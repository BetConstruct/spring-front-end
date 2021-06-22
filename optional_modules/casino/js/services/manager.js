/* global CASINO */
/**
 * @ngdoc service
 * @name CASINO.service:casinoManager
 * @description
 * Utility functions
 */

CASINO.service('casinoManager', ['$rootScope', '$q', '$window', '$sce', '$location', '$timeout', '$filter', 'casinoData', 'Storage', 'DomHelper', 'Zergling', 'Config', 'CConfig', 'Translator', 'LanguageCodes', 'AuthData', 'Utils', 'jackpotManager', function ($rootScope, $q, $window, $sce, $location, $timeout, $filter, casinoData, Storage, DomHelper, Zergling, Config, CConfig, Translator, LanguageCodes, AuthData, Utils, jackpotManager) {
    'use strict';
    var casinoManager = {};

    var realityCheckIntervalPromise;
    var profileActiveTimePromise;
    var notSupportedCurrencyWarningMessage = 'This game doesn\'t support Real mode in your account currency.';

    /**
     * @ngdoc method
     * @name clearLocation
     * @methodOf CASINO.service:casinoManager
     * @description deletes location specific search params
     *
     */
    function clearLocation() {
        $location.search('type', undefined);
        $location.search('game', undefined);
        $location.search('studio', undefined);
        $location.search('table', undefined);
        $location.search('limit', undefined);
        $location.search('room', undefined);
    }

    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.service:casinoManager
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     *
     * @param {Object} scope the rootScope
     * @param {Object} game Object
     */
    casinoManager.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(scope, game) {
        var myCasinoGames = scope.myCasinoGames || [], i, j;
        for (i = 0, j = myCasinoGames.length; i < j; i += 1) {
            if (myCasinoGames[i].id === game.id) {
                scope.$broadcast('game.removeGameFromMyCasinoGames', game);
                break;
            }
        }
        if (j === myCasinoGames.length) {
            //game is not from myCasinoGames
            scope.$broadcast('game.addToMyCasinoGames', game);
        }
    };

    /**
     * @ngdoc method
     * @name togglePlayMode
     * @methodOf CASINO.service:casinoManager
     * @description
     *
     * @param {Object} scope the rootScope
     * @param {Object} gameInfo Object
     */
    casinoManager.togglePlayMode = function togglePlayMode(scope, gameInfo) {
        if (!$rootScope.env.authorized) {
            $rootScope.$broadcast("openLoginForm");
            var loginFormWatcherPromise;
            var authWatcherPromise = scope.$on('loggedIn', function () {
                if ($rootScope.profile) {
                    if (loginFormWatcherPromise) {
                        loginFormWatcherPromise();
                    }
                    authWatcherPromise();
                    if (gameInfo.game.blocked_currencies && gameInfo.game.blocked_currencies.indexOf($rootScope.profile.currency) !== -1) {
                        showWarning(notSupportedCurrencyWarningMessage);
                    } else {
                        gameInfo.gameMode = 'real';
                        scope.refreshGame(gameInfo.id);
                    }

                }
            });

            loginFormWatcherPromise = scope.$watch('env.showSlider', function (showSlider) {
                if (!showSlider) {
                    loginFormWatcherPromise();
                    if (authWatcherPromise) {
                        authWatcherPromise();
                    }
                }
            });
            return;
        }
        if (gameInfo.gameMode === 'fun' && gameInfo.game.blocked_currencies && gameInfo.game.blocked_currencies.indexOf($rootScope.profile.currency) !== -1) {
            showWarning(notSupportedCurrencyWarningMessage);
        } else {
            gameInfo.gameMode = gameInfo.gameMode === 'fun' ? 'real' : 'fun';
            scope.refreshGame(gameInfo.id);
        }

    };

    /**
     * @ngdoc method
     * @name refreshCasinoGame
     * @methodOf CASINO.service:casinoManager
     * @description find game by id in opened games and relaod it
     *
     * @param {Object} scope the scope
     * @param {String} id the gameInfo id
     */
    casinoManager.refreshCasinoGame = function refreshCasinoGame(scope, id) {
        var i, length = scope.gamesInfo.length;
        for (i = 0; i < length; i += 1) {
            if (scope.gamesInfo[i].id === id) {
                var mode = scope.gamesInfo[i].gameMode;
                var currentGame = scope.gamesInfo[i].game;
                var studio = scope.gamesInfo[i].studio;
                var urlSuffix = scope.gamesInfo[i].urlSuffix;
                scope.gamesInfo[i] = {gameUrl: '', id: id, toAdd: true};
                scope.openGame(currentGame, mode, studio, urlSuffix, i);
                break;
            }
        }
    };

    /**
     * @ngdoc method
     * @name refreshOpenedGames
     * @methodOf CASINO.service:casinoManager
     * @description  if user logged in refresh open games that do not have mode "play for fun" and open in real mode, or
     *
     * @param {Object} scope the scope
     */
    casinoManager.refreshOpenedGames = function refreshOpenedGames(scope) {
        for (var i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
            if (scope.gamesInfo[i].game && scope.gamesInfo[i].gameUrl !== '' && ($rootScope.env.authorized || scope.gamesInfo[i].game.id !== CConfig.backgammon.id)) {
                var infoId = scope.gamesInfo[i].id;
                var currentGame = scope.gamesInfo[i].game;
                var studio = scope.gamesInfo[i].studio;
                var urlSuffix = scope.gamesInfo[i].urlSuffix;
                if ($rootScope.env.authorized) {
                    if (scope.gamesInfo[i].game.types.viewMode && !scope.gamesInfo[i].game.types.funMode) {
                        scope.gamesInfo[i] = {gameUrl: '', id: infoId, toAdd: true};
                        scope.openGame(currentGame, 'real', studio, urlSuffix);
                    }
                } else if (scope.gamesInfo[i].gameMode === 'real') {
                    if (scope.gamesInfo[i].game.types.funMode || scope.gamesInfo[i].game.types.viewMode) {
                        scope.gamesInfo[i] = {gameUrl: '', id: infoId, toAdd: true};
                        scope.openGame(currentGame, 'fun', studio, urlSuffix);
                    } else {
                        casinoManager.closeGame(scope, scope.gamesInfo[i].id);
                    }
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name openPopUpWindow
     * @methodOf CASINO.service:casinoManager
     * @description  finds game object, then calculates the possible sizes of the popup window and opens casino game in there
     *
     * @param {String} id game id
     * @param {Object} scope the scope object
     */
    casinoManager.openPopUpWindow = function openPopUpWindow(scope, id) {
        var gameInfo, scale, scaleWidth, scaleHeight;
        var percent = 0.85, windowWidth = 900, windowHeight = 900; // initial size of popUp
        var screenResolution = DomHelper.getScreenResolution();
        for (var i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
            if (scope.gamesInfo[i].id === id) {
                gameInfo = scope.gamesInfo[i];
                scope.gamesInfo[i] = {gameUrl: '', id: id, loadingUserData: true};
                break;
            }
        }
        var game = gameInfo.game;

        if (game.width && game.height) {
            scaleWidth = percent * screenResolution.x / game.width;
            scaleHeight = percent * screenResolution.y / game.height;
            scale = Math.min(scaleWidth, scaleHeight);
            windowWidth = scale * game.width;
            windowHeight = scale * game.height;
        } else if (game.ratio) {
            var ratios = game.ratio.split(':');
            var initialWidth = percent * screenResolution.y * ratios[0] / ratios[1];
            scaleWidth = percent * screenResolution.x / initialWidth;
            scale = Math.min(scaleWidth, 1);
            windowWidth = scale * initialWidth;
            windowHeight = scale * screenResolution.y * percent;
        }
        var windowParam = 'width=' + windowWidth + ',height=' + windowHeight + ',menubar=no,toolbar=no,location=no,scrollbars=no,resizable=yes';

        openGameWindow(casinoManager.getGameUrl(gameInfo), gameInfo, windowParam);
        casinoManager.closeGame(scope, id);
    };

    /**
     * @ngdoc method
     * @name getGameUrl
     * @methodOf CASINO.service:casinoManager
     * @description Get casino game url
     * @param {Object} gameInfo the game info
     */
    casinoManager.getGameUrl = function getGameUrl(gameInfo) {
        var gameUrl;
        var isSpecialLiveGame = (gameInfo.game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1 && gameInfo.game.show_as_provider === CConfig.liveCasino.provider);

        if (isSpecialLiveGame) {
            var urlPrefix = $window.location.protocol + CConfig.liveCasino.lcGameUrlPrefix + (CConfig.liveCasino.staticDomain || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1));
            if (gameInfo.urlSuffix) {
                gameUrl = urlPrefix + gameInfo.urlSuffix + (gameInfo.urlSuffix.indexOf('?') === -1 ? '?' : '&') + 'frameId=' + gameInfo.id;
            } else {
                var tableInfo = '/table' + ($location.search().table ? ('/table/' + $location.search().table) : '') + ($location.search().limit ? ('/' + $location.search().limit) : '');
                gameUrl = urlPrefix + '/web/' + (LanguageCodes[$rootScope.env.lang] || 'en') + '/' + Config.main.site_id + tableInfo + '?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[gameInfo.game.extearnal_game_id] || 0) + '&frameId=' + gameInfo.id + ($location.search().room ? ('&roomNumber=' + $location.search().room) : '');
            }
        } else {
            gameInfo.gameMode !== 'real' && (gameInfo.gameMode = 'fun');
            gameUrl = CConfig.cUrlPrefix + CConfig.gamesUrl + '?partnerId=' + Config.main.site_id + '&gameId=' + gameInfo.game.extearnal_game_id + '&language=' + LanguageCodes[$rootScope.env.lang] + '&openType=' + gameInfo.gameMode;
            gameInfo.studio && (gameUrl += '&studio=' + gameInfo.studio);
            gameInfo.game.game_options && (gameUrl += gameInfo.game.game_options);
        }

        gameUrl += "&devicetypeid=" + CConfig.deviceTypeId + "&platformType=" + CConfig.platformType;
        gameInfo.gameMode === 'real' && (gameUrl += '&token=' + AuthData.getAuthToken());
        gameUrl += '&exitURL=' + encodeURIComponent($window.location.origin + '/#' + $location.path());
        gameUrl += '&browserUrl=' + encodeURIComponent($window.location.href);

        return $sce.trustAsResourceUrl(gameUrl);
    };

    /**
     * @ngdoc method
     * @name openGameWindow
     * @methodOf CASINO.service:casinoManager
     * @description Opens a game in the window
     * @param {String} url the url
     * @param {Object} gameInfo info object
     * @param {String} param  params
     */
    function openGameWindow(url, gameInfo, param) {
        var windowName = gameInfo.id; //gameInfo.game.front_game_id

        url = addNeededDataInUrl(gameInfo, url + '&popup=true');
        var popup = $window.open(url, windowName, param);
        casinoManager.checkIfPopupIsBlocked(popup);
    }

    /**
     * @ngdoc method
     * @name gpTransfer
     * @methodOf CASINO.service:casinoManager
     * @description find game by id in opened games and relaod it
     *
     * @param {Object} transferModel object that contains some keys for request
     */
    casinoManager.gpTransfer = function gpTransfer(transferModel) {
        transferModel.transferInProgress = true;
        var request;
        if (transferModel.method !== 'transfer') {
            // Request for getting available balance
            request = {external_game_id: transferModel.externalGameId};
        } else {
            // Request for making the actual transfer
            request = {
                'from_product': transferModel.from,
                'to_product': transferModel.to,
                // the amount is taken from the input boxes of respective forms
                'amount': transferModel.from === 'Casino' ? transferModel.fromCasinoAmount : transferModel.fromGameAmount
            };
            transferModel.showTransferPopUp = true;
        }

        Zergling.get(request, transferModel.method).then(function (response) {
            transferModel.fromCasinoAmount = '';
            transferModel.fromGameAmount = '';
            transferModel.transferInProgress = false;

            if (response) {
                if (response.code === 0 || response.balance) {
                    // Getting game balance
                    transferModel.gpAmount = response.balance;
                } else if (response.result === 0) {
                    // Successful balance transfer
                    transferModel.gpAmount = response.details.balance;
                    transferModel.messageType = 'success';
                    updateCasinoBalance();
                } else {
                    transferModel.messageType = 'error';
                }
            }
        })['catch'](function () {
            transferModel.transferInProgress = false;
            transferModel.messageType = 'error';
        })['finally'](function () {
            transferModel.showTransferPopUp = true;
        });
    };

    /**
     * @ngdoc method
     * @name updateCasinoBalance
     * @methodOf CASINO.service:casinoManager
     * @description Update casino balance
     */
    function updateCasinoBalance() {
        Zergling.get({product: 'Casino'}, 'get_balance').then(function (response) {
            $rootScope.env.casinoBalance = response;
        });
    }

    /**
     * @ngdoc method
     * @name  initProvidersData
     * @methodOf CASINO.service:casinoManager
     * @description
     * @param {Array} gamesList the list of games
     */
    casinoManager.initProvidersData = function initProvidersData(gamesList) {
        var i, length = gamesList.length, providers = [], devidedGames = {}, providerBadgeMap = {};
        var providersMap = {};
        for (i = 0; i < length; i += 1) {
            if (!providersMap[gamesList[i].provider]) {
                providersMap[gamesList[i].provider] = true;
                providers.push({id: gamesList[i].provider, displayName: gamesList[i].provider_title});
            }
            if (!providerBadgeMap[gamesList[i].provider]) {
                providerBadgeMap[gamesList[i].provider] = gamesList[i].provider_badge;
            }
            if (gamesList[i].markets && (typeof gamesList[i].markets) === 'string') {
                gamesList[i].markets = JSON.parse(gamesList[i].markets);
            }
            if (!devidedGames[gamesList[i].provider]) {
                devidedGames[gamesList[i].provider] = {
                    games: [],
                    defaultStudio: '',
                    studios: []
                };
            }

            var devidedItem = devidedGames[gamesList[i].provider];
            devidedItem.games.push(gamesList[i]);

            if (gamesList[i].markets && gamesList[i].markets.available) {
                if (gamesList[i].markets.default && !devidedItem.defaultStudio) {
                    devidedItem.defaultStudio = gamesList[i].markets.default;
                }
                for (var j = 0, stLength = gamesList[i].markets.available.length; j < stLength; j += 1) {
                    if (devidedItem.studios.indexOf(gamesList[i].markets.available[j]) === -1) {
                        devidedItem.studios.push(gamesList[i].markets.available[j]);
                    }
                }
            }
        }

        if (CConfig.liveCasino.enableAllProviders && providers.length > 1) {
            providers.unshift({
                displayName: "All",
                id: "all"
            });
            devidedGames.all = {
                games: gamesList.slice(0),
                defaultStudio: '',
                studios: []
            };
        }

        return {
            providerOptions: providers,
            providerBadgeMap: providerBadgeMap,
            selectedProvider: CConfig.liveCasino.selectedDefaultProvider && Utils.getIndex(providers, 'id', CConfig.liveCasino.selectedDefaultProvider) !== -1 ? CConfig.liveCasino.selectedDefaultProvider : providers[0].id,
            devidedGames: devidedGames
        };
    };

    function showWarning(message) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "warning",
            title: "Warning",
            content: message
        });
    }

    function handleProviderCustomMessage(game) {
        if (CConfig.main.providersCustomMessages[game.provider] && !Storage.get(game.provider + '_provider_message')) {
            $rootScope.geoDataAvailable.then(function (data) {
                var country = data && data.countryCode && data.countryCode.toUpperCase();
                if (!country || !CConfig.main.providersCustomMessages[game.provider].showForCountries || CConfig.main.providersCustomMessages[game.provider].showForCountries.indexOf(country) !== -1) {
                    Storage.set(game.provider + '_provider_message', CConfig.main.providersCustomMessages[game.provider].timeDelay);

                    showWarning(CConfig.main.providersCustomMessages[game.provider].message);
                }
            });
        }
    }

    function handleBonusUsage(gameInfo) {
        if (CConfig.bonusBalanceUnderGame.enabled && $rootScope.profile && $rootScope.profile.calculatedBonus) {
            Zergling.get({game_id: gameInfo.game.extearnal_game_id}, 'casino_get_player_active_bonuses').then(function (response) {
                if (response && response.details && response.details.BonusDefId) {
                    gameInfo.bonusDefId = response.details.BonusDefId;
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.service:casinoManager
     * @param {Object} scope the scope object
     * @param {Object} game the game object
     * @param {String} gameType the type of game
     * @param {int} studio the sutdio's id
     * @param {String} urlSuffix the url's suffix
     * @param {Number} multiViewWindowIndex - passed when the window in multiview is refreshed
     * @description  opens login form if it needed, or generates casino game url and opens it
     *
     */
    casinoManager.openCasinoGame = function openCasinoGame(scope, game, gameType, studio, urlSuffix, multiViewWindowIndex) {
        $rootScope.env.showSlider = false;
        $rootScope.env.sliderContent = '';

        if (!game || (!game.types.realMode && !game.types.viewMode && !game.types.funMode)) {
            return;
        }

        if (!gameType) {
            gameType = $rootScope.env.authorized && game.types.realMode ? 'real' : 'fun';
        } else if (gameType === 'real' && !game.types.realMode) {
            gameType = 'fun';
        }

        var gameAlreadyOpen = $rootScope.env.authorized && (scope.gamesInfo || []).some(function (gameInfo) {
            return gameInfo.game && (game.categories && game.categories.indexOf(CConfig.liveCasino.categoryId) === -1) && gameInfo.game.id === game.id && (gameType === 'real' && gameInfo.gameMode === gameType);
        });

        if (gameAlreadyOpen) {
            showWarning('The game is already open.');
            return;
        }

        if ((!$rootScope.env.authorized && (gameType === 'real' || (gameType === 'fun' && !game.types.viewMode && !game.types.funMode)))) {
            $rootScope.$broadcast("openLoginForm", {
                key: 'casinoGamesList.openGame',
                data: {game: game, playMode: 'real', skipFavorite: true}
            });
            return;
        }

        if (gameType === 'real' && $rootScope.profile && game.blocked_currencies && game.blocked_currencies.indexOf($rootScope.profile.currency) !== -1){
            showWarning(notSupportedCurrencyWarningMessage);
            return;
        }

        var gameInfo = {
            externalId: game.extearnal_game_id,
            id: Utils.guid(),
            gameMode: gameType,
            toAdd: false,
            game: game,
            studio: studio,
            urlSuffix: urlSuffix
        };

        var toAddIndex;
        if (scope.gamesInfo && scope.gamesInfo.length > 1) {
            /*if (game.ratio === '0') {
                showWarning('Sorry, this game cannot be opened in multi-view mode');
                return;
            }*/
            var usedProviders = [], usedGames = [];
            for (var i = 0, length = scope.gamesInfo.length; i < length; i += 1) {
                var usedGame = scope.gamesInfo[i].game;
                if (usedGame) {
                    usedGames.push(usedGame);
                    if ((usedGame.provider === 'MGS' || usedGame.provider === 'BSG' || usedGame.provider === 'GMG' || usedGame.provider === 'NET') && usedProviders.indexOf(usedGame.provider) === -1) {
                        usedProviders.push(usedGame.provider);
                    }
                }
                if (toAddIndex === undefined) {
                    if (multiViewWindowIndex !== undefined) {
                        toAddIndex = multiViewWindowIndex;
                    } else if (scope.gamesInfo[i].toAdd) {
                        toAddIndex = i;
                    }
                }
            }
            if (usedProviders.indexOf(game.provider) !== -1) {
                for (var j = 0; j < usedGames.length; j += 1) {
                    if (game.id === usedGames[j].id) {
                        showWarning('This game Is Already Opened In Multi Game View. Please Choose Another game.');
                        return;
                    }
                }
                if (j === usedGames.length) {
                    showWarning('It Is Possible To Play Only One Game Of The Same Provider In Multi Game View. Please Choose Another Game.');
                    return;
                }
            } else {
                if (toAddIndex !== undefined) {
                    clearLocation();
                }
            }
        } else {
            scope.gamesInfo = [];
            $location.search('game', game.id);
            $location.search('type', gameType);
        }

        scope.gamesInfo[toAddIndex || 0] = gameInfo;

        $rootScope.casinoGameOpened = scope.gamesInfo.length;

        gameInfo.gameUrl = casinoManager.getGameUrl(gameInfo);

        if (gameInfo.gameMode === 'real') {
         //   checkAndStartRealityInterval(scope); // check and set reality functionality
            handleProviderCustomMessage(game);// provider custom message logic
            handleBonusUsage(gameInfo);
        }/* else {
            checkAndStopRealityInterval(scope.gamesInfo);
        }*/
    };

    /*function formatWithCurrency(num)  {
        return  $filter("number")(num, $rootScope.conf.balanceFractionSize) + " " + $filter("currency")($rootScope.profile.currency);
    }*/

   /* /!**
     * @ngdoc method
     * @name constructRealityCheckContent
     * @methodOf CASINO.service:casinoManager
     * @description Construct reality check content
     *!/
    function constructRealityCheckContent(data) {
        var details = data.details;
        var content = "<div class=\"reality-info\">";
        content += "<h4>" + Translator.get("Your Casino Activity") + "</h4>";
        content += "<span class=\"reality-title\">" + Translator.get("Your have played for") + ": </span><span class=\"reality-value\">" + details.SessionDuration + " " + Translator.get("minutes") + "</span>";
        content += "<span class=\"reality-title\">" + Translator.get("You have bet") + ": </span><span class=\"reality-value\">" + formatWithCurrency(details.CasinoBetTotal) + "</span>";
        content += "<span class=\"reality-title\">" + Translator.get("You have won") + ": </span><span class=\"reality-value under-line\">" + formatWithCurrency(details.CasinoWinTotal) + "</span>";
        content += "<span class=\"reality-title\">" + Translator.get("Profit") + ": </span><span class=\"reality-value\">" + formatWithCurrency(details.Profitness) + "</span>";
        content += "</div>";
        return content;

    }

    /!**
     * @ngdoc method
     * @name checkAndStartRealityInterval
     * @methodOf CASINO.service:casinoManager
     * @description Check and start reality interval
     *!/
    function checkAndStartRealityInterval(scope) {
        if (Config.main.realityCheck.enabled && !realityCheckIntervalPromise) { // there isn't active timer for popup and enabled from config
            if ($rootScope.profile && $rootScope.profile.active_time_in_casino) {
                var handleRealityCheck = function () {

                    realityCheckIntervalPromise = undefined;

                    var continueCallback = function () {
                        checkAndStartRealityInterval(scope);
                    };

                    var endCallback = function () {
                        for (var i = 0, length = scope.gamesInfo.length; i < length; ++i) {
                            if (scope.gamesInfo[i] && scope.gamesInfo[i].gameMode === 'real') {
                                casinoManager.closeGame(scope, scope.gamesInfo[i].id);
                            }
                        }
                        if (!$rootScope.env.showSlider || $rootScope.env.sliderContent !== "balanceHistory") {
                            $rootScope.$broadcast('toggleSliderTab', 'balanceHistory');
                        }
                    };

                    Zergling.get({}, "get_client_current_session_slot_pl").then(function (data) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'confirm',
                            title: 'Alert',
                            tag: 'reality-check-popup',
                            content: constructRealityCheckContent(data),
                            hideCloseButton: true,
                            buttons: [
                                {title: 'Continue', callback: continueCallback},
                                {title: 'End and Open Bet History', callback: endCallback}
                            ]
                        });
                    });
                };

                realityCheckIntervalPromise = $timeout(handleRealityCheck, $rootScope.profile.active_time_in_casino * 1000);
            }
            if (!profileActiveTimePromise) {
                profileActiveTimePromise = $rootScope.$watch('profile.active_time_in_casino', function () {
                    realityCheckIntervalPromise && $timeout.cancel(realityCheckIntervalPromise) && (realityCheckIntervalPromise = undefined);
                    if ($rootScope.profile && $rootScope.profile.active_time_in_casino) {
                        checkAndStartRealityInterval(scope);
                    }
                });
            }
        }
    }

    /!**
     * @ngdoc method
     * @name checkAndStopRealityInterval
     * @methodOf CASINO.service:casinoManager
     * @description Check and stop reality interval
     *!/
    function checkAndStopRealityInterval(openedGamesList) {
        if (realityCheckIntervalPromise) { // there is active timer for popup
            if (openedGamesList && openedGamesList.length) {
                for (var i = 0, length = openedGamesList.length; i < length; ++i) {
                    if (openedGamesList[i].gameMode === 'real') {
                        return;
                    }
                }

            }

            realityCheckIntervalPromise && $timeout.cancel(realityCheckIntervalPromise) && (realityCheckIntervalPromise = undefined);
            profileActiveTimePromise && profileActiveTimePromise() && (profileActiveTimePromise = undefined);
        }
    }*/

    /**
     * @ngdoc method
     * @name addNeededDataInUrl
     * @methodOf CASINO.service:casinoManager
     * @description Add needed data in url
     * @param {Object} gameInfo info object
     * @param {String} initialUrl url
     */
    function addNeededDataInUrl(gameInfo, initialUrl) {
        if (gameInfo.studio) {
            initialUrl += "&studio=" + gameInfo.studio;
        }

        return initialUrl;
    }

    /**
     * @ngdoc method
     * @name checkIfPopupIsBlocked
     * @methodOf CASINO.service:casinoManager
     * @description  detect if the popup has been blocked by the browser and shows proper message
     *
     * @param {Object} popup object
     */
    casinoManager.checkIfPopupIsBlocked = function checkIfPopupIsBlocked(popup) {
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: 'info',
                title: 'Alert',
                content: 'Please enable pop-up windows in your browser in order to open the game in a separate window.'
            });
        }
    };

    /**
     * @ngdoc method
     * @name changeView
     * @methodOf CASINO.service:casinoManager
     * @description change view for applying functionality of multiple view in casino
     *
     * @param {Object} scope the rootScope
     * @param {int} view int
     */
    casinoManager.changeView = function changeView(scope, view) {
        var i, gameInfo;
        if (view > scope.gamesInfo.length) {
            for (i = scope.gamesInfo.length; i < view; i++) {
                gameInfo = {gameUrl: '', id: Utils.guid(), toAdd: false};
                scope.gamesInfo.push(gameInfo);
            }
            scope.viewCount = view;
        } else if (view < scope.gamesInfo.length) {
            var actualviews = 0, actualGames = [];
            for (i = 0; i < scope.gamesInfo.length; i += 1) {
                if (scope.gamesInfo[i].gameUrl !== '') {
                    gameInfo = scope.gamesInfo[i];
                    actualGames.push(gameInfo);
                    actualviews++;
                }
            }
            if (actualviews <= view) {
                if (actualviews === 1 && view === 2) {
                    gameInfo = {gameUrl: '', id: Utils.guid(), toAdd: false};
                    if (scope.gamesInfo[0].gameUrl !== '') {
                        actualGames.push(gameInfo);
                    } else {
                        actualGames.unshift(gameInfo);
                    }
                }
                scope.gamesInfo = actualGames;
                scope.viewCount = view;
            } else {
                var numberOfNeeded = actualviews - view;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'warning',
                    title: 'Warning',
                    content: Translator.get('Please close {1} game(s) to change view', [numberOfNeeded])
                });
            }
        }
        $rootScope.casinoGameOpened = scope.gamesInfo.length;
    };

    /**
     * @ngdoc method
     * @name getGameById
     * @methodOf CASINO.service:casinoManager
     * @description Get game by id
     * @param {Array} games list
     * @param {int} id the game id
     * @returns game with selected id
     */
    casinoManager.getGameById = function getGameById(games, id) {
        for (var i = 0, count = games.length; i < count; i += 1) {
            if (games[i].id === id) {
                return games[i];
            }
        }

        return null;
    };

    /**
     * @ngdoc method
     * @name findAndCloseGame
     * @methodOf CASINO.service:casinoManager
     * @description Find and close game with selected id
     * @param {Object} scope
     * @param {int} gameId the game's id
     */
    casinoManager.findAndCloseGame = function findAndCloseGame(scope, gameId) {
        if (scope.gamesInfo && scope.gamesInfo.length) {
            if (gameId === undefined) {
                casinoManager.closeGame(scope);
            } else {
                var i, length = scope.gamesInfo.length;
                for (i = 0; i < length; i += 1) {
                    if (scope.gamesInfo[i].game && (scope.gamesInfo[i].game.id === gameId || scope.gamesInfo[i].game.server_game_id === gameId)) {
                        casinoManager.closeGame(scope, scope.gamesInfo[i].id);
                        break;
                    }
                }
            }
        }
    };

    function toCloseGame(scope, id) {
        if (id === undefined) {
            scope.gamesInfo = [];
            scope.viewCount = 1;
            $rootScope.casinoGameOpened = 0;
        } else {
            var cauntOfGames = 0, i, count;
            for (i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
                if (scope.gamesInfo[i].id === id) {
                    scope.gamesInfo[i] = {gameUrl: '', id: Utils.guid(), toAdd: false};
                }
                if (scope.gamesInfo[i].gameUrl !== '') {
                    cauntOfGames++;
                }
            }

            if (cauntOfGames === 0) {
                scope.gamesInfo = [];
                scope.viewCount = 1;
                $rootScope.casinoGameOpened = 0;
            }
        }

      //  checkAndStopRealityInterval(scope.gamesInfo);

        clearLocation();
    }

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.service:casinoManager
     * @description Close game
     * @param {Object} scope
     * @param {int} id of game
     * @param {string} targetAction the close action target
     */
    casinoManager.closeGame = function closeGame(scope, id, targetAction) {
        if (CConfig.main.enableConfirmationBeforeCloseGame && targetAction === 'closeButton') {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: "warning",
                title: "Warning",
                hideCloseButton: true,
                content: "Do you want to close the game?",
                buttons: [
                    {
                        title: 'Yes',
                        callback: function () {
                            toCloseGame (scope, id);
                        }
                    },
                    {
                        title: 'No'
                    }]
            });
        } else {
            toCloseGame (scope, id);
        }
    };

    /**
     * @ngdoc method
     * @name openGameDetailsPopUp
     * @methodOf CASINO.service:casinoManager
     * @description Open game details pop up
     * @param {int} gameId the game id
     */
    casinoManager.openGameDetailsPopUp = function openGameDetailsPopUp(gameId) {
        var url = '#/popup/?u=' + ($rootScope.profile && $rootScope.profile.unique_id ? $rootScope.profile.unique_id : '') + '&action=gamedetails&game_skin_id=' + gameId;
        var param = "scrollbars=1,width=1000,height=600,resizable=yes";

        var popup = $window.open(url, 'game.details', param);
        casinoManager.checkIfPopupIsBlocked(popup);
    };

    /**
     * @ngdoc method
     * @name clearAllPromises
     * @methodOf CASINO.service:casinoManager
     * @description Clear all promises
     */
    casinoManager.clearAllPromises = function clearAllPromises() {
       // checkAndStopRealityInterval();
    };


    // CASINO SOCKET JACKPOT DATA PART end

    /**
     * @ngdoc method
     * @name setCurrentFrameUrlPrefix
     * @methodOf CASINO.service:casinoManager
     * @description Finds the corresponding frame and changes the url Prefix (actualy used for only betconstruct's live casino)
     * @param {Object} gamesInfo the openes games info
     * @param {Object} frameData the data of frame
     */
    casinoManager.setCurrentFrameUrlSuffix = function setCurrentFrameUrlSuffix(gamesInfo, frameData) {
        for (var i = 0, length = gamesInfo.length; i < length; i += 1) {
            if (gamesInfo[i].id === frameData.frameId) {
                gamesInfo[i].urlSuffix = frameData.url + (frameData.roomNumber && ('?roomNumber=' + frameData.roomNumber) || '');
                if ($location.search().game) { //it means there is only one opened game and it's  from betconstryct's live casino
                    var frameUrlParams = frameData.url.split('/');
                    frameUrlParams[6] && $location.search('table', frameUrlParams[6]);
                    frameUrlParams[7] && $location.search('limit', frameUrlParams[7]);
                    frameData.roomNumber && $location.search('room', frameData.roomNumber);
                }
                return;
            }
        }
    };

    /**
     * @ngdoc method
     * @name navigateToRightRouteAndOpenGame
     * @methodOf CASINO.service:casinoManager
     * @description  open selected game
     * @param {Object} game the game object
     * @param {String} gameType the type for open
     */

    casinoManager.navigateToRightRouteAndOpenGame = function (game, gameType) {
        var page, pagePath;
        if ($rootScope.casinoGameOpened > 1) {
            pagePath = $location.path();
            switch (pagePath) {
                case '/casino/':
                    page = 'casino';
                    break;
                case '/jackpots/':
                    page = 'jackpots';
                    break;
                case '/livedealer/':
                    page = 'livedealer';
                    break;
                case '/games/':
                    page = 'games';
                    break;
                case '/tournaments/':
                    page = 'tournaments';
            }
            $rootScope.$broadcast(page + '.openGame', game, gameType);
        } else {
            if (game.categories.indexOf(CConfig.skillGames.categoryId) !== -1) {
                page = 'games';
            } else if (game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1) {
                page = 'livedealer';
            } else {
                page = 'casino';
            }
            pagePath = '/' + page + '/';
            if ($location.$$path === pagePath) {
                $rootScope.$broadcast(page + '.openGame', game, gameType);
            } else {
                var domainSpecificPrefix = Utils.getPrefixLink('#/' + page);
                if (domainSpecificPrefix) {
                    $window.location.href = domainSpecificPrefix + "/?game=" + game.id + '&type=' + gameType;
                } else {
                    var unregisterRouteChangeSuccess = $rootScope.$on('$routeChangeSuccess', function () {
                        if (!$location.$$replace) {
                            $rootScope.$broadcast(page + '.openGame', game, gameType);
                            unregisterRouteChangeSuccess();
                        }
                    });
                    $location.url(pagePath);
                }
            }
        }
    };

    return casinoManager;
}]);
