/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:row
 *
 * @description directive for displaying game, market information in 'comboView'
 *
 */
 VBET5.directive('comboViewMarketEvents', ['$filter', 'Utils', 'GameInfo', function ($filter, Utils, GameInfo) {
    var map = {};

    map['FirstTeamTotal'] = 'differentNames';
    map['SecondTeamTotal'] = 'differentNames';
    map['HT-FT'] = 'differentNames';
    map['HalfTimeFullTimeDoubleChance'] = 'differentNames';
    map['ResultBothTeamToScore'] = 'differentNames';
    map['FirstHalfScore'] = 'differentNames';
    map['SecondHalfScore'] = 'differentNames';
    map['ScoreCombinations'] = 'differentNames';
    map['Score'] = 'differentNames';
    map['SetScores'] = 'differentNames';
    map['SetsComparison'] = 'differentNames';
    map['ResultAndTotal2.5'] = 'differentNames';
    map['ResultAndGoals3.5'] = 'differentNames';
    map['List18'] = 'differentNames';
    map['FirstSubstitution'] = 'differentNames';
    map['Team1TotalGoals'] = 'differentNames';
    map['Team2TotalGoals'] = 'differentNames';
    map['OutcomeAndTotal35'] = 'differentNames';
    map['OutcomeAndTotal25'] = 'differentNames';
    map['NextEvent'] = 'differentNames';
    map['HalfTimeFullTime'] = 'differentNames';
    map['Team1TotalGoalsExact'] = 'differentNames';
    map['Team2TotalGoalsExact'] = 'differentNames';
    map['AnytimeGoalscorer'] = 'differentNames';
    map['Team1WinningMargin'] = 'differentNames';
    map['Team2WinningMargin'] = 'differentNames';
    map['Team1ToScoreFirstHalf/SecondHalf'] = 'differentNames';
    map['Team2ToScoreFirstHalf/SecondHalf'] = 'differentNames';
    map['ExactNumberOfGoals'] = 'differentNames';
    map['OutcomeandBothTeamToScore'] = 'differentNames';
    map['SetBetting'] = 'differentNames';
    map['TotalGoals'] = 'differentNames';
    map['OutcomeTotal2.5'] = 'differentNames';
    map['OutcomeTotal3.5'] = 'differentNames';
    map['HalfTimeTeam1TotalGoals'] = 'differentNames';
    map['winer+corner+card'] = 'differentNames';
    map['goal+corner'] = 'differentNames';
    map['goal+card'] = 'differentNames';
    map['corner+card'] = 'differentNames';
    map['SetScore'] = 'differentNames';
    map['Firstset/match'] = 'differentNames';
    map['Half-time/Full-time'] = 'differentNames';
    map['1-stPeriodCorrectScore'] = 'differentNames';
    map['TopHomeTeamBatsman'] = 'differentNames';
    map['TopAwayTeamBatsman'] = 'differentNames';
    map['TopMatchBatsman'] = 'differentNames';
    map['ManOfTheMatch'] = 'differentNames';
    map['MatchWinner/BestBatsmanoftheMatch'] = 'differentNames';
    map['TopTeam1/Team2Batsman'] = 'differentNames';
    map['Winningmethod'] = 'differentNames';
    map['AlternativeWinning5Round'] = 'differentNames';
    map['Winning5Rounds'] = 'differentNames';
    map['OutcomeAndTotal3.5'] = 'differentNames';
    map['OutcomeAndTotal4.5'] = 'differentNames';
    map['OutcomeAndTotal5.5'] = 'differentNames';
    map['OutcomeAndTotal6.5'] = 'differentNames';
    map['AnyTimeTouchdownScorer'] = 'differentNames';
    map['HalfTimeTeam2OverUnder'] = 'differentNames';
    map['SetWinningMarginTeam1'] = 'differentNames';
    map['Total'] = 'differentNames';
    map['SetWinningMarginTeam2'] = 'differentNames';
    map['SetCorrectScore'] = 'differentNames';
    map['2ndHalfCorrectScore'] = 'differentNames';
    map['HalfTimeCorrectScore'] = 'differentNames';
    map['PeriodCorrectTotal'] = 'differentNames';
    map['CorrectTotal'] = 'differentNames';
    map['HomeCorrectTotal'] = 'differentNames';
    map['AwayCorrectTotal'] = 'differentNames';
    map['HalfTimeTeam2TotalGoals'] = 'differentNames';
    map['FirstHalfTotal'] = 'differentNames';
    map['CorrectScore'] = 'correctScore';

    map['TotalAsian'] = 'total';
    map['AsianTotal'] = 'total';
    map['SecondHalfTotal'] = 'total';
    map['SetTotal'] = 'total';
    map['OverUnder'] = 'total';

    map['noMarketType'] = 'noMarketType';
    map['1'] = 'noMarketType';

    return {
        scope: {
            market: '=',
            game: '=',
            competition: '=',
            region: '=',
            sport: '=',
            bet: '&'
        },
        link: function (scope, element, attr) {

            scope.map = map;

            if (!scope.market) {
                return;
            }

            scope.displayBase = GameInfo.displayBase;
            scope.displayEventLimit = GameInfo.displayEventLimit;
            scope.cancelDisplayEventLimit = GameInfo.cancelDisplayEventLimit;
            scope.isEventInBetSlip = GameInfo.isEventInBetSlip;

            if (!scope.market.type) {
                scope.market.type = 'noMarketType';
            }

            if (['Total', 'AsianTotal', 'TotalAsian', 'FirstHalfTotal', 'SecondHalfTotal', 'SetTotal', 'OverUnder'].indexOf(scope.market.type) >= 0) {
                scope.market.events = Utils.objectToArray(scope.market.event);

                var middleEvent = angular.copy(scope.market.events[0]);
                middleEvent.name = '';
                scope.market.events.splice(1, 0, middleEvent);
            }

            if (map[scope.market.type] === 'correctScore') {
                var marketEventsWithTypeAsKey = {};
                angular.forEach(scope.market.event, function (event) {
                    marketEventsWithTypeAsKey[event.name] = event;
                });

                var i, j;
                var keys = Object.keys(marketEventsWithTypeAsKey);
                var keysLength = keys.length;
                var leftColumn = [];
                var middleColumn = [];
                var rightColumn = [];
                for (i = 0; i < 10; i++) {
                    for (j = 0; j < keysLength; j++) {
                        var type = keys[j].split(/[:,\/ -]/);

                        if (type[0] == i && type[0] > type[1]) {
                            leftColumn.push(marketEventsWithTypeAsKey[keys[j]]);
                        }

                        if (type[0] == i && type[0] === type[1]) {
                            middleColumn.push(marketEventsWithTypeAsKey[keys[j]]);
                        }

                        if (type[1] == i && type[0] < type[1]) {
                            rightColumn.push(marketEventsWithTypeAsKey[keys[j]]);
                        }
                    }
                }

                var length = Math.max(leftColumn.length, middleColumn.length, rightColumn.length);
                scope.market.correctScoreEvents = [];
                for (i = 0; i < length; i++) {
                    var leftColumnValue = leftColumn[i] || {};
                    scope.market.correctScoreEvents.push(leftColumnValue);

                    var middleColumnValue = middleColumn[i] || {};
                    scope.market.correctScoreEvents.push(middleColumnValue);

                    var rightColumnValue = rightColumn[i] || {};
                    scope.market.correctScoreEvents.push(rightColumnValue);                                    
                }
            }
        },
        templateUrl: $filter('fixPath')('optional_modules/comboView/templates/market/events.html')
     };
 }]);