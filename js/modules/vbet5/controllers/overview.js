/**
 * @ngdoc controller
 * @name vbet5.controller:overviewCtrl
 * @description
 * Sports live overview controller
 */
angular.module('vbet5.betting').controller('overviewCtrl', ['$rootScope', '$scope', 'Config', 'ConnectionService', 'Utils', '$filter', 'Translator', 'GameInfo', 'Storage', function ($rootScope, $scope, Config, ConnectionService, Utils, $filter, Translator, GameInfo, Storage) {
    'use strict';

    var lastData;
    var connectionService = new ConnectionService($scope);

    $rootScope.footerMovable = true;

    $scope.isSportCollapsed = {};

    /**
     * @ngdoc property
     * @name states
     * @description object that stores sports/competitions  expanded/collapsed states
     */
    $scope.states = Storage.get('liveOverviewStates') || {sport: {}, competition: {}};

    // watch changes and save in local storage
    $scope.$watch('states', function (states) { Storage.set("liveOverviewStates", states); }, true);


    /**
     * @ngdoc method
     * @name updateOverviewData
     * @methodOf vbet5.controller:overviewCtrl
     * @description  Receives game data object and creates array structures to be used in template:
     *              $scope.allSports - sports data tree:  sports->competitions->games
     *              $scope.favoriteGames - favorite games having same structure as above
     *              lastData is saved to call this function later and create $scope.favoriteGames array when favorite games are added/removed
     * @param {Object} data game data object
     */
    function updateOverviewData(data) {
        lastData = data;
        $scope.favoriteGames = [{name: Translator.get('Favorites'), alias: 'Favorites', competitions: []}];
        angular.forEach(data.sport, function (sport) {
            sport.competitions = [];
            $scope.isSportCollapsed[sport.id] = true;
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    var competitionFavoriteGames = [];
                    competition.games = [];
                    angular.forEach(competition.game, function (game) {
                        game.region = {id: region.id};
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.competition = {id: competition.id};
                        game.firstMarket = $filter('firstElement')(game.market);
                        game.additionalEvents = Config.main.showEventsCountInMoreLink ? game.events_count : game.markets_count;
                        if (game.firstMarket) {
                            game.firstMarket.events = Utils.createMapFromObjItems(game.firstMarket.event, 'type');
                            angular.forEach(game.firstMarket.events, function (event) {
                                event.name = $filter('improveName')(event.name, game);
                            });
                            if (!Config.main.showEventsCountInMoreLink) {
                                game.additionalEvents--;
                            } else {
                                game.additionalEvents -= $filter('count')(game.firstMarket.events);
                            }
                        }
                        game.hasVideo = GameInfo.hasVideo(game);
                        if ($rootScope.myGames.indexOf(game.id) !== -1) {
                            competitionFavoriteGames.push(game);
                        } else {
                            competition.games.push(game);
                            $scope.isSportCollapsed[sport.id] = false;
                        }
                    });
                    competition.region = {alias: region.alias};
                    competition.games.sort(function (a, b) {return a.start_ts - b.start_ts; });
                    sport.competitions.push(competition);
                    if (competitionFavoriteGames.length) {
                        $scope.favoriteGames[0].competitions.push({games: competitionFavoriteGames, region: {alias: region.alias}, name: competition.name, id: competition.id, sport : {alias: sport.alias, name: sport.name, id: sport.id}});
                    }
                });
            });

            sport.competitions.sort(Utils.orderSorting);

            if (!sport.competitions.length) {
                $scope.isSportCollapsed[sport.id] = true;
            }
        });

        $scope.allSports = Utils.objectToArray(data.sport).sort(Utils.orderSorting);
        console.log('overviewData:', $scope.allSports, $scope.favoriteGames);
    }

    /**
     * @ngdoc method
     * @name initOverview
     * @methodOf vbet5.controller:overviewCtrl
     * @description  Subscribes to live game data
     */
    $scope.initOverview = function initOverview() {

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'info', 'stats', 'events_count', 'markets_count', 'is_blocked', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider']
                ],
                'event': ['id', 'price', 'type', 'name'],
                'market': ['type', 'express_id', 'name', 'home_score', 'away_score']
            },
            'where': {
                'game': {'type': 1},
                'market': {'type': {'@in': ['P1XP2', 'P1P2']}}
            }
        };
        Utils.setCustomSportAliasesFilter(request);
        $scope.overviewLoading = true;
        connectionService.subscribe(
            request,
            updateOverviewData,
            {
                'thenCallback': function (result) {
                    $scope.overviewLoading = false;
                },
                'failureCallback': function () {
                    $scope.overviewLoading = false;
                }
            }
        );

    };

    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.getCurrentTime = GameInfo.getCurrentTime;


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

        updateOverviewData(lastData);
    };
}]);