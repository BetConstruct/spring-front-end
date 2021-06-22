/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:searchCtrl
 * @description
 * Search controller
 */
VBET5.controller('casinoSearchCtrl', ['$rootScope', '$scope', '$timeout', '$location', 'Config', 'CConfig', 'casinoData', 'casinoManager', function ($rootScope, $scope, $timeout, $location, Config, CConfig, casinoData, casinoManager) {
    'use strict';

    $scope.showSearchResults = false;
    $scope.showSearchCommandResults = false;

    /**
     * @ngdoc method
     * @name selectCasinoGameFromSearchResults
     * @methodOf vbet5.controller:searchCtrl
     *
     * @description  function is called by keyboardnavigation directive when result is selected.
     * navigates to result specified by **id**
     *
     * @param {String} id search result game id
     */
    $scope.selectCasinoGameFromSearchResults = function selectCasinoGameFromSearchResults(id) {
        var i, count = $scope.searchCommandResults.length;
        for (i = 0; i < count; i += 1) {
            if ($scope.searchCommandResults[i].id == id) {
                $scope.openCasinoGame($scope.searchCommandResults[i]);
                break;
            }
        }
    };



    /**
     * @ngdoc method
     * @name doSearchCommand
     * @methodOf vbet5.controller:searchCtrl
     * @description performs search and flattens results gotten from casino data
     * flattened results are stored in $scope.searchCommandResults
     *
     * @param {String} command search command
     */

    function doSearchCommand(command) {
        if (command && command.length > 2) {
            var countryCode = $rootScope.geoCountryInfo && $rootScope.geoCountryInfo.countryCode || '';
            casinoData.getGames({country: countryCode, search:command}).then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    var games;
                    if (CConfig.main.disableAgeRestrictedGames) {
                        games = response.data.games.filter(function(game) {
                            return !game.has_age_restriction || $rootScope.env.authorized;
                        });
                    } else {
                        games = response.data.games;
                    }

                    $scope.searchCommandResultGameIds = []; //needed for keyboard navigation
                    var i, length = games.length;
                    for (i = 0; i < length; i += 1) {
                        $scope.searchCommandResultGameIds.push(games[i].id);
                    }
                    $scope.showSearchCommandResults = true;
                    $scope.searchCommandResults = games;
                }
            });
        } else {
            $scope.showSearchCommandResults = false;
        }
    }

    if ($location.path() === '/') {
        $scope.openCasinoGame = function openCasinoGame(game, gameType) {
            casinoManager.navigateToRightRouteAndOpenGame(game, gameType);
        };
        $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
            casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
        };
    } else {

        /**
         * @ngdoc method
         * @name openCasinoGame
         * @methodOf vbet5.controller:searchCtrl
         * @param {Object} game game object
         * @description  broadcast game into casinoCtrl and hide casino search result
         */
        $scope.openCasinoGame = function openCasinoGame(game, gameType) {
            $scope.showSearchCommandResults = false;

            switch (game.front_game_id) {
                case CConfig.fantasySports.gameID:
                    $location.url('/fantasy/');
                    return;
                case CConfig.ogwil.gameID:
                    if ($rootScope.casinoGameOpened < 2) {
                        $location.url('/ogwil/');
                        return;
                    }
                    break;
                case CConfig.financials.gameID:
                    $location.url('/financials/');
                    return;
                default:
                    break;
            }

            if (!$rootScope.env.authorized && game.gameProvider === 'GMG') {
                $rootScope.$broadcast("openLoginForm");
                return;
            }

            gameType = gameType || ($rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : (game.gameCategory == 'VirtualBetting' || game.gameCategory == CConfig.liveCasino.categoryName || game.gameCategory == 'SkillGames' ? 'demo' : 'fun'));
            if($rootScope.casinoGameOpened > 1 && $location.path() === '/casino/') {
                $rootScope.$broadcast('casino.openGame', game, gameType);
                return;
            }
            var page;
            if (game.categories.indexOf(CConfig.skillGames.categoryId) !== -1) {
                page = 'games';
            } else if (game.categories.indexOf(CConfig.liveCasino.categoryId) !== -1) {
                page = 'livedealer';
            } else {
                page = 'casino';
            }


            if (page === "casino" || (page === "games" && !$rootScope.calculatedConfigs.skillgamesEnabled) || (page === "livedealer" && !$rootScope.calculatedConfigs.livedealerEnabled)) {
                $rootScope.$broadcast('casino.openGame', game, gameType);
            } else {
                var unregisterRouteChangeSuccess =  $scope.$on('$routeChangeSuccess', function () {
                    if (!$location.$$replace) {
                        $rootScope.$broadcast(page + '.openGame', game, gameType);
                        unregisterRouteChangeSuccess();
                    }
                });
                $location.url('/' + page + '/');
            }

        };
    }



    /**
     * Monitors search field and send search command to casinoCtrl when user stopped typing
     */
    var currentSearchCommandValue, searchCommandWatcherPromise;
    function searchCommandWatcher() {
        if ($scope.searchCommand && currentSearchCommandValue !== $scope.searchCommand) {
            currentSearchCommandValue = $scope.searchCommand;
            if (searchCommandWatcherPromise) {
                $timeout.cancel(searchCommandWatcherPromise);
            }
            searchCommandWatcherPromise = $timeout(searchCommandWatcher, 500);
        } else {
            doSearchCommand($scope.searchCommand);
        }
    }

    $scope.$watch('searchCommand', searchCommandWatcher);
    $scope.$watch('showSearchCommandResults', function (newValue, oldValue) {
        if (!newValue && oldValue) {
            $scope.searchCommand = ''; //reset search input
        }
    });


    /**
     * @ngdoc method
     * @name searchEnter
     * @methodOf vbet5.controller:searchCtrl
     * @description  performs the search when keypress event is 'enter'(13)
     * @param {Object} event keypress event
     */
    $scope.searchEnter = function searchEnter(event) {
        if (event.which === 13) {
            searchCommandWatcher();
        }
    };

}]);
