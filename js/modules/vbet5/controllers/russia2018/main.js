/**
 * @ngdoc controller
 * @name vbet5.controller:russia2018MainController
 * @description
 * russia 2018 view main controller
 */
VBET5.controller('russia2018MainController', ['$rootScope', '$scope', '$filter', 'Zergling', 'ConnectionService', 'Utils', 'GameInfo', 'Translator', '$http', '$timeout', 'Config', 'LanguageCodes', 'Moment', '$location', 'smoothScroll', '$route', function ($rootScope, $scope, $filter, Zergling, ConnectionService, Utils, GameInfo, Translator, $http, $timeout, Config, LanguageCodes, Moment, $location, smoothScroll, $route) {
    'use strict';

    $rootScope.footerMovable = true;

    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

    var groupUpdateTimeout,
        updateInterval = 300000; // 5 mins
    var language = LanguageCodes[$rootScope.env.lang];
    var outrightDataSubId, treeLoaded;
    var connectionService = new ConnectionService($scope);
    var matchListListener;

    var TEAM_MEMBERS_ORDER = [
        '1', // goalkeeper
        '2', // defender
        '4', // midfielder
        '5', // forward
        '3'  // coach
    ];

    var SCROLL_OFFSET = Config.main.skin === 'duxov.am' ? 152 : 212;

    function updateGroupMarkets(data, gameId) {
        var group = {};

        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        group.game = {
                            id: game.id,
                            team1_id: game.team1_id,
                            team1_name: game.team1_name,
                            team2_id: game.team2_id,
                            team2_name: game.team2_name,
                            type: game.type,
                            is_blocked: game.is_blocked
                        };

                        group.game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        group.game.region = {id: region.id, alias: region.alias, name: region.name};
                        group.game.competition = {id: competition.id, name: competition.name};
                        angular.forEach(game.market, function (market) {
                            group.market = {
                                base: market.base,
                                type: market.type,
                                name: market.name,
                                express_id: market.express_id,
                                display_key: market.display_key
                            };
                            group.market.events = [];
                            angular.forEach(market.event, function (event) {
                                event.name = $filter('removeParts')(event.name, [market.name]);
                                group.market.events.push(event);
                            });
                        });
                    });
                });
            });
        });

        $scope.groupData[gameId] = group;
    }

    function loadGroupInfo() {
        var groupId = $scope.groups[$scope.groupStats.selectedIndex].id,
            marketId = $scope.groups[$scope.groupStats.selectedIndex].marketId,
            gameId = $scope.groups[$scope.groupStats.selectedIndex].gameId;

        $http.get('https://krosstats.betcoapps.com/api/en/900/93f428d0-6591-48da-859d-b6c326db2448/League/GetLeagueTableByCompetitionId?cId=2969&r=0&stId=' + groupId)
            .then(
                function (response) {
                    if (response.data) {
                        $scope.groupStats.info[groupId] = response.data.sort(
                            function sortByPosition(teamA, teamB) {
                                return teamA.PositionTotal - teamB.PositionTotal;
                            });
                        if (groupUpdateTimeout) {
                            $timeout.cancel(groupUpdateTimeout);
                        }
                        groupUpdateTimeout = $timeout(loadGroupInfo, updateInterval);
                    }
                }
            );

        connectionService.subscribe({
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'region': ['id', 'name', 'alias'],
                'competition': ['id', 'name'],
                'game': ['id', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type', 'is_blocked'],
                'market': ['base', 'type', 'name', 'express_id', 'name', 'id', 'col_count', 'display_key'],
                'event': []
            },
            'where': {
                'market': {'id': marketId },
                'game': {'id': gameId},
                'sport': {'id': 1}
            }
        },
            function groupMarketUpdater(data) {
                updateGroupMarkets(data, gameId);
            }
        );
    }

    function loadStadiumInfo(mapBySeason) {
        var stadiumData = {},
            matches = {},
            seasonId;

        $http.get('https://krosstats.betcoapps.com/api/' + language +'/900/93f428d0-6591-48da-859d-b6c326db2448/Competition/GetSeasonTreeWithMatchList?stId=86616')
            .then(
                function success(response) {
                    if (response.data) {
                        angular.forEach(response.data, function(group) {
                            if (mapBySeason) {
                                seasonId = group.Item.Id;
                                matches = {};
                            }
                            angular.forEach(group.Item.WebMatches, function(match) {
                                matches[match.Id] = {
                                    id: match.StadiumId,
                                    name: match.StadiumName,
                                    latitude: match.StadiumGeoLat,
                                    longitude: match.StadiumGeoLong
                                };
                            });
                            if (mapBySeason) {
                                stadiumData[seasonId] = matches;
                            } else {
                                stadiumData = matches;
                            }
                        });
                    }

                    $scope.stadiumData = stadiumData;
                }
            );
    }

    $scope.loadHome = function loadHome() {
        loadGroupInfo();
    };

    $scope.selectGroup = function selectGroup(index) {
        if ($scope.groupStats.selectedIndex !== index) {
            $scope.groupStats.selectedIndex = index;
            loadGroupInfo();
        }
    };

    function subscribeToMatches(seasonIds) {
        seasonIds = seasonIds.length ? seasonIds : [198557, 198558, 198559, 198560, 198561];
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'region': ['id', 'name', 'alias'],
                'competition': ['id', 'name'],
                'game': [['id', 'start_ts', 'team1_name', 'team2_name', 'team1_id', 'team2_id', 'type', 'events_count', 'markets_count', 'is_blocked', 'is_live', 'info']],
                'market': ['type', 'express_id', 'name', 'base', 'display_key', 'display_sub_key', 'main_order', 'id'],
                'event': []
            },
            'where': {
                'market': {'type': 'P1XP2'},
                'game': {'season_id': {'@in': seasonIds}}
            }
        };

        function handleUpdates(data) {
            var treeData = {};

            angular.forEach(data.sport, function(sport) {
                var sharedSport = {id: sport.id, alias: sport.alias, name: sport.name};
                angular.forEach(sport.region, function(region) {
                    var sharedRegion = {id: region.id, alias: region.alias, name: region.name};
                    angular.forEach(region.competition, function(competition) {
                        var sharedCompetition = {id: competition.id, name: competition.name};
                        angular.forEach(competition.game, function(game) {
                            treeData[game.id] = {
                                id: game.id,
                                info: game.info,
                                is_blocked: game.is_blocked,
                                is_live: game.is_live,
                                markets_count: game.markets_count,
                                start_ts: game.start_ts,
                                team1_id: game.team1_id,
                                team1_name: game.team1_name,
                                team2_id: game.team2_id,
                                team2_name: game.team2_name,
                                type: game.type,
                                sport: sharedSport,
                                region: sharedRegion,
                                competition: sharedCompetition
                            };
                            angular.forEach(game.market, function(market) {
                                var processedEvent = {};
                                angular.forEach(market.event, function(event) {
                                    processedEvent[event.type] = event;
                                });
                                treeData[game.id].market = {
                                    id: market.id,
                                    display_key: market.display_key,
                                    display_sub_key: market.display_sub_key,
                                    express_id: market.express_id,
                                    name: market.name,
                                    type: market.type,
                                    event: processedEvent
                                };
                            });
                        });
                    });
                });
            });

            console.log('--- treeData ---', treeData);
            $scope.treeData = treeData;
        }

        connectionService.subscribe(request, handleUpdates, {
            'thenCallback': function () {
                //scope.loadingProcess = false;
            },
            'failureCallback': function () {
                //scope.loadingProcess = false;
            }
        });
    }

    $scope.loadTree = function loadTree() {
        if (treeLoaded) { return; }
        $http.get('https://krosstats.betcoapps.com/api/' + language + '/900/93f428d0-6591-48da-859d-b6c326db2448/Competition/GetSeasonTreeWithMatchList?stId=198556')
            .then(
                function success(response) {
                    var tree = {};
                    if (response.data && response.data.length) {
                        treeLoaded = true;
                        angular.forEach(response.data, function(stage) {
                            var stageId = stage.Item.Id;
                            tree[stageId] = [];
                            angular.forEach(stage.Item.WebMatches, function(match) {
                                tree[stageId].push({
                                    Id: match.Id,
                                    HomeTeam: match.HomeTeam[0],
                                    HomeTeamLogo: 'url(' + $rootScope.conf.teamLogosPath + 'e/s/' + Math.floor(match.HomeTeam[0].id / 2000) + '/' + match.HomeTeam[0].id + '.png)',
                                    AwayTeam: match.AwayTeam[0],
                                    AwayTeamLogo: 'url(' + $rootScope.conf.teamLogosPath + 'e/s/' + Math.floor(match.AwayTeam[0].id / 2000) + '/' + match.AwayTeam[0].id + '.png)',
                                    Date: match.Date + '+00:00',
                                    HomeScore: match.HomeScore,
                                    AwayScore: match.AwayScore
                                });
                            });
                            // Third place game
                            if (stageId === 198560 && stage.Children.length === 1) {
                                var thirdPlaceId = stage.Children[0].Item.Id;
                                var match = stage.Children[0].Item.WebMatches[0];
                                tree[thirdPlaceId] = [{
                                    Id: match.Id,
                                    HomeTeam: match.HomeTeam[0],
                                    HomeTeamLogo: 'url(' + $rootScope.conf.teamLogosPath + 'e/s/' + Math.floor(match.HomeTeam[0].id / 2000) + '/' + match.HomeTeam[0].id + '.png)',
                                    AwayTeam: match.AwayTeam[0],
                                    AwayTeamLogo: 'url(' + $rootScope.conf.teamLogosPath + 'e/s/' + Math.floor(match.AwayTeam[0].id / 2000) + '/' + match.AwayTeam[0].id + '.png)',
                                    Date: match.Date + '+00:00',
                                    HomeScore: match.HomeScore,
                                    AwayScore: match.AwayScore
                                }];
                            }
                        });
                        Utils.MergeRecursive($scope.tree, tree);
                    }
                    subscribeToMatches(Object.keys(tree).map(Number));
                }
            );
    };

    /*
    * start calendar functionality
    */

    function getDay(timestamp) {
        return Moment.moment.utc(Moment.moment.unix(timestamp)).locale('en').format('DD');
    }

    function getWeekDay(timestamp) {
        return Moment.moment.utc(Moment.moment.unix(timestamp)).locale(LanguageCodes[Config.env.lang]).format('ddd');
    }

    function getMonth(timestamp) {
        return Moment.moment.utc(Moment.moment.unix(timestamp)).locale(LanguageCodes[Config.env.lang] || 'en').format('MMM');
    }

    function updateActiveDays(data) {
        if (data && data.game) {
            var lastDay = 0;
            angular.forEach(data.game, function (game) {
                var currentDay = Date.parse((moment(game.start_ts*1000).utcOffset(Config.env.selectedTimeZone || 0).lang("en").format("YYYY-MM-DD")))/1000;
                if (lastDay < currentDay) {
                    lastDay = currentDay;
                }
            });

            $scope.calendarData.lastActiveDay = lastDay;
        }
    }

    function bindScrollForClasses() {
        var scrollTimeout;
        function changeNavigationClass() {
            if (scrollTimeout) {
                $timeout.cancel(scrollTimeout);
            }
            scrollTimeout = $timeout(
                function searchFirstVisibleElement() {
                    var containers = angular.element(document.getElementsByTagName('matches-list')[0]).children();
                    for (var i = 0, x = containers.length; i < x; i++) {
                        var rect = containers[i].getBoundingClientRect();
                        if (rect.top > 162 && rect.bottom > 0 ) {
                            $scope.selectCalendarDate($scope.calendarData.dates[containers[i].id]);
                            break;
                        }
                    }
                }, 100);
        }

        angular.element(document.querySelector('.center-column-v3')).on('scroll', changeNavigationClass);

        angular.element(document.querySelector('.russia2018-calendar-wrapper')).on('$destroy', function unbind() {
            angular.element(document.querySelector('.center-column-v3')).off('scroll', changeNavigationClass);
        });

    }

    function findActiveDate() {
        var availableDates = Object.keys($scope.calendarData.dates);

        for (var i = 0, length = availableDates.length; i < length; i++) {
            if ($scope.calendarData.today < availableDates[i]) {
                return availableDates[i];
            }
        }

        return availableDates[0];
    }

    $scope.loadCalendar = function loadCalendar() {
        $scope.calendarData = $scope.calendarData || {};
        $scope.calendarData.today = Date.parse(Moment.get().lang("en").format("YYYY-MM-DD")) / 1000;

        function prepareData() {
            var gamesStartTs = [
                1528988400, 1531576800, 1529074800, 1529085600, 1529143200, 1529154000, 1529164800, 1529175600, 1529236800, 1529247600, 1529258400, 1529323200, 1529334000,
                1529344800, 1529409600, 1529420400, 1529431200, 1529496000, 1529506800, 1529517600, 1529582400, 1529593200, 1529604000, 1529668800, 1529679600, 1529690400,
                1529755200, 1529766000, 1529776800, 1529841600, 1529852400, 1529863200, 1529064000, 1529935200, 1529949600, 1529949600, 1530021600, 1530021600, 1530036000,
                1530036000, 1530108000, 1530108000, 1530122400, 1530122400, 1530194400, 1530194400, 1530208800, 1530208800, 1530367200, 1530381600, 1530540000, 1530554400,
                1530626400, 1530640800, 1530453600, 1530468000, 1530885600, 1530900000, 1530972000, 1530986400, 1531245600, 1531332000, 1531666800
            ];

            //  prepare calendar data days
            var days = {};
            for (var i = 0; i < gamesStartTs.length; ++i) {
                var startOfDay = Date.parse((moment(gamesStartTs[i]*1000).utcOffset(Config.env.selectedTimeZone || 0).lang("en").format("YYYY-MM-DD")))/1000;
                if (!days[startOfDay]) {
                    days[startOfDay] = {
                        timestamp: startOfDay,
                        games: [1],
                        day: getDay(startOfDay),
                        week: getWeekDay(startOfDay),
                        month: getMonth(startOfDay)
                    };
                } else {
                    days[startOfDay].games.push(1);
                }
            }
            $scope.calendarData.fromDate = 1528988400 - 1; //first game timestamp
            $scope.calendarData.toDate = 1531666800 + 1; // last game timestamp
            $scope.calendarData.dates = days;

            if (!$scope.calendarData.selected) {
                // select today
                if ($scope.calendarData.dates[$scope.calendarData.today]) {
                    $scope.calendarData.selected = $scope.calendarData.dates[$scope.calendarData.today];
                } else {
                    $scope.calendarData.selected = $scope.calendarData.dates[findActiveDate()];
                }

            }
        }

        if (!$scope.calendarData.lastActiveDay) {

            //subscribe to world cup's games to detect active days
            $scope.loadingProcess = true;
            connectionService.subscribe({
                'source': 'betting',
                'what': {
                    game: ['start_ts']
                },
                'where': {
                    'competition': {'id': 2969}
                }
            }, updateActiveDays, {
                'thenCallback': function () {
                    $scope.loadingProcess = false;
                    prepareData();
                    bindScrollForClasses();
                    matchListListener = $scope.$on('matchesLoaded', function() {
                        if ($location.search().p === 'calendar') {
                            $timeout(function() {
                                $scope.selectCalendarDate($scope.calendarData.selected, true, true);
                            }, 0);
                        }
                    });
                }
            });
        } else {
            $timeout(bindScrollForClasses, 0); // Timeout so that containers load first
        }
    };

    $scope.selectCalendarDate = function selectCalendarDate(date, scroll, ignore) {
        if (!ignore && $scope.calendarData.selected && $scope.calendarData.selected.timestamp === date.timestamp) { return; }
        $scope.calendarData.selected = date;
        if (scroll) {
            smoothScroll(date.timestamp.toString(), {containerId: 'russia-scroll-container', offset: SCROLL_OFFSET});
        }
    };

    /*
    * calendar functionality end
    */

    function deleteAllEvents() {
        for (var i = $scope.teams.length; i--;) {
            $scope.teams[i].event = undefined;
        }
    }

    function createWinnersEvents() {
        if ($scope.outright.markets && $scope.outright.markets[118542576]) {
            var winEvents = $scope.outright.markets[118542576].events;
            if (!winEvents || !winEvents.length) {
                deleteAllEvents();
                return;
            }
            var i, j;
            for (i = $scope.teams.length; i--;) {
                for (j = winEvents.length; j--;) {
                    if (winEvents[j].id === $scope.teams[i].eventId) {
                        $scope.teams[i].event = winEvents[j];
                        break;
                    }
                }
                if (j === - 1) {
                    $scope.teams[i].event = undefined; // remove event if exists
                }
            }

            $scope.teams.sort(function(a, b) {
                if (!a.event || a.event.price === 1) {
                    return 1;
                } else if (!b.event || b.event.price === 1) {
                    return -1;
                }

                return a.event.price - b.event.price;
            });
        } else {
            deleteAllEvents();
        }
    }

    function updateOutrightData(data) {
        var gameData = {};

        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        gameData.game = {
                            id: game.id,
                            team1_id: game.team1_id,
                            team1_name: game.team1_name,
                            team2_id: game.team2_id,
                            team2_name: game.team2_name,
                            type: game.type,
                            is_blocked: game.is_blocked
                        };

                        gameData.game.sport = {id: sport.id, alias: sport.alias, name: sport.name};
                        gameData.game.region = {id: region.id, alias: region.alias, name: region.name};
                        gameData.game.competition = {id: competition.id, name: competition.name};
                        gameData.markets = {};
                        angular.forEach(game.market, function (market) {
                            gameData.markets[market.id] = {
                                base: market.base,
                                type: market.type,
                                name: market.name,
                                express_id: market.express_id
                            };
                            gameData.markets[market.id].events = [];
                            angular.forEach(market.event, function (event) {
                                event.name = $filter('removeParts')(event.name, [market.name]);
                                gameData.markets[market.id].events.push(event);
                            });
                            if (market.id === 118542576 || market.id === 121884776) { // Top goalscorer and winner
                                gameData.markets[market.id].events.sort(function sortByPrice(a, b) { return a.price - b.price; });
                            }
                        });
                    });
                });
            });
        });

        $scope.outright = gameData;

        createWinnersEvents();
    }


    function loadOutright() {
        var MARKETS = [
            121884776, // Top Goalscorer
            118542576 // Winner
        ];
        $scope.loadingProcess = true;

        Zergling.subscribe({
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias'],
                'region': ['id', 'name', 'alias'],
                'competition': ['id', 'name'],
                'game': ['id', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type', 'is_blocked'],
                'market': ['base', 'type', 'name', 'express_id', 'name', 'id', 'col_count', 'display_key'],
                'event': []
            },
            'where': {
                'market': {'id': {'@in': MARKETS} },
                'game': {'id': 8642211},
                'sport': {'id': 1}
            }
        }, updateOutrightData).then(function(response) {
            if (response.subid) {
                outrightDataSubId = response.subid;
            }
            updateOutrightData(response.data);
        })['finally'](function () {
            $scope.loadingProcess = false;
        });

    }


    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:russia2018MainController
     * @description  sends a message to betslip to add a bet
     *
     * @param {Object} event event object
     * @param {Object} market event's market object
     * @param {Object} openGame game object
     * @param {String} [oddType] odd type (odd or sp)
     */
    $scope.bet = function bet(event, market, openGame) {
        var game = Utils.clone(openGame);
        if (Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type === 1) {
            return;
        }
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: 'odd'});
    };


    $scope.optionsChange = function optionsChange(type, teamId) {
        if (!$scope.selected) {
            $scope.selected = {}; // For storing selected options of special bets
        }

        switch (type) {
            case 'winner':
                if (!$scope.selected.winner) {
                    $scope.selected.winner = $scope.outright.markets[118542576].events[0];
                }
                if (!teamId) {
                    teamId = $scope.eventTeamIdMap[$scope.selected.winner.id];
                }
                $scope.backgroundUrl = 'url(' + $rootScope.conf.teamLogosPath + 'e/s/' + Math.floor(teamId / 2000) + '/' + teamId + '.png)';
                break;
            case 'goalscorer':
                if (!$scope.selected.goalscorer) {
                    $scope.selected.goalscorer = $scope.outright.markets[121884776].events[0];
                }
                break;
        }
    };

    $scope.selectTeam = function selectTeam(teamId) {
        $scope.teamData.selectedTeamId = teamId;
        $scope.teamData.info = [];
        $scope.teamData.loading = true;
        $scope.teamData.teamName = '';

        $http.get('https://krosstats.betcoapps.com/api/'+ language + '/900/93f428d0-6591-48da-859d-b6c326db2448/Entity/GetPlayersStats?isAllSeason=3&seasonTreeId=86615&TeamIds[0]=' + teamId)
            .then(
                function (response) {
                    if (response.data && response.data.length) {
                        var info = {}, member;
                        for (var i = 0; i < response.data.length; i++) {
                            member = response.data[i];

                            info[member.CurrentPositionId] = info[member.CurrentPositionId] || [];
                            info[member.CurrentPositionId].push(member);
                        }
                        $scope.teamData.teamName = member.SCurrentTeamName;

                        $scope.teamData.info = Utils.objectToArray(info, 'order');
                        $scope.teamData.info.sort(function(a, b){
                            return TEAM_MEMBERS_ORDER.indexOf(a.order) - TEAM_MEMBERS_ORDER.indexOf(b.order);
                        });
                        angular.forEach($scope.teamData.info, function(position) {
                            position.sort(function sortByPlayedMatchCount(a, b) {
                                return b.SeasonStats.PlayedMatchCount - a.SeasonStats.PlayedMatchCount;
                            });
                        });
                    }
                })['finally'](function() {
                    $scope.teamData.loading = false;
                });
    };

    $scope.goToGame = function goToGame(game) {
        $location.path('/sport');
        $location.search({
            'game' : game.id,
            'sport': game.sport.id,
            'competition': game.competition.id,
            'type': game.type === 1 ? 1 : 0,
            'region': game.region.id
        });
        $route.reload();
    };

    (function() {
        if (!$location.search().p) {
            $location.search('p', 'calendar');
        }

        var groupName = Translator.get('Group');

        $scope.eventTeamIdMap = {
            375335476: 236,
            375335477: 241,
            375335478: 252,
            375335481: 818,
            375335482: 2560,
            375335483: 782,
            375335484: 239,
            375335485: 809,
            375335486: 785,
            375335487: 812,
            375335488: 255,
            375335489: 238,
            375335490: 2294,
            375335491: 247,
            375335492: 243,
            375335493: 819,
            375335494: 788,
            375335495: 815,
            375335496: 245,
            375335497: 3638,
            375335498: 3572,
            375335499: 242,
            375335500: 796,
            375335501: 2576,
            375335502: 3432,
            375335503: 256,
            375335504: 235,
            375335505: 2563,
            375335506: 250,
            375335507: 3436,
            375335508: 2570,
            375335509: 3433
        };

        $scope.tree = {
            "198557": [
                {
                    "Id": 10888907,
                    "HomeTeam": {
                        "id": 267970,
                        "name": "1C"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267970.png)",
                    "AwayTeam": {
                        "id": 417343,
                        "name": "2D"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417343.png)",
                    "Date": "2018-06-30T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888822,
                    "HomeTeam": {
                        "id": 267969,
                        "name": "1A"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267969.png)",
                    "AwayTeam": {
                        "id": 417341,
                        "name": "2B"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417341.png)",
                    "Date": "2018-06-30T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888917,
                    "HomeTeam": {
                        "id": 267975,
                        "name": "1E"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267975.png)",
                    "AwayTeam": {
                        "id": 417345,
                        "name": "2F"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417345.png)",
                    "Date": "2018-07-02T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888918,
                    "HomeTeam": {
                        "id": 417338,
                        "name": "1G"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417338.png)",
                    "AwayTeam": {
                        "id": 417347,
                        "name": "2H"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417347.png)",
                    "Date": "2018-07-02T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888922,
                    "HomeTeam": {
                        "id": 267971,
                        "name": "1F"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267971.png)",
                    "AwayTeam": {
                        "id": 417344,
                        "name": "2E"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417344.png)",
                    "Date": "2018-07-03T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888925,
                    "HomeTeam": {
                        "id": 417339,
                        "name": "1H"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417339.png)",
                    "AwayTeam": {
                        "id": 417346,
                        "name": "2G"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417346.png)",
                    "Date": "2018-07-03T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888909,
                    "HomeTeam": {
                        "id": 267966,
                        "name": "1B"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267966.png)",
                    "AwayTeam": {
                        "id": 417340,
                        "name": "2A"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417340.png)",
                    "Date": "2018-07-01T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10888915,
                    "HomeTeam": {
                        "id": 267965,
                        "name": "1D"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267965.png)",
                    "AwayTeam": {
                        "id": 417342,
                        "name": "2C"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417342.png)",
                    "Date": "2018-07-01T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                }
            ],
            "198558": [
                {
                    "Id": 11038501,
                    "HomeTeam": {
                        "id": 267980,
                        "name": "1C/2D"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267980.png)",
                    "AwayTeam": {
                        "id": 267979,
                        "name": "1A/2B"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267979.png)",
                    "Date": "2018-07-06T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10889772,
                    "HomeTeam": {
                        "id": 267981,
                        "name": "1E/2F"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267981.png)",
                    "AwayTeam": {
                        "id": 267982,
                        "name": "1G/2H"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267982.png)",
                    "Date": "2018-07-06T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10889791,
                    "HomeTeam": {
                        "id": 267985,
                        "name": "1F/2E"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267985.png)",
                    "AwayTeam": {
                        "id": 267986,
                        "name": "1H/G2"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267986.png)",
                    "Date": "2018-07-07T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10889782,
                    "HomeTeam": {
                        "id": 267983,
                        "name": "1B/2A"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267983.png)",
                    "AwayTeam": {
                        "id": 267984,
                        "name": "1D/2C"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267984.png)",
                    "Date": "2018-07-07T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                }
            ],
            "198559": [
                {
                    "Id": 10889803,
                    "HomeTeam": {
                        "id": 267989,
                        "name": "Winner Quarter-final 1"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267989.png)",
                    "AwayTeam": {
                        "id": 267990,
                        "name": "Winner Quarter-final 2"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267990.png)",
                    "Date": "2018-07-10T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                },
                {
                    "Id": 10889814,
                    "HomeTeam": {
                        "id": 267991,
                        "name": "Winner Quarter-final 3"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267991.png)",
                    "AwayTeam": {
                        "id": 267992,
                        "name": "Winner Quarter-final 4"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267992.png)",
                    "Date": "2018-07-11T18:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                }
            ],
            "198560": [
                {
                    "Id": 10889841,
                    "HomeTeam": {
                        "id": 267993,
                        "name": "Winner Semi-final 1"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267993.png)",
                    "AwayTeam": {
                        "id": 267994,
                        "name": "Winner Semi-final 2"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/133/267994.png)",
                    "Date": "2018-07-15T15:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                }
            ],
            "198561": [
                {
                    "Id": 10889851,
                    "HomeTeam": {
                        "id": 417382,
                        "name": "Loser Semi-final 1"
                    },
                    "HomeTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417382.png)",
                    "AwayTeam": {
                        "id": 417383,
                        "name": "Loser Semi-final 2"
                    },
                    "AwayTeamLogo": "url(https://statistics.betcoapps.com/images/e/s/208/417383.png)",
                    "Date": "2018-07-14T14:00:00+00:00",
                    "HomeScore": null,
                    "AwayScore": null
                }
            ]
        };
        $scope.treeData = {};

        $scope.groups = [
            {
                name: groupName + ' A',
                id: 86618,
                teamIds: [3572, 812, 2570, 255],
                gameId: 11099001,
                marketId: 172697258,
                fromDate: 1528988400,
                toDate: 1529935200,
                teams: [
                    {
                        name: Translator.get('Egypt'),
                        id: 3572,
                        eventId: 375335498
                    },
                    {
                        name: Translator.get('Russia'),
                        id: 812,
                        eventId: 375335487
                    },
                    {
                        name: Translator.get('Saudi Arabia'),
                        id: 2570,
                        eventId: 375335508
                    },
                    {
                        name: Translator.get('Uruguay'),
                        id: 255,
                        eventId: 375335488
                    }
                ]
            },
            {
                name: groupName + ' B',
                id: 86619,
                teamIds: [2563, 3432, 809, 818],
                gameId: 11049315,
                marketId: 171709458,
                fromDate: 1529074800,
                toDate: 1529949600,
                teams: [
                    {
                        name: Translator.get('Iran'),
                        id: 2563,
                        eventId: 375335505
                    },
                    {
                        name: Translator.get('Morocco'),
                        id: 3432,
                        eventId: 375335502
                    },
                    {
                        name: Translator.get('Portugal'),
                        id: 809,
                        eventId: 375335485
                    },
                    {
                        name: Translator.get('Spain'),
                        id: 818,
                        eventId: 375335481
                    }
                ]
            },
            {
                name: groupName + ' C',
                id: 86620,
                teamIds: [235, 788, 252, 256],
                gameId: 11049321,
                marketId: 172719308,
                fromDate: 1529143200,
                toDate: 1530021600,
                teams: [
                    {
                        name: Translator.get('Australia'),
                        id: 235,
                        eventId: 375335504
                    },
                    {
                        name: Translator.get('Denmark'),
                        id: 788,
                        eventId: 375335494
                    },
                    {
                        name: Translator.get('France'),
                        id: 252,
                        eventId: 375335478
                    },
                    {
                        name: Translator.get('Peru'),
                        id: 256,
                        eventId: 375335503
                    }
                ]
            },
            {
                name: groupName + ' D',
                id: 86621,
                teamIds: [2560, 785, 796, 245],
                gameId: 11049322,
                marketId: 172730576,
                fromDate: 1529154000,
                toDate: 1530036000,
                teams: [
                    {
                        name: Translator.get('Argentina'),
                        id: 2560,
                        eventId: 375335482
                    },
                    {
                        name: Translator.get('Croatia'),
                        id: 785,
                        eventId: 375335486
                    },
                    {
                        name: Translator.get('Iceland'),
                        id: 796,
                        eventId: 375335500
                    },
                    {
                        name: Translator.get('Nigeria'),
                        id: 245,
                        eventId: 375335496
                    }
                ]
            },
            {
                name: groupName + ' E',
                id: 86622,
                teamIds: [263, 250, 815, 819],
                gameId: 11049324,
                marketId: 172738339,
                fromDate: 1529236800,
                toDate: 1530122400,
                teams: [
                    {
                        name: Translator.get('Brazil'),
                        id: 236,
                        eventId: 375335476
                    },
                    {
                        name: Translator.get('Costa Rica'),
                        id: 250,
                        eventId: 375335506
                    },
                    {
                        name: Translator.get('Serbia'),
                        id: 815,
                        eventId: 375335495
                    },
                    {
                        name: Translator.get('Switzerland'),
                        id: 819,
                        eventId: 375335493
                    }
                ]
            },
            {
                name: groupName + ' F',
                id: 86623,
                teamIds: [241, 243, 2576, 247],
                gameId: 11049326,
                marketId: 172739069,
                fromDate: 1529247600,
                toDate: 1530108000,
                teams: [
                    {
                        name: Translator.get('Germany'),
                        id: 241,
                        eventId: 375335477
                    },
                    {
                        name: Translator.get('Mexico'),
                        id: 243,
                        eventId: 375335492
                    },
                    {
                        name: Translator.get('South Korea'),
                        id: 2576,
                        eventId: 375335501
                    },
                    {
                        name: Translator.get('Sweden'),
                        id: 247,
                        eventId: 375335491
                    }
                ]
            },
            {
                name: groupName + ' G',
                id: 86624,
                teamIds: [782, 239, 3433, 3436],
                gameId: 11049329,
                marketId: 172737685,
                fromDate: 1529334000,
                toDate: 1530208800,
                teams: [
                    {
                        name: Translator.get('Belgium'),
                        id: 782,
                        eventId: 375335483
                    },
                    {
                        name: Translator.get('England'),
                        id: 239,
                        eventId: 375335484
                    },
                    {
                        name: Translator.get('Panama'),
                        id: 3433,
                        eventId: 375335509
                    },
                    {
                        name: Translator.get('Tunisia'),
                        id: 3436,
                        eventId: 375335507
                    }
                ]
            },
            {
                name: groupName + ' H',
                id: 86625,
                teamIds: [238, 242, 2294, 3638],
                gameId: 11049333,
                marketId: 172726347,
                fromDate: 1529409600,
                toDate: 1530194400,
                teams: [
                    {
                        name: Translator.get('Colombia'),
                        id: 238,
                        eventId: 375335489
                    },
                    {
                        name: Translator.get('Japan'),
                        id: 242,
                        eventId: 375335499
                    },
                    {
                        name: Translator.get('Poland'),
                        id: 2294,
                        eventId: 375335490
                    },
                    {
                        name: Translator.get('Senegal'),
                        id: 3638,
                        eventId: 375335497
                    }
                ]
            }
        ];

        $scope.groupData = {};

        //home and groups pages will use this object
        $scope.groupStats = {
            selectedIndex: 0,
            info: {}
        };

        $scope.teamData = {
            selectedTeamId: null,
            info: {}
        };

        $scope.teams = [];

        for (var i = $scope.groups.length; i--;) {
            $scope.teams = $scope.teams.concat($scope.groups[i].teams);
        }

        loadOutright();
        loadStadiumInfo();
    }());

    $scope.$on('$destroy', function() {
        if (outrightDataSubId) {Zergling.unsubscribe(outrightDataSubId);}
        if (groupUpdateTimeout) {
            $timeout.cancel(groupUpdateTimeout);
            groupUpdateTimeout = undefined;
        }
        if (matchListListener) {
            matchListListener();
        }
    });
}]);