VBET5.directive('searchTeamNames',['$timeout', 'Zergling', 'Config', 'Utils', function ($timeout, Zergling, Config, Utils) {
    'use strict';
    return {
        require:"ngModel",
        restrict: 'E',
        scope: {
            sportId: '=?',
            competitionId: '=?'
        },
        templateUrl: 'templates/results/searchByTeamName.html',
        link: function($scope, el, attrs, ngModel){
            var selectedTerm = null;
            $scope.searchTearm = "";
            var addedMap;

            function clear() {
                $scope.data = [];
                selectedTerm = "";
                addedMap = {};
                ngModel.$setViewValue(null);
            }


            function addTeamInfo(data, teamName, teamId, sportAlias ) {
                if (!addedMap[teamId]) {
                    data.push({team_name: teamName, team_id: teamId, alias: sportAlias});
                    addedMap[teamId] = true;
                }
            }

            function processData(data, term) {
                clear();
                angular.forEach(data.game, function (game) {
                    var isFirst = game.team1_name.toLowerCase().indexOf(term.toLowerCase()) > -1;
                    var isSecond = game.team2_name.toLowerCase().indexOf(term.toLowerCase()) > -1;
                    if (isFirst) {
                       addTeamInfo($scope.data, game.team1_name, game.team1_id, game.sport_alias);
                    }
                    if (isSecond) {
                        addTeamInfo($scope.data, game.team2_name, game.team2_id, game.sport_alias);
                    }
                });
                $scope.showSearchResults = true;
            }

            function doSearch(term) {
                if (term && term.length > 2) {
                    if (term !== selectedTerm) {
                        $scope.loading = true;
                        var like = {};
                        like[Utils.getLanguageCode(Config.env.lang)] = term;
                        like['eng'] = term;
                        var request = {
                            'source': 'betting',
                            'what': {
                                'game': ['team1_id', 'team2_id', 'team1_name', 'team2_name', 'sport_alias']
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
                        if ($scope.sportId) {
                            request.where.sport = {
                                'id': $scope.sportId
                            };
                        }
                        if ($scope.competitionId && +$scope.competitionId !== -1) {
                            request.where.competition = {
                                'id': +$scope.competitionId
                            };
                        }
                        Zergling.get(request).then(function (data) {
                            $scope.loading = false;
                            processData(data.data, term);
                        });
                    }
                } else {
                    clear();
                }
            }
            /**
             * Monitors search field and starts searching when user stopped typing
             */
            var currentSearchTermValue, searchWatcherPromise;
            function searchWatcher() {
                if ($scope.searchTerm && currentSearchTermValue !== $scope.searchTerm) {
                    currentSearchTermValue = $scope.searchTerm;
                    $timeout.cancel(searchWatcherPromise); // TimeoutWrapper checks the existence of promise by itself
                    searchWatcherPromise = $timeout(searchWatcher, 500);
                } else {
                    doSearch($scope.searchTerm);
                }

            }
            $scope.$watch('searchTerm', searchWatcher);

            function clearOnChange(newValue, oldValue) {
                if (newValue !== oldValue && oldValue) {
                    $scope.searchTerm = "";
                }
            }

            $scope.$watch('sportId', clearOnChange);

            $scope.$watch('competitionId', clearOnChange);

            $scope.selectTeam = function selectTeam(game) {
                ngModel.$setViewValue(game.team_id);
                $scope.data = [];
                $scope.searchTerm = selectedTerm = game.team_name;
                $scope.showSearchResults = false;

            };
        }
    };
}]);
