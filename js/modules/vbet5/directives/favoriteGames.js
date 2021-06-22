/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:favoriteGames
 *
 * @description
 *
 */
VBET5.directive('favoriteGames', ['$rootScope', '$filter', 'ConnectionService', 'Utils', 'Storage', 'GameInfo', 'Config', function ($rootScope, $filter, ConnectionService, Utils, Storage, GameInfo, Config) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/favorite-games.html',
        scope: {
            key: '@',
            keepInStorage: '=',
            sharedData: '=storeIn' // used for passing info on fav games to parent controller
        },
        link: function ($scope) {
            var connectionService = new ConnectionService($scope);
            var favoriteGamesIDs = [];
            var subID;

            $scope.sharedData = $scope.sharedData || { count: 0 };
            if ($scope.keepInStorage) {
                if (Storage.get('favoriteGames') !== undefined) {
                    favoriteGamesIDs = Storage.get('favoriteGames')[$scope.key] || [];
                }
            }

            function subscribeToFavorites() {
                var request = {
                    source: 'betting',
                    what: {
                        sport: ['id', 'name', 'alias'],
                        competition: ['id', 'name'],
                        region: ['id', 'name', 'alias'],
                        game: ['id', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type', 'start_ts', 'info', 'markets_count', 'is_blocked', 'is_stat_available', 'is_live', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'partner_video_id']
                    },
                    where: {
                        game: {
                            id: {'@in': favoriteGamesIDs}
                        }
                    }
                };

                connectionService.subscribe(
                    request,
                    handleUpdates,
                    {
                        thenCallback: function(result) {
                            subID = result.subid;
                        }
                    }
                );
            }

            function handleUpdates(data) {
                data = Utils.copyObj(data.sport);
                var games = [];
                var gameIDs = [];
                $scope.sharedData = { count: $scope.sharedData.count };

                angular.forEach(data, function(sport) {
                    angular.forEach(sport.region, function(region) {
                        angular.forEach(region.competition, function(competition) {
                            angular.forEach(competition.game, function(game) {
                                game.hasVideo = GameInfo.hasVideo(game);
                                game.enableH2HStat = Config.main.enableH2HStat && game.is_stat_available;
                                // Grouping data so that we can properly broadcast to centre.js
                                game.requestInfo = {
                                    type: $scope.key === 'eSports' ? (game.type === 1 ? 'live' : 'preMatch') : (game.type === 2 ? 0 : game.type),
                                    sport: {id: sport.id, alias: sport.alias, name: sport.name},
                                    competition: {id: competition.id, name: competition.name},
                                    region: {id: region.id, alias: region.alias, name: region.name},
                                    game: {id: game.id}
                                };
                                gameIDs.push(game.id);
                                games.push(game);
                                $scope.sharedData[game.id] = true;
                            });
                        });
                    });
                });

                $scope.favoriteGames = games;
                $scope.sharedData.count = $scope.favoriteGames.length;

                // Syncing favorite games ids if there are any discrepancies
                if (favoriteGamesIDs.length !== gameIDs.length) {
                    favoriteGamesIDs = gameIDs;
                    updateStorageState();
                }
            }

            function updateStorageState() {
                if (!$scope.keepInStorage) { return; }

                var state = Storage.get('favoriteGames') || {};
                state[$scope.key] = favoriteGamesIDs;
                Storage.set('favoriteGames', state);
            }

            function addToFavorites(gameID) {
                favoriteGamesIDs.push(gameID);
                updateStorageState();
                subscribeToFavorites();
            }

            $scope.removeFromFavorites = function removeFromFavorites(gameID, index) {
                index = index || favoriteGamesIDs.indexOf(gameID);
                if (index > -1) {
                    favoriteGamesIDs.splice(index, 1);
                    updateStorageState();

                    if (favoriteGamesIDs.length) {
                        subscribeToFavorites();
                    } else {
                        $scope.favoriteGames = [];
                        $scope.sharedData = { count: 0 };
                        connectionService.unsubscribe(subID);
                    }
                }
            };

            $scope.toggleFavoriteGame = function toggleFavoriteGame(gameID) {
                var index = favoriteGamesIDs.indexOf(gameID);
                index < 0 ? addToFavorites(gameID) : $scope.removeFromFavorites(gameID, index);
            };

            $scope.selectFavoriteGame = function selectFavoriteGame(data) {
                $rootScope.$broadcast('favoriteGames.selected', data);
            };


            $scope.$on('favoriteGames.toggle', function(event, data) {
                $scope.toggleFavoriteGame(data);

                // This click was added for closing BetSlip mode selector,
                // because some buttons have stop.propagation and HideOnClick directive don't work
                document.body.click();
            });
            $scope.$on('favoriteGames.remove', function(event, data) { $scope.removeFromFavorites(data); });

            (function init() {
                if (favoriteGamesIDs.length > 0) {
                    subscribeToFavorites();
                }
            })();
        }
    };
}]);
