/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:searchCtrl
 * @description
 * Search controller
 */
VBET5.controller('casinoSearchCtrl', ['$rootScope', '$scope', 'TimeoutWrapper', '$location', 'Config', 'casinoUtils', 'CConfig', 'casinoData', function ($rootScope, $scope, TimeoutWrapper, $location, Config, casinoUtils, CConfig, casinoData) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.iconsUrl = CConfig.cUrlPrefix + CConfig.iconsUrl;
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
        var i, count;
        for (i = 0, count = $scope.searchCommandResults.length; i < count; i += 1) {
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
            casinoData.getSearchResult(command, CConfig.main.partnerID).then(function (response) {

                var responseData = casinoUtils.filterByGameProvider(response.data, CConfig.main.filterByProvider);
                var availableGames = getCasinoAvailableGames(responseData);
                $scope.searchCommandResultGameIds = []; //needed for keyboard navigation
                var i, j;
                for (i = 0, j = availableGames.length;  i < j;  i += 1) {
                    $scope.searchCommandResultGameIds.push(availableGames[i].id);
                }

                casinoUtils.setGamesFunMode(availableGames);
                $scope.showSearchCommandResults = true;
                $scope.searchCommandResults = availableGames;
            });
        } else {
            $scope.showSearchCommandResults = false;
        }
    }

    function getCasinoAvailableGames(games) {
        if (Config.main.skillgamesEnabled && Config.main.financialsEnabled && Config.main.livedealerEnabled && Config.main.ogwilEnabled && Config.main.fantasyEnabled) {
            return games;
        }
        var i;
        for (i = 0; i < games.length; i += 1) {
            if (
                (!Config.main.skillgamesEnabled && games[i].gameCategory == 'SkillGames' && games[i].id != '706') ||
                    (!Config.main.livedealerEnabled && games[i].gameCategory == 'LiveDealer') ||
                    (!Config.main.financialsEnabled && games[i].gameID == CConfig.financials.gameID) ||
                    (!Config.main.fantasyEnabled && games[i].gameID == CConfig.fantasySports.gameID) ||
                    (!Config.main.ogwilEnabled && games[i].gameID == CConfig.ogwil.gameID)
            ) {
                games.splice(i--, 1);
            }
        }
        return games;
    }

    /**
     * @ngdoc method
     * @name openCasinoGame
     * @methodOf vbet5.controller:searchCtrl
     * @param {Object} game game object
     * @description  broadcast game into casinoCtrl and hide casino search result
     */
    $scope.openCasinoGame = function openCasinoGame(game, gameType) {
        $scope.showSearchCommandResults = false;

        switch (game.gameID) {
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
        var gameType = gameType || ($rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : (game.gameCategory == 'VirtualBetting' || game.gameCategory == CConfig.liveCasino.categoryName || game.gameCategory == 'SkillGames' ? 'demo' : 'fun'));
        if($rootScope.casinoGameOpened > 1 && $location.path() === '/casino/') {
            $rootScope.$broadcast('casino.openGame', game, gameType);
            return;
        }
        var page;
        switch (game.gameCategory) {
            case CConfig.skillGames.categoryName:
            page = 'games';
            break;
            case CConfig.liveCasino.categoryName:
            page = 'livedealer';
            break;
        default:
            page = 'casino';
        }

        if (page !== 'casino') {
            var unregisterRouteChangeSuccess =  $rootScope.$on('$routeChangeSuccess', function () {
                if (!$location.$$replace) {
                    $rootScope.$broadcast(page + '.openGame', game, gameType);
                    unregisterRouteChangeSuccess();
                }
            });
            $location.url('/' + page + '/');
        } else {
            $rootScope.$broadcast('casino.openGame', game, gameType);
        }
    };

    /**
     * Monitors search field and send search command to casinoCtrl when user stopped typing
     */
    var currentSearchCommandValue, searchCommandWatcherPromise;
    function searchCommandWatcher() {
        if ($scope.searchCommand && currentSearchCommandValue !== $scope.searchCommand) {
            currentSearchCommandValue = $scope.searchCommand;
            if (searchCommandWatcherPromise) {
                TimeoutWrapper.cancel(searchCommandWatcherPromise);
            }
            searchCommandWatcherPromise = TimeoutWrapper(searchCommandWatcher, 500);
        } else {
            doSearchCommand($scope.searchCommand);
        }
    }

    $scope.$watch('searchCommand', searchCommandWatcher);



    /**
     * @ngdoc method
     * @name searchEnter
     * @methodOf vbet5.controller:searchCtrl
     * @description  performs the search when keypress event is 'enter'(13)
     * @param {Object} event keypress event
     */
    $scope.searchEnter = function searchEnter(event) {
        if (event.which === 13) {
            if (['/', '/sport/', '/poolbetting/'].indexOf($location.path()) !== -1) {
                searchWatcher();
            } else {
                searchCommandWatcher();
            }
        }
    };

}]);