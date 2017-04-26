/* global CASINO */
/**
 * @ngdoc service
 * @name CASINO.service:casinoManager
 * @description
 * Utility functions
 */

CASINO.service('casinoManager', ['$rootScope', '$q', '$window', '$sce', '$location', '$timeout', 'analytics', 'casinoData', 'Storage', 'DomHelper', 'Zergling', 'Config', 'CConfig', 'Translator', 'LanguageCodes', function ($rootScope, $q, $window,  $sce, $location, $timeout, analytics, casinoData, Storage, DomHelper, Zergling, Config, CConfig, Translator, LanguageCodes) {
    'use strict';
    var casinoManager = {};

    var realityCheckIntervalPromise;
    var profileActiveTimePromise;
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
    casinoManager.togglePlayMode = function togglePlayMode (scope, gameInfo) {
        if (!$rootScope.env.authorized) {
            $rootScope.$broadcast("openLoginForm");

            var authWatcherPromise = scope.$watch('env.authorized', function (authorized){
                if (authorized) {
                    if (loginFormWatcherPromise) {
                        loginFormWatcherPromise();
                    }
                    if (authWatcherPromise) {
                        authWatcherPromise();
                    }
                    gameInfo.gameMode = 'real';
                    scope.refreshGame(gameInfo.id);
                }
            });

            var loginFormWatcherPromise = scope.$watch('env.showSlider', function (showSlider){
                if (!showSlider) {
                    if (loginFormWatcherPromise) {
                        loginFormWatcherPromise();
                    }
                    if (authWatcherPromise) {
                        authWatcherPromise();
                    }
                }
            });

            return;
        }
        gameInfo.gameMode = gameInfo.gameMode === 'fun' ? 'real' : 'fun';
        scope.refreshGame(gameInfo.id);
    };

    /**
     * @ngdoc method
     * @name refreshCasinoGame
     * @methodOf CASINO.service:casinoManager
     * @description find game by id in opened games and relaod it
     *
     * @param {Object} scope the scope
     * @param {Int} id gameInfo id
     */
    casinoManager.refreshCasinoGame = function refreshCasinoGame(scope, id) {
        var i , length = scope.gamesInfo.length;
        for (i = 0; i < length; i += 1) {
            if (scope.gamesInfo[i].id === id) {
                var mode = scope.gamesInfo[i].gameMode;
                var currentGame = scope.gamesInfo[i].game;
                var studio = scope.gamesInfo[i].studio;
                scope.gamesInfo[i] = {gameUrl: '', id: id, toAdd: true};
                scope.openGame(currentGame, mode, studio);
                break;
            }
        }
    };

    /**
     * @ngdoc method
     * @name refreshOpenedGames
     * @methodOf CASINO.service:casinoManager
     * @description  if user logged in refresh open games that do not have mode "play for fun" and open in real mode, or
     *               if user logged out close games that opened in real mode
     *
     * @param {Object} scope the scope
     */
    casinoManager.refreshOpenedGames = function refreshOpenedGames(scope) {
        for (var i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
            if (scope.gamesInfo[i].game) {
                if (scope.gamesInfo[i].game.id !== CConfig.backgammon.id || $rootScope.env.authorized) {
                    if (scope.gamesInfo[i].game.types.viewMode) {
                        var infoId = scope.gamesInfo[i].id;
                        var currentGame = scope.gamesInfo[i].game;
                        var studio = scope.gamesInfo[i].studio;
                        var gameMode = $rootScope.env.authorized ? 'real' : 'fun';
                        scope.gamesInfo[i] = {gameUrl: '', id: infoId, toAdd: true};
                        scope.openGame(currentGame, gameMode, studio);
                    } else if (scope.gamesInfo[i].gameUrl !== '' && scope.gamesInfo[i].gameMode === 'real' && !$rootScope.env.authorized) {
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
        var game = gameInfo.game, gameMode = gameInfo.gameMode === "real" ? "real" : "fun";

        if (game.width && game.height) {
            scaleWidth = percent * screenResolution.x / game.width;
            scaleHeight = percent *  screenResolution.y / game.height;
            scale = Math.min(scaleWidth, scaleHeight);
            windowWidth = scale * game.width;
            windowHeight = scale * game.height;
        } else if (game.ratio) {
            var ratios =  game.ratio.split(':');
            var initialWidth = percent * screenResolution.y * ratios[0] / ratios[1];
            scaleWidth =percent *  screenResolution.x / initialWidth;
            scale = Math.min(scaleWidth, 1);
            windowWidth = scale * initialWidth;
            windowHeight = scale * screenResolution.y * percent;
        }
        var windowParam = 'width=' + windowWidth + ',height=' + windowHeight + ',menubar=no,toolbar=no,location=no,scrollbars=no,resizable=yes';

        getGameUrl(gameInfo).then(function(url) {
            if (url) {
                openGameWindow(url, gameInfo, windowParam);
            } else {
                showMessage('casino_auth_error');
            }
        })['finally'](function () {
            casinoManager.closeGame(scope, id);
        });
    };

    function getGameUrl (gameInfo) {
        var data = $q.defer();
        var urlPromise = data.promise;
        var gameUrl;

        var isSpecialLiveGame = (gameInfo.game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1 && gameInfo.game.show_as_provider === CConfig.liveCasino.provider);

        if (gameInfo.game.gameOpenUrl || CConfig.main.providersThatWorkWithSwarm.indexOf(gameInfo.game.provider) === -1 || isSpecialLiveGame) {
            if (isSpecialLiveGame) {
                var subDomain = CConfig.staticUrlForLiveCasino || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1);
                gameUrl = CConfig.liveCasino.lcGameUrlPrefix + subDomain + '/web/' + (LanguageCodes[$rootScope.env.lang] || 'en') + '/' + CConfig.main.partnerID + '/table?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[gameInfo.game.extearnal_game_id] || 0) + '&frameId=' + gameInfo.id;
            } else {
                var urlPrefix = CConfig.main.providersThatWorkWithCasinoBackend && CConfig.main.providersThatWorkWithCasinoBackend.providers && CConfig.main.providersThatWorkWithCasinoBackend.providers.indexOf(gameInfo.game.provider) !== -1 ? CConfig.main.providersThatWorkWithCasinoBackend.url : CConfig.cUrlPrefix + CConfig.cGamesUrl;

                gameUrl = urlPrefix + '?gameid=' + gameInfo.game.front_game_id + '&mode=' + gameInfo.gameMode + '&provider=' + gameInfo.game.provider + (gameInfo.game.game_options ? gameInfo.game.game_options : "") +
                    '&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;
            }

            if (gameInfo.gameMode === 'real') {
                Zergling.get({'game_id': parseInt(gameInfo.game.extearnal_game_id)}, 'casino_auth').then(function (response) {
                    if (response && response.result) {
                        if (response.result.has_error == "False") {
                            var userInfo = gameInfo.game.gameOpenUrl ? response.result.token + '&username=' + response.result.username : '&token=' + response.result.token + '&username=' + response.result.username + '&balance=' + response.result.balance + '&currency=' + response.result.currency + '&userid=' + response.result.id;
                            gameUrl = gameInfo.game.gameOpenUrl ?  $sce.trustAsResourceUrl(gameInfo.game.gameOpenUrl + userInfo) : $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo, gameUrl + userInfo));
                            data.resolve(gameUrl);
                        } else  {
                            data.resolve(null);
                        }
                    }
                }, function (failResponse) {
                    data.resolve(null);
                });
            } else {
                gameUrl = gameInfo.game.gameOpenUrl ?  $sce.trustAsResourceUrl(gameInfo.game.gameOpenUrl) : $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo,gameUrl));
                data.resolve(gameUrl);
            }
        } else {
            if (gameInfo.gameMode !== "real") {
                gameInfo.gameMode = "fun";
            }
            var request = {
                'provider': gameInfo.game.provider,
                'game_id': gameInfo.game.front_game_id,
                'external_game_id': gameInfo.game.extearnal_game_id,
                'mode': gameInfo.gameMode,
                'skin_host': CConfig.cUrlPrefix
            };
            if (gameInfo.studio) {
                request.studio = parseInt(gameInfo.studio);
            }
            if (gameInfo.game.game_options) {
                addOptionsInRequest(gameInfo.game.game_options, request);
            }

            Zergling.get(request, 'casino_game_url').then(function (response) {
                if (response && response.url) {
                    gameUrl = $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo, response.url));
                    data.resolve(gameUrl);
                } else {
                    data.resolve(null);

                }
            }, function () {
                data.resolve(null);
            });
        }

        return urlPromise;
    }

    function openGameWindow(url, gameInfo, param) {
        var windowName = gameInfo.game.front_game_id;

        url = addNeededDataInUrl(gameInfo, url + '&popup=true');
        var popup = $window.open(url, windowName, param);
        casinoManager.checkIfPopupIsBlocked(popup);
    }

     function addOptionsInRequest(options, request) {
         var list = options.split('&');
         for (var i = 0; i < list.length; i += 1) {
             var option = list[i].split("=");
             if (option.length === 2) {
                 request[option[0]] = option[1];
             }
         }
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
        if (transferModel.method === 'get_balance_poker_klas') {
            request = {external_game_id: transferModel.externalGameId};
        } else {
            request = {
                'from_product': transferModel.from,
                'to_product': transferModel.to,
                'amount': transferModel.from === 'Casino' ? transferModel.fromCasinoAmount : transferModel.fromGameAmount
            }
        }

        Zergling.get(request, transferModel.method).then(function (response) {
            transferModel.fromCasinoAmount = '';
            transferModel.fromGameAmount = '';
            transferModel.transferInProgress = false;

            if (response) {
                if (response.code === 0) {
                    transferModel.gpAmount = response.balance;
                } else if (response.result === 0) {
                    transferModel.gpAmount = response.details.balance;
                    transferModel.messageType = 'success';
                    updateCasinoBalance();
                } else {
                    transferModel.messageType = 'error';
                }
            }
        })['catch'](function (reason) {
            transferModel.transferInProgress = false;
            transferModel.messageType = 'error';
        });
    };

    function updateCasinoBalance() {
        Zergling.get({product: 'Casino'}, 'get_balance').then(function (response) {
            $rootScope.env.casinoBalance = response;
        });
    }

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.service:casinoManager
     *
     * @description  opens login form if it needed, or generates casino game url and opens it
     *
     */
    casinoManager.openCasinoGame = function openCasinoGame(scope, game, gameType, studio) {
        $rootScope.env.showSlider = false;
        $rootScope.env.sliderContent = '';

        if (!game.types.realMode && !game.types.viewMode && !game.types.funMode) {
            return;
        }

        if (!gameType) {
            gameType = $rootScope.env.authorized && game.types.realMode ? 'real' : 'fun';
        }

        if (gameType === 'real' && !game.types.realMode) {
            gameType = 'fun';
        }

        if ((gameType === 'real' && !$rootScope.env.authorized) || (gameType === 'fun' && !game.types.viewMode && !game.types.funMode)) {
            $rootScope.$broadcast("openLoginForm");
            var infoIndex, count = scope.gamesInfo.length;
            for (infoIndex = 0; infoIndex < count; infoIndex += 1) {
                scope.gamesInfo[infoIndex].toAdd = false;
            }
            return;
        }

        var gameInfo = {};
        gameInfo.gameID = game.front_game_id;
        gameInfo.id = Math.random().toString(36).substr(2, 9);
        gameInfo.gameMode = gameType;
        gameInfo.toAdd = false;
        gameInfo.game = game; //need for refresh some games after loggin
        gameInfo.studio = studio;



        if (scope.gamesInfo && scope.gamesInfo.length > 1) {
            if (game.ratio === '0') {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
                    content: Translator.get('Sorry, this game cannot be opened in multi-view mode')
                });
                return;
            }
            var toAddIndex, usedProviders = [], usedGames = [];
            for (var i = 0, length = scope.gamesInfo.length; i < length; i += 1) {
                var usedGame = scope.gamesInfo[i].game;
                if (usedGame) {
                    if (gameType === 'real' && game.id === usedGame.id && game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1) { //@TODO actually can't open live casino same table
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "warning",
                            title: "Warning",
                            content: Translator.get('This game Is Already Opened In Multi Game View. Please Choose Another game.')
                        });
                        return;
                    }
                    usedGames.push(usedGame);
                    if ((usedGame.provider === 'MGS' || usedGame.provider === 'BSG' || usedGame.provider === 'GMG' || usedGame.provider === 'NET') && usedProviders.indexOf(usedGame.provider) === -1) {
                        usedProviders.push(usedGame.provider);
                    }
                }
                if (scope.gamesInfo[i].toAdd) {
                    toAddIndex = i;
                }
            }
            if (usedProviders.indexOf(game.provider) !== -1) {
                for (var j = 0; j < usedGames.length; j += 1) {
                    if (game.id === usedGames[j].id) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "warning",
                            title: "Warning",
                            content: Translator.get('This game Is Already Opened In Multi Game View. Please Choose Another game.')
                        });
                        return;
                    }
                }
                if (j === usedGames.length) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "warning",
                        title: "Warning",
                        content: Translator.get('It Is Possible To Play Only One Game Of The Same Provider In Multi Game View. Please Choose Another Game.')
                    });
                    return;
                }
            } else {
                if (toAddIndex !== undefined) {
                    $location.search('type', undefined);
                    $location.search('game', undefined);
                    $location.search('studio', undefined);
                }
            }
        } else {
            scope.gamesInfo = [];
            $location.search('game', game.id);
            $location.search('type', gameType);
        }

        scope.gamesInfo[toAddIndex || 0] = gameInfo;
        gameInfo.loadingUserData = true;

        $rootScope.casinoGameOpened = scope.gamesInfo.length;

        getGameUrl(gameInfo).then(function(data) {
            gameInfo.loadingUserData = false;
            if (data) {
                gameInfo.gameUrl = data;
                if (gameInfo.gameMode === 'real') { // check and set reality functionality
                    checkAndStartRealityInterval(scope);
                } else {
                    checkAndStopRealityInterval(scope.gamesInfo);
                }
            } else {
                showMessage('casino_auth_error');
                casinoManager.closeGame(scope, gameInfo.id);
            }
        });

        if($rootScope.env.authorized && CConfig.main.providersCustomMessages && CConfig.main.providersCustomMessages[game.provider] && !Storage.get(game.provider)){
            Storage.set(game.provider, 'Popup time delay for ' + game.provider + ' provider', CConfig.main.providersCustomMessages[game.provider].timeDelay);
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'warning',
                title: 'Warning',
                content: Translator.get(CConfig.main.providersCustomMessages[game.provider].message)
            });
        }
    };

    function checkAndStartRealityInterval(scope) {
        if (Config.main.realityCheck.enabled && !realityCheckIntervalPromise) { // there isn't active timer for popup and enabled from config
            if ($rootScope.profile.active_time_in_casino) {
                var handleRealityCheck = function () {

                    realityCheckIntervalPromise = undefined;

                    var continueCallback = function () {
                        checkAndStartRealityInterval(scope);
                    };

                    var endCallback = function() {
                        for (var i = 0, length = scope.gamesInfo.length; i < length; ++i) {
                            if (scope.gamesInfo[i] && scope.gamesInfo[i].gameMode === 'real') {
                                casinoManager.closeGame(scope,scope.gamesInfo[i].id);
                            }
                        }
                        if (!$rootScope.env.showSlider || $rootScope.env.sliderContent !== "balanceHistory") {
                            $rootScope.$broadcast('toggleSliderTab', 'balanceHistory');
                        }
                    };

                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'confirm',
                        title: 'Alert',
                        content: Translator.get('You have been playing for {1} minutes. Please select if you want to continue or stop playing.', [$rootScope.profile.active_time_in_casino / 60]),
                        hideCloseButton: true,
                        buttons: [
                            {title: 'Continue', callback: continueCallback},
                            {title: 'End and Open Bet History', callback: endCallback}
                        ]
                    });
                };

                realityCheckIntervalPromise =  $timeout(handleRealityCheck, $rootScope.profile.active_time_in_casino * 1000);
            }
            if (!profileActiveTimePromise) {
                profileActiveTimePromise = $rootScope.$watch('profile.active_time_in_casino', function () {
                    realityCheckIntervalPromise && $timeout.cancel(realityCheckIntervalPromise) && (realityCheckIntervalPromise = undefined);
                    if ($rootScope.profile.active_time_in_casino) {
                        checkAndStartRealityInterval(scope);
                    }
                });
            }
        }
    }

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
    }

    function addNeededDataInUrl(gameInfo, initialUrl) {
        if (gameInfo.studio) {
            initialUrl += "&studio=" + gameInfo.studio;
        }

        return initialUrl;
    }

    function showMessage(message) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: 'warning',
            title: ' ',
            content: message
        });
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
        if(!popup || popup.closed || typeof popup.closed=='undefined')
        {
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
     * @param {Int} view int
     */
    casinoManager.changeView = function changeView(scope, view) {
        var i, gameInfo, uniqueId;
        if(view > scope.gamesInfo.length) {
            for (i = scope.gamesInfo.length; i < view; i++) {
                uniqueId = Math.random().toString(36).substr(2, 9);
                gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
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
                    uniqueId = Math.random().toString(36).substr(2, 9);
                    gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
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

        analytics.gaSend('send', 'event', 'multiview',  {'page': $location.path(), 'eventLabel': 'multiview changed to ' + view});
    };

    casinoManager.getGameById = function getGameById(games, id) {
        for(var i = 0, count = games.length; i < count;  i += 1) {
            if (games[i].id === id) {
                return games[i];
            }
        }

        return null;
    };

    casinoManager.findAndCloseGame = function findAndCloseGame(scope, gameId) {
        if (scope.gamesInfo && scope.gamesInfo.length) {
            if (gameId === undefined) {
                casinoManager.closeGame(scope);
            } else {
                var i, length = scope.gamesInfo.length;
                for (i = 0; i < length; i += 1) {
                    if (scope.gamesInfo[i].game && (scope.gamesInfo[i].game.id == gameId || scope.gamesInfo[i].game.server_game_id == gameId)) {
                        casinoManager.closeGame(scope, scope.gamesInfo[i].id);
                        break;
                    }
                }
            }
        }
    };

    casinoManager.closeGame = function closeGame(scope, id) {
        if (id === undefined) {
            scope.gamesInfo = [];
            scope.viewCount = 1;
            $rootScope.casinoGameOpened = 0;
        } else {
            var cauntOfGames = 0, i, count;
            for (i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
                if (scope.gamesInfo[i].id === id) {
                    var uniqueId = Math.random().toString(36).substr(2, 9);
                    scope.gamesInfo[i] = {gameUrl: '', id: uniqueId, toAdd: false};
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

        checkAndStopRealityInterval(scope.gamesInfo);

        $location.search('type', undefined);
        $location.search('game', undefined);
    };

    casinoManager.openGameDetailsPopUp = function openGameDetailsPopUp (gameId) {
        var url = '#/popup/?u=' + ($rootScope.profile && $rootScope.profile.unique_id ? $rootScope.profile.unique_id : '') + '&action=gamedetails&game_skin_id=' + gameId;
        var param = "scrollbars=1,width=1000,height=600,resizable=yes";

        var popup = $window.open(url, 'game.details', param);
        casinoManager.checkIfPopupIsBlocked(popup);
    };

    casinoManager.clearAllPromises = function clearAllPromises() {
        checkAndStopRealityInterval();
    };

    return casinoManager;
}]);
