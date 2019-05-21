/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:poolBettingCtrl
 * @description
 *  pool Betting controller.
 */
VBET5.controller('poolBettingCtrl', ['$scope', '$rootScope', '$interval', '$filter', '$q', '$location', 'Utils', 'Zergling', 'Moment', 'analytics', 'Translator', 'Config', 'TimeoutWrapper', function ($scope, $rootScope, $interval, $filter, $q, $location, Utils, Zergling, Moment, analytics, Translator, Config, TimeoutWrapper) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var DRAW_STATUS_OPEN = 1;
    var DRAW_STATUS_BLOCKED = 2;
    var DRAW_STATUS_CLOSED = 3;
    var DRAW_STATUS_FIXED = 4;
    var DRAW_STATUS_PAYED = 5;
    var DRAW_STATUS_FINISHED = 6;

    $scope.drawDisplayStatuses = {};
    $scope.drawDisplayStatuses[DRAW_STATUS_OPEN] = "In progress";           // translate##In progress##
    $scope.drawDisplayStatuses[DRAW_STATUS_BLOCKED] = 'Blocked';     // translate##Blocked##
    $scope.drawDisplayStatuses[DRAW_STATUS_CLOSED] = "Calculating wins";         // translate##Calculating wins##
    $scope.drawDisplayStatuses[DRAW_STATUS_FIXED] = "Calculating wins";
    $scope.drawDisplayStatuses[DRAW_STATUS_PAYED] = "Calculating wins";
    $scope.drawDisplayStatuses[DRAW_STATUS_FINISHED] = "Closed";   // translate##Closed##

    $scope.poolBettingModel = {};
    $scope.drawSelection = {};
    $scope.use_bonus = {};
    $scope.use_bonus.balance = false;
    $scope.choiceType = '';

    $scope.poolBettingProperties = {
        'stake': '',
        'options': '',
        'minStake': '',
        'result': null,
        'resultType': ''
    };

    /**
     * @ngdoc method
     * @name getPicks
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description
     * collects picks from **poolBettingModel** and sets **$scope.complete** accordingly
     * (true if picks are selected for all games, false otherwise)
     */
    function getPicks() {
        $scope.choiceType = '';
        $scope.complete = true;
        $scope.poolBettingProperties.options = 1;
        angular.forEach($scope.poolBettingModel, function (game, gameId) {
            $scope.drawSelection[gameId].picks = [];
            var tempOption = 0;
            angular.forEach(game, function (selected, event) {
                if (selected) {
                    $scope.drawSelection[gameId].picks.push(event);
                    tempOption++;
                }
            });
            $scope.poolBettingProperties.options *= tempOption;
            if (!$scope.drawSelection[gameId].picks.length) {
                $scope.complete = false;
            }
        });
        $scope.poolBettingProperties.minStake = Math.round($scope.poolBettingProperties.options * ($rootScope.currency && $rootScope.currency.toto_rate) * 100 || 0) / 100;

    }

    $scope.$watch('poolBettingModel', getPicks, true);

    /**
     * @ngdoc method
     * @name openRulesPage
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description opens rules page
     */
    $scope.openRulesPage = function openRulesPage() {
        $rootScope.$broadcast('openHelpPage', {slug: Config.main.openHelpAsPopup ? 'faq&subsub=rules&sub=pool-betting' : 'poolbetting-rules'});
    };

    /**
     * @ngdoc method
     * @name openAllDraws
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description opens all draws slider tab
     */
    $scope.openAllDraws = function openAllDraws() {
        $rootScope.env.sliderContent = 'alldraws';
        $rootScope.env.showSlider = true;
    };

    /**
     * @ngdoc method
     * @name closeDrawsSlider
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description closes draws slider tab
     */
    $scope.closeDrawsSlider = function closeDrawsSlider() {
        $rootScope.env.sliderContent = '';
        $rootScope.env.showSlider = false;
    };


    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description loads pool betting data
     */
    $scope.init = function init() {
        $scope.loading = true;
        Zergling.get({
            'source': 'pool.betting',
            'what': {
                'draw': [],
                'selection': []
            },
            'where': {
                'draw': {
                    'status': 1
                }
            }
        }).then(function (response) {

            $scope.draw = response.data && $filter('firstElement')(response.data.draw);
            console.log('main draw:', $scope.draw);
            if (!$scope.draw || !$scope.draw.selection) {
                $scope.loading = false;
                return;
            }
            angular.forEach($scope.draw.selection, function (selection) {
                $scope.poolBettingModel[selection.order] = {};
                $scope.drawSelection[selection.order] = selection;
            });

            if ($scope.draw && $scope.draw.selection) {
                $scope.competitions = Utils.objectToArray(Utils.groupByItemProperty($scope.draw.selection, 'competition_id'));
            }
            if ($scope.competitions) {
                $scope.competitions.sort(function (a, b) {
                    return a[0].order - b[0].order;
                });
            }
            if (!$scope.draw.jackpot || $scope.draw.jackpot <= $scope.draw.min_jackpot) {
                $scope.draw.jackpot = $scope.draw.min_jackpot;
                $scope.draw.min = true;
            }
            console.log('draw selection competitions', $scope.competitions);
            $scope.loading = false;
        });
    };


    /**
     * @ngdoc method
     * @name initAllDraws
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description loads pool betting all draws data
     */
    $scope.initAllDraws = function initAllDraws() {
        $scope.loading = true;
        Zergling.get({
            'source': 'pool.betting',
            'what': {
                'draw': []
            }
        }).then(function (response) {

            $scope.draws = Utils.objectToArray(response.data.draw);

            if ($rootScope.currency.toto_rate) {
                angular.forEach($scope.draws, function (draw) {
                    if (!draw.jackpot || draw.jackpot <= draw.min_jackpot) {
                        draw.jackpot = draw.min_jackpot;
                        draw.min = true;
                    }
                    draw.jackpot = draw.jackpot * $rootScope.currency.toto_rate;
                    draw.pool_fee = draw.pool_fee * $rootScope.currency.toto_rate;
                    draw.prize_fund = draw.prize_fund * $rootScope.currency.toto_rate;
                    draw.state = $scope.drawDisplayStatuses[draw.status];
                });
            }

            console.log('all draws:', response, $scope.draws);
            $scope.loading = false;
        });
    };

    /**
     * @ngdoc method
     * @name initSingleDraw
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description loads pool betting data
     */
    $scope.initSingleDraw = function initSingleDraw() {
        if (!$scope.drawId) {
            console.warn('no $scope.drawId');
            return;
        }
        $scope.draw = $scope.gamesResultTableRows = null;
        $scope.loading = true;
        var selectedDrawNumber = parseInt($scope.drawNumber, 10), next = selectedDrawNumber + 1, prev = selectedDrawNumber - 1;
        var totoInfoPromise = Zergling.get({'game_id':  $scope.drawId}, 'toto_game_info');
        var drawInfoPromise = Zergling.get({
            'source': 'pool.betting',
            'what': {
                'draw': [],
                'selection': []
            },
            'where': {
                draw: {
                    '@or': [
                        {id: $scope.drawId},
                        {number: {
                            '@in': [prev.toString(), next.toString()]
                        }}
                    ]
                }
            }
        });
        $q.all([totoInfoPromise, drawInfoPromise]).then(function (data) {
            var totoGameInfo = data[0];
            var drawInfoResponse = data[1];
            $scope.totoPrizeInfo = totoGameInfo.prizes;
            console.log('pool betting draw details and toto game info:', drawInfoResponse.data, totoGameInfo);
            $scope.draw = (drawInfoResponse.data.draw[$scope.drawId]);
            if ($rootScope.currency.toto_rate && $scope.draw && $scope.draw.jackpot) {

                $scope.draw.min = false;
                if (!$scope.draw.jackpot || $scope.draw.jackpot <= $scope.draw.min_jackpot) {
                    $scope.draw.jackpot = $scope.draw.min_jackpot;
                    $scope.draw.min = true;
                }
                $scope.draw.jackpot = $scope.draw.jackpot * $rootScope.currency.toto_rate;
            }
            $scope.previousDraw = $scope.nextDraw = null;
            angular.forEach(drawInfoResponse.data.draw, function (draw) {
                if (draw.number === prev.toString()) {
                    $scope.previousDraw = {id: draw.id, number: draw.number, status: draw.status};
                }
                if (draw.number === next.toString()) {
                    $scope.nextDraw = {id: draw.id, number: draw.number, status: draw.status};
                }
            });
            var competitions = Utils.objectToArray(Utils.groupByItemProperty($scope.draw.selection, 'competition_id'));
            var totoGameData = Utils.groupByItemProperty(totoGameInfo.events, 'game_id');
            if (competitions) {
                competitions.sort(function (a, b) {return a[0].order - b[0].order; });
                var i, j, competition;
                $scope.gamesResultTableRows = [];
                for (i = 0; i < competitions.length; i++) {
                    competition = competitions[i];
                    $scope.gamesResultTableRows.push({
                        type: 'competition',
                        sport_name: competition[0].sport_name,
                        competition_name: competition[0].competition_name
                    });
                    for (j = 0; j < competition.length; j++) {
                        $scope.gamesResultTableRows.push({
                            order: competition[j].order,
                            type: 'game',
                            score: totoGameData[competition[j].game_id][0].score,
                            start_ts: competition[j].start_ts,
                            team1_name: competition[j].team1_name,
                            team2_name: competition[j].team2_name,
                            p1: totoGameData[competition[j].game_id][0].p1,
                            p1_1: totoGameData[competition[j].game_id][0].p1_1,
                            p2: totoGameData[competition[j].game_id][0].p2,
                            p2_1: totoGameData[competition[j].game_id][0].p2_1,
                            x: totoGameData[competition[j].game_id][0].px,
                            x_1: totoGameData[competition[j].game_id][0].px_1
                        });
                    }
                }
            }
            $scope.loading = false;
        });
    };

    /**
     * @ngdoc function
     * @name gotoDraw
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description
     *
     * @param {Number} id draw id - used to get draw
     * @param {Number} number draw number - used to get siblings
     */
    $scope.gotoDraw = function gotoDraw(id, number) {
        $scope.drawId = id;
        $scope.drawNumber = number;
        if ($rootScope.env.sliderContent !== 'singledraw') {
            $rootScope.env.sliderContent = 'singledraw';
        } else {
            $scope.initSingleDraw();
        }


    };

    var clockPromise;

    /**
     * @ngdoc function
     * @name clock
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description updates the timer
     */
    function clock() {
        if ($scope.draw) {
            var end = $scope.draw.end_date * 1000;
            if (end < new Date().getTime()) {
                $scope.drawIsOver = true;
                $interval.cancel(clockPromise);
            }
            $scope.timer = Moment.get().preciseDiff(Moment.get(end));
        }
    }

    clockPromise = $interval(clock, 1000);

    /**
     * @ngdoc method
     * @name randomChoice
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description
     */
    $scope.randomChoice = function randomChoice() {
        angular.forEach($scope.draw.selection, function (selection) {
            $scope.poolBettingModel[selection.order] = {}; //clear
            var key = ['p1', 'p2', 'x'][Math.floor((Math.random() * 3))];
            $scope.poolBettingModel[selection.order][key] = true;
        });

        TimeoutWrapper(function () {
            $scope.choiceType = 'random';
        }, 100);
    };

    /**
     * @ngdoc method
     * @name favouriteChoice
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description
     */
    $scope.favouriteChoice = function favouriteChoice() {
        angular.forEach($scope.draw.selection, function (selection) {
            $scope.poolBettingModel[selection.order] = {}; //clear
            var minKey = Utils.getKeyOfMinValue({p1: selection.p1_price, p2: selection.p2_price, x: selection.x_price});
            $scope.poolBettingModel[selection.order][minKey] = true;
        });

        TimeoutWrapper(function () {
            $scope.choiceType = 'favorite';
        }, 100);
    };

    /**
     * @ngdoc method
     * @name addToBetslip
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description
     */
    $scope.addToBetslip = function addToBetslip() {

        var selectionList = [];
        angular.forEach($scope.drawSelection, function (sel) {
            var tempPick = '';
            if (sel.picks.indexOf('p1') > -1) {
                tempPick += '1';
            }
            if (sel.picks.indexOf('x') > -1) {
                tempPick += 'x';
            }
            if (sel.picks.indexOf('p2') > -1) {
                tempPick += '2';
            }
            selectionList.push(tempPick);
        });


        var request = {
            'game_id': $scope.draw.id,
            'selections': selectionList
        };

        request.amount =  parseFloat($scope.poolBettingProperties.stake);

        if ($scope.use_bonus.balance) {
            request.use_points = $scope.use_bonus.balance;
        } else {
            delete request.use_points;
        }

        var processTotBetResults = function (result) {
            console.log("request =", request);
            $scope.poolBettingProperties.resultType = (result.result !== "OK") ? 'error' : 'success';
            if (('message_' + result.result) !== Translator.get('message_' + result.result)) {
                $scope.poolBettingProperties.result = Translator.get('message_' + result.result);
            } else {
                $scope.poolBettingProperties.result = Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + result.result + ')';
            }
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: $scope.poolBettingProperties.resultType,
                title: 'error' === $scope.poolBettingProperties.resultType ? 'Error' : 'Success',
                content: $scope.poolBettingProperties.result
            });
        };

        analytics.gaSend('send', 'event', 'betting', {'page': $location.path(), 'eventLabel': 'placePoolBet'});

        Zergling
            .get(request, 'do_bet_toto')
            .then(processTotBetResults)['catch'](
                function (reason) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + reason.code + ')'
                    });
                    console.log('Error:', reason);
                }
            );
        console.log($scope.drawSelection, $scope.draw.id);


    };

    /**
     * @ngdoc method
     * @name betFromKeyboard
     * @methodOf vbet5.controller:poolBettingCtrl
     * @description  Place Bet by pressing Enter key on keyboard
     * @param {Object} $event keypress event
     */

    $scope.betFromKeyboard = function betFromKeyboard($event) {
        if ($event.keyCode == 13 && $scope.env.authorized && $scope.poolBettingProperties.stake >= $scope.poolBettingProperties.minStake && $scope.complete) {
            $scope.addToBetslip();
        }
    };

    $scope.$on('$destroy', function() {
        if (clockPromise) {
            $interval.cancel(clockPromise);
            clockPromise = undefined;
        }
    });
}]);