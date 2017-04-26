
VBET5.directive('statisticsOnHover', ['$document', '$http', '$compile', '$q', '$timeout', 'DomHelper', 'Config', 'Translator', function($document, $http, $compile, $q, $timeout, DomHelper, Config, Translator) {
    'use strict';

    return {
        restrict: 'A',
        replace: false,
        scope: {
            statsGame: '='
        },
        link: function(scope, element, attrs) {
            if(!Config.main.statisticsOnHover || !Config.main.statisticsOnHover.enabled) {
                return;
            }
            var statisticsCache = {};
            var statsUrlPrefix = Config.main.statisticsOnHover.prefixUrl;
            var mouseEnterProcessPromise, mouseLeaveProcessPromise;
            var STATS_CONSTANTS = {
                H2H: ['Home', 'Away'],
                performance: ['all', 'Home', 'Away']
            };

            scope.statsTableTexts= {
                AGPM1: {
                    abbr: 'IT',
                    title: 'Average individual total goals'
                },
                AGPM2: {
                    abbr: 'GT',
                    title: 'Average total goals'
                }
            }
            scope.sportBasedStats = {
                'Soccer': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Handball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Baseball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total runs',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total runs',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'AmericanFootball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total points',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total points',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Tennis': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total games',
                        value: 'scoreByPeriod'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total games',
                        value: 'total_scoreByPeriod'
                    }
                },
                'IceHockey': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                //this is bandy
                'BallHockey': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Futsal': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Volleyball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total points',
                        value: 'scoreByPeriod'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total points',
                        value: 'total_scoreByPeriod'
                    },
                    home: true,
                    away: true
                },
                'Floorball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Curling': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total points',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total points',
                        value: 'total_goals'
                    }
                },
                'FieldHockey': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'WaterPolo': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total goals',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total goals',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                },
                'Basketball': {
                    AGPM1: {
                        abbr: 'IT',
                        title: 'Average individual total points',
                        value: 'goals'
                    },
                    AGPM2: {
                        abbr: 'GT',
                        title: 'Average total points',
                        value: 'total_goals'
                    },
                    home: true,
                    away: true
                }
            }
            scope.info = {'message': 'Data is loading ...'};
            scope.keepOpen = false;
            scope.statistics = {};
            var body = $document.find('body').eq(0);
            var popup = {
                height: parseInt(attrs.popupHeight) || 300,
                width:  parseInt(attrs.popupWidth) || 570
            };

            /**
             * @description positions the popup on the screen
             * @param container
             */
            function setPosition(container) {
                container[0].style.position = 'absolute';
                container[0].style.width = popup.width +'px';
                container[0].style.height = popup.height +'px';
                var pageSize = DomHelper.getScreenResolution();
                if(pageSize.y - element[0].getBoundingClientRect().top < popup.height + 40) {
                    container.addClass('stats-on-top');
                    container[0].style.top = element[0].getBoundingClientRect().bottom - popup.height + 'px';
                } else{
                    container[0].style.top = element[0].getBoundingClientRect().top + 'px';
                }
                if(element[0].getBoundingClientRect().left < popup.width) {
                    container[0].style.left = '20px';
                } else {
                    container[0].style.left = (element[0].getBoundingClientRect().right - popup.width) + 'px';
                }
            }



            function getScoreByPeriod(matchResults, scoreKey) {
                var i, length = matchResults.length, score = 0;
                for (i = 0; i < length; i++) {
                    if(matchResults[i].TypeName !== 'Sets') {
                        if(scoreKey) {
                            score += matchResults[i][scoreKey];
                        } else {
                            score += matchResults[i].HomeScore + matchResults[i].AwayScore;
                        }
                    }
                }
                return score;
            }

            /**
             * @description calculates head to head statistics
             * @param stats
             */
            function calculateH2H(stats, mapTeams) {
                var count = 0;
                angular.forEach(stats.H2HMatches, function(h2h) {
                    if(count < 5) {
                        for(var i = 0; i< STATS_CONSTANTS.H2H.length; i++) {
                            if (scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]]) {
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].scores.push({'score1': h2h[STATS_CONSTANTS.H2H[i] + 'Score'], 'score2': h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score']});
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].all.games++;
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].all.points += h2h[STATS_CONSTANTS.H2H[i] + 'Score'] > h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 1 : h2h[STATS_CONSTANTS.H2H[i] + 'Score'] === h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 0.5 : 0;
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].goals += h2h[STATS_CONSTANTS.H2H[i] + 'Score'];
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].scoreByPeriod += getScoreByPeriod(h2h.MatchResults, STATS_CONSTANTS.H2H[i] + 'Score');
                                if(scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]].name === h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name) {
                                    scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[i]].games++;
                                    scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[i]].points += h2h[STATS_CONSTANTS.H2H[i] + 'Score'] > h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 1 : h2h[STATS_CONSTANTS.H2H[i] + 'Score'] === h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 0.5 : 0;
                                } else {
                                    scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[Math.abs(i-1)]].games++;
                                    scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[Math.abs(i-1)]].points += h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] > h2h[STATS_CONSTANTS.H2H[i] + 'Score'] ? 1 : h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] === h2h[STATS_CONSTANTS.H2H[i] + 'Score'] ? 0.5 : 0;
                                }

                            } else {
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]] = {
                                    name: h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name,
                                    scores: [{
                                        'score1': h2h[STATS_CONSTANTS.H2H[i] + 'Score'],
                                        'score2': h2h[STATS_CONSTANTS.H2H[Math.abs(i - 1)] + 'Score']
                                    }],
                                    all: {
                                        games: 1,
                                        points: h2h[STATS_CONSTANTS.H2H[i] + 'Score'] > h2h[STATS_CONSTANTS.H2H[Math.abs(i - 1)] + 'Score'] ? 1 : h2h[STATS_CONSTANTS.H2H[i] + 'Score'] === h2h[STATS_CONSTANTS.H2H[Math.abs(i - 1)] + 'Score'] ? 0.5 : 0
                                    },
                                    goals: h2h[STATS_CONSTANTS.H2H[i] + 'Score'],
                                    //we need to count AGpM by periods
                                    scoreByPeriod: getScoreByPeriod(h2h.MatchResults, STATS_CONSTANTS.H2H[i] + 'Score')//???
                                };
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[i]] = {
                                    games: 1,
                                    points: h2h[STATS_CONSTANTS.H2H[i] + 'Score'] > h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 1 : h2h[STATS_CONSTANTS.H2H[i] + 'Score'] === h2h[STATS_CONSTANTS.H2H[Math.abs(i-1)] + 'Score'] ? 0.5 : 0
                                };
                                scope.statistics.H2H[mapTeams[h2h[STATS_CONSTANTS.H2H[i] + 'Team'][0].name]][STATS_CONSTANTS.H2H[Math.abs(i-1)]] = {
                                    games: 0,
                                    points: 0
                                };
                            }
                        }
                        count++;
                    }
                });



                //calculate H2H performance
                for (var j = 0; j < STATS_CONSTANTS.performance.length; j++) {
                    var persentTeam1 = scope.statistics.H2H.team1[STATS_CONSTANTS.performance[j]].games ? (100/scope.statistics.H2H.team1[STATS_CONSTANTS.performance[j]].games * scope.statistics.H2H.team1[STATS_CONSTANTS.performance[j]].points) : 0;
                    scope.statistics.H2H.team1[STATS_CONSTANTS.performance[j]].persent = (persentTeam1 % 1 === 0 ?  persentTeam1 : persentTeam1.toFixed(1))+ '%';
                    var persentTeam2 = scope.statistics.H2H.team2[STATS_CONSTANTS.performance[j]].games ? (100/scope.statistics.H2H.team2[STATS_CONSTANTS.performance[j]].games * scope.statistics.H2H.team2[STATS_CONSTANTS.performance[j]].points) : 0;
                    scope.statistics.H2H.team2[STATS_CONSTANTS.performance[j]].persent = (persentTeam2 % 1 === 0 ? persentTeam2 : persentTeam2.toFixed(1)) + '%';
                }

                //add filter to count agpm by periods if needed
                var scoreType = scope.sportBasedStats[scope.statsGame.sport] ? scope.sportBasedStats[scope.statsGame.sport].AGPM1.value : 'goals';
                scope.statistics.H2H.team1.AGPM = scope.statistics.H2H.team1.all.games ? (scope.statistics.H2H.team1[scoreType]/scope.statistics.H2H.team1.all.games).toFixed(1) : 0;
                scope.statistics.H2H.team2.AGPM = scope.statistics.H2H.team1.all.games ? (scope.statistics.H2H.team2[scoreType]/scope.statistics.H2H.team1.all.games).toFixed(1) : 0;
                scope.statistics.H2H.AGPM = scope.statistics.H2H.team1.all.games ? ((scope.statistics.H2H.team1[scoreType] + scope.statistics.H2H.team2[scoreType]) / scope.statistics.H2H.team1.all.games).toFixed(1) : 0;
            }

            /**
             * @description calculates h2h league stats
             * @param stats
             */
            function calculateH2HLeague(stats, mapTeams) {
                scope.statistics.H2Hleague[mapTeams[stats.H2HleagueTable[0].EntityName]] = {POS: stats.H2HleagueTable[0].PositionTotal, PLD: stats.H2HleagueTable[0].PlayedTotal, PTS: stats.H2HleagueTable[0].PointsTotal};
                scope.statistics.H2Hleague[mapTeams[stats.H2HleagueTable[1].EntityName]] = {POS: stats.H2HleagueTable[1].PositionTotal, PLD: stats.H2HleagueTable[1].PlayedTotal, PTS: stats.H2HleagueTable[1].PointsTotal};               
                for (var i = 1; i < 3; i++) {
                    if(stats['UpcomingMatchesEnt' + i] && stats['UpcomingMatchesEnt' + i].length) {
                        var currentTeam = mapTeams[stats['UpcomingMatchesEnt' + i][0].AwayTeam[0].name] || mapTeams[stats['UpcomingMatchesEnt' + i][0].HomeTeam[0].name];
                        scope.statistics.H2Hleague[currentTeam].nextMatch = {date: stats['UpcomingMatchesEnt' + i][0].Date}
                    }

                }
            }

            /**
             *
             * @param stats
             * @param mapTeams
             */
            function calculatePlayedMatches(stats, mapTeams) {
                for(var i = 1; i < 3; i++) {
                    var count = 0;
                    angular.forEach(stats['PlayedMatchesEnt' + i], function (match) {
                        if(count < 5) {
                            var currentSide = mapTeams[match.HomeTeam[0].name] ? 'Home' : 'Away';
                            var otherSide =  mapTeams[match.HomeTeam[0].name] ? 'Away' : 'Home';
                            var currentTeam = mapTeams[match[currentSide + 'Team'][0].name];

                            if(scope.statistics.playedMatches[currentTeam]) {
                                scope.statistics.playedMatches[currentTeam].scores.push({
                                    score1: match.HomeScore,
                                    score2: match.AwayScore,
                                    state: match.HomeScore === match.AwayScore ? 'draw' : match[currentSide + 'Score'] > match[otherSide + 'Score'] ? 'won' : 'lost'
                                });
                                scope.statistics.playedMatches[currentTeam].goals += match[currentSide + 'Score'];
                                scope.statistics.playedMatches[currentTeam].scoreByPeriod += getScoreByPeriod(match.MatchResults, currentSide + 'Score');
                                scope.statistics.playedMatches[currentTeam].total_goals += match[currentSide + 'Score'] + match[otherSide + 'Score'];
                                scope.statistics.playedMatches[currentTeam].total_scoreByPeriod += getScoreByPeriod(match.MatchResults);
                            } else {
                                scope.statistics.playedMatches[currentTeam] = {
                                    scores: [{
                                        score1: match.HomeScore,
                                        score2: match.AwayScore,
                                        state: match.HomeScore === match.AwayScore ? 'draw' : match[currentSide + 'Score'] > match[otherSide + 'Score'] ? 'won' : 'lost'
                                    }],
                                    goals: match[currentSide + 'Score'],
                                    total_goals:  match[currentSide + 'Score'] + match[otherSide + 'Score'],
                                    scoreByPeriod: getScoreByPeriod(match.MatchResults, currentSide + 'Score'),
                                    total_scoreByPeriod: getScoreByPeriod(match.MatchResults)

                                };
                            }
                            count++;
                        }

                    });
                }


                var scoreType = scope.sportBasedStats[scope.statsGame.sport] ? scope.sportBasedStats[scope.statsGame.sport].AGPM1.value : 'goals';
                scope.statistics.playedMatches.team1.AGPM = (scope.statistics.playedMatches.team1[scoreType] / scope.statistics.playedMatches.team1.scores.length).toFixed(1);
                scope.statistics.playedMatches.team2.AGPM = (scope.statistics.playedMatches.team2[scoreType] / scope.statistics.playedMatches.team2.scores.length).toFixed(1);
                var totalScoreType = scope.sportBasedStats[scope.statsGame.sport] ? scope.sportBasedStats[scope.statsGame.sport].AGPM2.value : 'total_goals';
                scope.statistics.playedMatches.team1.totalAGPM = (scope.statistics.playedMatches.team1[totalScoreType] / scope.statistics.playedMatches.team1.scores.length).toFixed(1);
                scope.statistics.playedMatches.team2.totalAGPM = (scope.statistics.playedMatches.team2[totalScoreType] / scope.statistics.playedMatches.team2.scores.length).toFixed(1);
            }

            /**
             *
             * @description change data got from server to match provided design
             * @param stats
             */
            function updateStatistics(stats) {
                if(!stats) {
                    scope.info.message = Translator.get("No data available at the moment");
                    return;
                }
                scope.statistics.team1_name = stats.H2HMatches[0].HomeTeam[0].name;
                scope.statistics.team2_name = stats.H2HMatches[0].AwayTeam[0].name;

                var mapTeams = {};
                mapTeams[scope.statistics.team1_name] = 'team1';
                mapTeams[scope.statistics.team2_name] = 'team2';



                calculateH2H(stats, mapTeams);
                if(stats.H2HleagueTable.length) {
                    calculateH2HLeague(stats, mapTeams);
                }
                calculatePlayedMatches(stats, mapTeams);


                //cache the statistics
                statisticsCache[scope.statsGame.id] = scope.statistics;
                scope.isLoading = false;
            }

            /**
             * @description load data
             */
            function loadStatistics() {
                var canceler = $q.defer();
                scope.isLoading = true;
                scope.info.message = Translator.get("Data is loading ...");
                var statsBlock = angular.element('<div class="statistic-on-hover"><include-template template-path="templates/directive/stats-on-hover.html"></include-template></div>');
                setPosition(statsBlock);

                var statsBlockLeave = function () {
                    scope.keepOpen = false;
                    mouseLeaveProcessPromise && $timeout.cancel(mouseLeaveProcessPromise);
                    mouseLeaveProcessPromise = $timeout(function () {
                        mouseLeaveProcessPromise = undefined;
                        closePopup();
                    }, 500);
                };

                statsBlock.on('mouseenter', function() {scope.keepOpen = true;});
                statsBlock.on('mouseleave', statsBlockLeave);
                body.append($compile(statsBlock)(scope));
                if (statisticsCache[scope.statsGame.id]) {
                    scope.statistics = statisticsCache[scope.statsGame.id];
                    scope.isLoading = false;
                    return;
                }

                scope.statistics = {};
                //reset stats object
                scope.statistics.H2H = {};
                scope.statistics.H2Hleague = {};
                scope.statistics.playedMatches = {};

                $http({
                    method: 'GET',
                    url: statsUrlPrefix + scope.statsGame.id,
                    timeout: canceler.promise
                }).then(function(response) {
                    console.log('Statistics on Hover', response);
                    updateStatistics(response.data);
                },
                    function(error) {
                        console.log('Statistics error', error);
                    }
                );
            }

            /**
             *
             */
            function closePopup() {
                if(scope.keepOpen) {
                    return;
                }
                var mystats = angular.element(document.getElementsByClassName('statistic-on-hover')[0]);
                mystats.html = '';
                mystats.remove();
            }

            element.on('mouseenter', function () {
                scope.keepOpen = true;
                mouseEnterProcessPromise = $timeout(function () {
                    mouseEnterProcessPromise = undefined;
                    loadStatistics();
                }, 500);
            });
            element.on('mouseleave', function () {
                scope.keepOpen = false;
                mouseEnterProcessPromise && $timeout.cancel(mouseEnterProcessPromise) && (mouseEnterProcessPromise = undefined);

                //mouseLeaveProcessPromise && mouseLeaveProcessPromise();
                mouseLeaveProcessPromise = $timeout(function () {
                    mouseLeaveProcessPromise = undefined;
                    closePopup();
                }, 500);
            });

            element.on('click', function () {
                scope.keepOpen = false;
                closePopup();
            });

            /*scope.$on('$destroy', function () {
                //delete statisticsCache;
            });*/
        }
    };
}]);
