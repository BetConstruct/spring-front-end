/**
 * @ngdoc directive
 * @name CASINO.directive:biggestWinners
 * @element ANY
 * @param {Number} initial-width initial width of target element
 *
 * @description Makes gets and updates list of biggest winners of casino
 */
CASINO.directive('multiviewControl', ['$interval', '$timeout', 'CConfig', 'casinoData', 'casinoManager', function ($interval, $timeout, CConfig, casinoData, casinoManager) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'optional_modules/casino/templates/directive/multiview-control.html',
        scope: {
            gamesInfo: '=',
            viewCount: '=',
            wideMode: '=',
            middleMode: '='
        },
        link: function (scope) {
            scope.confData = CConfig;
            scope.searchCommand = '';
            scope.games = [];
            scope.gamesLimit = 40;
            scope.maxCount = 0;
            scope.newDesignEnabled = CConfig.main.newCasinoDesign.enabled;
            scope.changeView = function changeView(view) {
                scope.$emit('casinoMultiview.viewChange', view);
            };

            scope.closePopUp = function closePopUp () {
                scope.selectedCategory = null;
                reset();
            };

            scope.selectCategory = function selectCategory(categoryId) {
                if (scope.selectedCategory === categoryId) {
                    return;
                }
                scope.selectedCategory = categoryId;
                reset();

                /*if (scope.selectedCategory === CConfig.liveCasino.categoryId) {
                    if (!CConfig.liveCasino.lobby.getDataViaSwarm) {
                        scope.liveCasinoTablesInfo = {};
                        casinoManager.setupTableInfo(scope.liveCasinoTablesInfo);
                    }
                    scope.loadingProcess = false;

                    return;
                }*/
                getGames();
            };

            scope.loadMoreGames = function loadMoreGames() {
                if (scope.gamesLimit < scope.maxCount && !scope.loadingProcess) {
                    scope.gamesLimit += 40;
                    getGames();
                }
            };

            scope.$on('casinoMultiview.showGames', function (event, category) {
                scope.selectCategory(category);
            });

            scope.$on('casinoGamesList.openGame', function (event, data) {
                scope.closePopUp();
            });

            scope.$on('livedealer.redirectGame', function (event, message) {
                scope.closePopUp();
            });

            var currentSearchCommandValue, searchCommandWatcherPromise, searchEnabled = false;
            function searchCommandWatcher() {
                if (scope.searchCommand && currentSearchCommandValue !== scope.searchCommand) {
                    currentSearchCommandValue = scope.searchCommand;
                    if (searchCommandWatcherPromise) {
                        $timeout.cancel(searchCommandWatcherPromise);
                    }
                    searchCommandWatcherPromise = $timeout(searchCommandWatcher, 500);
                } else if (scope.searchCommand.length > 2) {
                    searchEnabled = true;
                    reset(true);
                    getGames();
                } else if (searchEnabled) {
                    searchEnabled = false;
                    reset(true);
                    getGames();
                }
            }

            scope.$watch('searchCommand', searchCommandWatcher);

            function getOpenedGamesIds() {
                var data = [];
                for (var i = 0, length = scope.gamesInfo.length; i < length; i += 1) {
                    if (scope.gamesInfo[i].game) {
                        data.push(scope.gamesInfo[i].game.id);
                    }
                }

                return data;
            }

            function reset(keepSearchCommand) {
                scope.games = [];
                scope.gamesLimit = 40;
                if (!keepSearchCommand) {
                    scope.searchCommand = '';
                }
            }

            function getGames() {
                scope.loadingProcess = true;
                var openedGameIds = getOpenedGamesIds();
                casinoData.getGames(scope.selectedCategory, null, scope.gamesLimit - 40, scope.gamesLimit, scope.searchCommand, openedGameIds).then(function (response) {
                    if (response && response.data && response.data.status !== -1) {
                        Array.prototype.push.apply(scope.games, response.data.games);
                        scope.maxCount = parseInt(response.data.total_count);
                    }
                })['finally'](function () {
                    scope.loadingProcess = false;
                })
            }
        }
    };
}]);