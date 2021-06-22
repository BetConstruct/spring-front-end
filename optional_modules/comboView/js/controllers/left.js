/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:comboViewLeftController
 * @description
 *  comboView left controller
 */
VBET5.controller('comboViewLeftController', ['$scope', 'Config', 'GameInfo', 'Utils', 'ConnectionService', '$location', 'Storage', function ($scope, Config, GameInfo, Utils, ConnectionService, $location, Storage) {
    'use strict';
    var connectionService = new ConnectionService($scope);

    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.leftMenuSports = [];

    /**
     * @ngdoc method
     * @name loadLeftMenuSports
     * @methodOf vbet5.controller:comboViewLeftController
     * @description the function loads all sports and update the view with new data
     * @param callback - function which will be called once when update is ready
     */
    function loadLeftMenuSports (callback) {
        var request = {
            'source': 'betting',
            'what': {'sport': ['id', 'name', 'alias', 'order'], 'market': '@count'},
            'where': {
                'game': {}
            }
        };

        request.where.sport = {'type': {'@ne': 1}};

        if ($scope.selectedUpcomingPeriod) {
            request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
        } else if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        Utils.setCustomSportAliasesFilter(request);

        var updateLeftMenuSport = function updateLeftMenuSport (data) {
            $scope.leftMenuSports = Utils.objectToArray(data.sport);
            $scope.leftMenuSports.sort(Utils.orderSorting);

            if (callback) {
                callback();
                callback = null;
            }
        };

        connectionService.subscribe(request, updateLeftMenuSport);
    }

    /**
     * @ngdoc method
     * @name loadLeftMenuRegionsForTheSport
     * @methodOf vbet5.controller:comboViewLeftController
     * @description the function loads regions for specific sport and update the view with new data
     * @param sport - sport
     * @param callback - function which will be called once when update is ready
     */
    $scope.loadLeftMenuRegionsForTheSport = function loadLeftMenuRegionsForTheSport (sport, callback) {
        if (sport.opened) {
            return;
        }
        sport.opened = true;

        var sport_id = sport.id;
        var request = {
            'source': 'betting',
            'what': {sport:['id'],'region': ['name', 'alias', 'id', 'order'],
                    'market': '@count'},
            'where': {
                'sport': {'id': sport_id},
                'game': {}
            }
        };

        if ($scope.selectedUpcomingPeriod) {
            request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
        } else if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        var updateLeftMenuRegionsForSport = function updateLeftMenuRegionsForSport (data, subid) {
            sport_id = data && data.sport ?  Object.keys(data.sport)[0] * 1 : sport_id;
            var region_array = Utils.objectToArray(data.sport[sport_id].region);

            var sport = Utils.getArrayObjectElementHavingFieldValue($scope.leftMenuSports, 'id', sport_id);
            sport.region = region_array;
            sport.region.sort(Utils.orderSorting);
            sport.regionsSubId = subid || sport.regionsSubId;

            if (callback) {
                callback();
                callback = null;
            }
        };

        connectionService.subscribe(request, updateLeftMenuRegionsForSport);
    };


    /**
     * @ngdoc method
     * @name selectLeftMenuSport
     * @methodOf vbet5.controller:comboViewLeftController
     * @description select the sport
     * @param sport - which should be selected
     */
    $scope.selectLeftMenuSport = function selectLeftMenuSport (sport) {
        if (!sport.opened) {
            $scope.loadLeftMenuRegionsForTheSport(sport);
        }

        $scope.$emit(
            'comboView.leftMenu.sportSelected',
            {'sport': sport}
        );
    };

    $scope.closeSportRegions = function closeSportRegions (sport) {
        connectionService.unsubscribe(sport.regionsSubId);
        sport.opened = false;
        var regIndex;
        for (regIndex in sport.region) {
            if (sport.region[regIndex].opened) {
                $scope.closeRegionCompetitions(sport.region[regIndex]);
            }
        }
    };

    /**
     * @ngdoc method
     * @name loadLeftMenuCompetitionsForTheRegion
     * @methodOf vbet5.controller:comboViewLeftController
     * @description the function loads competitions for specific region and updates the view with new data
     * @param region - region
     * @param callback - function which will be called once when update is ready
     */
    $scope.loadLeftMenuCompetitionsForTheRegion = function loadLeftMenuCompetitionsForTheRegion(region, callback) {
        if (region.opened) {
            return;
        }
        region.opened = true;

        var region_id = region.id;
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id'],
                'competition': ['id', 'name', 'order', 'sport_id'],
                'market': '@count',
                'region': ['name', 'alias', 'id']
            },
            'where': {
                'region': {'id': region_id},
                'game': {}
            }
        };

        if ($scope.selectedUpcomingPeriod) {
            request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
        } else if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }

        var updateLeftMenuCompetitionsForTheRegion = function updateLeftMenuCompetitionsForTheRegion(data, subid) {
            var sport_data = Utils.objectToArray(data.sport);

            region_id = sport_data && sport_data[0] && sport_data[0].region ? Object.keys(sport_data[0].region)[0] * 1 : region_id;

            var competition_array = Utils.objectToArray(sport_data[0].region[region_id].competition);
            var sport = Utils.getArrayObjectElementHavingFieldValue($scope.leftMenuSports, 'id', sport_data[0].id);
            var region = Utils.getArrayObjectElementHavingFieldValue(sport.region, 'id', region_id);
            if (region) {
                region.competition = competition_array;
                region.competition.sort(Utils.orderSorting);
                region.competitionsSubId = subid || region.competitionsSubId;
            }


            if (callback) {
                callback();
                callback = null;
            }
        };

        connectionService.subscribe(request, updateLeftMenuCompetitionsForTheRegion, null, true);
    };

    $scope.selectLeftMenuRegion = function selectLeftMenuRegion(region, sport) {
        if (!region.opened) {
            $scope.loadLeftMenuCompetitionsForTheRegion(region);
        }

        $scope.$emit(
            'comboView.leftMenu.regionSelected',
            {
                'sport': sport,
                'region': region
            }
        );
    };


    $scope.closeRegionCompetitions = function closeRegionCompetitions (region) {
        connectionService.unsubscribe(region.competitionsSubId);
        region.opened = false;
        var compIndex;
        for (compIndex in region.competition) {
            if (region.competition[compIndex].opened) {
                $scope.closeCompetitionGames(region.competition[compIndex]);
            }
        }
    };

    /**
     * @ngdoc method
     * @name loadLeftMenuGamesForTheCompetition
     * @methodOf vbet5.controller:comboViewLeftController
     * @description the function loads games for specific competition and updates the view with new data
     * @param competition - competition
     * @param callback - function which will be called once when update is ready
     */
    $scope.loadLeftMenuGamesForTheCompetition = function loadLeftMenuGamesForTheCompetition(competition, callback) {
        if (competition.opened) {
            return;
        }
        competition.opened = true;

        var competition_id = competition.id;
        var request = {
            'source': 'betting',
            'what': {
                'competition': ['id'],
                'sport': ['id'],
                'region': ['id', 'sport_id'],
                game: [
                    ['id', 'start_ts', 'team1_name', 'team2_name', 'team1_external_id', 'team2_external_id', 'type', 'info', 'markets_count', 'is_blocked', 'sport_id', 'order', 'is_live']
                ],
                'event': ['id', 'price', 'type', 'name', 'order', 'base'],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'show_type', 'id', '@count']
            },
            'where': {
                'competition': {'id': +competition_id},
                'game': {}
            }
        };
        Utils.addPrematchExpressId(request);


        if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }
        if ($scope.selectedUpcomingPeriod) {
            request.where.game.start_ts = {'@now': {'@gte': 0, '@lt': $scope.selectedUpcomingPeriod * 3600}};
        } else if (Config.env.gameTimeFilter) {
            request.where.game.start_ts = Config.env.gameTimeFilter;
        }
        /*Utils.setCustomSportAliasesFilter(request);*/
        var updateLeftMenuGamesForTheCompetition = function updateLeftMenuGamesForTheCompetition (data, subid) {
            var sport_data = Utils.objectToArray(data.sport);
            var region_array = sport_data && Utils.objectToArray(sport_data[0].region) || [];
            competition_id = region_array && region_array[0] && region_array[0].competition ? Object.keys(region_array[0].competition)[0] * 1 : competition_id;

            var games_array = region_array[0] && Utils.objectToArray(region_array[0].competition[competition_id].game);
            var sport = Utils.getArrayObjectElementHavingFieldValue($scope.leftMenuSports, 'id', sport_data[0].id);
            var region = Utils.getArrayObjectElementHavingFieldValue(sport.region, 'id', region_array[0].id);
            var competition = Utils.getArrayObjectElementHavingFieldValue(region.competition, 'id', competition_id);
            var marketKey;
            competition.games = games_array;
            competition.games.sort(Utils.orderSorting);
            competition.gamesSubId = subid || competition.gamesSubId;

            angular.forEach(competition.games, function (game) {
                for (marketKey in game.market) {
                    if ("P1XP2" === game.market[marketKey].type) {
                        game.main_market = game.market[marketKey];
                        game.main_market.events = Utils.groupByItemProperty(game.market[marketKey].event, 'type');
                        return 0;
                    } else if ("P1P2" === game.market[marketKey].type) {    // if P1XP2 is found then search should be stopped if P1P2 it should continue to search for P1XP2
                        game.main_market = game.market[marketKey];
                        game.main_market.events = Utils.groupByItemProperty(game.market[marketKey].event, 'type');
                    }
                }
            });

            if (callback) {
                callback();
                callback = null;
            }
        };

        connectionService.subscribe(request, updateLeftMenuGamesForTheCompetition);
    };

    $scope.selectLeftMenuCompetition = function selectLeftMenuCompetition (competition, region, sport) {
        if(!competition.opened) {
            $scope.loadLeftMenuGamesForTheCompetition(competition);
        }

        $scope.$emit(
            'comboView.leftMenu.competitionSelected',
            {
                'sport': sport,
                'region': region,
                'competition': competition
            }
        );
    };

    $scope.closeCompetitionGames = function closeCompetitionGames (competition) {
        connectionService.unsubscribe(competition.gamesSubId);
        competition.opened = false;
        var gameIndex;
        for (gameIndex in competition.games) {
            competition.games[gameIndex].opened = false;
        }
    };

    $scope.selectLeftMenuGame = function selectLeftMenuGame (game, competition, region, sport) {
        game.opened = true;

        game.sport = {id: sport.id, alias:sport.alias, name:sport.name};
        game.region = {id: region.id, name: region.name};
        game.competition = {id: competition.id, order: competition.order, name: competition.name};

        $scope.$emit('comboView.leftMenu.gameSelected', game);
    };

    function openInitialFieldsInLeftMenu () {
        var params = $location.search();
        if (!params.sport) {
            params = Storage.get('comboViewSelectedGame') || {};
        }

        loadLeftMenuSports(function () {
            var sport = params.sport ? Utils.getArrayObjectElementHavingFieldValue($scope.leftMenuSports, 'id', +params.sport) : null;
            if (sport) {
                $scope.loadLeftMenuRegionsForTheSport(sport, function () {
                    var region = params.region ? Utils.getArrayObjectElementHavingFieldValue(sport.region, 'id', +params.region) : null;
                    if (region) {
                        $scope.loadLeftMenuCompetitionsForTheRegion(region, function () {
                            var competition = params.competition ? Utils.getArrayObjectElementHavingFieldValue(region.competition, 'id', +params.competition) : null;
                            if (competition) {
                                $scope.loadLeftMenuGamesForTheCompetition(competition, function () {
                                    var game = params.game ? Utils.getArrayObjectElementHavingFieldValue(competition.games, 'id', +params.game) : null;
                                    if (game) {
                                        $scope.selectLeftMenuGame(game, competition, region, sport);
                                    } else {
                                        $scope.selectLeftMenuCompetition(competition, region, sport);
                                    }
                                });
                            } else {
                                $scope.selectLeftMenuRegion(region, sport);
                            }
                        });
                    } else {
                        $scope.selectLeftMenuSport(sport);
                    }
                });
            } else if (Config.main.combo && Config.main.combo.expandFirstSportByDefault && $scope.leftMenuSports.length) {
                $scope.selectLeftMenuSport($scope.leftMenuSports[0]);
            } else {
                $scope.liveTodaySelected();
            }
        });
    }

    $scope.$on('comboView.timeFilter.changed', function (event) {
        openFieldsInLeftMenuAfterTimeFilter();
    });

    function openFieldsInLeftMenuAfterTimeFilter () {
        var params = $location.search();
        loadLeftMenuSports(function () {
            var sport = params.sport ? Utils.getArrayObjectElementHavingFieldValue($scope.leftMenuSports, 'id', +params.sport) : null;
            if (sport) {
                $scope.loadLeftMenuRegionsForTheSport(sport, function () {
                    var region = params.region ? Utils.getArrayObjectElementHavingFieldValue(sport.region, 'id', +params.region) : null;
                    if (region) {
                        $scope.loadLeftMenuCompetitionsForTheRegion(region, function () {
                            var competition = params.competition ? Utils.getArrayObjectElementHavingFieldValue(region.competition, 'id', +params.competition) : null;
                            if (competition) {
                                $scope.loadLeftMenuGamesForTheCompetition(competition, function () {
                                    var game = params.game ? Utils.getArrayObjectElementHavingFieldValue(competition.games, 'id', +params.game) : null;
                                    if (game) {
                                        game.opened = true;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    // Was created for selecting favorite games from top menu. Not fully functional deep linking handle!
    $scope.$on("comboView.handleDeepLinking", function() {
        openInitialFieldsInLeftMenu();
    });

    (function init() {
        GameInfo.getProviderAvailableEvents().then(function() {
            openInitialFieldsInLeftMenu();
        });
    })();
}]);
