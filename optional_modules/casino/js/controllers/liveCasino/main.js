/**
 * @ngdoc controller
 * @name CASINO.controller:liveCasinoMainCtrl
 * @description
 * casino page controller
 */

CASINO.controller('liveCasinoMainCtrl', ['$rootScope', '$scope', '$sce', '$location', '$interval', '$window', 'Storage', 'CConfig', 'casinoData', 'Utils', 'casinoUtils', 'Translator', 'casinoCache', 'Zergling', 'WPConfig', 'content', 'analytics', 'smoothScroll', 'TimeoutWrapper', function ($rootScope, $scope, $sce, $location, $interval, $window, Storage, CConfig, casinoData, Utils, casinoUtils, Translator, casinoCache, Zergling, WPConfig, content, analytics, smoothScroll, TimeoutWrapper) {
    'use strict';

    $scope.games = [];
    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    $scope.errorStatus = 0;
    $scope.liveGamesConf = CConfig.liveCasino;
    $scope.selectedGameId = '';
    $scope.liveCasinoLobbyPopup = {};
    $scope.casinoLobbyRowView = Storage.get('isLobbyRowView');
    $scope.cConf = {
        iconsUrl: CConfig.cUrlPrefix + CConfig.iconsUrl,
        backGroundUrl: CConfig.cUrlPrefix + CConfig.backGroundUrl,
        newCasinoDesignEnabled: CConfig.main.newCasinoDesign.enabled
    };
    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.$on('widescreen.on', function () { $scope.wideMode = true; });
    $scope.$on('widescreen.off', function () { $scope.wideMode = false; });
    $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
    $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });

    /**
     * @ngdoc method
     * @name init
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Initialization
     */
    function init() {
        if ($scope.liveGamesConf.view3DEnabled || $scope.liveGamesConf.viewStyle === '3DView') { //footer must be movable for only for 3D View
            $rootScope.footerMovable = true;
        }
        loadDealerPages();
        loadGames();

        //check and show bonus popUp if it need
        if (CConfig.bonusPopUpUrl) {
            getBonusPopUpOptions();
        }
    }

    /**
     * @ngdoc method
     * @name loadGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads live dealer games list using {@link CASINO.service:casinoData casinoData} service's **getCategory** method
     * and assigns to scope's 'games' variable
     */
    function loadGames() {
        var gamesData = casinoCache.get(CConfig.liveCasino.categoryName + CConfig.main.partnerID);
        if (gamesData !== undefined  && gamesData.length) {
            prepareGames(gamesData);
        } else {
            casinoData.getCategory(CConfig.liveCasino.categoryName, CConfig.main.partnerID).then(function (response) {
                if (response.data.length) {
                    var availableGames = casinoUtils.filterByGameProvider(response.data, CConfig.liveCasino.filterByProvider);
                    var preparedGames = casinoUtils.setGamesFunMode(availableGames);
                    casinoCache.put(CConfig.liveCasino.categoryName + CConfig.main.partnerID, preparedGames);
                    prepareGames(preparedGames);
                } else {
                    $scope.errorStatus = 1;
                }
            }, function (reason) {
                $scope.errorStatus = 1;
            });
        }
    }

    /**
     * @ngdoc method
     * @name getBonusPopUpOptions
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Get bonus pop up options
     */
    function getBonusPopUpOptions() {
        var searchParams = $location.search();
        if (!searchParams.game) {
            var wasShownPopUp = Storage.get('lcBonusPopUp');
            if (!wasShownPopUp) {
                Storage.set('lcBonusPopUp', true, CConfig.main.storedbonusPopUpLifetime);
                $rootScope.$broadcast('youtube.videourl', CConfig.bonusPopUpUrl);
            }
        }
    }

    /**
     * @ngdoc method
     * @name prepareGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Prepare casino games
     * @param {Object} games array
     */
    function prepareGames(games) {
        var isInKeno = $location.path() === '/keno/' || $location.path() === '/keno';
        if (!isInKeno) {
            $scope.games = games;

            if (CConfig.main.multiViewEnabled) {
                getAllGames();
            }
            if ($scope.liveGamesConf.view3DEnabled || $scope.liveGamesConf.viewStyle === '3DView') {
                prepareView3DDisplay();
                load3DViewTopBanners();
            } else if ($scope.liveGamesConf.viewStyle === 'SliderView') {
                if (!$scope.liveGamesConf.disableProvidersFilter) {
                    initProvidersData();
                }
            }
        } else {
            var kenoGames = [], length = games.length;
            for (var i = 0; i < length; i += 1) {
                if (games[i].id === $scope.liveGamesConf.games.keno.id || games[i].id === $scope.liveGamesConf.games.draw.id) {
                    kenoGames.push(games[i]);
                }
            }
            $scope.games = kenoGames;
            $scope.firstView = false;
            $scope.liveGamesConf.allViewsEnabled = false;
            $scope.liveGamesConf.view3DEnabled = true;
        }

        findAndOpenGame();
    }

    /**
     * @ngdoc method
     * @name getAllGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  loads all games and filter options list using {@link CASINO.service:casinoData casinoData} service's **getFilterOptions** method
     */
    function getAllGames() {
        $scope.agSelectedCategory = 'LiveDealer';
        $scope.popUpSearchInput = '';
        var gamesData = casinoCache.get('allGames' + CConfig.main.partnerID);
        if (gamesData !== undefined) {
            $scope.allGames = casinoCache.get('allGames' + CConfig.main.partnerID);
        } else {
            casinoData.getFilterOptions().then(function (response) {
                if (response.data) {
                    var multiViewGames = casinoUtils.getMultiviewGames(Utils.objectToArray(response.data.games));
                    var filteredMultiViewGames = casinoUtils.filterByGameProvider(multiViewGames, CConfig.main.filterByProvider);
                    $scope.allGames = casinoUtils.setGamesFunMode(filteredMultiViewGames);
                    casinoCache.put('allGames' + CConfig.main.partnerID, $scope.allGames);
                }
            });
        }
    };

    /**
     * @ngdoc method
     * @name findAndOpenGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Find and open game
     */
    function findAndOpenGame() {
        var searchParams = $location.search();
        if (searchParams.game !== undefined) {
            var gameID = parseInt(searchParams.game, 10);
            var game = getGameById(gameID);
            var studio = searchParams.studio;
            if (game) {
                $scope.openGame(game, null, null, studio, searchParams.limit);
            }
        }
    }

    /**
     * @ngdoc method
     * @name openGameInNewWindow
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  calculates the possible sizes of the popup window and opens casino game in there
     *
     * @param {string} id game id
     */
    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoUtils.openPopUpWindow($scope, id);
    };

    /**
     * @ngdoc method
     * @name openTables
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {Object} game game object
     * @param {String} gameType gameType string
     * @param {String} studio studio string
     * @description  opens login form if it needed, or generates live casino tables url and opens it
     */
    $scope.openTables = function openTables(game, gameType, studio) {
        if (!gameType) {
            gameType = $rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : 'fun';
        }
        if (gameType === 'real' && !$rootScope.env.authorized) {
            $rootScope.$broadcast("openLoginForm");
            return;
        }
        var data = CConfig.liveCasino.games;
        //other games haven't tables
        if (game.id === data.roulette.id || game.id === data.blackjack.id || game.id === data.baccarat.id || game.id === data.betOnPoker.id || game.id === data.betOnBaccarat.id ||game.id === data.russianPoker.id || game.id === data.fortuna.id) {
            $scope.liveCasinoLobbyPopup.open = true;
            $scope.selectedGameId = game.serverGameID;
            if(!$scope.liveGamesConf.lobby.getDataViaSwarm) {
                authorizeTablesControll(game);
            }
        } else {
            $scope.openGame(game, gameType, null, studio);
        }
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {Object} game game object
     * @param {String} gameType gameType string
     * @param {String} tableId tableId string
     * @param {String} studio studio string
     * @param {String} limit limit string
     * @description  opens login form if it needed, or generates casino game url and opens it
     */
    $scope.openGame = function openGame(game, gameType, tableId, studio, limit) {
        if ($scope.gamesInfo.length < 2) {
            if (tableId) {
                $location.search('table', tableId);
            } else {
                var searchParams = $location.search();
                if (searchParams.table !== undefined) {
                    tableId = searchParams.table;
                }
            }
            if (studio) {
                $location.search('studio', studio);
            }
            if (limit) {
                $location.search('limit', limit);
            }
        }

        casinoUtils.openCasinoGame($scope, game, gameType, tableId, studio, limit);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  close opened game
     */
    $scope.closeGame = function closeGame(id) {
        if (id === undefined) {
            $scope.gamesInfo = [];
            $scope.viewCount = 1;
            $rootScope.casinoGameOpened = 0;
        } else {
            var cauntOfGames = 0, i, count;
            for (i = 0, count = $scope.gamesInfo.length; i < count; i += 1) {
                if ($scope.gamesInfo[i].id === id) {
                    var uniqueId = Math.random().toString(36).substr(2, 9);
                    $scope.gamesInfo[i] = {gameUrl: '', id: uniqueId, toAdd: false};
                }
                if ($scope.gamesInfo[i].gameUrl !== '') {
                    cauntOfGames++;
                }
            }

            if (cauntOfGames === 0) {
                $scope.gamesInfo = [];
                $scope.viewCount = 1;
                $rootScope.casinoGameOpened = 0;
            }
        }

        $location.search('type', undefined);
        $location.search('game', undefined);
        $location.search('table', undefined);
        $location.search('studio', undefined);
        $location.search('limit', undefined);
    };

    /**
     * @ngdoc method
     * @name isFromSaved
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  checks if game (that has gameID) is in myCasinoGames
     * @param {Number} gameId Number
     * @returns {boolean} true if current game is in myCasinoGames, false otherwise
     */
    $scope.isFromSaved = function isFromSaved(gameId) {
        var games = $rootScope.myCasinoGames || [], i, j;

        for (i = 0, j = games.length; i < j; i += 1) {
            if (games[i].id === gameId) {
                return true;
            }
        }

        return false;
    };

    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     * @param {Object} game Object
     */
    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        casinoUtils.toggleSaveToMyCasinoGames($rootScope, game);
    };

    /**
     * @ngdoc method
     * @name togglePlayForReal
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Toggle play for real
     * @param game info object
     */
    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoUtils.togglePlayMode($scope, gameInfo);
    };

    /**
     * @ngdoc method
     * @name getGameById
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description get game by id
     * @param {Number} game id
     */
    function getGameById(gameID) {
        for(var i = 0, count = $scope.games.length; i < count;  i += 1) {
            if ($scope.games[i].id == gameID) {
                return $scope.games[i];
            }
        }
    }

    /**
     * @ngdoc method
     * @name openLiveDealerGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description open live dealer game
     * @param {Object} event not used
     * @param {Object} game object
     * @param {String} game type
     */
    function openLiveDealerGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            // if ($scope.gamesInfo.length === 1) {
            //     $scope.closeGame();
            // }
            //
            if ($scope.games.length) {
                $scope.openTables(getGameById(game.id), gameType, game.markets && game.markets.default);
                // $scope.openGame(getGameById(game.id), gameType);
            } else {
                var gamesWatcherPromise = $scope.$watch('games', function() {
                    if ($scope.games.length) {
                        $scope.openTables(getGameById(game.id), gameType, game.markets && game.markets.default);
                        //$scope.openGame(getGameById(game.id), gameType);
                        gamesWatcherPromise();
                    }
                });
            }
        } else {
            //games that are not resizable
            var typeOfGame = (typeof game.gameType) == 'string' ? JSON.parse(game.gameType) : game.gameType;
            if (typeOfGame.ratio == "0") {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
                    content: Translator.get('Sorry, this game cannot be opened in multi-view mode')
                });
            } else {
                var i, count = $scope.gamesInfo.length;
                for (i = 0; i < count; i += 1) {
                    if ($scope.gamesInfo[i].gameUrl === '') {
                        $scope.gamesInfo[i].toAdd = true;
                        if (game.gameCategory === CConfig.liveCasino.categoryName) {
                            $scope.openTables(game, gameType);
                        } else {
                            $scope.openGame(game, gameType);
                        }
                        break;
                    }
                }
                if (i === count) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "warning",
                        title: "Warning",
                        content: Translator.get('Please close one of the games for adding new one')
                    });
                }
            }
        }
    }

    $scope.$on("livedealer.openGame", openLiveDealerGame);

    $scope.$on('game.closeCasinoGame', function (ev, id) {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            if (id === undefined) {
                $scope.closeGame();
            } else {
                var i, length = $scope.gamesInfo.length;
                for (i = 0; i < length; i += 1) {
                    if ($scope.gamesInfo[i].game && $scope.gamesInfo[i].game.id == id) {
                        $scope.closeGame($scope.gamesInfo[i].id);
                    }
                }
            }
        }
    });

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoUtils.refreshOpenedGames($scope);
        }

        //refresh tables container if it's opened
        if ($scope.tablesControll) {
            var tableGame = $scope.tablesControll.game;
            $scope.tablesControll = null;

            TimeoutWrapper(function () {
                authorizeTablesControll(tableGame);
            }, 20);
        }
    });

    /**
     * @ngdoc method
     * @name authorizeTablesControll
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Authorize tables controlls
     * @param {Object} game object
     */
    function authorizeTablesControll(game) {
        $scope.tablesControll = {loadingUserData: true, game: game};
        if (CConfig.main.providersThatWorkWithSwarm.indexOf(game.gameProvider) !== -1) {
            Zergling.get({'provider': game.gameProvider, 'game_id': game.gameID, 'external_game_id': game.externalID, 'mode': $rootScope.env.authorized ? 'real' : 'fun'}, 'casino_game_url')
                .then(
                function (data) {
                    if (data && data.url) {
                        $scope.tablesControll.url = $sce.trustAsResourceUrl(data.url);
                        $scope.tablesControll.loadingUserData = false;
                    } else {
                        showAuthErrorAndRemoveTablesControll();
                    }
                },
                function (reason) {
                    showAuthErrorAndRemoveTablesControll();
                });
        } else {
            var gameUrl = CConfig.cUrlPrefix + CConfig.cGamesUrl + '?gameid=' + game.gameID + '&provider=' + game.gameProvider + '&lan=' + $rootScope.env.lang + '&partnerid=' + CConfig.main.partnerID;
            if ($rootScope.env.authorized) {
                Zergling.get({'game_id': parseInt(game.externalID)}, 'casino_auth').then(function (response) {
                    if (response && response.result) {
                        if (response.result.has_error == "False") {
                            var userInfo = '&token=' + response.result.token + '&username=' + response.result.username + '&currency=' + response.result.currency + '&userid=' + response.result.id;
                            $scope.tablesControll.url = $sce.trustAsResourceUrl(gameUrl + userInfo + '&mode=' + 'real');
                            $scope.tablesControll.loadingUserData = false;
                        } else if (response.result.has_error == "True") {
                            showAuthErrorAndRemoveTablesControll();
                        }
                    }
                }, function (failResponse) {
                    showAuthErrorAndRemoveTablesControll();
                });
            } else {
                $scope.tablesControll.loadingUserData = false;
                $scope.tablesControll.url = $sce.trustAsResourceUrl(gameUrl + '&mode=demo');
            }
        }
    }

    /**
     * @ngdoc method
     * @name showAuthErrorAndRemoveTablesControll
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Show authorization error and remove casino tables controlls
     */
    function showAuthErrorAndRemoveTablesControll() {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "error",
            title: "Error",
            content: Translator.get('casino_auth_error')
        });
        $scope.tablesControll = null;
    }

    /**
     * listen to messages from other windows to change livedealer options when needed
     */
    $scope.$on('livedealer.redirectGame', function (event, message) {
        if (message.data && !message.data.openJackpotList) {
            casinoUtils.adjustLiveCasinoGame($scope, message, $scope.games);
        }



        if (message.data.isMinnyLobby) {
            var searchParams = $location.search();
            if (searchParams.game !== undefined) {
                for (var i = 0, length = $scope.games.length; i < length; i += 1) {
                    if (message.data.provider + message.data.gameId === $scope.games[i].gameID) {
                        $location.search('game', $scope.games[i].id);
                        break;
                    }
                }
                $location.search('table', message.data.tableId);
            }
        } else {
            $scope.tablesControll = null;
            $scope.liveCasinoLobbyPopup.open=false;
        }
    });

    /**
     * @ngdoc method
     * @name openDealerGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description find the dealers game and open it
     * @param {Object} dealerInfo the object that contain infomration for current dealer
     */
    $scope.openDealerGame = function openDealerGame(dealerInfo) {
        if ($scope.games && $scope.games.length) {
            var game, i, length = $scope.games.length;
            for (i = 0; i < length; i += 1) {
                if ($scope.games[i].serverGameID == dealerInfo.game_id) {
                    game = $scope.games[i];
                    break;
                }
            }

            if (game) {
                $scope.selectDealerPage($scope.dealerPages[0]);
                $scope.openGame(game, undefined, dealerInfo.table_id);
            }
        }
    };

    /**
     * @ngdoc method
     * @name changeView
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description change view for applying functionality of multiple view in casino
     * @param {Int} view the Int
     */
    $scope.changeView = function changeView(view) {
        var i, gameInfo, uniqueId;
        if(view > $scope.gamesInfo.length) {
            for (i = $scope.gamesInfo.length; i < view; i++) {
                uniqueId = Math.random().toString(36).substr(2, 9);
                gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
                $scope.gamesInfo.push(gameInfo);
            }
            $scope.viewCount = view;
        } else if (view < $scope.gamesInfo.length) {
            var actualviews = 0, actualGames = [];
            for (i = 0; i < $scope.gamesInfo.length; i += 1) {
                if ($scope.gamesInfo[i].gameUrl !== '') {
                    gameInfo = $scope.gamesInfo[i];
                    actualGames.push(gameInfo);
                    actualviews++;
                }
            }
            if (actualviews <= view) {
                if (actualviews === 1 && view === 2) {
                    uniqueId = Math.random().toString(36).substr(2, 9);
                    gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
                    if ($scope.gamesInfo[0].gameUrl !== '') {
                        actualGames.push(gameInfo);
                    } else {
                        actualGames.unshift(gameInfo);
                    }
                }
                $scope.gamesInfo = actualGames;
                $scope.viewCount = view;
            } else {
                var numberOfNeeded = actualviews - view;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
                    content: Translator.get('Please close {1} game(s) to change view', [numberOfNeeded])
                });
            }
        }
        $rootScope.casinoGameOpened = $scope.gamesInfo.length;

        analytics.gaSend('send', 'event', 'multiview',  {'page': $location.path(), 'eventLabel': 'multiview changed to ' + view});
    };

    /**
     * @ngdoc method
     * @name enableToAddGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description enable current view for add new game and show container of all games
     * @param {String} id gameInfo id
     */
    $scope.enableToAddGame = function enableToAddGame(id) {
        for (var i = 0; i < $scope.gamesInfo.length; i += 1) {
            $scope.gamesInfo[i].toAdd = id === $scope.gamesInfo[i].id;
        }
        $scope.showAllGames = true;
        //we need to reinitialize filter options and selected category options
        $scope.popUpSearchInput = "";
        $scope.agSelectedCategory = 'LiveDealer';
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
        $scope.mvTablesInfo = {};
        casinoUtils.setupTableInfo($scope.mvTablesInfo);
    };

    $scope.$watch('agSelectedCategory', function(){
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);

        if ($scope.agSelectedCategory === 'LiveDealer' && $scope.showAllGames) {
            $scope.mvTablesInfo = {};
            casinoUtils.setupTableInfo($scope.mvTablesInfo);
        }
    });
    $scope.$watch('popUpSearchInput', function(){
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
    });

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {Int} id the games id
     */
    $scope.refreshGame = function refreshGame(id) {
        casinoUtils.refreshCasinoGame($scope, id);
    };

    /**
     * @ngdoc method
     * @name loadDealerPages
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads poker pages from cms and selects first one
     */
    function loadDealerPages() {
        $scope.dealerPagesLoaded = false;

        if (Utils.isObjectEmpty($scope.dealerPages)) {
            content.getPage('live-dealer-' + $rootScope.env.lang, true).then(function (data) {
                $scope.dealerPagesLoaded = true;
                $scope.dealerPages = [];
                if (data.data.page && data.data.page.children) {
                    $scope.dealerPages = data.data.page.children;
                    var i, j, k;
                    for (i = 0; i < $scope.dealerPages.length; i++) {
                        $scope.dealerPages[i].title = $sce.trustAsHtml($scope.dealerPages[i].title);
                        $scope.dealerPages[i].content = $sce.trustAsHtml($scope.dealerPages[i].content);
                        for (j = 0; j < $scope.dealerPages[i].children.length; j++) {
                            $scope.dealerPages[i].children[j].title = $sce.trustAsHtml($scope.dealerPages[i].children[j].title);
                            $scope.dealerPages[i].children[j].content = $sce.trustAsHtml($scope.dealerPages[i].children[j].content);
                            for (k = 0; k < $scope.dealerPages[i].children[j].children.length; k++) {
                                $scope.dealerPages[i].children[j].children[k].title = $sce.trustAsHtml($scope.dealerPages[i].children[j].children[k].title);
                                $scope.dealerPages[i].children[j].children[k].content = $sce.trustAsHtml($scope.dealerPages[i].children[j].children[k].content);
                            }
                        }
                    }
                    var page = checkForDealerPageDeepLink() || $scope.dealerPages[0];
                    $scope.selectDealerPage(page);
                }
            }, function (reason) {
                $scope.dealerPages = [];
                $scope.dealerPagesLoaded = true;
            });
        }
    }

    /**
     * @ngdoc method
     * @name checkForDealerPageDeepLink
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Check for dealer page deep link
     */
    function checkForDealerPageDeepLink(){
        if ($location.search().page) {
            var i, slug = $location.search().page;
            for (i = 0; i < $scope.dealerPages.length; i += 1) {
                if ($scope.dealerPages[i].slug === slug) {
                    return $scope.dealerPages[i];
                }
            }
        }

        return null;
    }

    /**
     * @ngdoc method
     * @name selectDealerPage
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description selects given poker page
     *
     * @param {Object} page page to select
     */
    $scope.selectDealerPage = function selectDealerPage(page) {
        if (!$scope.selectedDealerPage || $scope.selectedDealerPage.slug !== page.slug) {
            $scope.selectedDealerPage = page;
            $location.search('page', page.slug);

            if (page.slug === "meet-our-dealers") {
                $scope.ourDealers = getVisibleGames($scope.selectedDealerPage.children);
                //get dealerInfo
                getDealerInfo($scope.ourDealers[2].custom_fields.dealer_id[0]);
            }

            if (page.slug === 'how-to-play' && !$scope.howToPlayPage) {
                prepareHowToPlay();
            }
        }
    };

    /**
     * @ngdoc method
     * @name prepareHowToPlay
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Prepare "HowToPlay" page
     */
    function prepareHowToPlay() {
        var i, length = $scope.selectedDealerPage.children.length;
        $scope.howToPlayPage = {
            sliderIndex: 0 // for products slider
        };

        for (i = 0; i < length; i += 1) {
            switch ($scope.selectedDealerPage.children[i].slug) {
                case 'products':
                    $scope.howToPlayPage.products = Utils.groupToGroups($scope.selectedDealerPage.children[i].children, 4);
                    break;
                case 'game-rules':
                    $scope.howToPlayPage.rules = $scope.selectedDealerPage.children[i];
                    break;
                case 'learn-to-win':
                    $scope.howToPlayPage.learnToWin = $scope.selectedDealerPage.children[i];
                    break;
            }
        }
    }

    /**
     * @ngdoc method
     * @name slideHowToPlayProducts
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Slides visible how to play's products left or right
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slideHowToPlayProducts = function slideHowToPlayProducts(direction) {
        if (direction === 'left') {
            $scope.howToPlayPage.sliderIndex = $scope.howToPlayPage.sliderIndex > 0 ? 0 : $scope.howToPlayPage.products.length - 1;
        } else if (direction === 'right') {
            $scope.howToPlayPage.sliderIndex = $scope.howToPlayPage.sliderIndex < $scope.howToPlayPage.products.length - 1 ? $scope.howToPlayPage.sliderIndex + 1 : 0;
        }
    };

    /**
     * @ngdoc method
     * @name scrollToSelectedItem
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description scroll to element that has itemId
     *
     * @param {String} itemId id of item
     */
    $scope.scrollToSelectedItem = function scrollToSelectedItem(itemId){
        smoothScroll(itemId);
    };

    /**
     * @ngdoc method
     * @name slide
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Slides visible games left or right
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slide = function slide(direction) {
        $scope.slideDirection = direction;
        var dealers = $scope.selectedDealerPage.children;

        if (direction === 'left') {
            dealers.unshift(dealers.pop());
        } else if (direction === 'right') {
            dealers.push(dealers.shift());
        }
        $scope.ourDealers = getVisibleGames(dealers);
        //get dealerInfo
        getDealerInfo($scope.ourDealers[2].custom_fields.dealer_id[0]);
    };

    /**
     * @ngdoc method
     * @name getVisibleGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Get visible games
     * @param {Object} games array
     * @returns {Object} visible games array
     */
    function getVisibleGames(games) {
        return games.slice(0, 5);
    }

    /*
    * get dealer info according to dealerId
    */

    /**
     * @ngdoc method
     * @name getDealerInfo
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description get dealer info according to it`s ID
     * @param {Number} dealer id
     */
    function getDealerInfo(dealerId) {
        $scope.dealerInfo = null;
        Zergling.get({'dealer_id': dealerId}, 'casino_live_dealer_info').then(function (response) {
            $scope.dealerInfo = response;
            if ($scope.dealerInfo.is_online) {
                $scope.dealerInfo.gameName = 'livecasino_' + $scope.dealerInfo.game_id +
                    ($scope.dealerInfo.game_id == '101' ? '_' + $scope.dealerInfo.table_id : '');
            }
        }, function (failResponse) {
            $scope.dealerInfo = {is_online: false};
        });
    }

    /**
     * 3D view functionality
     */

    var rotatePromise;

    /**
     * @ngdoc method
     * @name initSlidingView
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Sliding view initialization
     */
    $scope.initSlidingView = function initSlidingView() {
        loadSlidingViewTopBanners();
    };

    /**
     * @ngdoc method
     * @name table3DClickHandler
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {String} gameId id of selected game
     * @description  opens current tables or shows error message if the selected game is undefined
     */
    $scope.table3DClickHandler = function table3DClickHandler(gameId) {
        var game = getGameById(gameId);
        if (game) {
            var gameType = $rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : 'demo';
            $scope.openTables(game, gameType);
        } else {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: Translator.get('The game is not available')
            });
        }
    };

    /**
     * @ngdoc method
     * @name view3DChangeArrowClick
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     *
     * @description  change current view
     */
    $scope.view3DChangeArrowClick = function view3DChangeArrowClick() {
        $scope.firstView = !$scope.firstView;
    };

    /**
     * @ngdoc method
     * @name load3DViewTopBanners
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads poker 3d view top banners from cms
     */
    function load3DViewTopBanners() {
        if (Utils.isObjectEmpty($scope.top3DBanners)) {
            $scope.top3DBanners = {
                l1: {index: 0, rotationPaused: false, list: []},
                l2: {index: 0, rotationPaused: false, list: []},
                r1: {index: 0, rotationPaused: false, list: []},
                r2: {index: 0, rotationPaused: false, list: []}
            };
            content.getWidget('bannerSlugs.livecasino').then(function (response) {
                if (response.data && response.data.widgets && response.data.widgets[0]) {
                    var i, length = response.data.widgets.length;
                    for (i = 0; i < length; i += 1) {
                        var instance = response.data.widgets[i].instance;
                        switch (instance.align) {
                            case 'l1':
                                $scope.top3DBanners.l1.list.push(instance);
                                break;
                            case 'l2':
                                $scope.top3DBanners.l2.list.push(instance);
                                break;
                            case 'r1':
                                $scope.top3DBanners.r1.list.push(instance);
                                break;
                            case 'r2':
                                $scope.top3DBanners.r2.list.push(instance);
                                break;
                            default:
                                //$scope.top3DBanners.l1.list.push(instance);
                                break;
                        }
                    }
                }

                if ($scope.top3DBanners.l1.list.length > 1 || $scope.top3DBanners.l2.list.length > 1 || $scope.top3DBanners.r1.list.length > 1 || $scope.top3DBanners.r2.list.length > 1) {
                    rotatePromise = $interval(change3DBanners, CConfig.liveCasino.view3DBannersRotationPeriod);
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name loadSlidingViewTopBanners
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Load top banners
     */
    function loadSlidingViewTopBanners () {
        content.getPage('live-casino.mainPageSlugs', true).then(function (data) {
            $scope.productSlides = (data.data.page && data.data.page.children[0] && data.data.page.children[0].children) || [];
        });
    }

    /**
     * @ngdoc method
     * @name top3DBannerClickHandler
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description   check link and opens corresponding data
     *
     * @param {string} [link] optional
     */
    $scope.top3DBannerClickHandler = function top3DBannerClickHandler(link) {
        //analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'livecasino 3d view top banner click'});
        if (link === undefined || link === '') {
            return;
        }
        var unregisterlocationChangeSuccess = $rootScope.$on('$locationChangeSuccess', function () {
            unregisterlocationChangeSuccess();

            var searchParams = $location.search();
            if (searchParams.game !== undefined) {
                var gameID = parseInt(searchParams.game, 10);
                $scope.table3DClickHandler(gameID);
            } else if (searchParams.help !== undefined) {
                $rootScope.$broadcast('openHelpPage', {slug: searchParams.help, from: 'footer'}); //need to open helps sliders
            }
        });
    };

    /**
     * @ngdoc method
     * @name t3DBRotationControl
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {String} currentBanner reference to current banner
     * @param {String} mouseEvent 'over' or 'out'
     *
     * @description  pause or play current banner by changing current rotationPaused attribute
     */
    $scope.t3DBRotationControl = function t3DBRotationControl(currentBanner, mouseEvent) {
        $scope.top3DBanners[currentBanner].rotationPaused = mouseEvent === 'over';
    };

    /**
     * @ngdoc method
     * @name change3DBanners
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Change 3D banners
     */
    function change3DBanners() {
        if ($scope.firstView) {
            // rotate l1 banner
            if (!$scope.top3DBanners.l1.rotationPaused) {
                if ($scope.top3DBanners.l1.index < $scope.top3DBanners.l1.list.length - 1) {
                    $scope.top3DBanners.l1.index += 1;
                } else {
                    $scope.top3DBanners.l1.index = 0;
                }
            }
            // rotate r1 banner
            if (!$scope.top3DBanners.r1.rotationPaused) {
                if ($scope.top3DBanners.r1.index < $scope.top3DBanners.r1.list.length - 1) {
                    $scope.top3DBanners.r1.index += 1;
                } else {
                    $scope.top3DBanners.r1.index = 0;
                }
            }

        } else {
            // rotate l2 banner
            if (!$scope.top3DBanners.l2.rotationPaused) {
                if ($scope.top3DBanners.l2.index < $scope.top3DBanners.l2.list.length - 1) {
                    $scope.top3DBanners.l2.index += 1;
                } else {
                    $scope.top3DBanners.l2.index = 0;
                }
            }
            // rotate r2 banner
            if (!$scope.top3DBanners.r2.rotationPaused) {
                if ($scope.top3DBanners.r2.index < $scope.top3DBanners.r2.list.length - 1) {
                    $scope.top3DBanners.r2.index += 1;
                } else {
                    $scope.top3DBanners.r2.index = 0;
                }
            }
        }
    }

    /**
     * @ngdoc method
     * @name prepareView3DDisplay
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Prepare 3D view
     */
    function prepareView3DDisplay() {
        var FPGamesLength = 0, SPGamesLength = 0;
        var i, length = $scope.games.length;
        for (i = 0; i < length; i += 1) {
            switch ($scope.games[i].id) {
                case $scope.liveGamesConf.games.roulette.id:
                case $scope.liveGamesConf.games.blackjack.id:
                case $scope.liveGamesConf.games.baccarat.id:
                case $scope.liveGamesConf.games.betOnPoker.id:
                    FPGamesLength += 1;
                    break;
                case $scope.liveGamesConf.games.keno.id:
                case $scope.liveGamesConf.games.draw.id:
                    SPGamesLength += 1;
                    break;
            }
        }

        $scope.liveGamesConf.allViewsEnabled = FPGamesLength > 0 && SPGamesLength > 0;
        $scope.firstView = FPGamesLength > 0;
    }

    /**
     * @ngdoc method
     * @name initProvidersData
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Initialize provider data
     */
    function initProvidersData() {
        var i, length = $scope.games.length, providers = [], devidedGames = {};

        for (i = 0; i < length; i += 1) {
            if (providers.indexOf($scope.games[i].gameProvider) === -1) {
                providers.push($scope.games[i].gameProvider);
            }
            if ($scope.games[i].markets && (typeof $scope.games[i].markets) === 'string') {
                $scope.games[i].markets = JSON.parse($scope.games[i].markets);
            }
            if (!devidedGames[$scope.games[i].gameProvider]) {
                devidedGames[$scope.games[i].gameProvider] = {
                    games:[],
                    defaultStudio: '',
                    studios: []
                };
            }

            var devidedItem = devidedGames[$scope.games[i].gameProvider];
            devidedItem.games.push($scope.games[i]);

            if ($scope.games[i].markets && $scope.games[i].markets.available) {
                if ($scope.games[i].markets.default && !devidedItem.defaultStudio) {
                    devidedItem.defaultStudio = $scope.games[i].markets.default;
                }
                for (var j = 0, stLength = $scope.games[i].markets.available.length; j < stLength; j += 1) {
                    if (devidedItem.studios.indexOf($scope.games[i].markets.available[j]) === -1) {
                        devidedItem.studios.push($scope.games[i].markets.available[j]);
                    }
                }
            }
        }

        $scope.providerOptions = providers;
        $scope.selectedProvider = CConfig.liveCasino.selectedDefaultProvider && $scope.providerOptions.indexOf(CConfig.liveCasino.selectedDefaultProvider) !== -1 ? CConfig.liveCasino.selectedDefaultProvider : $scope.providerOptions[0];
        $scope.devidedGames = devidedGames;
    }

    /**
     * @ngdoc method
     * @name openDeposit
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Post message to open deposit slider on the main product
     */
    $scope.openDeposit = function() {
        $scope.liveCasinoLobbyPopup.open=false;
        $window.postMessage({
            action: "openSlider", tab: "deposit"
        },'*');
    };

    /**
     * @ngdoc method
     * @name toggleCasinoLobbyView
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Toggle casino lobby view
     */
    $scope.toggleCasinoLobbyView = function toggleCasinoLobbyView(isRowView) {
        $scope.casinoLobbyRowView = isRowView;
        Storage.set('isLobbyRowView', $scope.casinoLobbyRowView);
    };

    $scope.$on('casinoGamesList.openGame', function(e, data) {
        $scope.openGame(data.game, data.playMode);
    });

    init();

    $scope.$on('$destroy', function () {
        if (rotatePromise) {
            $interval.cancel(rotatePromise);
        }
    });

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function(e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    });
}]);