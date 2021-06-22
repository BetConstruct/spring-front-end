/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewRacingHomepageCtrl
 * @description
 * Classic view racing homepage controller
 */
angular.module('vbet5.betting').controller('classicViewRacingHomepageCtrl', ['$rootScope', '$scope', 'ConnectionService', 'Utils', 'Moment', 'content', 'Translator',
    function ($rootScope, $scope, ConnectionService, Utils, Moment, content, Translator) {
        'use strict';

        var connectionService = new ConnectionService($scope);

        function loadRegions() {
            $scope.regionsLoading = true;
            var request = {
                source: 'betting',
                what: {
                    region: ['id', 'name', 'alias', 'order'],
                    game: '@count'
                },
                where: {
                    sport: {id: $scope.data.sportId}
                }
            };

            function handleRegionUpdate(data) {
                $scope.regions = Utils.objectToArray(data.region);
                $scope.regions.sort(Utils.orderSorting);
            }

            function handerLoadingState () {
                $scope.regionsLoading = false;
                var regionId = $scope.selectedRegion.id;
                if (regionId) {
                    $scope.toggleRegion(regionId, true);
                }
            }
            connectionService.subscribe(request, handleRegionUpdate, {
                    'thenCallback': handerLoadingState,
                    'failureCallback': handerLoadingState
            });
        }

        function loadBanners() {
            var bannersSlugMap = {
                '31': "bannerSlugs.horseRacingBanners",
                '184': "bannerSlugs.greyhoundRacingBanners"

            };
            $scope.bannersLoading = true;
            $scope.banners = [];
            content.getWidget(bannersSlugMap[$scope.data.sportId]).then(function (response) {
                if (response.data && response.data.widgets && response.data.widgets[0]) {
                    angular.forEach(response.data.widgets, function (widget) {
                        $scope.banners.push(widget.instance);
                    });
                }
            })['finally'](function () {
                $scope.bannersLoading = false;
            });
        }

        function init() {
            loadRegions();
            loadBanners();
            $scope.regionMap = {};
        }
        init();
        $scope.loadCompetitionAndGames = function loadCompetitionAndGames(dateFilter, regionId, showLoader) {
            showLoader && ($scope.regionMap[regionId].loadingContent = true);
            var previousSubId = $scope.regionMap[regionId].comeptitionSubId;
            if (previousSubId) {
                connectionService.unsubscribe(previousSubId);
                $scope.regionMap[regionId].comeptitionSubId = null;
            }
            $scope.regionMap[regionId].currentDate = dateFilter;
            var request = {
                source: 'betting',
                what: {
                    'competition': ['id', 'name'],
                    'game': ['id', 'start_ts']
                },
                where: {
                    sport: {id: $scope.data.sportId},
                    region: {id: regionId},
                    game: {
                        'start_ts': {
                            '@gte': dateFilter.start,
                            '@lt': dateFilter.end
                        }
                    }
                }
            };

            function  handleCompetitionAndGamesUpdate(data) {
                var competitions = [];
                angular.forEach(data.competition, function (competitionData) {
                    var competition = {
                        id: competitionData.id,
                        name: competitionData.name,
                        games: []
                    };
                    angular.forEach(competitionData.game, function (gameData){
                        var game = {
                            id: gameData.id,
                            start_ts: gameData.start_ts
                        };
                        competition.games.push(game);
                    });
                    competition.games.sort(function (item1, item2) {
                        return item1.start_ts - item2.start_ts;
                    });
                    competitions.push(competition);
                });
                $scope.regionMap[regionId].competitions = competitions;

            }

            connectionService.subscribe(request, handleCompetitionAndGamesUpdate, {
                'thenCallback': function (res) {
                    $scope.regionMap[regionId].comeptitionSubId =  res.subid;
                    $scope.regionMap[regionId].loading = false;
                    $scope.regionMap[regionId].loadingContent = false;

                }
            }, true);
        };

        function getDates(regionId, fromLeft) {
            var request = {
                source: 'betting',
                what: {
                    competition: ['id'],
                    game: ['start_ts']
                },
                where: {
                    sport: {id: $scope.data.sportId},
                    region: {id: regionId}
                }
            };

            function handleDateUpdates(data) {
                var games = [];
                angular.forEach(data.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        games.push({
                            start_ts: game.start_ts,
                            competitionId: competition.id
                        });
                    });
                });
                games.sort(function (item1, item2) {
                    return item1.start_ts - item2.start_ts;
                });
                var todayWeekName = Moment.get().format('dddd');
                var filterThatHaveSelectedCompetition;
                var mappedDates = games.map(function(game) {
                    var gameWeekName = Moment.convertUnixToMoment(game.start_ts).format('dddd');
                    var weekName = todayWeekName === gameWeekName? Translator.get('Today'): gameWeekName;
                    var filter = {
                        start: Moment.convertUnixToMoment(game.start_ts).startOf('day').unix(),
                        end:  Moment.convertUnixToMoment(game.start_ts).endOf('day').unix(),
                        weekName: weekName

                    };
                    if (!filterThatHaveSelectedCompetition && fromLeft && $scope.selectedCompetition.id === game.competitionId) {
                        filterThatHaveSelectedCompetition = filter;
                    }
                    return filter;
                });
                var datesLength = mappedDates.length;
                var dayNames = {};
                var dateFilters = [];
                for( var i = 0; i < datesLength; ++i) {
                    var dateFilter = mappedDates[i];
                    if (!dayNames[dateFilter.weekName]) {
                        dateFilters.push(dateFilter);
                        dayNames[dateFilter.weekName] = 1;
                    }
                }
                $scope.regionMap[regionId].dates = dateFilters;
                if (!dateFilters.length) {
                    $scope.regionMap[regionId].loading = false;
                    return;
                }
                if (filterThatHaveSelectedCompetition) {
                    return $scope.loadCompetitionAndGames(filterThatHaveSelectedCompetition, regionId);
                }
                if (!$scope.regionMap[regionId].currentDate) {
                    return $scope.loadCompetitionAndGames( dateFilters[0], regionId);
                }
                if (!dayNames[$scope.regionMap[regionId].currentDate.weekName]) {
                    $scope.loadCompetitionAndGames( dateFilters[0], regionId);
                }
            }
            $scope.regionMap[regionId].loading = true;
            connectionService.subscribe(request, handleDateUpdates, {
                'thenCallback': function (res) {
                    $scope.regionMap[regionId].datesSubId =  res.subid;
                }
            }, true);
        }

        $scope.toggleRegion = function toggleRegion(regionId, fromLeft) {
            if ($scope.regionMap[regionId] && $scope.regionMap[regionId].expanded) {
                var datesSubId = $scope.regionMap[regionId].datesSubId;
                if (datesSubId) {
                    connectionService.unsubscribe(datesSubId);
                }
                var competitionSubId = $scope.regionMap[regionId].comeptitionSubId;
                if (competitionSubId) {
                    connectionService.unsubscribe(competitionSubId);
                }
                if (!fromLeft) {
                    $scope.regionMap[regionId] = {
                        expanded: false
                    };
                    return;
                }
            }
            $scope.regionMap[regionId] = {
                expanded: true
            };
            getDates(regionId, fromLeft);
        };

        $scope.$on("expandRegion", function (event, regionId) {
            $scope.toggleRegion(regionId, true);
        });

        $scope.$on("reloadHomePage",  function () {
            angular.forEach($scope.regionMap, function (item) {
                if (item.competitionSubId) {
                    connectionService.unsubscribe(item.competitionSubId);
                    item.competitionSubId = null;
                }
                if (item.datesSubId) {
                    connectionService.unsubscribe(item.datesSubId);
                    item.datesSubId = null;
                }
            });
            init();

        });


    }
]);
