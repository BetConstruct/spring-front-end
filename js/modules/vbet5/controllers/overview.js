/**
 * @ngdoc controller
 * @name vbet5.controller:overviewCtrl
 * @description
 * Sports live overview controller
 */
angular.module('vbet5.betting').controller('overviewCtrl', ['$rootScope', '$scope', '$location', 'Config', 'ConnectionService', 'Utils', '$filter', 'Translator', 'GameInfo', '$q', function ($rootScope, $scope, $location,Config, ConnectionService, Utils, $filter, Translator, GameInfo, $q) {
    'use strict';

    $rootScope.footerMovable = true;

    var connectionService = new ConnectionService($scope);
    var SPORTS_TO_OPEN = 3; // Number of sports to be expanded on init
    var subids = {};


    $scope.states = {
        sportExpanded: {},
        competitionCollapsed: {}
    };
    $scope.loading = {
        overview: true
    };
    $scope.sportData = {};
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.getCurrentTime = GameInfo.getCurrentTime;


    function unsubscribe(sportId) {
        if (subids[sportId]) {
            connectionService.unsubscribe(subids[sportId]);
            subids[sportId] = null;
        }
    }


    function getOptimalMarketId(displayKey, markets) {
        var marketId;

        switch (displayKey) {
            case 'WINNER':
                if (markets.length > 1) {
                    // If possible always choose 2 way winner
                    var p1p2 = markets.filter(function getP1P2(market) { return Object.keys(market.event).length === 2; });
                    if (p1p2.length) {
                        marketId = p1p2[0].id;
                    } else {
                        marketId = markets[0].id;
                    }
                } else {
                    marketId = markets[0].id;
                }
                break;
            default: // getting most optimal base
                var min, currMin;
                var eventTypes = markets[0].display_key === 'HANDICAP' ? ['Home', 'Away'] : ['Over', 'Under'];
                for (var i = 0, x = markets.length; i < x; i++) {
                    var events = markets[i].events;
                    if (min === undefined) {
                        if (events[eventTypes[0]] && events[eventTypes[0]].price && events[eventTypes[1]] && events[eventTypes[1]].price) {
                            marketId = markets[i].id;
                            min = +Math.abs(markets[i].events[eventTypes[0]].price - markets[i].events[eventTypes[1]].price).toFixed(2);
                        }
                    } else if (events[eventTypes[0]] && events[eventTypes[0]].price && events[eventTypes[1]] && events[eventTypes[1]].price) {
                        currMin = +Math.abs(markets[i].events[eventTypes[0]].price - markets[i].events[eventTypes[1]].price).toFixed(2);
                        if (currMin < min) {
                            marketId = markets[i].id;
                            min = currMin;
                        }
                    }
                }
        }

        return marketId;
    }


    function processMarkets(data) {
        var groupedMarkets = Utils.groupByItemProperty(data, 'display_sub_key');

        if (groupedMarkets) {
            angular.forEach(groupedMarkets, function(value, displaySubKey) {
                groupedMarkets[displaySubKey] = Utils.groupByItemProperty(value, 'display_key');
            });
            groupedMarkets = angular.extend({}, groupedMarkets.PERIOD, groupedMarkets.MATCH);

            angular.forEach(groupedMarkets, function(markets, displayKey) {
                if (displayKey !== 'WINNER' && groupedMarkets[displayKey][0].display_sub_key === 'PERIOD') {
                    // Grouping markets by point_sequence to select the correct one
                    groupedMarkets[displayKey] = Utils.groupByItemProperty(groupedMarkets[displayKey], 'point_sequence');
                    var pointSequence = Math.min.apply(null, Object.keys(groupedMarkets[displayKey]));

                    if (groupedMarkets[displayKey][pointSequence]) {
                        groupedMarkets[displayKey][pointSequence].forEach(function formatEventData(market) {
                            // Grouping events by type_1 (type) for future base calculations (in getOptimalMarketId function)
                            market.events = Utils.createMapFromObjItems(market.event, 'type_1');
                        });
                        groupedMarkets[displayKey] = data[getOptimalMarketId(displayKey, groupedMarkets[displayKey][pointSequence])];
                    } else {
                        groupedMarkets[displayKey] = null;
                    }

                } else {
                    markets.forEach(function formatEventData(market) {
                        market.events = Utils.createMapFromObjItems(market.event, 'type_1');
                    });
                    groupedMarkets[displayKey] = data[getOptimalMarketId(displayKey, markets)];
                }
            });
        }

        return groupedMarkets;
    }


    function processData(data) {
        var processedData = [];

        angular.forEach(data.sport, function (sport) {
            var processedSport = {
                id: sport.id,
                alias: sport.alias,
                name: sport.name,
                order: sport.order,
                competitions: []
            };
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    var processedCompetition = {
                        id: competition.id,
                        name: competition.name,
                        region: { alias: region.alias },
                        games: []
                    };
                    angular.forEach(competition.game, function (game) {
                        var processedGame = {
                            id: game.id,
                            region: {id: region.id},
                            sport: {id: sport.id, alias: sport.alias},
                            competition: {id: competition.id},
                            info: game.info,
                            is_blocked: game.is_blocked,
                            markets_count: game.markets_count,
                            team1_name: game.team1_name,
                            team2_name: game.team2_name,
                            video_id: game.video_id,
                            stats: game.stats,
                            type: game.type,
                            start_ts: game.start_ts,
                            processedMarkets: processMarkets(game.market)
                        };
                        if (processedGame.processedMarkets) {
                            angular.forEach(processedGame.processedMarkets, function(market) {
                                if (market) {
                                    angular.forEach(market.events, function (event) {
                                        event.name = $filter('improveName')(event.name, game);
                                    });
                                }
                            });
                        }
                        processedGame.hasVideo = GameInfo.hasVideo(processedGame);
                        processedCompetition.games.push(processedGame);
                    });
                    processedCompetition.games.sort(Utils.orderByStartTs);
                    processedSport.competitions.push(processedCompetition);
                });
            });
            processedData.push(processedSport);
        });

        return processedData;
    }


    function subscribeToSport(id) {
        $scope.loading[id] = true;

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                'game': [['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'stats', 'markets_count', 'is_blocked', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider']],
                'event': ['id', 'price', 'type_1', 'name', 'base'],
                'market': ['id', 'type', 'express_id', 'name', 'home_score', 'away_score', 'display_key', 'display_sub_key', 'base', 'id', 'cashout', 'point_sequence', 'col_count']
            },
            'where': {
                'game': {'type': 1},
                'sport': { 'id': id },
                'market': {
                    'display_key': {'@in': ['WINNER', 'HANDICAP', 'TOTALS']},
                    'display_sub_key': {'@in': ['MATCH', 'PERIOD']}
                }
            }
        };

        connectionService.subscribe(
            request,
            function updateSportData(data) {
                var sportId = Object.keys(data.sport)[0];

                if (!$scope.states.sportExpanded[sportId]) {
                    unsubscribe(sportId);
                    return;
                }

                $scope.sportData[sportId] = processData(data)[0];
            },
            {
                'thenCallback': function (response) {
                    subids[id] = response.subid;
                    $scope.loading[id] = false;
                },
                'failureCallback': function () {
                    $scope.loading[id] = false;
                }
            },
            true
        );
    }


    function getSports() {
        var deferred = $q.defer();
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order']
            },
            'where': {
                'game': {'type': 1}
            }
        };
        Utils.setCustomSportAliasesFilter(request);
        connectionService.subscribe(
            request,
            function updateSportsList(data) {
                $scope.allSports = Utils.objectToArray(data.sport).sort(Utils.orderSorting);
            },
            {
                'thenCallback': function() {
                    var sportsToExpand = $scope.allSports
                        .filter(function openSportsByDefault(sport, index) {
                            return index < SPORTS_TO_OPEN;
                        })
                        .map(function mapIds(sport) {
                            return sport.id;
                        });
                    deferred.resolve(sportsToExpand);
                },
                'failureCallback': function() {
                    deferred.reject();
                }
            }
        );

        return deferred.promise;
    }


    $scope.toggleMenuItem = function toggleMenuItem(type, id) {
        switch (type) {
            case 'sport':
                $scope.states.sportExpanded[id] = !$scope.states.sportExpanded[id];
                if ($scope.states.sportExpanded[id]) {
                    subscribeToSport(id);
                } else {
                    unsubscribe(id);
                }
                break;
            case 'competition':
                $scope.states.competitionCollapsed[id] = !$scope.states.competitionCollapsed[id];
        }
    };


    /**
     * @ngdoc method
     * @name initOverview
     * @methodOf vbet5.controller:overviewCtrl
     * @description  Subscribes to live game data
     */
    $scope.initOverview = function initOverview() {
        $scope.loading.overview = true;
        GameInfo.getProviderAvailableEvents().then(function () {
            getSports().then(function subscribeAndCollapse(sportsToExpand) {
                sportsToExpand.forEach(function subscribeAndExpand(id) {
                    $scope.toggleMenuItem('sport', id);
                });
            })['finally'](function stopLoading() {
                $scope.loading.overview = false;
            });
        });
    };


    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:overviewCtrl
     * @description  sends a message to betslip[ to add a bet
     *
     * @param {Object} event event object
     * @param {Object} market event's market object
     * @param {Object} openGame game object
     * @param {String} [oddType] odd type (odd or sp)
     */
    $scope.bet = function bet(event, market, openGame, oddType) {

        oddType = oddType || 'odd';
        var game = Utils.clone(openGame);
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
        console.log('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    /**
     * @ngdoc method
     * @name toggleGameFavorite
     * @methodOf vbet5.controller:overviewCtrl
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     * @param {Object} game game object
     */
    $scope.toggleGameFavorite = function toggleGameFavorite(game) {
        if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
            $scope.$emit('game.addToMyGames', game);
        } else {
            $scope.$emit('game.removeGameFromMyGames', game);
        }
    };

    (function init(){
        Config.env.live = true;
    })();
}]);
