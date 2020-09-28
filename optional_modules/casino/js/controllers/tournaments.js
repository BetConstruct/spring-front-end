/**
 * @ngdoc controller
 * @name CASINO.controller:casinoTournamentsCtrl
 * @description
 * tournaments page controller
 */

angular.module('casino').controller('casinoTournamentsCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'CConfig', 'Config', 'Translator', 'Zergling', 'AuthData', 'casinoManager', 'casinoData', 'LanguageCodes', 'Moment', 'Geoip', 'casinoMultiviewValues', 'analytics', function ($rootScope, $scope, $location, $timeout, CConfig, Config, Translator, Zergling, AuthData, casinoManager, casinoData, LanguageCodes, Moment, Geoip, casinoMultiviewValues, analytics) {
    'use strict';

    $scope.confData = CConfig;
    $scope.gamesInfo = [];
    $scope.tournament = {
        filterList: CConfig.tournaments.filters,
        casinoGames: {},
        casinoGamesCount: {},
        tournamentGamesCount: {},
        sliderIndex: {},
        pageType: null
    };
    $scope.viewCount = 1;

    $scope.placePostfix = {
        '1': 'st',
        '2': 'nd',
        '3': 'rd'
    };
    $scope.casinoMultiviewValues = function () {
        casinoMultiviewValues.init($scope);
    };

    $scope.loadingProcess = false;

    var gameInfoId;

    $scope.hasTournaments = true;

    var timeoutPromise, timeoutStatsPromise, countryCode;

    /**
     * @ngdoc method
     * @name updateFilters
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Update tournaments by filter once loaded or changed
     */
    $scope.updateFilters = function updateFilters(filterGroupSource, filterSource, okButton, forCasinoWidget) {
        if (!(filterGroupSource && filterGroupSource.noRefresh && !okButton)) {
            $scope.tournament.filteredList = [];
        }
        angular.forEach($scope.tournament.fullList, function (tournament) {
            var addTournament = true;
            angular.forEach($scope.tournament.filterList, function (filterGroup) {
                var filterPassed = false, filterPresent = false, allSelected = false;

                if (filterGroupSource === filterGroup) {

                    var noneSelected = true;

                    angular.forEach(filterGroup.filters, function (filter) {
                        if (filter.active) {
                            noneSelected = false;
                        }
                    });

                    angular.forEach(filterGroup.filters, function (filter) {
                        if (filter.all) {
                            if (noneSelected) {
                                filter.active = true;
                            }
                            allSelected = filter.active;
                        }
                    });

                    if (filterSource && filterSource.all && allSelected) {
                        angular.forEach(filterGroup.filters, function (filter) {
                            if (!filter.all) {
                                filter.active = false;
                            }
                        });
                    }

                    if (filterSource && !filterSource.all && filterSource.active) {
                        angular.forEach(filterGroup.filters, function (filter) {
                            if (filter.all) {
                                filter.active = false;
                            }
                        });
                    }

                }

                angular.forEach(filterGroup.filters, function (filter) {

                    if (filter.all) {
                        return;
                    }

                    filterPresent = filterPresent || filter.active;
                    if (filter.active && tournament[filterGroup.field] === filter.value) {
                        filterPassed = true;
                    }
                });

                if (!filterPassed && filterPresent) {
                    addTournament = false;
                }
            });
            if (addTournament && !(filterGroupSource && filterGroupSource.noRefresh && !okButton)) {
                $scope.tournament.sliderIndex[tournament.Id] = $scope.tournament.sliderIndex[tournament.Id] || 0;
                if (!forCasinoWidget) {
                    loadTournamentCasinoGames(tournament);
                }
                $scope.tournament.filteredList.push(tournament);
            }
        });

        if (filterGroupSource && (filterGroupSource.refresh || okButton)) {
            $scope.tournament.fullList = null;
            $scope.tournament.filteredList = null;
            refreshTournamentData();
        }
    };

    /**
     * @ngdoc method
     * @name getTournamentList
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Load tournaments
     */
    $scope.getTournamentList = function getTournamentList(firstTime, forCasinoWidget) {
        $scope.tournament.pageType = forCasinoWidget ? 'casino' : 'main';
        cancelRequests();

        var request = getFilteredRequest();
        Zergling.get(request, 'get_tournament_list').then(
            function (data) {
                if (data && data.result) {

                    angular.forEach(data.result, function (tournament) {
                        tournament.LobbyBannerImagesFiltered = filterImagesByLang(tournament.LobbyBannerImages);
                        tournament.canParticipate = canParticipateCheck(tournament);
                        tournament.registrationStatus = registrationStatusCheck(tournament);
                        tournament.buyInStatus = buyInCheck(tournament);

                        if(tournament.PrizeType === 2) { // freeSpins
                            tournament.CurrencyId = 'FS';
                        }
                    });

                    $scope.tournament.fullList = data.result;
                    $scope.updateFilters(null, null, null, forCasinoWidget);

                    if (firstTime) {
                        findAndOpenGame($location.search());
                    }
                }

            }
        );

        timeoutPromise = $timeout(function(){
            getTournamentList(undefined,forCasinoWidget);
        }, 25000);
    };

    function getFilteredRequest() {
        var stageList = [], registrationStarted = [], request = {};
        angular.forEach($scope.tournament.filterList, function (filterGroup) {
            angular.forEach(filterGroup.filters, function (filter) {
                if(filter.active){
                    if (filter.stageList) {
                        stageList.push(filter.stageList);
                    }
                    if (filter.registrationStarted !== undefined) {
                        registrationStarted.push(filter.registrationStarted);
                    }
                }
            });
        });

        if (stageList.length) {
            request.stage_list = stageList;
        }

        if (registrationStarted.length === 1 && registrationStarted[0]) {
            request.registration_started = registrationStarted[0];
        }

        return request;
    }

    /**
     * @name findAndOpenGame
     * @description get gameId from $location, find game in games and open it (used in deeplinking)
     */
    function findAndOpenGame(searchParams) {
        if (searchParams.game !== undefined) {
            var game;
            casinoData.getGames(null, null, countryCode, null, null, null, null, [searchParams.game]).then(function (response) {
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
                                    var gameInfo = {};
                                    gameInfo.gameID = game.front_game_id;
                                    gameInfo.game = game;
                                    gameInfo.loadingUserData = true;
                                    $rootScope.casinoGameOpened = 1;
                                    $scope.gamesInfo.push(gameInfo);

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
                                    })
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
     * @name filterImagesByLang
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Filter images by language, default "en"
     */
    function filterImagesByLang(images) {
        if (!images || !images.length) {
            return;
        }
        var out, defaultOut, i, length = images.length;
        for (i = 0; i < length; ++i) {
            if (images[i].LangId === LanguageCodes[Config.env.lang]) {
                out = images[i].Images;
                break;
            }
            images[i].LangId === 'en' && (defaultOut = images[i].Images);
        }

        return out || defaultOut || (images[0] && images[0].Images);
    }

    /**
     * @ngdoc method
     * @name canParticipateCheck
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Return false is user cannot participate in this tournament
     */
    function canParticipateCheck(tournament) {
        var timePassed = Moment.get().diff(Moment.moment.utc(tournament.RegistrationEndDate), 'seconds');

        if (timePassed >= 0) {
            return false;
        }

        return !(tournament.IsParticipated || tournament.Stage === 1);
    }

    /**
     * @ngdoc method
     * @name registrationStatusCheck
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Return 0 1 or 2 based on registration status
     */
    function registrationStatusCheck(tournament) {
        var startDateDiff = Moment.get().diff(Moment.moment.utc(tournament.RegistrationStartDate), 'seconds'),
            endDateDiff = Moment.get().diff(Moment.moment.utc(tournament.RegistrationEndDate), 'seconds');

        console.log('CTS ', startDateDiff, ' ', endDateDiff);
        if (endDateDiff > 0) {
            return 2;
        } else if (startDateDiff > 0) {
            return 1;
        }

        return 0;
    }

    /**
     * @ngdoc method
     * @name buyInCheck
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Return true if the tournament is paid
     */
    function buyInCheck(tournament) {
        return tournament.RegistrationAmount && tournament.RegistrationAmount > 0 ? 2 : 1;
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
     * @name updateTournamentStatus
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description update Tournament Status every 5 seconds
     */
    function updateTournamentStatus() {
        if (!$scope.tournament.detailsTournamentId) {
            return;
        }

        var request = {
            'tournament_id': $scope.tournament.detailsTournamentId
        };

        Zergling.get(request, 'get_tournament_stats').then(
            function (data) {
                if (data && data.result && $scope.tournament.details) {
                    angular.forEach(data.result, function (stats) {
                        if ($scope.tournament.details.Id === stats.Id) {
                            $scope.tournament.stats = stats;
                            $scope.tournament.details.JoinedPlayersCount = stats.JoinedPlayersCount || 0;
                            $scope.tournament.details.PrizeFund = stats.PrizeFund || 0;

                            if (stats.TopPlayerList) {
                                processTopPlayerList($scope.tournament.details, stats.TopPlayerList, $scope.tournament.details.CurrentPlayerStats);
                            }
                        }
                    });
                }
                timeoutStatsPromise = $timeout(updateTournamentStatus, 15000);
            }, function () {
                timeoutStatsPromise = $timeout(updateTournamentStatus, 30000);
            }
        );
    }

    /**
     * @ngdoc method
     * @name openTournamentDetails
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Open tournament details
     */
    $scope.openTournamentDetails = function openTournamentDetails(tournamentId, refresh, firstTime) {
        $scope.tournament.pageType = 'details';
        if (!refresh) {
            $scope.tournament.details = null;
        }
        cancelRequests();

        $scope.tournament.detailsTournamentId = parseInt(tournamentId, 10);

        var request = {
            'tournament_id': $scope.tournament.detailsTournamentId
        };

        Zergling.get(request, 'get_tournament').then(
            function (data) {
                if (data && data.result && angular.isObject(data.result)) {
                    data.result.DetailsBannerImagesFiltered = filterImagesByLang(data.result.DetailsBannerImages);
                    data.result.canParticipate = canParticipateCheck(data.result);
                    $scope.tournament.details = data.result;
                    $scope.tournament.details.games = [];
                    $scope.tournament.details.total_count = 0;
                    $scope.tournament.detailsCasinoGamesCount = 0;

                    if($scope.tournament.details.PrizeType === 2) { // freeSpins
                        $scope.tournament.details.CurrencyId = 'FS';
                    }

                    processTopPlayerList($scope.tournament.details, $scope.tournament.details.TopPlayerList, $scope.tournament.details.CurrentPlayerStats);

                    console.log('GET GAMES', $scope.tournament.details.GameIdList);
                    loadTournamentDetailsCasinoGames(tournamentId, 0, 12, true);


                    if (firstTime) {
                        findAndOpenGame($location.search());
                    }
                }
            }
        );

        updateTournamentStatus();
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

    /**
     * @ngdoc method
     * @name participateConfirmedment
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Tournament participation confirmed
     */
    function participateConfirmed(tournament) {

        if (!tournament || !tournament.Id || !canParticipateCheck(tournament)) {
            return;
        }

        var request = {
            'tournament_id': parseInt(tournament.Id, 10)
        };
        Zergling.get(request, 'join_to_tournament').then(function (response) {
            var error = 'Error occured.';

            switch (Math.abs(parseInt(response.result || 0, 10))) {
                case 21:
                    error = 'Insufficient balance';
                    break;
                case 1035:
                    error = 'The maximum allowed count of tournament players has been exceeded';
                    break;
                case 1013:
                    error = 'Tournament Player already exists';
                    break;
            }

            if (response.result && response.result.TournamentId) {
                tournament.IsParticipated = true;
            } else {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: error
                });
            }

        }, function () {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "error",
                title: "Error",
                content: 'Error occured.'
            });
        });

    }

    /**
     * @ngdoc method
     * @name participateInTournament
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Participate button
     */
    $scope.participateInTournament = function participateInTournament(tournament) {

        if (!Config.env.authorized) {
            $rootScope.$broadcast("openLoginForm");
            return;
        }

        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "info",
            title: "Info",
            content: 'To join this tournament {1} {2} required, continue ?',
            contentPlaceholders: [tournament.RegistrationAmount, tournament.CurrencyId],
            buttons: [
                {
                    title: 'Yes', callback: function () {
                        participateConfirmed(tournament);
                    }
                },
                {title: 'No'}
            ]
        });
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
        cancelRequests();
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
                    timeoutPromise = $timeout(function () {
                        $scope.loadCasinoIframeInfo(gameInfo);
                    }, 15000);
                }
            },
            function () {
                timeoutPromise = $timeout(function () {
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
     * @name cancelRequests
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Cancel timeout requests
     */
    function cancelRequests() {
        timeoutPromise && $timeout.cancel(timeoutPromise);
        timeoutStatsPromise && $timeout.cancel(timeoutStatsPromise);
        timeoutPromise = null;
        timeoutStatsPromise = null;
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

    /**
     * @ngdoc method
     * @name refreshTournamentData
     * @methodOf CASINO.controller:casinoTournamentsCtrl
     * @description Refresh data after login, logout, session restore
     */
    function refreshTournamentData () {
        cancelRequests();
        switch ($scope.tournament.pageType) {
            case 'main':
                $scope.getTournamentList();
                break;
            case 'details':
                $scope.tournament.detailsTournamentId
                   ? $scope.openTournamentDetails($scope.tournament.detailsTournamentId, true)
                   : updateTournamentStatus();
                break;
        }
    }

   $scope.initWatchers = function initWatchers() {
        $scope.$on('counterFinished.tournamentList', $scope.getTournamentList);
        $scope.$on('counterFinished.tournamentListDetails', function () {
            $scope.openTournamentDetails($location.search().tournament_id, true);
        });

        $scope.$on('login.loggedOut', refreshTournamentData);
        $scope.$on('loggedIn', refreshTournamentData);

        $scope.$on("tournaments.openGame", openTournamentGame);
        $scope.$on('goToHomepage', function () {
            $location.search('tournament_id', undefined);
        });
        $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function (e, game) {
            $scope.toggleSaveToMyCasinoGames(game);
        });
        $scope.$on('casinoGamesList.openGame', function (e, data) {
            if (!data.game && data.gameId) {
                casinoData.getGames(null, null, countryCode, null, null, null, null, [data.gameId]).then(function (response) {
                    if (response && response.data) {
                        $scope.openGame(response.data.games[0]);
                    }
                });
            } else {
                $scope.openGame(data.game, data.playMode, data.studio);
            }
        });
        $scope.$on('widescreen.on', function () {
            $scope.wideMode = true;
        });

        $scope.$on('widescreen.off', function () {
            $scope.wideMode = false;
        });

        $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
        $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });

        $scope.$on('casinoMultiview.viewChange', function (event, view) {
            analytics.gaSend('send', 'event', 'multiview', {'page': $location.path(),'eventLabel': 'multiview changed to ' + view});
            casinoManager.changeView($scope, view);
        });
    }

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
        cancelRequests();
        if ($scope.hasIframeTournamentInfo && gameInfoId) {
            delete  $scope.hasIframeTournamentInfo[gameInfoId];
            if (Object.keys($scope.hasIframeTournamentInfo).length === 1) {
                $scope.hasIframeTournamentInfo.empty = true;
            }
        }
    });
}]);
