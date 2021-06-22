/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:favoriteTeamController
 * @description
 * Search controller
 */
VBET5.controller('favoriteTeamController',
    ['$rootScope', '$scope', '$q', '$location', 'Config', 'Zergling', 'ConnectionService', 'Utils', 'Translator', '$http', '$timeout', 'LanguageCodes', function ($rootScope, $scope, $q, $location, Config, Zergling, ConnectionService, Utils, Translator, $http, $timeout, LanguageCodes) {

        'use strict';

        $scope.expanded = false;

        // var connectionService = new ConnectionService($scope);

        /**
         * @ngdoc method
         * @name initScope
         * @methodOf vbet5.controller:favoriteTeamController
         * @description Initialization
         */
        // function initScope() {
        //
        //     $scope.showSearchCommandResults = false;
        //
        //     $scope.data = {
        //         searchTerm: '',
        //         showSearchResults: false,
        //         searchResults: [],
        //         favoriteTeamLiveGames: {
        //             subscribed: false,
        //             list: []
        //
        //         },
        //         favoriteTeamPrematchGames: {
        //             subscribed: false,
        //             list: []
        //         }
        //     };
        // }

        /**
         * @ngdoc method
         * @name init
         * @methodOf vbet5.controller:favoriteTeamController
         * @description This is done to avoid duplicate initialization on template level
         */
        function init() {
            // initScope();

            $scope.favoriteTeamError = false;
            $scope.getFavoriteTeam();
        }

        $scope.getFavoriteTeam = function getFavoriteTeam() {
            $scope.favoriteTeamLoading = true;
            $timeout(function () { //todo requested by Khachatur Petrosyan
                Zergling.get({}, 'get_favorite_name').then(function (response) {
                    if (response.result === 0 || response.result === 'OK') {
                        $scope.teams = response.details;
                        if($scope.teams[0]){
                            $scope.loadGamesOfFavoriteTeam($scope.teams[0]);
                        }

                    } else {
                        console.log('Unable to fetch your favorite team');
                        $scope.favoriteTeamError = true;
                    }
                    $scope.favoriteTeamLoading = false;
                })['catch'](function (response) {
                    $scope.favoriteTeamLoading = false;
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: Translator.get('Error occured') + ' : ' + response.data
                    });
                });
            },5000);

        };
        // initScope();

        $scope.loadGamesOfFavoriteTeam = function loadGamesOfFavoriteTeam(team) {
            if (Config.env.live) {
                return; // todo
            } else {
                $scope.$emit('prematch.expandFavoriteTeam', {team: {name: team.Name, id: team.Id}});
            }
        };

        /**
         * @ngdoc method
         * @name loadGamesOfFavoriteTeamFactory
         * @methodOf vbet5.controller:favoriteTeamController
         *
         * @description queries games of favorite team
         *
         */
        // function loadGamesOfFavoriteTeamFactory(type) {
//
        //     var favoriteTeamGames = type ? 'favoriteTeamLiveGames' : 'favoriteTeamPrematchGames';
        //
        //     return function () {
        //         if (!$scope.favoriteTeam.id.new) {
        //             return;
        //         }
        //
        //         var request = {
        //             "source": "betting",
        //             "what": {
        //                 "competition": [],
        //                 "region": [],
        //                 "game": [
        //                     "type",
        //                     "start_ts",
        //                     "team1_name",
        //                     "team1_id",
        //                     "team2_name",
        //                     "team2_id",
        //                     "id",
        //                     "events_count",
        //                     "markets_count",
        //                     "info",
        //                     "stats",
        //                     "video_id",
        //                     "video_id2",
        //                     "video_id3",
        //                     "video_provider"
        //                 ],
        //                 "sport": []
        //             },
        //             "where": {
        //                 "game": {
        //                     "@or": [
        //                         {"team1_id": $scope.favoriteTeam.id.new},
        //                         {"team2_id": $scope.favoriteTeam.id.new}
        //                     ],
        //                     "type": type
        //                 }
        //             }
        //         };
        //
        //         connectionService.subscribe(
        //             request,
        //             function (data) {
        //                 $scope.data[favoriteTeamGames].list = [];
        //
        //                 angular.forEach(data.sport, function (sport) {
        //                     angular.forEach(sport.region, function (region) {
        //                         angular.forEach(region.competition, function (competition) {
        //                             angular.forEach(competition.game, function (game) {
        //                                 game.sport = {id: sport.id, alias: sport.alias};
        //                                 game.region = {id: region.id, alias: region.alias};
        //                                 game.competition = {id: competition.id};
        //
        //                                 $scope.data[favoriteTeamGames].list.push(game);
        //                             });
        //                         });
        //                     });
        //                 });
        //
        //                 $scope.data[favoriteTeamGames].list = Utils.objectToArray($scope.data[favoriteTeamGames].list);
        //             }
        //         );
        //     }
        // }
        //
        // var loadPrematchGamesOfFavoriteTeam = loadGamesOfFavoriteTeamFactory(0);
        // var loadLiveGamesOfFavoriteTeam = loadGamesOfFavoriteTeamFactory(1);

        // $scope.$on('$destroy', function () {
        //     init();
        // });

        init();

        /**
         * @ngdoc method
         * @name processResults
         * @methodOf vbet5.controller:favoriteTeamController
         * @description processes search results and writes them to $scope's searchResults array
         *
         * @param {Array} promises array of promises of search requests that will be resolved when search completes
         */

            // function processResults(promises) {
            //     $q.all(promises).then(function (resultsSet) {
            //         $scope.data.searchResults = {};
            //         $scope.searchResultGameIds = []; //needed for keyboard navigation
            //         var order = 0;
            //
            //         angular.forEach(resultsSet, function (data) {
            //             angular.forEach(data.data.sport, function (sport) {
            //                 angular.forEach(sport.region, function (region) {
            //                     angular.forEach(region.competition, function (competition) {
            //                         angular.forEach(competition.game, function (game) {
            //                             if ($scope.searchResultGameIds.indexOf(game.id) !== -1) {
            //                                 return;
            //                             }
            //
            //                             if (game.team1_id && game.team2_id) {
            //                                 if ($scope.data.searchResults[sport.id] === undefined) {
            //                                     $scope.data.searchResults[sport.id] = {order: order++, results: []};
            //                                 }
            //
            //                                 $scope.data.searchResults[sport.id].results.push({
            //                                     game: game,
            //                                     region: {name: region.name, id: region.id},
            //                                     competition: {name: competition.name, id: competition.id},
            //                                     sport: {id: sport.id, name: sport.name}
            //                                 });
            //
            //                                 $scope.searchResultGameIds.push(game.id);
            //                             }
            //                         });
            //                     });
            //                 });
            //             });
            //         });
            //
            //         $scope.data.showSearchResults = true;
            //
            //         $scope.data.searchResults = Utils.objectToArray($scope.data.searchResults); // for sorting
            //     });
            // }
            //


        var promise;
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

        $scope.doSearch = function doSearch() {
            if (promise) {
                $timeout.cancel(promise);
            }

            if ($scope.searchString.length < 3) {
                $scope.searchResults = null;
                return;
            }
            $scope.searchLoading = true;

            var seqarchApiUrl = "https://krosstats.betcoapps.com/api/{lang}/900/93f428d0-6591-48da-859d-b6c326db2448/Utility/GetTeamSearchResult?searchString={searchString}&take=20";
            promise = $timeout(function () {
                $http.get(seqarchApiUrl.replace('{searchString}', $scope.searchString).replace('{lang}', LanguageCodes[Config.env.lang])).then(function (response) {
                        if (response.data && response.data.length) {
                            $scope.searchResults = [];
                                $scope.searchResults = response.data.filter(function (value) {
                                    return value.SportId === 1; // soccer
                                }).slice(0, 5);
                        }
                    }
                ).finally(function () {
                    $scope.searchLoading = false;
                });
            }, 300);

        };
        /*
            $scope.doSearch = function doSearch(term) {
                var termIsNumber = term && term.length && parseInt(term, 10).toString() === term;

                if (!(term && (term.length > 2 || (termIsNumber && Config.main.search.enableSearchByGameNumber)))) {
                    $scope.data.showSearchResults = false;
                    return;
                }
                if (promise) {
                    $timeout.cancel(promise);
                }

                promise = $timeout(function () {
                    console.info('********', term);
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

                }, 500);

            };
        */
        /**
         * @ngdoc method
         * @name selectFavoriteTeam
         * @methodOf vbet5.controller:favoriteTeamController
         * @description updates search field with user selected team name
         *
         *
         * @param {Object} team team to select
         */
        // $scope.selectFavoriteTeam = function selectFavoriteTeam(team) {
        //     $scope.data.searchTerm = '';
        //
        //     $scope.favoriteTeam.id.old = ($scope.favoriteTeam.id.new || !$scope.favoriteTeam.id.original ? $scope.favoriteTeam.id.new : team.id);
        //     $scope.favoriteTeam.id.new = team.id;
        //
        //     $scope.favoriteTeam.name.old = ($scope.favoriteTeam.name.new || !$scope.favoriteTeam.name.original ? $scope.favoriteTeam.name.new : team.name);
        //     $scope.favoriteTeam.name.new = team.name;
        //
        //     if (team.editable !== undefined) {
        //         $scope.favoriteTeam.editable = team.editable;
        //     }
        //
        //     $scope.data.showSearchResults = false;
        // };

        $scope.selectedTeam = {};

        /**
         * @ngdoc method
         * @name storeFavoriteTeam
         * @methodOf vbet5.controller:favoriteTeamController
         * @description Send selected favorite team data to backend
         */
        $scope.storeFavoriteTeam = function storeFavoriteTeam() {
            var request = {
                command_id: $scope.selectedTeam.Id
            };
            $scope.storeFavoriteTeamLoading = true;

            Zergling.get(request, 'set_favorite_command').then(function (response) {
                if (response.result === 0) {
                    $scope.searchResults = [];
                    $scope.searchString = '';
                    $scope.selectedTeam = {};
                    $scope.getFavoriteTeam();
                    $scope.showForm = false;

                } else {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: Translator.get('Unable to store "' + $scope.selectedTeam.Name + '" as your favorite team')
                    });
                }
                $scope.storeFavoriteTeamLoading = false;
            })['catch'](function (response) {
                $scope.storeFavoriteTeamLoading = false;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: Translator.get('Error occured') + ' : ' + response.data
                });
            });
        };

        // /**
        //  * @ngdoc method
        //  * @name favoriteTeamClickedInPrematch
        //  * @methodOf vbet5.controller:favoriteTeamController
        //  * @description Favorite team clicked in prematch
        //  */
        // $scope.favoriteTeamClickedInPrematch = function favoriteTeamClickedInPrematch () {
        //     if (!$scope.favoriteTeam.name.new) {
        //         return;
        //     }
        //
        //     if ($location.path() === '/dashboard/') {
        //         $location.path("/sport/");
        //     }
        //
        //     if (Config.env.preMatchMultiSelection) {
        //         angular.forEach($scope.data.favoriteTeamPrematchGames.list, function (game) {
        //             $scope.gameToMultiView(game);
        //         });
        //     } else {
        //         $scope.expandFavoriteTeam({'id': $scope.favoriteTeam.id.new});
        //     }
        // };
    }]);