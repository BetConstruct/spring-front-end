VBET5.controller("tournamentBaseCtrl",[
    '$rootScope', '$scope', '$location', '$timeout', 'Config', 'Translator', 'Zergling', 'AuthData', 'LanguageCodes', 'Moment', 'Geoip','analytics', 'Utils', 'filterConfig', 'productTypeId',
    function ($rootScope, $scope, $location, $timeout, Config, Translator, Zergling, AuthData, LanguageCodes, Moment, Geoip,  analytics, Utils, filterConfig, productTypeId){

        'use strict';
        $scope.tournament = {
            filterList: filterConfig,
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


        $scope.loadingProcess = false;


        $scope.hasTournaments = true;

        var timeoutStatsPromise;

        /**
         * @ngdoc method
         * @name cancelRequests
         * @methodOf CASINO.controller:casinoTournamentsCtrl
         * @description Cancel timeout requests
         */
        $scope.cancelRequests = function cancelRequests() {
            $scope.timeoutPromise && $timeout.cancel($scope.timeoutPromise);
            timeoutStatsPromise && $timeout.cancel(timeoutStatsPromise);
            $scope.timeoutPromise = null;
            timeoutStatsPromise = null;
        };
        /**
         * @ngdoc method
         * @name updateFilters
         * @methodOf CASINO.controller:casinoTournamentsCtrl
         * @description Update tournaments by filter once loaded or changed
         */
        $scope.updateFiltersBase = function updateFiltersBase(filterGroupSource, filterSource, okButton, forCasinoWidget, callback) {
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
                    if (!forCasinoWidget && callback) {
                        callback(tournament);
                    }
                    $scope.tournament.filteredList.push(tournament);
                }
            });

            if (filterGroupSource && (filterGroupSource.refresh || okButton)) {
                $scope.tournament.fullList = null;
                $scope.tournament.filteredList = null;
                $scope.refreshTournamentData();
            }
        };

        /**
         * @ngdoc method
         * @name getTournamentList
         * @methodOf CASINO.controller:casinoTournamentsCtrl
         * @description Load tournaments
         */
        $scope.getTournamentListBase = function getTournamentListBase(firstTime, forCasinoWidget, productTypeId, callback) {
            $scope.tournament.pageType = forCasinoWidget ? 'casino' : 'main';
            $scope.cancelRequests();

            var request = getFilteredRequest(productTypeId);
            Zergling.get(request, 'get_tournament_list').then(
                function (data) {
                    if (data && data.result) {

                        angular.forEach(data.result, function (tournament) {
                            tournament.LobbyBannerImagesFiltered = filterImagesByLang(tournament.LobbyBannerImages);
                            tournament.DetailsBannerImagesFiltered = filterImagesByLang(tournament.DetailsBannerImages);
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
                            callback($location.search());
                        }
                    }

                }
            );

            $scope.timeoutPromise = $timeout(function(){
                $scope.getTournamentListBase(undefined,forCasinoWidget, productTypeId, callback);
            }, 25000);
        };

        function getFilteredRequest(productTypeId) {
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
            request.product_type_id = productTypeId;

            return request;
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

            return !(tournament.IsParticipated || tournament.Stage === 1 || tournament.Stage === -1); // stage Canceled=-1,Finished = 1, Running = 2, Future=3
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
            request.product_type_id = productTypeId;

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
        $scope.openTournamentDetailsBase = function openTournamentDetailsBase(tournamentId, refresh, firstTime, findAndOpenGame, loadTournamentDetailsCasinoGames) {
            $scope.tournament.pageType = 'details';
            if (!refresh) {
                $scope.tournament.details = null;
            }
            $scope.cancelRequests();

            $scope.tournament.detailsTournamentId = parseInt(tournamentId, 10);

            var request = {
                'tournament_id': $scope.tournament.detailsTournamentId
            };

            Zergling.get(request, 'get_tournament').then(
                function (data) {
                    if (data && data.result && angular.isObject(data.result)) {
                        data.result.DetailsBannerImagesFiltered = filterImagesByLang(data.result.DetailsBannerImages);
                        data.result.LobbyBannerImagesFiltered = filterImagesByLang(data.result.LobbyBannerImages);
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
                        if (loadTournamentDetailsCasinoGames) {
                            loadTournamentDetailsCasinoGames(tournamentId, 0, 12, true);

                        }


                        if (firstTime && findAndOpenGame) {
                            findAndOpenGame($location.search());
                        }
                    }
                }
            );

            updateTournamentStatus();
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
        $scope.refreshTournamentDataBase = function refreshTournamentDataBase (callback) {
            callback && callback();

            $scope.cancelRequests();
            switch ($scope.tournament.pageType) {
                case 'main':
                    $scope.getTournamentList();
                    break;
                case 'details':
                    $scope.tournament.detailsTournamentId ? $scope.openTournamentDetails($scope.tournament.detailsTournamentId, true) : updateTournamentStatus();
                    break;
            }
        };

        $scope.initWatchersBase = function initWatchersBase() {
            $scope.$on('counterFinished.tournamentList', $scope.getTournamentList);
            $scope.$on('counterFinished.tournamentListDetails', function () {
                $scope.openTournamentDetails($location.search().tournament_id, true);
            });

            $scope.$on('login.loggedOut', $scope.refreshTournamentData);
            $scope.$on('loggedIn', $scope.refreshTournamentData);

            $scope.$on('goToHomepage', function () {
                $location.search('tournament_id', undefined);
            });

            $scope.$on('widescreen.on', function () {
                $scope.wideMode = true;
            });

            $scope.$on('widescreen.off', function () {
                $scope.wideMode = false;
            });

            $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
            $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });


        };






        $scope.$on('$destroy', function () {
            $scope.cancelRequests();
        });



    }
]);
