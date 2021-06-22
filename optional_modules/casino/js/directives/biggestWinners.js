/**
 * @ngdoc directive
 * @name CASINO.directive:biggestWinners
 * @element ANY
 * @param {Number} initial-width initial width of target element
 *
 * @description Makes gets and updates list of biggest winners of casino
 */
CASINO.directive('casinoBiggestWinners', ['$rootScope', '$location', '$interval', 'CConfig', 'Zergling', 'Utils', 'casinoData', 'Geoip', function ($rootScope, $location, $interval, CConfig, Zergling, Utils, casinoData, Geoip) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        template: '<ng-include src="templateUrl"/>',
        scope: {
            limit: '=',
            templateUrl: '@',
            title: '@'
        },
        link: function (scope) {
            var updateInterval, countryCode = '';
            scope.externalImages = {};
            scope.activeTab = CConfig.main.biggestWinners.activeTab !== undefined ? CConfig.main.biggestWinners.activeTab : 'last';

            scope.imagePath = CConfig.cUrlPrefix + CConfig.winnersIconsUrl;
            scope.biggestWinners = CConfig.main.biggestWinners;
            scope.externalIds = {};
            /**
             * @ngdoc method
             * @name changeTab
             * @description  changed request and showing content from 'Top Winners' to 'Last Winners' and vice versa
             */
            scope.changeTab = function changeTab(tabName) {
                if(scope.activeTab === tabName){ return; }

                scope.activeTab = tabName;
                scope.winners = '';
                $interval.cancel(updateInterval);
                if(scope.activeTab === 'last') {
                    updateInterval = $interval(getWinners, CConfig.main.biggestWinners.updateInterval || 10000);
                }
                getWinners();
            };

            // todo SDC-40634
            // scope.openGameByExternalId = function openGameByExternalId(game_id) {
            //     casinoData.getGames(null, null, countryCode, null, null, null, null, null,[game_id]).then(function (response) {
            //         if(response && response.data && response.data.games && response.data.games.length > 0){
            //             $rootScope.$broadcast('casino.openGame',response.data.games[0],'real');
            //         }
            //     });
            // };

            function processExternalGames() {
                var gameExternalIds = [], i, length;
                for (i = 0, length = scope.winners.length; i < length; ++i) {
                    !scope.externalImages[scope.winners[i].game_id] && gameExternalIds.indexOf(scope.winners[i].game_id) === -1 && gameExternalIds.push(scope.winners[i].game_id);
                }

                if (gameExternalIds.length) {
                    casinoData.getGames({country: countryCode, external_id : gameExternalIds,additionalParams: '&only_images=1' }).then(function(response) {
                        if(response && response.data && response.data.games) {
                            var games = response.data.games;
                            for (i = 0, length = games.length; i < length; ++i) {
                                scope.externalImages[games[i].extearnal_game_id] = games[i].icon_2 || games[i].icon_1;
                            }
                        }
                    });
                }
            }

            /**
             * @ngdoc method
             * @name getWinners
             * @description  get winners data
             */
            function getWinners() {
                if ($rootScope.inactiveMode) {
                    return;
                }
                var activeTab = scope.activeTab;
                scope.winnersLoading = (scope.activeTab === activeTab) && !scope.winners;
                var command = (scope.activeTab === 'top') ? 'get_partner_last_big_wins' : 'get_partner_last_wins';
                var request = {
                    count: scope.limit || 5
                };
                Zergling.get(request, command).then(function (result) {  //  or get_partner_last_big_wins
                    if (result && result.result === 0 && result.details && scope.activeTab === activeTab) {
                        scope.winners = Utils.objectToArray(result.details);
                        processExternalGames();

                    }
                })['catch'](function (reason) {
                    console.log('Error:'); console.log(reason);
                })['finally'](function () {
                    scope.activeTab === activeTab && (scope.winnersLoading = false);
                });
            }

            if(scope.activeTab === 'last') {
                updateInterval = $interval(getWinners, CConfig.main.biggestWinners.updateInterval || 15000);
            }

            function openGame(game, gameType) {
                var page, pagePath;
                var gameId = game.front_game_id;
                if (gameId === CConfig.ogwil.gameID) {
                    if (gameType === 'real' && !$rootScope.env.authorized) {
                        $rootScope.$broadcast("openLoginForm");
                    } else {
                        $location.url('/ogwil/');
                    }
                    return;
                }

                if (game.categories.indexOf(CConfig.skillGames.categoryId) !== -1) {
                    page = 'games';
                } else if (game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1) {
                    page = 'livedealer';
                } else {
                    page = 'casino';
                }

                pagePath =  '/' + page + '/';
                if ($location.$$path === pagePath) {
                    $rootScope.$broadcast(page + '.openGame', game, gameType);
                } else {
                    var unregisterRouteChangeSuccess =  scope.$on('$routeChangeSuccess', function () {

                        if (!$location.$$replace) {
                            $rootScope.$broadcast(page + '.openGame', game, gameType);
                            unregisterRouteChangeSuccess();
                        }
                    });

                    $location.url(pagePath);
                }

            }

            scope.openWinnerGame = function openWinnerGame (gameExternalId) {
                casinoData.getGames({country: countryCode, external_id: [gameExternalId]}).then(function(response) {
                    if(response && response.data && response.data.games) {
                        openGame(response.data.games[0], CConfig.main.biggestWinners.defaultMode);
                    }
                });
            };

            (function init() {
                Geoip.getGeoData(false).then(function (data) {
                    data && data.countryCode && (countryCode = data.countryCode);
                })['finally'](function () {
                    getWinners();
                });
            })();


            /**
             * clear interval
             */
            scope.$on('$destroy', function () {
                $interval.cancel(updateInterval);
                updateInterval = undefined;
            });
        }
    };
}]);
