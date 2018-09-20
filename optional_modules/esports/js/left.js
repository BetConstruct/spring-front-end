VBET5.controller('eSportsLeftController', ['$rootScope', '$scope',  '$location', '$q', 'Utils', 'ConnectionService', 'GameInfo', 'Storage', 'Config', function ($rootScope, $scope, $location, $q, Utils, ConnectionService, GameInfo, Storage, Config) {
    'use strict';
    ////////////////////////////////////////////////////////////////////////////////
    // GLOBAL VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    var connectionService = new ConnectionService($scope);

    var defaultLeftMenuState = {
        selectedType: 'preMatch',
        filters: $scope.sharedData.filters,
        collapsed: {
            preMatch: {
                sport: {},
                region: {}
            },
            live: {
                sport: {},
                region: {},
                competition: {}
            },
            favorites: false
        },
        selected: $scope.sharedData.selected
    };

    var subIds = {};
    ////////////////////////////////////////////////////////////////////////////////
    // GLOBAL VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // GLOBAL $SCOPE VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    $scope.leftMenu = {
        preMatch: {
            data: [],
            count: { total: 0 }
        },
        live: {
            data: [],
            count: { total: 0 }
        }
    };

    $scope.leftMenuState = Storage.get('eSports.leftMenuState') || defaultLeftMenuState;
    ////////////////////////////////////////////////////////////////////////////////
    // GLOBAL $SCOPE VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS
    ////////////////////////////////////////////////////////////////////////////////
    function setGameCount(sportId, competition, type) {
        $scope.leftMenu[type].count[sportId] = ($scope.leftMenu[type].count[sportId] || 0) + (type === 'preMatch' ? competition.game : Object.keys(competition.game).length);
        return competition;
    }

    function modifyGameObject(sport, region, competition, game) {
        // Need this three parameters for making a bet from the left menu (P1XP2)
        game.sport = { id: sport.id,  alias: sport.alias };
        game.region = { id: region.id };
        game.competition = { id: competition.id };

        // If the video filter is on we've requested only games that have video, thus no need to run GameInfo.hasVideo function
        game.hasVideo = $scope.leftMenuState.filters.video || GameInfo.hasVideo(game);

        return game;
    }

    function getIndex(key, value, array) {
        var i = array.length;
        while (i--) {
            if (array[i][key] === value) {
                return i;
            }
        }
        return -1;
    }

    function makeArrayAndSort(obj, sortParam, callback) {
        var output = [], prop;
        for (prop in obj) {
            output.push(callback ? callback(obj[prop]) : obj[prop]);
        }
        return sortParam ? output.sort(function sort(a, b) { return a[sortParam] - b[sortParam]; }) : output;
    }

    function processMenuUpdates(data, type) {
        $scope.leftMenu[type].count = { total: $scope.leftMenu[type].count.total }; // We reset count (except total) on every update
        data = makeArrayAndSort(Utils.copyObj(data).sport, 'order');
        data.forEach(function processRegions(sport) {
            sport.region = makeArrayAndSort(sport.region, 'order');
            sport.region.forEach(function processCompetitions(region) {
                region.competition = makeArrayAndSort(region.competition, 'order', function countGames(competition) { return setGameCount(sport.id, competition, type); });
                if (type === 'live') {
                    region.competition.forEach(function processGames(competition) {
                        competition.game = makeArrayAndSort(competition.game, 'start_ts', function processGames(game) { return modifyGameObject(sport, region, competition, game); });
                        competition.game.forEach(function processMarkets(game) {
                            game.market = makeArrayAndSort(game.market, false)[0] || {};
                            if (game.market.event) {
                                game.market.event = makeArrayAndSort(game.market.event, 'order');
                            }
                        });
                    });
                }
            });
        });
        $scope.leftMenu[type].data = data;
    }

    function getMenuItems(type, videoFilter) {
        var promise = $q.defer();
        // Making sure we subscribe only once
        if (subIds[type]) {
            promise.resolve();
            return promise.promise;
        }

        $scope.loading = true;

        var request = {
            source: 'betting',
            what: {
                sport: ['id', 'name', 'alias', 'order'],
                region: ['name', 'alias', 'id', 'order'],
                competition: ['id', 'name', 'order']
            },
            where: {
                sport: { type: 0 }
            }
        };

        switch (type) {
            case 'preMatch':
                request.what.game = '@count';

                var filters = $scope.repayCompetitionsFilter($scope.leftMenuState.filters.time.selected, type);
                request.where.game = filters.game;
                request.where.market = filters.market;

                break;
            case 'live':
                request.what.game = [['id', 'start_ts', 'team1_name', 'team2_name','team1_reg_name', 'team2_reg_name', 'type', 'info', 'events_count', 'markets_count', 'is_blocked', 'stats', 'tv_type', 'video_id', 'video_id2', 'video_id3', 'video_provider', 'is_stat_available', 'show_type', 'game_external_id', 'team1_external_id', 'team2_external_id']];
                request.what.market = ['base', 'type', 'name', 'express_id'];
                request.what.event = [];
                request.where.game = { 'type': 1 };
                request.where.market = {
                    type: { '@in': ['P1XP2','P1P2'] }
                };

                if (videoFilter) {
                    request.where.game['@or'] = GameInfo.getVideoFilter();
                }
                break;
        }

        Utils.setCustomSportAliasesFilter(request);

        connectionService.subscribe(
            request,
            function processUpdates(data) {
                processMenuUpdates(data, type);
            },
            {
                thenCallback: function thenCallback(result) {
                    $scope.loading = false;
                    subIds[type] = result.subid;
                    Object.keys(result.data.sport).forEach(function collapseAllSports(id) { $scope.leftMenuState.collapsed[type].sport[id] = true; });
                    promise.resolve();
                },
                failureCallback: function failureCallback() {
                    $scope.loading = false;
                    promise.reject();
                }
            }
        );

        return promise.promise;
    }

    function makeRequestObj(params) {
        var data = $scope.leftMenu[params.type].data,
            request = {};

        var sportIndex = getIndex('id', parseInt(params.sport, 10), data);
        if (sportIndex > -1) {
            request.sport = data[sportIndex];
            if (params.region) {
                var regions = data[sportIndex].region;
                var regionIndex = getIndex('id', parseInt(params.region, 10), regions);
                if (regionIndex > -1) {
                    request.region = regions[regionIndex];
                    if (params.competition) {
                        var competitions = regions[regionIndex].competition;
                        var competitionIndex = getIndex('id', parseInt(params.competition, 10), competitions);
                        if (competitionIndex > -1) {
                            request.competition = competitions[competitionIndex];
                            if (params.game) {
                                request.game = { id: parseInt(params.game, 10) };
                            }
                        }
                    }
                }
            } else if (params.game) {
                request.game = { id: parseInt(params.game, 10) };
            }
        }
        return request;
    }

    function expandAndSelect(params) {
        params = params || {};
        var menuType = $scope.leftMenuState.selectedType,
            availableData = $scope.leftMenu[menuType].data;

        if (availableData.length) {
            // If no params are given we take the first available sport and request all available competitions
            var sport = params.sport || availableData[0],
                region = params.region ||  {},
                competition = params.competition || {},
                game = params.game || {};

            // This object will be first used to expand the menu and then to request data from SWARM
            var expandObj = {
                sport: sport,
                region: region
            };

            if (menuType === 'live') {
                expandObj.competition = competition.id;
            }

            angular.forEach(expandObj, function expandMenu(value, menuType) {
                if (value !== undefined) {
                    $scope.toggleCollapse(menuType, value.hasOwnProperty('id') ? value.id : value, true);
                }
            });

            // We modify the expandObj for it to be used for requesting data from SWARM
            expandObj.competition = competition; // We may have set it previously if the menu type was 'live'
            expandObj.game = game; // No need to worry if the game.id is undefined - centre.js will take care of it
            expandObj.type = menuType;
            $scope.requestData(expandObj);
        }
    }

    function subscribeToAllGameCounts() {
        var request = {
            source: 'betting',
            what: {game: '@count'},
            where: {
                sport: {type: 0},
                game: { type: {'@in': [0, 2]} }
            }
        };

        function updateCount(type, data) {
            $scope.leftMenu[type].count.total = data.game;
        }

        connectionService.subscribe(
            request,
            function updatePreMatchCount(data) { updateCount('preMatch', data); },
            {
                thenCallback: function subscribeToLiveCount() {
                    request.where.game.type = 1;
                    connectionService.subscribe(request, function updateLiveCount(data) { updateCount('live', data);  }, false, true);
                }
            },
            true
        );
    }
    ////////////////////////////////////////////////////////////////////////////////
    // FUNCTIONS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // $SCOPE METHODS
    ////////////////////////////////////////////////////////////////////////////////
    $scope.selectMenu = function selectMenu(type, initialLoad) {
        $scope.leftMenuState.selectedType = type;
        if (!initialLoad) { $location.search({}); }
        $location.search('type', type);
        getMenuItems(type).then(function initializeMenu() {
            if (initialLoad) {
                expandAndSelect(makeRequestObj($location.search()));
            } else if (!$scope.leftMenuState.selected[type]) {
                // If no game has been previously selected we select one by default
                expandAndSelect();
            } else {
                // If a game or a competition were previously selected we open them
                $rootScope.$broadcast('eSports.requestData', $scope.leftMenuState.selected[type]);
            }
        });
    };

    $scope.toggleFilter = function toggleFilter(type) {
        $scope.leftMenuState.filters[type] = !$scope.leftMenuState.filters[type];
        if (type === 'video') {
            subIds.live = null;
            getMenuItems($scope.leftMenuState.selectedType,  $scope.leftMenuState.filters.video);
        }
    };

    $scope.selectTimePeriod = function selectTimePeriod(period) {
        $scope.leftMenuState.filters.time.expanded = false;
        if ($scope.leftMenuState.filters.time.selected === period) { return; }
        $scope.leftMenuState.filters.time.selected = period;
        subIds.preMatch = null;
        getMenuItems('preMatch');
    };

    $scope.requestData = function requestData(params) {
        var selected = $scope.createSelectedObj(params);
        if (!angular.equals($scope.leftMenuState.selected[params.type], selected)) {
            $scope.leftMenuState.selected[params.type] = selected;
            $rootScope.$broadcast('eSports.requestData', selected);
        }
    };

    $scope.toggleCollapse = function toggleCollapse(menuType, id, forceExpand) {
        if (menuType === 'favorites') {
            $scope.leftMenuState.collapsed.favorites = !$scope.leftMenuState.collapsed.favorites;
        } else {
            var collapsed = $scope.leftMenuState.collapsed[$scope.leftMenuState.selectedType][menuType];
            collapsed[id] = forceExpand ? false : typeof collapsed[id] === 'undefined' || !collapsed[id];
        }
    };
    ////////////////////////////////////////////////////////////////////////////////
    // $SCOPE METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // $SCOPE EVENT LISTENERS
    ////////////////////////////////////////////////////////////////////////////////
    $scope.$on('favoriteGames.selected', function requestData(event, data) { $scope.requestData(data); });
    ////////////////////////////////////////////////////////////////////////////////
    // $SCOPE EVENT LISTENERS - END
    ////////////////////////////////////////////////////////////////////////////////

    (function init() {
        $scope.selectMenu({'preMatch':'preMatch','live':'live'}[$location.search().type] || $scope.leftMenuState.selectedType, true);
        subscribeToAllGameCounts();
    })();
}]);