/* global CASINO */
/**
 * @ngdoc service
 * @name CASINO.service:casinoUtils
 * @description
 * Utility functions
 */

CASINO.service('casinoUtils', ['$rootScope', '$window', '$sce', '$location', 'Storage', 'DomHelper', 'Zergling', 'Config', 'CConfig', 'Translator', 'LanguageCodes', function ($rootScope, $window, $sce, $location, Storage, DomHelper, Zergling, Config, CConfig, Translator, LanguageCodes) {
    'use strict';
    var casinoUtils = {};

    /**
     * @ngdoc method
     * @name filterByGameProvider
     * @methodOf CASINO.service:casinoUtils
     * @description returns filtered games
     * @param {Array} games the array
     * @param {Array} providers the list of providers
     *
     * @return {Array} games
     */
    casinoUtils.filterByGameProvider = function filterByGameProvider(games, providers) {
        if (!providers || !providers.length) {
            return games;
        }
        var i, j;
        for (i = 0; i < providers.length; i += 1) {
            for (j = 0; j < games.length; j += 1) {
                if (games[j].gameProvider === providers[i]) {
                    games.splice(j, 1);
                    j--;
                }
            }
        }

        return games;
    };

    /**
     * @ngdoc method
     * @name setGamesFunMode
     * @methodOf CASINO.service:casinoUtils
     * @description returns games by adding hasFunMode property
     * @param {Array} games the array
     * @param {Array} providers the list of providers
     *
     * @return {Array} games
     */
    casinoUtils.setGamesFunMode = function setGamesFunMode(games) {
        if (games[0] && !games[0].hasOwnProperty('hasFunMode')) {
            var i, length = games.length;
            for (i = 0; i < length; i += 1) {
                games[i].hasFunMode = CConfig.main.funModeEnabled && CConfig.main.providersThatHaveNotFunMode.indexOf(games[i].gameProvider) === -1 && CConfig.main.categoriesThatHaveNotFunMode.indexOf(games[i].gameCategory) === -1;
                if(games[i].hasFunMode) {
                    games[i].funModeText =  games[i].gameCategory &&(games[i].gameCategory.replace(/\s+/g, '') === CConfig.skillGames.categoryName || games[i].gameCategory.replace(/\s+/g, '') === CConfig.virtualBetting.categoryName) ? CConfig.main.viewLabel || 'View' : CConfig.main.playForFreeLabel || 'Play For Free';
                }

                if (CConfig.main.guestLabel && !Config.env.authorized) {
                    games[i].funModeText = CConfig.main.guestLabel;
                }

            }
        }

        return games;
    };

    /**
     * @ngdoc method
     * @name getCasinoPopUpGames
     * @methodOf CASINO.service:casinoUtils
     * @description  returns an array of those games that can be played in multiviev mode
     *
     * @param {Array} allGames array of all games
     * @param {String} selectedCategory selected category name
     * @param {String} searchTerm term of input field
     * @param {Array} gamesInfo array of objects (object contains information about played casino game)
     * @returns {Array} games the array
     */
    casinoUtils.getCasinoPopUpGames = function getCasinoPopUpGames(allGames, selectedCategory, searchTerm, gamesInfo) {
        var games = [];
        if (allGames && allGames.length) {
            var i, count = allGames.length;
            var usedProviders = [], game, isNardiOpened = false;
            for (i = 0; i < gamesInfo.length; i += 1) {
                game = gamesInfo[i].game;
                if (game && (game.gameProvider === 'MGS' || game.gameProvider === 'BSG' || game.gameProvider === 'GMG' || game.gameProvider === 'NET') && usedProviders.indexOf(game.gameProvider) === -1) {
                    usedProviders.push(game.gameProvider);
                }
                if (game && game.id == '599'){
                    isNardiOpened = true;
                }
            }
            var category;
            for (i = 0; i < count; i += 1) {
                category = allGames[i].gameCategory;
                if ((category === selectedCategory || (selectedCategory === 'CasinoGames' && category !== 'LiveDealer' && category !== 'SkillGames' && category !== 'VirtualBetting')) && (searchTerm === '' || allGames[i].gameName.toUpperCase().indexOf(searchTerm.toUpperCase()) > -1)) {
                    if (selectedCategory !== 'CasinoGames' || !usedProviders.length || usedProviders.indexOf(allGames[i].gameProvider) === -1) {
                        if (!isNardiOpened || allGames[i].id != '599') {
                            games.push(allGames[i]);
                        }
                    }
                }
            }
        }

        return games;
    };

    /**
     * @ngdoc method
     * @name getMultiviewGames
     * @methodOf CASINO.service:casinoUtils
     * @description  returns an array of those games that can be played in multiviev mode (remove mobile games, the games
     * that do not resizable, the games that do not have realPlay mode, financials game and fantasy sport.)
     *
     * @param {Array} allGames array of all games
     * @returns {Array} games the array
     */
    casinoUtils.getMultiviewGames = function getMultiviewGames(allGames) {
        var i, count = allGames.length;
        for (i = 0; i < count; i += 1) {
            if (allGames[i].id !== '1291' && allGames[i].id !== '1541' && (allGames[i].isMobile === 'Y' || allGames[i].gameType.ratio === '0' || allGames[i].gameType.realPlay !== 1 || allGames[i].id === '706' || allGames[i].id === '1297')) {
                allGames.splice(i, 1);
                i--;
                count--;
            }
        }
        return allGames;
    };

    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.service:casinoUtils
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     *
     * @param {Object} scope the rootScope
     * @param {Object} game Object
     */
    casinoUtils.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(scope, game) {
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
     * @methodOf CASINO.service:casinoUtils
     * @description
     *
     * @param {Object} scope the rootScope
     * @param {Object} gameInfo Object
     */
    casinoUtils.togglePlayMode = function togglePlayMode (scope, gameInfo) {
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
     * @methodOf CASINO.service:casinoUtils
     * @description find game by id in opened games and relaod it
     *
     * @param {Object} scope the scope
     * @param {Int} id gameInfo id
     */
    casinoUtils.refreshCasinoGame = function refreshCasinoGame(scope, id) {
        var i , length = scope.gamesInfo.length;
        for (i = 0; i < length; i += 1) {
            if (scope.gamesInfo[i].id === id) {
                var mode = scope.gamesInfo[i].gameMode;
                var currentGame = scope.gamesInfo[i].game;
                var tableId = scope.gamesInfo[i].tableId;
                var limit = scope.gamesInfo[i].limit;
                var studio = scope.gamesInfo[i].studio;
                scope.gamesInfo[i] = {gameUrl: '', id: id, toAdd: true};
                scope.openGame(currentGame, mode, tableId, studio, limit);
                break;
            }
        }
    };

    /**
     * @ngdoc method
     * @name refreshOpenedGames
     * @methodOf CASINO.service:casinoUtils
     * @description  if user logged in refresh open games that do not have mode "play for fun" and open in real mode, or
     *               if user logged out close games that opened in real mode
     *
     * @param {Object} scope the scope
     */
    casinoUtils.refreshOpenedGames = function refreshOpenedGames(scope) {
        for (var i = 0, count = scope.gamesInfo.length; i < count; i += 1) {
            if (scope.gamesInfo[i].game) {
                if (scope.gamesInfo[i].game.id !== CConfig.backgammon.id || $rootScope.env.authorized) {
                    if (scope.gamesInfo[i].game.id === scope.gamesInfo[i].game.gameID == CConfig.ogwil.gameID ||
                        scope.gamesInfo[i].game.gameCategory == CConfig.virtualBetting.categoryName ||
                        scope.gamesInfo[i].game.gameCategory == CConfig.liveCasino.categoryName ||
                        scope.gamesInfo[i].game.gameCategory == CConfig.skillGames.categoryName) {
                        var infoId = scope.gamesInfo[i].id;
                        var currentGame = scope.gamesInfo[i].game;
                        var tableId = scope.gamesInfo[i].tableId;
                        var studio = scope.gamesInfo[i].studio;
                        var gameMode = $rootScope.env.authorized ? 'real' : 'fun';
                        var limit = scope.gamesInfo[i].limit;
                        scope.gamesInfo[i] = {gameUrl: '', id: infoId, toAdd: true};
                        scope.openGame(currentGame, gameMode, tableId, studio, limit);
                    } else if (scope.gamesInfo[i].gameUrl !== '' && scope.gamesInfo[i].gameMode === 'real') {
                        scope.closeGame(scope.gamesInfo[i].id);
                    }
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name openPopUpWindow
     * @methodOf CASINO.service:casinoUtils
     * @description  finds game object, then calculates the possible sizes of the popup window and opens casino game in there
     *
     * @param {String} id game id
     * @param {Object} scope the scope object
     */
    casinoUtils.openPopUpWindow = function openPopUpWindow(scope, id) {
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
        var windowUrl, game = gameInfo.game, gameMode = gameInfo.gameMode === "real" ? "real" : "fun";
        if (game.gameType && typeof  game.gameType == 'string') {
            game.gameType = JSON.parse(game.gameType);
        }
        if (game.gameType.width && game.gameType.height) {
            scaleWidth = percent * screenResolution.x / game.gameType.width;
            scaleHeight = percent *  screenResolution.y / game.gameType.height;
            scale = Math.min(scaleWidth, scaleHeight);
            windowWidth = scale * game.gameType.width;
            windowHeight = scale * game.gameType.height;
        } else if (game.gameType.ratio) {
            var ratios =  game.gameType.ratio.split(':');
            var initialWidth = percent * screenResolution.y * ratios[0] / ratios[1];
            scaleWidth =percent *  screenResolution.x / initialWidth;
            scale = Math.min(scaleWidth, 1);
            windowWidth = scale * initialWidth;
            windowHeight = scale * screenResolution.y * percent;
        }
        var windowParam = 'width=' + windowWidth + ',height=' + windowHeight + ',menubar=no,toolbar=no,location=no,scrollbars=no,resizable=yes';

        var isSpecialLiveGame = (gameInfo.game.gameCategory == CConfig.liveCasino.categoryName && gameInfo.game.gameProvider === CConfig.liveCasino.provider);



        if (!isSpecialLiveGame && CConfig.main.providersThatWorkWithSwarm.indexOf(game.gameProvider) !== -1) {
            var request = generateRequest(gameInfo);

            Zergling.get(request, 'casino_game_url')
                .then(
                    function (data) {
                        if (data && data.url) {
                            openGameWindow(data.url, gameInfo, windowParam);
                            return;
                        } else {
                            showMessage('casino_auth_error');
                        }
                    },
                    function (reason) {
                        showMessage('casino_auth_error');
                    }
                )['finally'](function () {
                    scope.closeGame(id);
                });
        } else {
            if (isSpecialLiveGame) {
                var subDomain = CConfig.staticUrlForLiveCasino || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1);
                windowUrl = CConfig.liveCasino.lcGameUrlPrefix + subDomain + '/web/' + LanguageCodes[$rootScope.env.lang] + '/' + CConfig.main.partnerID + '/table?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[gameInfo.game.externalID] || 0);
            } else {
                var gameOption = game.gameOptions ? game.gameOptions : "";
                windowUrl = CConfig.cUrlPrefix + CConfig.cGamesUrl + '?gameid=' + game.gameID + '&mode=' + gameMode + '&provider=' + game.gameProvider + gameOption + '&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;
            }

            if (gameMode === 'real') {
                Zergling.get({'game_id': parseInt(game.externalID)}, 'casino_auth')
                    .then(
                        function (response) {
                            if (response && response.result) {
                                if (response.result.has_error == "False") {
                                    var userInfo = '&token=' + response.result.token + '&username=' + response.result.username + '&balance=' + response.result.balance + '&currency=' + response.result.currency + '&userid=' + response.result.id;
                                    openGameWindow(windowUrl + userInfo, gameInfo, windowParam);
                                    return;
                                } else if (response.result.has_error == "True") {
                                    showMessage('casino_auth_error');
                                }
                            }
                        },
                        function (failResponse) {
                            showMessage('casino_auth_error');
                        }
                    )['finally'](function () {
                        scope.closeGame(id);
                    });
            } else {
                scope.closeGame(id);
                openGameWindow(windowUrl, gameInfo, windowParam);
            }
        }
    };

    function openGameWindow(url, gameInfo, param) {
        var windowName = gameInfo.game.gameID;
        if (gameInfo.tableId) {
            url += "&table_id=" + gameInfo.tableId;
            windowName += "_" + gameInfo.tableId;
        }

        url = addNeededDataInUrl(gameInfo, url + '&popup=true');

        var popup = $window.open(url, windowName, param);
        casinoUtils.checkIfPopupIsBlocked(popup);
    }

    /**
     * @ngdoc method
     * @name gpTransfer
     * @methodOf CASINO.service:casinoUtils
     * @description find game by id in opened games and relaod it
     *
     * @param {Object} transferModel object that contains some keys for request
     */
    casinoUtils.gpTransfer = function gpTransfer(transferModel) {
        transferModel.transferInProgress = true;
        var request;
        if (transferModel.method === 'get_balance') {
            request = {product: 'KlasGaming'};
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
     * @name setupTableInfo
     * @methodOf CASINO.service:casinoUtils
     * @description prepare url to open tables
     *
     * @param {Object} tableInfo object that contains url of tables
     */
    casinoUtils.setupTableInfo = function setupTableInfo(tableInfo) {
        if (CConfig.main.providersThatWorkWithSwarm.indexOf('VGS') !== -1) {
            tableInfo.loadingUserData = true;
            Zergling.get({'provider': 'VGS', 'game_id': 'VGS102', 'external_game_id': '102', 'mode': $rootScope.env.authorized ? 'real' : 'fun'}, 'casino_game_url')
                .then(
                function (data) {
                    if (data && data.url) {
                        tableInfo.url = $sce.trustAsResourceUrl(data.url);
                    }
                })['finally'](function () {
                    tableInfo.loadingUserData = false;
                });
        } else {
            var urlPrefix = CConfig.cUrlPrefix + CConfig.cGamesUrl + '?gameid=VGS102&provider=VGS&table_id=-1&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;
            if ($rootScope.env.authorized) {
                tableInfo.loadingUserData = true;
                Zergling.get({'game_id': 102}, 'casino_auth').then(function (response) {
                    if (response && response.result && response.result.has_error == "False") {
                        var userInfo = '&token=' + response.result.token + '&username=' + response.result.username + '&currency=' + response.result.currency + '&userid=' + response.result.id + '&nickname=' + response.result.nickname + '&firstname=' + $rootScope.profile.first_name + '&lastname=' + $rootScope.profile.last_name;
                        tableInfo.url = $sce.trustAsResourceUrl(urlPrefix + userInfo + '&mode=real');
                    }
                })['finally'](function () {
                    tableInfo.loadingUserData = false;
                });
            } else {
                tableInfo.url = $sce.trustAsResourceUrl(urlPrefix + '&mode=fun');
            }
        }
    };

    /**
     * @ngdoc method
     * @name adjustLiveCasinoGame
     * @methodOf CASINO.service:casinoUtils
     * @description changes game and tableId in gameInfo or finds and opens game
     *
     * @param {Object} scope the scope
     * @param {Object} message object that contains game info
     * @param {Array} games array of games
     */

    casinoUtils.adjustLiveCasinoGame = function adjustLiveCasinoGame(scope, message, games) {
        games = games || scope.allGames;
        var i, length, oldGame, newGame;

        for(i = 0, length = games.length; i < length; i += 1) {
            if (message.data.provider + message.data.gameId === games[i].gameID) {
                newGame = games[i];
            }
            if (message.data.provider + message.data.lastGameId === games[i].gameID) {
                oldGame = games[i];
            }
        }

        if (message.data.isMinnyLobby) {
            i = 0;
            length = scope.gamesInfo.length;

            if (oldGame) {
                for (; i < length; i += 1) {
                    if (scope.gamesInfo[i].game && scope.gamesInfo[i].game.id === oldGame.id) {
                        scope.gamesInfo[i].game = newGame;
                        scope.gamesInfo[i].tableId = message.data.tableId;
                        break;
                    }
                }
            } else {
                for (; i < length; i += 1) {
                    if (scope.gamesInfo[i].game && scope.gamesInfo[i].game.id === newGame.id) {
                        scope.gamesInfo[i].tableId = message.data.tableId;
                        break;
                    }
                }
            }
        } else {
            scope.openGame(newGame, undefined, message.data.tableId, null, message.data.gameSelectedLimit);
        }
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.service:casinoUtils
     *
     * @description  opens login form if it needed, or generates casino game url and opens it
     *
     */
    casinoUtils.openCasinoGame = function openCasinoGame(scope, game, gameType, tableId, studio, limit) {
        scope.showAllGames = false;
        $rootScope.env.showSlider = false;
        $rootScope.env.sliderContent = '';

        if (!gameType) {
            gameType = $rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : 'fun';
        }

        if (gameType === 'real') {
            if (!CConfig.main.realModeEnabled) {
                gameType = 'fun';
            } else if (!$rootScope.env.authorized) {
                $rootScope.$broadcast("openLoginForm");
                var infoIndex, count = scope.gamesInfo.length;
                for (infoIndex = 0; infoIndex < count; infoIndex += 1) {
                    scope.gamesInfo[infoIndex].toAdd = false;
                }
                return;
            }
        }
        if (game.gameInfo && typeof game.gameInfo == 'string') {
            game.gameInfo = JSON.parse(game.gameInfo);
        }
        if (game.gameType && typeof  game.gameType == 'string') {
            game.gameType = JSON.parse(game.gameType);
        }
        if (game.gameType && game.gameType.realPlay !== 1) {
            return;
        }

        var gameInfo = {};
        gameInfo.gameID = game.gameID;
        gameInfo.id = Math.random().toString(36).substr(2, 9);
        gameInfo.gameMode = gameType;
        gameInfo.toAdd = false;
        gameInfo.game = game; //need for refresh some games after loggin
        var gameOption = game.gameOptions ? game.gameOptions : "";
        var tableInfo = tableId !== undefined ? "&table_id=" + tableId : "";
        gameInfo.tableId = tableId;
        gameInfo.studio = studio;
        gameInfo.limit = limit;
        var gameUrl = CConfig.cUrlPrefix + CConfig.cGamesUrl + '?gameid=' + game.gameID + '&mode=' + gameType + '&provider=' + game.gameProvider + gameOption + tableInfo +
            '&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;


        if (scope.gamesInfo && scope.gamesInfo.length > 1) {
            if (game.gameType.ratio === '0') {
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
                    if (gameType === 'real' && game.id === usedGame.id && (game.gameCategory !== CConfig.liveCasino.categoryName || tableId === scope.gamesInfo[i].tableId)) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "warning",
                            title: "Warning",
                            content: Translator.get('This Table Is Already Opened In Multi Game View. Please Choose Another Game.')
                        });
                        return;
                    }
                    usedGames.push(usedGame);
                    if ((usedGame.gameProvider === 'MGS' || usedGame.gameProvider === 'BSG' || usedGame.gameProvider === 'GMG' || usedGame.gameProvider === 'NET') && usedProviders.indexOf(usedGame.gameProvider) === -1) {
                        usedProviders.push(usedGame.gameProvider);
                    }
                }
                if (scope.gamesInfo[i].toAdd) {
                    toAddIndex = i;
                }
            }
            if (usedProviders.indexOf(game.gameProvider) !== -1) {
                for (var j = 0; j < usedGames.length; j += 1) {
                    if (game.id === usedGames[j].id) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "warning",
                            title: "Warning",
                            content: Translator.get('This Table Is Already Opened In Multi Game View. Please Choose Another Table.')
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
                    $location.search('table', undefined);
                    $location.search('studio', undefined);
                    $location.search('limit', undefined);

                    addCurrentGame(scope, gameInfo, gameUrl, toAddIndex);
                }
            }
        } else {
            scope.gamesInfo = [];
            $location.search('game', game.id);
            $location.search('type', gameType);
            $location.search('limit', limit);


            addCurrentGame(scope, gameInfo, gameUrl, 0);
        }

        $rootScope.casinoGameOpened = scope.gamesInfo.length;

        if($rootScope.env.authorized && CConfig.main.providersCustomMessages && CConfig.main.providersCustomMessages[game.gameProvider] && !Storage.get(game.gameProvider)){
            Storage.set(game.gameProvider, 'Popup time delay for ' + game.gameProvider + ' provider', CConfig.main.providersCustomMessages[game.gameProvider].timeDelay);
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'warning',
                title: 'Warning',
                content: Translator.get(CConfig.main.providersCustomMessages[game.gameProvider].message)
            });
        }
    };

    /**
     * @ngdoc method
     * @name addCurrentGame
     * @methodOf CASINO.service:casinoUtils
     * @description changes game and tableId in gameInfo or finds and opens game
     *
     * @param {Object} scope the scope
     * @param {Object} gameInfo object that contains game info
     * @param {String} gameUrl string that contains part of game's url
     * @param {Int} toAddIndex int current index
     */

    function addCurrentGame(scope, gameInfo, gameUrl, toAddIndex) {
        var isSpecialLiveGame = (gameInfo.game.gameCategory == CConfig.liveCasino.categoryName && gameInfo.game.gameProvider === CConfig.liveCasino.provider);


        if (!isSpecialLiveGame && CConfig.main.providersThatWorkWithSwarm.indexOf(gameInfo.game.gameProvider) !== -1) {
            gameInfo.loadingUserData = true;
            scope.gamesInfo[toAddIndex] = gameInfo;
            if (gameInfo.gameMode !== "real") {
                gameInfo.gameMode = "fun";
            }
            var request = generateRequest(gameInfo);

            Zergling.get(request,
                'casino_game_url').then(function (data) {
                    if (data && data.url) {
                        gameInfo.loadingUserData = false;
                        gameInfo.gameUrl = $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo, data.url));
                    } else {
                        showMessage('casino_auth_error');
                        scope.closeGame(gameInfo.id);
                    }
            }, function (reason) {
                    showMessage('casino_auth_error');
                    scope.closeGame(gameInfo.id);
                });
        } else {
            if (isSpecialLiveGame) {
                var subDomain = CConfig.staticUrlForLiveCasino || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1);
                gameUrl = CConfig.liveCasino.lcGameUrlPrefix + subDomain + '/web/' + LanguageCodes[$rootScope.env.lang] + '/' + CConfig.main.partnerID + '/table?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[gameInfo.game.externalID] || 0);
            }

            if (gameInfo.gameMode === 'real') {

                gameInfo.loadingUserData = true;
                scope.gamesInfo[toAddIndex] = gameInfo;
                Zergling.get({'game_id': parseInt(gameInfo.game.externalID)}, 'casino_auth').then(function (response) {
                    if (response && response.result) {
                        if (response.result.has_error == "False") {
                            var userInfo = '&token=' + response.result.token + '&username=' + response.result.username + '&balance=' + response.result.balance + '&currency=' + response.result.currency + '&userid=' + response.result.id;
                            gameInfo.gameUrl = $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo, gameUrl + userInfo));
                            gameInfo.loadingUserData = false;
                        } else if (response.result.has_error == "True") {
                            showMessage('casino_auth_error');
                            scope.closeGame(gameInfo.id);
                        }
                    }
                }, function (failResponse) {
                    showMessage('casino_auth_error');
                    scope.closeGame(gameInfo.id);
                });
            } else {
                gameInfo.gameUrl = $sce.trustAsResourceUrl(addNeededDataInUrl(gameInfo,gameUrl));
                scope.gamesInfo[toAddIndex] = gameInfo;
            }
        }
    }

    function generateRequest(gameInfo) {
        var request = {
            'provider': gameInfo.game.gameProvider,
            'game_id': gameInfo.game.gameID,
            'external_game_id': gameInfo.game.externalID,
            'mode': gameInfo.gameMode,
            'skin_host': CConfig.cUrlPrefix
        };

        if (gameInfo.tableId) {
            request.table_id = gameInfo.tableId.toString();
        }
        if (gameInfo.limit) {
            request.limit_category_id = gameInfo.limit;
        }
        if (gameInfo.studio) {
            request.studio = parseInt(gameInfo.studio);
        }
        if (gameInfo.game.gameOptions) {
            var props = gameInfo.game.gameOptions.split('&');
            for (var i = 0, length = props.length; i < length; i += 1) {
                if (props[i].indexOf("=") != -1) {
                   var option =  props[i].split("=");
                    request[option[0]] = option[1];
                }
            }
        }

        return request;
    }

    function addNeededDataInUrl(gameInfo, initialUrl) {
        if (gameInfo.studio) {
            initialUrl += "&studio=" + gameInfo.studio;
        }
        if (gameInfo.game.gameCategory === CConfig.liveCasino.categoryName) {
            var location = $window.location.origin + '/#/livedealer/';
            initialUrl += '&homeaction=' + encodeURIComponent(location) + '&loginaction=' + encodeURIComponent(location + '?action=login');
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
     * @name prepareSkillGames
     * @methodOf CASINO.service:casinoUtils
     * @description do needed changes
     *
     * @param {Array} games the list of games
     */
    casinoUtils.prepareSkillGames = function prepareSkillGames(games) {
        var skillGames = [];
        for (var i = 0, j = games.length; i < j; i += 1) {
            var game = games[i];
            if (game.gameID !== CConfig.financials.gameID) {
                game.gameType = JSON.parse(game.gameType);
                game.gameInfo = JSON.parse(game.gameInfo);

                if (game.gameType.isDownloadClient === 1 && game.gameInfo.downloadLink.indexOf('http') === -1) {
                    game.gameInfo.downloadLink = CConfig.cUrlPrefix + game.gameInfo.downloadLink;
                }
                if (game.gameType.realPlay === 1 && game.gameInfo.targetOpenLink.indexOf('http') === -1) {
                    game.gameInfo.targetOpenLink = CConfig.cUrlPrefix + game.gameInfo.targetOpenLink + '&lan=' + $rootScope.env.lang;
                }
                skillGames.push(game);
            }
        }

        return skillGames;
    };

    /**
     * @ngdoc method
     * @name checkIfPopupIsBlocked
     * @methodOf CASINO.service:casinoUtils
     * @description  detect if the popup has been blocked by the browser and shows proper message
     *
     * @param {Object} popup object
     */
    casinoUtils.checkIfPopupIsBlocked = function checkIfPopupIsBlocked(popup) {
        if(!popup || popup.closed || typeof popup.closed=='undefined')
        {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: 'info',
                title: 'Alert',
                content: 'Please enable pop-up windows in your browser in order to open the game in a separate window.'
            });
        }
    };

    return casinoUtils;
}]);
