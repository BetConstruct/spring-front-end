/**
 * @ngdoc controller
 * @name CASINO.controller:casinoTournamentsCtrl
 * @description
 * tournaments page controller
 */

angular.module('casino').controller('casinoTournamentsCtrl', ['$rootScope', '$controller', '$scope', '$location', '$timeout', 'CConfig', 'Config', 'Translator', 'Zergling', 'AuthData', 'casinoManager', 'casinoData', 'LanguageCodes', 'Moment', 'Geoip', 'casinoMultiviewValues', 'analytics', 'Utils', function ($rootScope, $controller, $scope, $location, $timeout, CConfig, Config, Translator, Zergling, AuthData, casinoManager, casinoData, LanguageCodes, Moment, Geoip, casinoMultiviewValues, analytics, Utils) {
    'use strict';

    $scope.confData = CConfig;
    $scope.gamesInfo = [];

    $scope.casinoMultiviewValues = function () {
        casinoMultiviewValues.init($scope);
    };


    var gameInfoId, countryCode;


    angular.extend(this, $controller('tournamentBaseCtrl', {
        $scope: $scope,
        $rootScope: $rootScope,
        $location: $location,
        $timeout: $timeout,
        Config: Config,
        Translator:Translator,
        Zergling:Zergling,
        AuthData: AuthData,
        LanguageCodes: LanguageCodes,
        Moment: Moment,
        Geoip: Geoip,
        analytics: analytics,
        Utils: Utils,
        filterConfig: CConfig.tournaments.filters,
        productTypeId: 1


    }));
    /**
     * @ngdoc method
     * @name updateFilters
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Update tournaments by filter once loaded or changed
     */
    $scope.updateFilters = function updateFilters(filterGroupSource, filterSource, okButton, forCasinoWidget) {
        $scope.updateFiltersBase(filterGroupSource, filterSource, okButton, forCasinoWidget, loadTournamentCasinoGames);
    };

    /**
     * @ngdoc method
     * @name getTournamentList
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Load tournaments
     */
    $scope.getTournamentList = function getTournamentList(firstTime, forCasinoWidget) {
        $scope.getTournamentListBase(firstTime, forCasinoWidget, 1, findAndOpenGame);
    };
    /**
     * @name findAndOpenGame
     * @description get gameId from $location, find game in games and open it (used in deeplinking)
     */
    function findAndOpenGame(searchParams) {
        if (searchParams.game !== undefined) {
            var game;
            casinoData.getGames({country: countryCode, id: [searchParams.game]}).then(function (response) {
                game = response && response.data && response.data.games && response.data.games[0];
                if (game !== undefined) {
                    var gameType, initialType = searchParams.type || ($rootScope.env.authorized ? 'real' : 'fun');
                    switch (initialType) {
                        case "demo":
                        case "fun":
                            gameType = $rootScope.env.authorized && game.types.viewMode ? "real" : "fun";
                            $scope.openGame(game, gameType);
                            break;
                        case "real":
                            if ($rootScope.env.authorized) {
                                $scope.openGame(game, "real");
                            } else {
                                if (!$rootScope.loginInProgress) {
                                    $rootScope.$broadcast('openLoginForm');
                                } else {
                                    $rootScope.casinoGameOpened = 1;
                                    $scope.gamesInfo.push({
                                        externalId: game.extearnal_game_id,
                                        game: game,
                                        loadingUserData: true
                                    });

                                    var loginProccesWatcher = $scope.$watch('loginInProgress', function () {
                                        if (!$rootScope.loginInProgress) {
                                            loginProccesWatcher();
                                            if (!$rootScope.env.authorized) {
                                                $scope.closeGame();
                                                $rootScope.$broadcast("openLoginForm");
                                            } else {
                                                $scope.openGame(game, "real");
                                            }
                                        }
                                    });
                                }
                            }
                            break;
                        default:
                            $scope.openGame(game, gameType);
                    }
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name selectTournament
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Get tournamnt detailed information
     */
    $scope.selectTournament = function selectTournament(tournamentId) {
        if ($location.path() !== '/tournaments/') {
            $location.path('/tournaments/');
        }
        $location.search('tournament_id', tournamentId);
    };


    /**
     * @ngdoc method
     * @name openTournamentDetails
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Open tournament details
     */
    $scope.openTournamentDetails = function openTournamentDetails(tournamentId, refresh, firstTime) {
        $scope.openTournamentDetailsBase(tournamentId, refresh, firstTime, findAndOpenGame, loadTournamentDetailsCasinoGames);
    };
    /**
     * @ngdoc method
     * @name loadTournamentDetailsCasinoGames
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Get Tournament games
     */

    var loadTournamentDetailsCasinoGames = function loadTournamentDetailsCasinoGames(tournamentId, offset, limit, withImages) {
        $scope.loadingProcess = true;
        casinoData.getTournamentGames(tournamentId, offset, limit, withImages).then(function (response) {
            $scope.loadingProcess = false;
            if (response && response.data && response.data.items && response.data.items.length) {
                $scope.tournament.details.games = $scope.tournament.details.games.concat(response.data.items);
                $scope.tournament.details.total_count = response.data.total_count;
            }
        });


    };

    /**
     * @ngdoc method
     * @name showMoreCasinoGames
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Get more Tournament games
     */
    $scope.showMoreCasinoGames = function showMoreCasinoGames() {
        if ($scope.loadingProcess) {
            return;
        }
        loadTournamentDetailsCasinoGames($scope.tournament.details.Id, $scope.tournament.details.games.length, 12, true);
    };



    if ($rootScope.casinoGameOpened === 1 && $scope.hasIframeTournamentInfo) {
        $scope.hasIframeTournamentInfo.empty = true;
    }

    /**
     * @ngdoc method
     * @name loadCasinoIframeInfo
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Participate button
     */
    $scope.loadCasinoIframeInfo = function loadCasinoIframeInfo(gameInfo) {
        $scope.cancelRequests();
        console.log('GAME INFO:', gameInfo);

        if (!gameInfo || !gameInfo.game || !gameInfo.game.extearnal_game_id) {
            return;
        }

        gameInfoId = gameInfo.id;

        var request = {
            'game_id': parseInt(gameInfo.game.extearnal_game_id, 10)
        };

        Zergling.get(request, 'get_top_player_list').then(
            function (data) {
                if (data && data.result) {
                    if (data.result.CurrentPlayer) {
                        $scope.tournament.iframeInfo = {};
                        processTopPlayerList($scope.tournament.iframeInfo, data.result);
                        if ($scope.hasIframeTournamentInfo) {
                            $scope.hasIframeTournamentInfo[gameInfo.id] = $scope.tournament.iframeInfo && $scope.tournament.iframeInfo.playerList && !!$scope.tournament.iframeInfo.playerList.length;
                            $scope.hasIframeTournamentInfo.empty = !$scope.hasIframeTournamentInfo[gameInfo.id];
                        }
                    }
                    $scope.timeoutPromise = $timeout(function () {
                        $scope.loadCasinoIframeInfo(gameInfo);
                    }, 15000);
                }
            },
            function () {
                $scope.timeoutPromise = $timeout(function () {
                    if ($scope.hasIframeTournamentInfo) {
                        $scope.hasIframeTournamentInfo[gameInfo.id] = false;
                    }
                    $scope.loadCasinoIframeInfo(gameInfo);
                }, 60000);
            }
        );
    };

    /**
     * @ngdoc method
     * @name loadCasinoIframeInfo
     * @methodOf CASINO.controller:loadTournamentCasinoGames
     * @description Load casino games (cached) so the update function works properly
     */
    function loadTournamentCasinoGames(tournament) {
        if (tournament && tournament.GameIdList && $scope.tournament.tournamentGamesCount[tournament.Id] !== tournament.GameIdList.length) {
            $scope.tournament.tournamentGamesCount[tournament.Id] = tournament.GameIdList.length;

            casinoData.getTournamentGames(tournament.Id , 0, 5, true).then(function (response) {
                if (response && response.data && response.data.items && response.data.items.length) {
                    $scope.tournament.casinoGames[tournament.Id] = response.data.items.slice(0, response.data.total_count > 5 ? 4 : 5);
                    $scope.tournament.casinoGamesCount[tournament.Id] = response.data.total_count;
                } else {
                    $scope.tournament.casinoGames[tournament.Id] = [];
                    $scope.tournament.casinoGamesCount[tournament.Id] = 0;
                }
            });
        }
    }




    /**
     * @ngdoc method
     * @name processTopPlayerList
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Filter player list in different ways from different calls with alternative properties
     */
    function processTopPlayerList(tournament, topPlayerList, currentPlayer) {
        tournament.currentPlayer = topPlayerList.CurrentPlayer || currentPlayer || {};
        tournament.playerList = [];
        var placeCounter = 1;
        angular.forEach(topPlayerList.TopPlayerList, function (item) {
            item.showPlace = true;
            item.Place = item.Place || placeCounter;
            tournament.playerList.push(item);
            placeCounter++;
        });

        angular.forEach(tournament.playerList, function (item) {
            if (tournament.currentPlayer && item.PlayerId === tournament.currentPlayer.PlayerId) {
                item.label = 'Me';
            }
        });

    }


    $scope.initWatchers = function initWatchers() {

        $scope.initWatchersBase();

        $scope.$on("tournaments.openGame", openTournamentGame);
        $scope.$on('goToHomepage', function () {
            $location.search('tournament_id', undefined);
        });
        $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function (e, game) {
            $scope.toggleSaveToMyCasinoGames(game);
        });
        $scope.$on('casinoGamesList.openGame', function (e, data) {
            if (!data.game && data.gameId) {
                casinoData.getGames({country: countryCode, id:[data.gameId]}).then(function (response) {
                    if (response && response.data) {
                        $scope.openGame(response.data.games[0]);
                    }
                });
            } else {
                $scope.openGame(data.game, data.playMode, data.studio);
            }
        });


        $scope.$on('casinoMultiview.viewChange', function (event, view) {
            analytics.gaSend('send', 'event', 'multiview', {'page': $location.path(),'eventLabel': 'multiview changed to ' + view});
            casinoManager.changeView($scope, view);
        });

        $scope.$on('casino.action', function (event, data) {
            switch (data.action) {
                case 'setUrlData':
                    data.url && data.frameId && casinoManager.setCurrentFrameUrlSuffix($scope.gamesInfo, data);
                    break;
                case 'closeGame':
                    casinoManager.findAndCloseGame($scope, data.gameId);
                    break;
                case 'togglePlayMode':
                    var gameInfo = Utils.getArrayObjectElementHavingFieldValue($scope.gamesInfo, "externalId", data.gameId);
                    if (gameInfo) {
                        $scope.togglePlayForReal(gameInfo);
                    }
                    break;
            }
        });
    };

    // ******************** 'BIG-GAME' RELATED ********************


    $scope.openGame = function openGame(game, gameType, studio, urlSuffix, multiViewWindowIndex) {
        var type = gameType ? gameType : 'real';

        if((!!$rootScope.profile && type === 'real') || type === 'fun'){
            analytics.gaSend('send', 'event', 'games','Open game ' + game.name,  {'page': $location.path(), 'eventLabel': 'Game type '+ type});
        }
        casinoManager.openCasinoGame($scope, game, gameType, studio, urlSuffix, multiViewWindowIndex);
    };

    function openTournamentGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            var needToClose = $scope.gamesInfo.length === 1 && $scope.gamesInfo[0].game && $scope.gamesInfo[0].game.id !== game.id;
            if (needToClose) {
                $scope.closeGame();
            }

            $scope.openGame(game, gameType);
        } else {
            //games that are not resizable
            if (game.ratio == "0") {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'warning',
                    title: 'Warning',
                    content: Translator.get('Sorry, this game cannot be opened in multi-view mode')
                });
            } else {
                var i, count = $scope.gamesInfo.length;
                for (i = 0; i < count; i += 1) {
                    if ($scope.gamesInfo[i].gameUrl === '') {
                        $scope.gamesInfo[i].toAdd = true;
                        $scope.openGame(game, gameType);
                        break;
                    }
                }
                if (i === count) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'warning',
                        title: 'Warning',
                        content: Translator.get('Please close one of the games for adding new one')
                    });
                }
            }
        }
    }


    $scope.closeGame = function confirmCloseGame(id, targetAction) {
        casinoManager.closeGame($scope, id, targetAction);
    };

    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoManager.openPopUpWindow($scope, id);
    };

    $scope.togglePlayForReal = function togglePlayForReal(gameInfo) {
        casinoManager.togglePlayMode($scope, gameInfo);
    };

    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
    };

    $scope.refreshGame = function refreshGame(id) {
        casinoManager.refreshCasinoGame($scope, id);
    };
    // ******************** 'BIG-GAME' RELATED END ********************


    // ******************** MULTIVIEW RELATED ********************
    $scope.enableToAddGame = function enableToAddGame(id) {
        for (var i = 0; i < $scope.gamesInfo.length; i += 1) {
            $scope.gamesInfo[i].toAdd = id === $scope.gamesInfo[i].id;
        }
        $scope.$broadcast('casinoMultiview.showGames', 'all'); // show multiview popup  with all games
    };
    // ******************** MULTIVIEW RELATED END********************


    (function init() {
        Geoip.getGeoData(false).then(function (data) {
            data && data.countryCode && (countryCode = data.countryCode);
        });
    })();



    $scope.$on('$destroy', function () {
        if ($scope.hasIframeTournamentInfo && gameInfoId) {
            delete  $scope.hasIframeTournamentInfo[gameInfoId];
            if (Object.keys($scope.hasIframeTournamentInfo).length === 1) {
                $scope.hasIframeTournamentInfo.empty = true;
            }
        }
    });
    /**
     * @ngdoc method
     * @name refreshTournamentData
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Refresh data after login, logout, session restore
     */
    $scope.refreshTournamentData = function refreshTournamentData () {
        $scope.refreshTournamentDataBase(function (){
            casinoManager.refreshOpenedGames($scope);

        });
    };
}]);
