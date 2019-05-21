/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:favoriteTeamController
 * @description
 * Search controller
 */
VBET5.controller('favoriteTeamController',
    ['$rootScope', '$scope', '$q', '$location', 'Config', 'Zergling', 'ConnectionService', 'Utils', 'Translator', function ($rootScope, $scope, $q, $location, Config, Zergling, ConnectionService, Utils, Translator) {

    'use strict';

    if (!Config.main.favoriteTeam || !Config.main.favoriteTeam.enabled) {
        return;
    }

    var connectionService = new ConnectionService($scope);
    /**
     * @ngdoc method
     * @name initScope
     * @methodOf vbet5.controller:favoriteTeamController
     * @description Initialization
     */
    function initScope () {
        $scope.leftMenuState.favoriteTeamForm = {};
        $scope.leftMenuState.favoriteTeamForm.expanded = true;

        $scope.showSearchCommandResults = false;

        $scope.favoriteTeam = {
            id: {
                new: undefined,
                old: undefined,
                original: undefined
            },
            name: {
                new: '',
                old: '',
                original: ''
            },
            editable: true
        };

        $scope.data = {
            searchTerm : '',
            showSearchResults: false,
            searchResults: [],
            favoriteTeamLiveGames: {
                subscribed: false,
                list: []

            },
            favoriteTeamPrematchGames: {
                subscribed: false,
                list: []
            }
        };
    }

    /**
     * @ngdoc method
     * @name bootstrap
     * @methodOf vbet5.controller:favoriteTeamController
     * @description This is done to avoid duplicate initialization on template level
     */
    function bootstrap () {
        initScope();

        if (!$rootScope.env.authorized) {
            return;
        }

        $scope.favoriteTeamLoading = true;
        $scope.favoriteTeamError = false;
        Zergling.get({}, 'get_favorite_name').then(function (response) {
            if (response.result === 0 || response.result === 'OK') {
                var team = {
                    id: parseInt(response.details.command_id),
                    name: response.details.name,
                    editable: !!parseInt(response.details.status)
                };

                $scope.favoriteTeam.id.original = team.id;
                $scope.favoriteTeam.name.original = team.name;

                $scope.selectFavoriteTeam(team);

                if (Config.env.live) {
                    loadLiveGamesOfFavoriteTeam();
                } else {
                    loadPrematchGamesOfFavoriteTeam();
                }
            } else {
                console.log('Unable to fetch your favorite team');
                $scope.favoriteTeamError = true;
            }
            $scope.favoriteTeamLoading = false;
        })['catch'](function (response) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: Translator.get('Error occured') + ' : ' + response.data
            });
        });
    }

    initScope();

    /**
     * @ngdoc method
     * @name loadGamesOfFavoriteTeamFactory
     * @methodOf vbet5.controller:favoriteTeamController
     *
     * @description queries games of favorite team
     *
     */
    function loadGamesOfFavoriteTeamFactory(type) {
        var favoriteTeamGames = type ? 'favoriteTeamLiveGames' : 'favoriteTeamPrematchGames';

        return function () {
            if (!$scope.favoriteTeam.id.new) {
                return;
            }

            var request = {
                "source": "betting",
                "what": {
                    "competition": [],
                    "region": [],
                    "game": [
                        "type",
                        "start_ts",
                        "team1_name",
                        "team1_id",
                        "team2_name",
                        "team2_id",
                        "id",
                        "events_count",
                        "markets_count",
                        "info",
                        "stats",
                        "video_id",
                        "video_id2",
                        "video_id3",
                        "video_provider"
                    ],
                    "sport": []
                },
                "where": {
                    "game": {
                        "@or": [
                            {"team1_id": $scope.favoriteTeam.id.new},
                            {"team2_id": $scope.favoriteTeam.id.new}
                        ],
                        "type": type
                    }
                }
            };

            connectionService.subscribe(
                request,
                function (data) {
                    $scope.data[favoriteTeamGames].list = [];

                    angular.forEach(data.sport, function (sport) {
                        angular.forEach(sport.region, function (region) {
                            angular.forEach(region.competition, function (competition) {
                                angular.forEach(competition.game, function (game) {
                                    game.sport = {id: sport.id, alias: sport.alias};
                                    game.region = {id: region.id, alias: region.alias};
                                    game.competition = {id: competition.id};

                                    $scope.data[favoriteTeamGames].list.push(game);
                                });
                            });
                        });
                    });

                    $scope.data[favoriteTeamGames].list = Utils.objectToArray($scope.data[favoriteTeamGames].list);
                }
            );
        }
    }

    var loadPrematchGamesOfFavoriteTeam = loadGamesOfFavoriteTeamFactory(0);
    var loadLiveGamesOfFavoriteTeam = loadGamesOfFavoriteTeamFactory(1);

    $scope.$on('$destroy', function () {
        bootstrap();
    });

    $scope.$watch('env.authorized', bootstrap);

    $scope.$watch('env.live', function () {
        if (Config.env.live) {
            loadLiveGamesOfFavoriteTeam();
        } else {
            loadPrematchGamesOfFavoriteTeam();
        }
    });

    /**
     * @ngdoc method
     * @name processResults
     * @methodOf vbet5.controller:favoriteTeamController
     * @description processes search results and writes them to $scope's searchResults array
     *
     * @param {Array} promises array of promises of search requests that will be resolved when search completes
     */
    function processResults(promises) {
        $q.all(promises).then(function (resultsSet) {
            $scope.data.searchResults = {};
            $scope.searchResultGameIds = []; //needed for keyboard navigation
            var order = 0;

            angular.forEach(resultsSet, function (data) {
                angular.forEach(data.data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (game) {
                                if ($scope.searchResultGameIds.indexOf(game.id) !== -1) {
                                    return;
                                }

                                if (game.team1_id && game.team2_id) {
                                    if ($scope.data.searchResults[sport.id] === undefined) {
                                        $scope.data.searchResults[sport.id] = {order: order++, results: []};
                                    }

                                    $scope.data.searchResults[sport.id].results.push({
                                        game: game,
                                        region: {name: region.name, id: region.id},
                                        competition: {name: competition.name, id: competition.id},
                                        sport: {id: sport.id, name: sport.name}
                                    });

                                    $scope.searchResultGameIds.push(game.id);
                                }
                            });
                        });
                    });
                });
            });

            $scope.data.showSearchResults = true;

            $scope.data.searchResults = Utils.objectToArray($scope.data.searchResults); // for sorting
        });
    }

    $scope.formHeaderClicked = function formHeaderClicked() {
        $scope.leftMenuState.favoriteTeamForm.expanded = !$scope.leftMenuState.favoriteTeamForm.expanded;
    };

    /**
     * @ngdoc method
     * @name doSearch
     * @methodOf vbet5.controller:favoriteTeamController
     * @description performs search and flattens results gotten from swarm
     * flattened results are stored in $scope.searchResults
     *
     * search is done by sending 2 requests - for games and competitions
     * results are merged then
     *
     * @param {String} term search term
     */
    $scope.doSearch = function doSearch(term) {
        var termIsNumber = term && term.length && parseInt(term, 10).toString() === term;

        if (term && (term.length > 2 || (termIsNumber && Config.main.search.enableSearchByGameNumber))) {
            var like = {};
            like[Utils.getLanguageCode(Config.env.lang)] = term;

            // search for games
            var request = {
                'source': 'betting',
                'what': {
                    'competition': [],
                    'region': [],
                    'game': [
                        'type',
                        'start_ts',
                        'team1_name',
                        'team1_id',
                        'team2_name',
                        'team2_id',
                        'id'
                    ],
                    'sport': []
                },
                'where': {
                    'game': {
                        '@limit': Config.main.search.limitGames,
                        '@or': [
                            {'team1_name': {'@like': like}},
                            {'team2_name': {'@like': like}}
                        ],
                        'type': {'@in': [0, 1]}
                    }
                }
            };

            if (termIsNumber && Config.main.search.enableSearchByGameNumber) {
                request.where.game['@or'].push({game_number: parseInt(term, 10)});
            }

            if (Config.main.favoriteTeam.sport) {
                request.where.sport = Config.main.favoriteTeam.sport;
            }

            processResults([Zergling.get(request)]);
        } else {
            $scope.data.showSearchResults = false;
        }
    };

    /**
     * @ngdoc method
     * @name selectFavoriteTeam
     * @methodOf vbet5.controller:favoriteTeamController
     * @description updates search field with user selected team name
     *
     *
     * @param {Object} team team to select
     */
    $scope.selectFavoriteTeam = function selectFavoriteTeam(team) {
        $scope.data.searchTerm = '';

        $scope.favoriteTeam.id.old = ($scope.favoriteTeam.id.new || !$scope.favoriteTeam.id.original ? $scope.favoriteTeam.id.new : team.id);
        $scope.favoriteTeam.id.new = team.id;

        $scope.favoriteTeam.name.old = ($scope.favoriteTeam.name.new || !$scope.favoriteTeam.name.original ? $scope.favoriteTeam.name.new : team.name);
        $scope.favoriteTeam.name.new = team.name;

        if (team.editable !== undefined) {
            $scope.favoriteTeam.editable = team.editable;
        }

        $scope.data.showSearchResults = false;
    };

    /**
     * @ngdoc method
     * @name storeFavoriteTeam
     * @methodOf vbet5.controller:favoriteTeamController
     * @description Send selected favorite team data to backend
     */
    $scope.storeFavoriteTeam = function storeFavoriteTeam() {
        var request = {
            command_id: $scope.favoriteTeam.id.new
        };

        $scope.favoriteTeamLoading = true;

        Zergling.get(request, 'set_favorit_command').then(function (response) {
            if (response.result === 0 || response.result === 'OK') {
                $scope.favoriteTeam.editable = false;

                if (Config.env.live) {
                    loadLiveGamesOfFavoriteTeam();
                } else {
                    loadPrematchGamesOfFavoriteTeam();
                }
            } else {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: Translator.get('Unable to store "' + $scope.favoriteTeam.name.new + '" as your favorite team')
                });
            }
            $scope.favoriteTeamLoading = false;
        })['catch'](function (response) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: Translator.get('Error occured') + ' : ' + response.data
            });
        });
    };

    /**
     * @ngdoc method
     * @name resetFavoriteTeam
     * @methodOf vbet5.controller:favoriteTeamController
     * @description Reset favorite team data
     */
    $scope.resetFavoriteTeam = function resetFavoriteTeam() {
        var idToReset = (!$scope.favoriteTeam.id.original ? $scope.favoriteTeam.id.original : $scope.favoriteTeam.id.old);
        var nameToReset = (!$scope.favoriteTeam.name.original ? $scope.favoriteTeam.name.original : $scope.favoriteTeam.name.old);

        $scope.data.searchTerm = '';

        $scope.favoriteTeam = {
            id: {
                old: idToReset,
                new: idToReset
            },
            name: {
                old: nameToReset,
                new: nameToReset
            },
            editable: true
        };
    };

    /**
     * @ngdoc method
     * @name favoriteTeamClickedInPrematch
     * @methodOf vbet5.controller:favoriteTeamController
     * @description Favorite team clicked in prematch
     */
    $scope.favoriteTeamClickedInPrematch = function favoriteTeamClickedInPrematch () {
        if (!$scope.favoriteTeam.name.new) {
            return;
        }

        if ($location.path() === '/dashboard/') {
            $location.path("/sport/");
        }

        if (Config.env.preMatchMultiSelection) {
            angular.forEach($scope.data.favoriteTeamPrematchGames.list, function (game) {
                $scope.gameToMultiView(game);
            });
        } else {
            $scope.expandFavoriteTeam({'id': $scope.favoriteTeam.id.new});
        }
    };
}]);