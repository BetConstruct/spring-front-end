/**
 * @ngdoc directive
 * @name CASINO.directive:biggestWinners
 * @element ANY
 * @param {Number} initial-width initial width of target element
 *
 * @description Makes gets and updates list of biggest winners of casino
 */
CASINO.directive('multiviewControl', ['$interval', '$timeout', 'CConfig', 'casinoData', 'casinoManager', 'Geoip', 'content', '$rootScope', function ($interval, $timeout, CConfig, casinoData, casinoManager, Geoip, content, $rootScope) {
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
            scope.gamesLimit = 36;
            scope.maxCount = 0;
            var countryCode = '';

            scope.changeView = function changeView(view) {
                scope.$emit('casinoMultiview.viewChange', view);
            };
            scope.showMultiViewDropdown = false;

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

                if (scope.selectedCategory === scope.confData.liveCasino.categoryId) {
                    casinoData.getPageOptions(scope);
                }

                getGames();
            };

            scope.loadMoreGames = function loadMoreGames() {
                if (scope.gamesLimit < scope.maxCount && !scope.loadingProcess) {
                    scope.gamesLimit += 36;
                    getGames();
                }
            };

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
                scope.gamesLimit = 36;
                if (!keepSearchCommand) {
                    scope.searchCommand = '';
                }
            }

            function getGames() {
                scope.loadingProcess = true;
                var startIndex = scope.gamesLimit - 36;
                var offsetIndex = scope.gamesLimit;

                if(scope.selectedCategory === scope.confData.liveCasino.categoryId){
                    startIndex = 0;
                    offsetIndex = 999;
                }

                casinoData.getGames({
                    category: scope.selectedCategory,
                    country: countryCode,
                    offset: startIndex,
                    limit: offsetIndex,
                    search: scope.searchCommand
                }).then(function (response) {
                    if (response && response.data && response.data.status !== -1) {
                        if (scope.selectedCategory === scope.confData.liveCasino.categoryId) {
                            scope.liveGamesData = scope.liveGamesData || casinoManager.initProvidersData(response.data.games);
                        } else {
                            Array.prototype.push.apply(scope.games, response.data.games);
                            scope.maxCount = parseInt(response.data.total_count);
                        }
                    }
                })['finally'](function () {
                    scope.loadingProcess = false;
                })
            }

            scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
                casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
            };


            scope.openGame = function openGame (game, gameType, studio) {
                scope.$emit('casinoGamesList.openGame', {game: game, playMode: gameType, studio: studio});
            };

            /**
             * @ngdoc method
             * @name selectLiveDealerProvider
             * @description Select provider
             * @param {string} provider: Name of the provider
             */
            scope.selectLiveDealerProvider = function selectLiveDealerProvider(provider) {
                scope.liveGamesData.selectedProvider = provider;
            };

            (function() {
                scope.showMultiViewDropdown = (
                    (scope.$root.calculatedConfigs.livedealerEnabled && scope.$root.calculatedConfigs.skillgamesEnabled) ||
                    (scope.$root.calculatedConfigs.casinoEnabled && scope.$root.calculatedConfigs.skillgamesEnabled) ||
                    (scope.$root.calculatedConfigs.casinoEnabled && scope.$root.calculatedConfigs.livedealerEnabled) ||
                    (scope.$root.calculatedConfigs.casinoEnabled && scope.$root.calculatedConfigs.virtualBettingEnabledInTopMenu)
                );
                Geoip.getGeoData(false).then(function (data) {
                    data && data.countryCode && (countryCode = data.countryCode);
                })['finally'](function () {
                    scope.$on('casinoMultiview.showGames', function (event, category) {scope.selectCategory(category);});
                    scope.$on('casinoGamesList.openGame', scope.closePopUp);
                    scope.$on('livedealer.redirectGame', scope.closePopUp);
                });
            })();
        }
    };
}]);
