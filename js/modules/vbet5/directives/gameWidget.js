/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:gameWidget
 *
 * @description game widget for last minute bets and game blocks in dashboard
 *
 */
VBET5.directive('gameWidget', ['Utils', 'Config', 'ConnectionService', 'GameInfo', 'Translator', '$rootScope', '$location', '$route', '$window', function (Utils, Config, ConnectionService, GameInfo, Translator, $rootScope, $location, $route, $window) {
    'use strict';
    var gamesSubscription;
    return {
        restrict: 'E',
        replace: false,
        templateUrl: function templateUrl(el, attrs) {
          if(attrs.templatePath) {
              return $rootScope.getTemplate(attrs.templatePath);
          }  else {
              return $rootScope.getTemplate('templates/directive/gamewidget.html')
          }
        },
        scope: {
            sportTabsQuantity: '=',
            gameWidgetTitle: '=',
            gameWidgetType: '=',
            gameWidgetMode: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            var connectionService = new ConnectionService(scope);

            scope.sportP1P2Alias = ['Dota2', 'CounterStrike', 'Tennis', 'TableTennis', 'Volleyball', 'Golf', 'Snooker', 'Mma', 'LeagueOfLegends', 'StarCraft2', 'WorldOfTanks']; //sport aliases which haven't X (only P1 P2)
            scope.minutesFilter = 0;
            scope.selectedSport = {};
            scope.loadCompleted = false;
            scope.liveGameViewData = [];
            scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
            scope.timeFormat = (scope.gameWidgetType === 'highlights' && Config.main.showPromotedGamesOnWidget.timeFormat) ? Config.main.showPromotedGamesOnWidget.timeFormat : 'LT';
            scope.widgetMode = scope.gameWidgetMode;
            scope.collapsedAll = true;

            scope.toggleSports = function toggleSports(sport) {
                if (sport) {
                    sport.collapsed = !sport.collapsed;
                    checkToggleAllStatus();
                } else {
                    scope.collapsedAll = !scope.collapsedAll;
                    var i, length = scope.liveGameViewData.length;
                    for (i = 0; i < length; i++) {
                        scope.liveGameViewData[i].collapsed = !scope.collapsedAll;
                    }
                }
            };

            function checkToggleAllStatus() {
                var expandedCount = 0;
                var i, length = scope.liveGameViewData.length;
                for (i = 0; i < length; i++) {
                    if (scope.liveGameViewData[i].collapsed) {
                        expandedCount++;
                    }
                }

                if (expandedCount === length) {
                    scope.collapsedAll = false;
                } else if (!expandedCount) {
                    scope.collapsedAll = true;
                }
            }

            /**
             * @ngdoc method
             * @name init
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description Initialization
             */
            function init() {
                scope.setMinutes(Config.main.homePageLastMinuteBets.timeOptions[Config.main.homePageLastMinuteBets.timeOptions.length - 1]);
            }

            /**
             * @ngdoc method
             * @name updateGames
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description update games
             *
             * @param {object} data games object
             */
            function updateGames(data) {
                scope.loadCompleted = true;
                scope.liveGameViewData = [];
                var allSports = {name: Translator.get('All Sports'), alias: 'allSport', game: []};

                var sportList = [], sportData = Utils.objectToArray(data), markets = [];

                angular.forEach(sportData[0], function (sport) {
                    sportList.push(sport);
                });

                angular.forEach(sportList, function (sport, k1) {
                    if (sportList[k1] && scope.liveGameViewData.length < scope.sportTabsQuantity) {
                        sportList[k1].game = [];
                        sportList[k1].collapsed = sportList[k1].collapsed || false;
                        angular.forEach(sport.region, function (region, rKey) {
                            angular.forEach(region.competition, function (competition, cKey) {
                                sportList[k1].region[rKey].competition[cKey].gamesLength = Object.keys(competition.game).length;
                                competition.collapsed = competition.collapsed || false;
                                angular.forEach(competition.game, function (game) {
                                    game.sport = sport;
                                    game.region = region;
                                    game.competition = competition;
                                    game.events = {};
                                    markets = Utils.groupByItemProperty(game.market, 'type');
                                    game.choosenMarket = null;
                                    if (markets) {
                                        if (markets.P1XP2) {
                                            game.choosenMarket = markets.P1XP2[0];
                                        } else if (markets.P1P2) {
                                            game.choosenMarket = markets.P1P2[0];
                                        }
                                    }
                                    if (game.choosenMarket && game.choosenMarket.event) {
                                        angular.forEach(game.choosenMarket.event, function (event) {
                                            game.events[event.type] = event;
                                        });
                                        sportList[k1].game.push(game);
                                        allSports.game.push(game);
                                    }
                                });
                            });
                        });

                        sportList[k1].game.sort(function (a, b) {
                            return a.start_ts - b.start_ts;
                        });
                        if (sportList[k1].game.length > 0) {
                            if ('popularGamesWidget' === scope.gameWidgetType && sportList[k1].game.length > Config.main.showPromotedGamesOnWidget.quantity) {
                                sportList[k1].game = sportList[k1].game.slice(0, Config.main.showPromotedGamesOnWidget.quantity);
                            }
                            scope.liveGameViewData.push(sportList[k1]);
                        }
                    }
                });

                if ('liveNow' === scope.gameWidgetType) {
                    scope.liveGameViewData.unshift(allSports);
                }
                if (scope.liveGameViewData.length > 0) {
                    angular.forEach(scope.liveGameViewData, function (game) {
                        game.game.sort(function (a, b) {
                            return a.id - b.id;
                        });
                    });

                    GameInfo.updateSelectedSportByLiveGameViewData(scope);
                } else {
                    scope.selectedSport = null;
                }
            }

            /**
             * @ngdoc method
             * @name subscribeForGames
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description
             */
            function subscribeForGames() {
                if (gamesSubscription) {
                    connectionService.unsubscribe(gamesSubscription);
                }

                var request = {
                    'source': 'betting',
                    'what': {
                        'sport': ['id', 'name', 'alias'],
                        'competition': ['id', 'order', 'name'],
                        'region': ['id', 'name', 'alias'],
                        'game': ['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'markets_count', 'is_blocked',
                            'video_id', 'video_id2', 'video_id3', 'video_provider', 'last_event', 'is_stat_available', 'team1_external_id', 'team2_external_id', 'game_external_id', 'is_live'],
                        'event': ['id', 'price', 'type', 'name'],
                        'market': ['type', 'express_id', 'name']
                    },
                    'where': {
                        'game': {'@limit': Config.main.showPromotedGamesOnWidget.gameLimit},
                        'event': {type: {'@in': ['P1', 'X', 'P2']}}
                    }
                };
                if (!Config.main.GmsPlatform) {
                    request.where.sport = {'id': {'@nin': Config.main.virtualSportIds}};
                }
                if (scope.gameWidgetType === 'lastMinutesBets') {
                    request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': scope.minutesFilter * 60}};
                } else if (scope.gameWidgetType === 'highlights' && Config.main.loadPopularGamesForSportsBook && Config.main.loadPopularGamesForSportsBook.level) {
                    request.where[Config.main.loadPopularGamesForSportsBook.level] = {};
                    request.where[Config.main.loadPopularGamesForSportsBook.level][Config.main.loadPopularGamesForSportsBook.type] = true;
                } else if (scope.gameWidgetType === 'popularGamesWidget' && Config.main.showPromotedGamesOnWidget.enabled) {
                    if (Config.main.showPromotedGamesOnWidget.level === 'competition') {
                        request.where[Config.main.showPromotedGamesOnWidget.level] = {};
                        request.where[Config.main.showPromotedGamesOnWidget.level][Config.main.showPromotedGamesOnWidget.type] = true;
                    } else if (Config.main.showPromotedGamesOnWidget.level === 'game'){
                        request.where.game[Config.main.showPromotedGamesOnWidget.type] = {"@contains": parseInt(Config.main.site_id)};
                    }
                } else if (scope.gameWidgetType === 'liveNow') {
                    request.where.game.type = 1;
                } else if (scope.gameWidgetType === 'upcoming') {
                    if(Config.main.availableSportsbookViews.euro2016) {
                        request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': scope.minutesFilter * 60}};
                    } else {
                        request.where.game.type = 2;
                    }
                }

                if (Config.main.homePageLastMinuteBets && Config.main.homePageLastMinuteBets.showCustomSports) {
                    Utils.setCustomSportAliasesFilter(request, Config.main.customSportIds[Config.main.homePageLastMinuteBets.showCustomSports]);
                }

                connectionService.subscribe(
                    request,
                    updateGames,
                    {
                        'thenCallback': function (result) {
                            if (result.subid) {
                                gamesSubscription = result.subid;
                            }
                        }
                    }
                );
            }

            /**
             * @ngdoc method
             * @name selectSport
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description set minutes filter
             *
             * @param sport sport object
             */
            scope.selectSport = function selectSport(sport) {
                scope.selectedSport = sport;
            };

            /**
             * @ngdoc method
             * @name setMinutes
             * @methodOf CMS.directive:vbetLastMinuteBets
             * @description set minutes filter
             *
             * @param {number} minutes
             */
            scope.setMinutes = function setMinutes(minutes) {
                if (minutes === scope.minutesFilter) {
                    return;
                }
                scope.collapsedAll = true;
                scope.minutesFilter = minutes;
                scope.loadCompleted = false;
                scope.selectedSport = null;
                subscribeForGames();
            };

            /**
             * @ngdoc method
             * @name updateFeaturedGame
             * @methodOf vbet5.controller:featuredgameCtrl
             * @description selects most popular game and saves in  **$scope.mostPopularLiveGame**
             *
             * @param {object} data object containing games data
             */
            function updateFeaturedGame(data) {
                if (data.sport === null) {
                    return; //keep the game there is subscription update is empty
                }
                var mostPopularGame = null, maxEventsCount = 0, markets = null;
                angular.forEach(data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                if (game.events_count > maxEventsCount) {
                                    mostPopularGame = game;
                                    mostPopularGame.sport = sport;
                                    mostPopularGame.competition = competition;
                                    mostPopularGame.region = region;
                                    mostPopularGame.choosenMarket = null;
                                    markets = Utils.groupByItemProperty(game.market, 'type');
                                    maxEventsCount = game.events_count;
                                    if(markets) {
                                        if (markets.P1XP2) {
                                            mostPopularGame.choosenMarket = markets.P1XP2[0];
                                        } else if (markets.P1P2) {
                                            mostPopularGame.choosenMarket = markets.P1P2[0];
                                        }
                                    }
                                    if (mostPopularGame.choosenMarket && mostPopularGame.choosenMarket.event) {
                                        game.event = [];
                                        angular.forEach(mostPopularGame.choosenMarket.event, function (event) {
                                            game.event.push(event);
                                        });

                                    }
                                }
                            });
                        });
                    });
                });

                if (mostPopularGame) {
                    mostPopularGame.event = Utils.getItemBySubItemProperty(mostPopularGame.event, 'type', ['P1', 'P2', 'X']);

                    if (mostPopularGame.info !== undefined && mostPopularGame.info.current_game_time > 0) {
                        mostPopularGame.info.current_game_time = getOnlyTime(mostPopularGame.info.current_game_time);
                    }
                    if (Config.main.featuredGameNewTemplate) {
                        addBgImageIfExists(mostPopularGame);
                    }
                } else {
                    $scope.getOneLiveGame();
                }

                $scope.mostPopularLiveGame = mostPopularGame;
            }

            scope.goToUrl = Utils.goToUrl;

            scope.openStatistics = function openStatistics(game) {
                $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
            };

            scope.bet = function bet(event, game) {
                var oddType = 'odd';
                if (!game || !event || Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type == 1) {
                    return;
                }
                var keys = Object.keys(game.market);
                var market = game.choosenMarket || game.market[keys[0]];

                if (scope.widgetMode === 'iframe') {
                    $window.parent.postMessage({
                        action: 'place_bet',
                        data: {event: event, market: market, game: game, oddType: oddType}
                    }, '*');
                }
                if (scope.widgetMode !== 'iframe' || Config.main.enableAddToBetSlipFromWidget) {
                    $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
                }
            };

            /**
             * @ngdoc method
             * @name toggleGameFavorite
             * @methodOf vbet5.controller:gameWidget
             * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
             * @param {Object} game game object
             */
            scope.toggleGameFavorite = function toggleGameFavorite(game) {
                $rootScope.$broadcast('game.toggleGameFavorite', game);
                console.log('scope.favorites', scope.favorites);
            };


            init();
        }
    };
}]);
