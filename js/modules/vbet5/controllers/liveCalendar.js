/**
 * @ngdoc controller
 * @name vbet5.controller:LiveCalendarController
 * @description
 * LiveCalendarController controller
 */
angular.module('vbet5.betting').controller('LiveCalendarController', ['$scope', '$rootScope', '$location', '$window', 'ConnectionService', 'Moment', 'Translator', 'Utils', 'Config', 'GameInfo', 'partner', "Zergling", "analytics",
    function ($scope, $rootScope, $location, $window, ConnectionService, Moment, Translator, Utils, Config, GameInfo, partner, Zergling, analytics) {
        'use strict';
        $rootScope.footerMovable = true;
        var linkedGameSubId, i, excludeIdsKey;
        var excludeIds, liveCalendarSelectedDaysSavedState, initialLoadDone = false;
        var connectionService = new ConnectionService($scope);

        $scope.liveCalendarSelectedSports = {};
        $scope.liveCalendarSelectedDays = {};
        $scope.dayFilter = [];
        $scope.marketEvents = {};
        $scope.collapsedSports = {};
        $scope.totalGamesCount = 0;
        $scope.sporsSelected = false;
        $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
        $scope.options = {
            allSportsSelected: false,
            allDaysSelected: false
        };

        /**
         * @ngdoc method
         * @name doInitialLoad
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  selects initial values for sport and day and loads games
         */
        function doInitialLoad() {
            if ($scope.leftMenuSports && $scope.leftMenuSports.length > 0) {
                $scope.liveCalendarSelectedSports[$scope.leftMenuSports[0].id] = true;
                $scope.selectedSports = [$scope.leftMenuSports[0].id];
                $scope.liveCalendarSelectedDays[0] = true;

                initialLoadDone = true;

                if (Config.main.liveCalendarSelectAllSports) {
                    $scope.selectedSports = [];
                    angular.forEach($scope.leftMenuSports, function (sport, key) {
                        $scope.liveCalendarSelectedSports[sport.id] = true;
                        $scope.selectedSports.push(sport.id);
                    });
                    $scope.options.allSportsSelected = true;

                }
                updateSportsLabel();
                $scope.toggleDay();
            }
        }

        /**
         * @ngdoc method
         * @name updateLeftMenu
         * @methodOf vbet5.controller:LiveCalendarController
         * @description updates sports object and does the initial load
         * @param {Object} data sports data object
         */
        function updateLeftMenu(data) {

            console.log('updateLeftMenu', data);
            $scope.leftMenuSports = Utils.objectToArray(data.sport).sort(Utils.orderSorting);
            if (!initialLoadDone) {
                doInitialLoad();
            }
        }

        /**
         * @ngdoc method
         * @name updateLinkedGames
         * @methodOf vbet5.controller:LiveCalendarController
         * @description Update games callback
         * @param {Object} data sports data object
         */
        function updateLinkedGames(data) {
            angular.forEach(data.sport, function (sport) {
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {
                            var groupedMarkets = Utils.groupByItemProperty(game.market, 'type');
                            if (groupedMarkets) {
                                var gameObj = {
                                    sport: {id: sport.id},
                                    region: {id: region.id},
                                    competition: {id: competition.id},
                                    id: game.id,
                                    team1_name: game.team1_name,
                                    team2_name: game.team2_name,
                                    markets_count: game.markets_count,
                                    type: game.type,
                                    start_ts: game.start_ts
                                };
                                if (groupedMarkets.P1XP2 !== undefined && groupedMarkets.P1XP2[0] && groupedMarkets.P1XP2[0].event) {
                                    $scope.marketEvents[game.id] = {
                                        events: Utils.groupByItemProperty(groupedMarkets.P1XP2[0].event, 'type'),
                                        market: groupedMarkets.P1XP2[0],
                                        game: gameObj
                                    };
                                } else if (groupedMarkets.P1P2 !== undefined && groupedMarkets.P1P2[0] && groupedMarkets.P1P2[0].event) {
                                    $scope.marketEvents[game.id] = {
                                        events: Utils.groupByItemProperty(groupedMarkets.P1P2[0].event, 'type'),
                                        market: groupedMarkets.P1P2[0],
                                        game: gameObj
                                    };
                                }
                            }
                        });
                    });
                });
            });
        }

        /**
         * @ngdoc method
         * @name getLinkedGames
         * @methodOf vbet5.controller:LiveCalendarController
         * @description Get linked games
         */
        function getLinkedGames() {
            if (linkedGameSubId) {
                connectionService.unsubscribe(linkedGameSubId);
                linkedGameSubId = null;
            }
            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', 'order'],
                    'competition': ['id'],
                    'region': ['id', 'name', 'alias'],
                    'game': ['id', 'team1_name', 'team2_name', 'type', 'is_stat_available', 'team1_external_id', 'team2_external_id', 'is_live'],
                    'market': ['type', 'name', 'id', 'base', 'express_id'],
                    'event': ['type', 'id', 'price', 'name', 'base']
                },
                'where': {
                    'game': {
                        'id': {'@in': excludeIds}
                    },
                    'market': {
                        'type': {'@in': ['P1XP2', 'P1P2']}
                    }
                }
            };
            /*Utils.setCustomSportAliasesFilter(request);*/
            connectionService.subscribe(
                request,
                updateLinkedGames,
                {
                    'thenCallback': function (result) {
                        if (result.subid) {
                            linkedGameSubId = result.subid;
                        }
                    }
                }
            );
        }

        /**
         * @ngdoc method
         * @name updateGames
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  creates main game objects array from received data
         *
         * @param {Object} data games data object
         */
        function updateGames(data) {
            excludeIds = [];
            $scope.liveCalendarGames = [];
            $scope.liveCalendarAllGames = [];

            angular.forEach(data.sport, function (sport) {
                var allGames = [];
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {
                            game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                            game.region = {id: region.id, name: region.name, alias: region.alias};
                            if(Config.main.showPlayerRegion) {
                                game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                                game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                            }
                            game.title = game.team1_name + " - " + game.team2_name;
                            game.competition = {id: competition.id, name: competition.name};
                            game.game_text_info = (game.info && game.info.add_info ? game.info.add_info : '') || (game.text_info ? game.text_info.split(';')[0] : '');
                            for (i = 0; i < $scope.dayFilter.length - 1; i++) {
                                if (game.start_ts >= $scope.dayFilter[i].from && game.start_ts < $scope.dayFilter[i].to) {
                                    game.day = $scope.dayFilter[i];
                                    game.dayOffset = $scope.dayFilter[i].id;
                                }
                            }
                            game.pointerId = game.id;

                            GameInfo.hasVideo(game, true); // check availability of video

                            allGames.push(game);
                            $scope.liveCalendarAllGames.push(game);
                        });
                    });
                });
                if (excludeIds.length > 0 && !Config.main.calendarPrematchSelection) {
                    if (excludeIdsKey !== excludeIds.join()) {
                        getLinkedGames();
                        excludeIdsKey = excludeIds.join();
                    }
                } else  {
                    updateLinkedGames(data);
                }
                $scope.liveCalendarGames.push({sport: sport, order: sport.order, games: Utils.groupByItemProperty(allGames, 'dayOffset')});
            });
            $scope.liveCalendarGames.sort(Utils.orderSorting);
        }

        /**
         * @ngdoc method
         * @name loadLeftMenu
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  loads the sports menu data
         */
        function loadLeftMenu() {
            $scope.leftMenuIsLoading = true;
            var request = {
                'source': 'betting',
                'what': {'sport': ['id', 'name', 'alias', 'order']},
                'where': {
                    'game': {
                        'type': Config.main.calendarPrematchSelection ? {'@in': [0, 2]} : 2
                    }
                }
            };
            Utils.setCustomSportAliasesFilter(request);
            connectionService.subscribe(
                request,
                updateLeftMenu,
                {
                    'thenCallback': function () {
                        $scope.leftMenuIsLoading = false;
                    }
                }
            );
        }

        /**
         * @ngdoc method
         * @name loadSelectedGames
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  loads selected games according to sport and time filters
         */
        function loadSelectedGames() {
            $scope.gamesAreLoading = true;

            var request = {
                'source': 'betting',
                'what': {
                    'sport': ['id', 'name', 'alias', 'order'],
                    'region': ['id', 'name', 'alias'],
                    'competition': ['id', 'name'],
                    'game': [['id', 'start_ts', 'type', 'is_blocked', 'game_number', 'team1_name', 'team2_name','team1_reg_name', 'team2_reg_name', 'start_ts', 'markets_count',
                        'title', 'info', 'text_info', 'exclude_ids', 'is_stat_available', 'team1_external_id', 'team2_external_id', 'is_live',
                        'video_id', 'tv_type', 'video_id2', 'video_id3', 'partner_video_id']]
                },
                'where': {
                    'sport': {'id': {'@in': $scope.selectedSports}},
                    'game': {
                        'type': Config.main.calendarPrematchSelection ? {'@in': [0, 2]} : 2
                    }
                }
            };

            if (!Config.main.hideLiveCalendarMarkets) {
                request.what.market = ['type', 'name', 'id', 'base', 'express_id'];
                Utils.addPrematchExpressId(request);

                request.what.event = ['type', 'id', 'price', 'name', 'base'];
                request.where.market = {type: {'@in': ['P1XP2', 'P1P2']}};
            }

            if ($scope.selectedDays && $scope.selectedDays.length > 0) {
                if ($scope.selectedDays.length > 1) {
                    request.where.game['@or'] = $scope.selectedDays;
                } else {
                    request.where.game.start_ts = $scope.selectedDays[0].start_ts;
                }
            }
            /*Utils.setCustomSportAliasesFilter(request);*/

            connectionService.subscribe(
                request,
                updateGames,
                {
                    'thenCallback': function () {
                        $scope.gamesAreLoading = false;
                    }
                }
            );

            updateSportsLabel();
        }

        /**
         * @ngdoc method
         * @name bet
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  sends a message to betslip to add a bet
         *
         * @param {Object} event event object
         * @param {Object} market event's market object
         * @param {Object} openGame game object
         * @param {String} [oddType] odd type (odd or sp)
         */
        $scope.bet = function bet(event, market, openGame, oddType) {
            if (!event) {
                return;
            }
            oddType = oddType || 'odd';
            var game = Utils.clone(openGame);
            $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
        };

        /**
         * @ngdoc method
         * @name openMore
         * @methodOf vbet5.controller:LiveCalendarController
         * @description open more link
         * @param {Number} Sport ID
         * @param {Object} Game data
         */
        $scope.openMore = function openMore(sportId, game) {
            if (!game) {
                return;
            }
            partner.call('gameInfo', {type: 0});
            $location.url('/sport/?type=0&sport=' + sportId + '&region=' + game.region.id + '&competition=' + game.competition.id + '&game=' + game.id);
        };

        $scope.openSport = function openMore(live) {
            $location.url('/sport/?type=' + live);
        };

        /**
         * @ngdoc method
         * @name toggleSport
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  updates sport filter and loads corresponding data
         */
        $scope.toggleSport = function toggleSport(allSportsCheckbox, toggleAll) {
            var sports = [], selectedCount = 0;

            if (allSportsCheckbox) {
                $scope.liveCalendarSelectedSports = {};
                angular.forEach($scope.leftMenuSports, function (sport) {
                    $scope.liveCalendarSelectedSports[sport.id] = $scope.options.allSportsSelected;
                });
            }

            angular.forEach($scope.liveCalendarSelectedSports, function (selected, id) {
                if (selected) {
                    selectedCount++;
                    sports.push(parseInt(id, 10));
                }
            });

            if (selectedCount) {
                $scope.options.allSportsSelected = $scope.leftMenuSports.length === selectedCount;
            } else {
                sports.push($scope.leftMenuSports[0].id);
                $scope.liveCalendarSelectedSports[$scope.leftMenuSports[0].id] = true;
            }

            $scope.selectedSports = sports;
            loadSelectedGames();
            updateSportsLabel();
        };

        /**
         * @ngdoc method
         * @name toggleDayAll
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  toggles all days or restores selection, then load corresponding data
         */
        $scope.toggleDayAll = function toggleDayAll() {
            if ($scope.options.allDaysSelected) {
                liveCalendarSelectedDaysSavedState = Utils.clone($scope.liveCalendarSelectedDays);
                $scope.liveCalendarSelectedDays = {0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true};
            } else {
                $scope.liveCalendarSelectedDays = liveCalendarSelectedDaysSavedState;
            }
            $scope.toggleDay();
        };

        /**
         * @ngdoc method
         * @name printCoupon
         * @methodOf vbet5.controller:LiveCalendarController
         * @description prints the coupon
         */
        $scope.printCoupon = function printCoupon() {
            var popup = $window.open('#/popup/?action=couponprintpreview&anticache=' + Math.floor((Math.random() * 1000)), Config.main.skin + 'couponprintpreview.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
            popup.topLevelLiveCalendarGames = $scope.liveCalendarGames;
            popup.topLevelMarketEvents = $scope.marketEvents;
        };

        /**
         * @ngdoc method
         * @name toggleDay
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  updates time filter and loads corresponding data
         */
        $scope.toggleDay = function toggleDay(updateAllCheckbox) {
            var selectedCount = 0;

            if (updateAllCheckbox) {
                angular.forEach($scope.liveCalendarSelectedDays, function(selectedDay) {
                    if (selectedDay) {
                        selectedCount++;
                    }
                });
                if (selectedCount === 0) {
                    $scope.liveCalendarSelectedDays[0] = true;
                    $scope.toggleDay(true);
                    return;
                }
                $scope.options.allDaysSelected = selectedCount >= $scope.dayFilter.length;
            }

            var days = [];
            //console.table($scope.dayFilter);
            angular.forEach($scope.dayFilter, function (selected, id) {
                if ($scope.liveCalendarSelectedDays[id]) {
                    if ($scope.liveCalendarSelectedDays[id - 1]) {
                        days[days.length - 1] = {'@gte': days[days.length - 1]['@gte'], '@lt': $scope.dayFilter[id].to};
                    } else {
                        days.push({'@gte': $scope.dayFilter[id].from, '@lt': $scope.dayFilter[id].to});
                    }
                }
            });
            $scope.selectedDays = days.map(function (element) {
                return {'start_ts': element};
            });
            loadSelectedGames();
        };

        /**
         * @ngdoc method
         * @name selectDay
         * @methodOf vbet5.controller:LiveCalendarController
         * @description select specific day by index (used in new livecalendar)
         */
        $scope.selectDay = function selectDay(dayIndex) {
            $scope.liveCalendarSelectedDays = {};
            $scope.liveCalendarSelectedDays[dayIndex] = true;
            $scope.options.allDaysSelected = false;
            $scope.toggleDay();
        };

        /**
         * @ngdoc method
         * @name openStatistics
         * @methodOf vbet5.controller:LiveCalendarController
         * @description
         * Opens statistics in popup window
         *
         * @param {Object} game game object
         */
        $scope.openStatistics = function openStatistics(game) {
            analytics.gaSend('send', 'event', 'explorer', 'H2H-on-click', {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});
            $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
        };

        /**
         * @ngdoc method
         * @name updateSportsLabel
         * @methodOf vbet5.controller:LiveCalendarController
         * @description
         * Generates readable lable for all sports dropdown
         */
        function updateSportsLabel() {
            $scope.sportsSelected = false;
            if (!$scope.liveCalendarSelectedSports || !$scope.leftMenuSports) {
                $scope.sportsLabel = '';
            }
            var count = 0, name = '';
            angular.forEach($scope.leftMenuSports, function (value) {
                if ($scope.liveCalendarSelectedSports[value.id]) {
                    count++;
                    name = value.name;
                }
            });
            $scope.sportsSelected = true;
            if (count === 1) {
                $scope.sportsLabel =  name;
                return;
            }
            if (count === $scope.leftMenuSports.length) {
                $scope.sportsLabel =  Translator.get('All Sports');
                return;
            }
            if (count > 1) {
                $scope.sportsLabel =  Translator.get('Sport Types');
                return;
            }
            $scope.sportsSelected = false;
            $scope.sportsLabel =  Translator.get('No Selection');
        }

        /**
         * @ngdoc method
         * @name initLiveCalendar
         * @methodOf vbet5.controller:LiveCalendarController
         * @description  does the initial load
         */
        function initLiveCalendar() {
            $scope.setTitle('LiveCalendar');
            loadLeftMenu();
            for (i = 0; i < 7; i++) {
                $scope.dayFilter.push({
                    to: Moment.get().add(i, 'days').endOf("day").unix(),
                    from: Moment.get().add(i, 'days').startOf("day").unix(),
                    id: i,
                    name: Moment.get().add(i, 'days').startOf("day").format("dd D")
                });
            }

            if (Config.main.boostedBets.enabled && !$rootScope.boostedBetsEventIds) {
                $rootScope.boostedBetsEventIds = {};

                Zergling.get({}, 'get_boosted_selections').then(function (response) {
                    if (response && response.details) {
                        angular.forEach(response.details, function (value) {
                            angular.forEach(value, function (value) {
                                $rootScope.boostedBetsEventIds[value.Id] = true;
                            });
                        });
                    }
                });
            }
            if (!GameInfo.PROVIDER_AVAILABLE_EVENTS) { //subscribe for prematch channels
                GameInfo.getProviderAvailableEvents();
            }

        }

        initLiveCalendar();
    }]);
