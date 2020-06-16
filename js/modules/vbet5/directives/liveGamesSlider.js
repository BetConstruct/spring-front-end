VBET5.directive('liveGamesSlider', ['$rootScope', '$filter', '$interval', '$location', '$route', 'Config', 'ConnectionService', 'Utils', 'GameInfo', 'Storage', function($rootScope, $filter, $interval, $location, $route, Config, ConnectionService, Utils, GameInfo, Storage){
    return {
        restrict:'E',
        replace: true,
        scope: {
            interval: '='
        },
        template: '<div class="e-live-now-betslip" ng-include="::\'templates/directive/live-game-slider.html\'|fixPath"></div>',
        link: function ($scope) {
            $scope.interval = $scope.interval || 10000;
            $scope.displayBase = GameInfo.displayBase;

            var connectionService = new ConnectionService($scope);
            $scope.state = {};

            $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

            $scope.bet = function bet(event, market, openGame, oddType) {
                oddType = oddType || 'odd';
                var game = Utils.clone(openGame);
                $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
            };

            var request = {
                source: 'betting',
                what: {
                    sport: ['id', 'name', 'alias', 'order'],
                    region: ['name', 'alias', 'id', 'order'],
                    competition: ['id', 'name', 'order'],
                    game: [['id', 'start_ts', 'team1_name', 'team2_name','team1_reg_name', 'team2_reg_name', 'type', 'info', 'text_info', 'markets_count', 'is_blocked', 'stats', 'is_stat_available', 'show_type', 'game_external_id', 'team1_external_id', 'team2_external_id']],
                    market: ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order" ],
                    event: ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"]
                },
                where: {
                    sport: { type: 0 },
                    game: {markets_count: {'@gt': 0}, type: 1},
                    market: {
                        "@or": [
                            {
                                display_key: { "@in": ["HANDICAP", "TOTALS"] },
                                display_sub_key: "MATCH",
                                main_order: 1
                            },
                            {
                                display_sub_key: {'@ne': "MATCH"}
                            },
                            {
                                display_key: {"@nin": ["HANDICAP", "TOTALS"]}
                            }
                        ]
                    }
                }
            };
            $scope.loading = true;
            var intervalPromise = null;

            function startInterval() {
                if ($scope.games.length > 1) {
                    intervalPromise = $interval(function () {
                        if($scope.state.rotationPaused || $scope.games.length === 0) {
                            return;
                        }
                        $scope.nextGame();
                    }, $scope.interval);
                }

            }

            function makeArrayAndSort(obj, sortParam, callback) {
                var output = [], prop;
                for (prop in obj) {
                    output.push(callback ? callback(obj[prop]) : obj[prop]);
                }
                return sortParam ? output.sort(function sort(a, b) { return a[sortParam] - b[sortParam]; }) : output;
            }



            function modifyGameObject(sport, region, competition, game) {
                // Need this three parameters for making a bet from the left menu (P1XP2)
                game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                game.region = {id: region.id};
                game.competition = {id: competition.id};
                return game;
            }

            var updateGames = function updateGames(data) {
                var gameIdInStorage = Storage.get("liveGameSliderGameId");
                var currentGameId = ($scope.state.selectedIndex !== undefined && $scope.games[$scope.state.selectedIndex])
                    ? $scope.games[$scope.state.selectedIndex].id
                    : (gameIdInStorage || null);

                if (gameIdInStorage) {
                    Storage.remove("liveGameSliderGameId");
                }


                var index = -1;
                var newIndex = 0;
                $scope.games = [];
                $scope.loading = true;
                var initialRotationPaused = $scope.state.rotationPaused;
                $scope.state.rotationPaused = true;
                data = makeArrayAndSort(Utils.copyObj(data).sport, 'order');
                data.forEach(function processRegions(sport) {
                    sport.region = makeArrayAndSort(sport.region, 'order');
                    sport.region.forEach(function processCompetitions(region) {
                        region.competition = makeArrayAndSort(region.competition, 'order');
                        region.competition.forEach(function processGames(competition) {
                            competition.game = makeArrayAndSort(competition.game, 'start_ts', function processGames(game) { return modifyGameObject(sport, region, competition, game); });
                            competition.game.forEach(function processMarkets(game) {
                                game.market = makeArrayAndSort(game.market, 'order')[0];
                                if (!game.market) {
                                    return;
                                }
                                if (Config.main.showPlayerRegion) {
                                   game.team1_name = game.team1_reg_name && game.team1_name.indexOf(game.team1_reg_name) === -1 ? game.team1_name + ' (' + game.team1_reg_name + ')' : game.team1_name;
                                   game.team2_name = game.team2_reg_name && game.team2_name.indexOf(game.team2_reg_name) === -1 ? game.team2_name + ' (' + game.team2_reg_name + ')' : game.team2_name;
                                }
                                var market = game.market;
                                market.events = makeArrayAndSort(market.event, 'order');
                                market.events = market.events.slice(0, market.col_count);
                                market.events.forEach(function processEvents(event) {
                                    event.name = $filter('removeParts')(event.name, [market.name]);
                                    if (Config.main.dontReplaceP1P2WithTeamNamesForEvents) {
                                        if (!Config.main.dontReplaceP1P2WithTeamNamesForEvents[market.type]) {
                                            event.name = $filter('improveName')(event.name, game);
                                        }
                                    }
                                    else if (Config.main.replaceP1P2WithTeamNames) {
                                        event.name = $filter('improveName')(event.name, game);
                                    }
                                });
                                $scope.games.push(game);
                                index++;
                                if (game.id === currentGameId) {
                                    newIndex = index;
                                }
                            });
                        });

                    });
                });
                if (!intervalPromise) {
                    startInterval();
                }
                $scope.state.selectedIndex = newIndex;
                if (!initialRotationPaused) {
                    $scope.state.rotationPaused = false;
                }
                $scope.loading = false;

            };

            connectionService.subscribe(
                request,
                updateGames
            );

            $scope.nextGame = function nextGame() {
                $scope.state.selectedIndex = ($scope.state.selectedIndex + 1) % $scope.games.length;
            };

            $scope.previousGame = function previousGame() {
                $scope.state.selectedIndex = ($scope.state.selectedIndex - 1 + $scope.games.length) % $scope.games.length;
            };

            $scope.gotoBetGame = function gotoBetGame(gamePointer) {
                $location.search({
                    type: 'live',
                    sport: gamePointer.sport.id,
                    competition: gamePointer.competition.id,
                    region: gamePointer.region.id,
                    game: gamePointer.id,
                    layout: $location.search().layout
                });
                Storage.set("liveGameSliderGameId", $scope.games[$scope.state.selectedIndex].id);
                $route.reload();
            };

            $scope.$on("$destroy", function onDestroy() {
                if (intervalPromise) {
                    $interval.cancel(intervalPromise);
                }
            });

        }
    };
}]);
