/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:searchCtrl
 * @description
 * Search controller
 */
VBET5.controller('searchCtrl', ['$rootScope', '$scope', 'TimeoutWrapper', '$route', '$q', '$location', 'Config', 'Zergling',  'Utils', function ($rootScope, $scope, TimeoutWrapper, $route, $q, $location, Config, Zergling, Utils) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.showSearchResults = false;
    $scope.showSearchCommandResults = false;

    var customSportAliasFilter = Utils.getCustomSportAliasFilter();
    /**
     * @ngdoc method
     * @name processResults
     * @methodOf vbet5.controller:searchCtrl
     * @description processes search results and writes them to $scope's searchResults array
     *
     * @param {Array} promises array of promises of search requests that will be resolved when search completes
     */
    function processResults(promises) {
        $q.all(promises).then(function (resultsSet) {
            $scope.searchResults = {};
            $scope.searchResultGameIds = []; //needed for keyboard navigation
            var order = 0;

            angular.forEach(resultsSet, function (data) {
                angular.forEach(data.data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                if ($scope.searchResults[sport.id] === undefined) {
                                    $scope.searchResults[sport.id] = {order: order++, results: []};
                                }
                                $scope.searchResults[sport.id].results.push({
                                    game: game,
                                    region: {name: region.name, id: region.id},
                                    competition: {name: competition.name, id: competition.id},
                                    sport: {id: sport.id, name: sport.name, alias: sport.alias}
                                });
                                $scope.searchResultGameIds.push(game.id);
                            });
                        });
                    });
                });
            });
            $scope.showSearchResults = true;

            $scope.searchResults = Utils.objectToArray($scope.searchResults); // for sorting

            console.log('results - raw: ', resultsSet, ' flat: ', $scope.searchResults);
        });
    }

    /**
     * @ngdoc method
     * @name doSearch
     * @methodOf vbet5.controller:searchCtrl
     * @description performs search and flattens results gotten from swarm
     * flattened results are stored in $scope.searchResults
     *
     * search is done by sending 2 requests - for games and competitions
     * results are merged then
     *
     * @param {String} term search term
     */
    function doSearch(term) {
        console.log('doSearch', term);
        var termIsNumber = term && term.length && parseInt(term, 10).toString() === term;

        if (term && (term.length > 2 || (termIsNumber && Config.main.search.enableSearchByGameNumber))) {
            var like = {}, promiseComp, promiseGame;

            like[Utils.getLanguageCode(Config.env.lang)] = term;
            
            // search for games
            var request = {
                'source': 'betting',
                'what': {
                    'competition': [],
                    'region': [],
                    'game': ['type', 'start_ts', 'team1_name', 'team2_name', 'id'],
                    'sport': ['id', 'name', 'alias']
                },
                'where': {
                    'game': {
                        '@limit': Config.main.search.limitGames,
                        '@or': [
                            {'team1_name': {'@like': like}},
                            {'team2_name': {'@like': like}}
                        ]
                    }
                }
            };

            var types = [];
            if (Config.main.customSportsBook[Config.main.sportsLayout].showPrematch) {
                types.push(0);
                Config.main.GmsPlatform && types.push(2);
            }
            if (Config.main.customSportsBook[Config.main.sportsLayout].showLive) {
                types.splice(1,0,1);
            }
            if (types.length && types.length !== 3) {
                request.where.game.type = {'@in': types};
            }

            if (termIsNumber && Config.main.search.enableSearchByGameNumber) {
                request.where.game['@or'].push({game_number: parseInt(term, 10)});
            }
           Utils.setCustomSportAliasesFilter(request);

            promiseGame = Zergling.get(request);

            // search for competitions
            var compRequest = {
                'source': 'betting',
                'what': {
                    'competition': [],
                    'region': [],
                    'game': ['type', 'start_ts', 'team1_name', 'team2_name', 'id'],
                    'sport': ['id', 'name', 'alias']
                },
                'where': {
                    'competition': {
                        'name': {'@like': like}
                    },
                    'game': {
                        '@limit': Config.main.search.limitCompetitions
                    }
                }
            };

            Utils.setCustomSportAliasesFilter(compRequest);
            promiseComp = Zergling.get(compRequest);

            processResults([promiseGame, promiseComp]);
            console.log(term);
        } else {
            $scope.showSearchResults = false;
        }

    }

    /**
     * @ngdoc method
     * @name selectGameFromSearchResults
     * @methodOf vbet5.controller:searchCtrl
     *
     * @description  function is called by keyboardnavigation directive when result is selected.
     * navigates to result specified by **id**
     *
     * @param {String} id search result game id
     */
    $scope.selectGameFromSearchResults = function selectGameFromSearchResults(id) {
        angular.forEach($scope.searchResults, function (sportResult) {
            angular.forEach(sportResult.results, function (gameResult) {
                if (gameResult.game.id === id) {
                    $scope.goToResult(gameResult);
                }
            });

        });
    };



    /**
     * @ngdoc method
     * @name goToResult
     * @methodOf vbet5.controller:searchCtrl
     * @description  changes location search params to ones from result and reloads the view
     *
     *
     * @param {Object} result object
     */
    $scope.goToResult = function goToResult(result) {
        $scope.showSearchResults = false;

        var currentParams = $location.search();

        if (currentParams.type == result.game.type && currentParams.sport == result.sport.id && currentParams.competition == result.competition.id && currentParams.region == result.region.id &&  currentParams.game == result.game.id) {
            return;
        }
        if($location.path() !== "/sport/"){
            $location.path("/sport/");
        }
        $location.search({
            type: result.game.type === 2 ? 0 : result.game.type,
            sport: result.sport.id,
            competition: result.competition.id,
            region: result.region.id,
            game: result.game.id
        });
        $route.reload();
    };

    /**
     * @ngdoc method
     * @name goToResultLite
     * @methodOf vbet5.controller:searchCtrl
     * @description  changes location search for windbet
     *
     *
     * @param {Object} result object
     */
    $scope.goToResultLite = function goToResultLite(result) {
        $rootScope.env.showSearchDialog = false;
        $location.path('/game/' + result.game.id);
        $route.reload();
    };

    /**
     * Monitors search field and starts searching when user stopped typing
     */
    var currentSearchTermValue, searchWatcherPromise;
    function searchWatcher() {
        if ($scope.searchTerm && currentSearchTermValue !== $scope.searchTerm) {
            currentSearchTermValue = $scope.searchTerm;
            if (searchWatcherPromise) {
                TimeoutWrapper.cancel(searchWatcherPromise);
            }
            searchWatcherPromise = TimeoutWrapper(searchWatcher, 500);
        } else {
            doSearch($scope.searchTerm);
        }


    }

    $scope.$watch('searchTerm', searchWatcher);

    /**
     * @ngdoc method
     * @name searchEnter
     * @methodOf vbet5.controller:searchCtrl
     * @description  performs the search when keypress event is 'enter'(13)
     * @param {Object} event keypress event
     */
    $scope.searchEnter = function searchEnter(event) {
        if (event.which === 13) {
            searchWatcher();
        }
    };

}]);