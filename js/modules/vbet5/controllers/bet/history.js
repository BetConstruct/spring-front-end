/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:myBetsCtrl
 * @description
 *  bet history controller.
 */
VBET5.controller('myBetsCtrl', ['$scope', 'Utils', 'ConnectionService', 'Zergling', 'Moment', 'Translator', 'Config', 'GameInfo', '$rootScope', '$window', '$filter', '$timeout', '$location', function ($scope, Utils, ConnectionService, Zergling, Moment, Translator, Config, GameInfo, $rootScope, $window, $filter, $timeout, $location) {
    'use strict';
    $scope.BETS_TO_SHOW = Config.main.countOfRecentBetsToShow;
    $scope.offset = 0;
    $scope.allBetsCount = 0;
    $scope.myBetsLoaded = false;
    $scope.betHistoryLoaded = false;
    $scope.monthIndexes = [];

    $scope.poolBettingMap = {
        '1': Translator.get('W1'),
        '2': 'X',
        '3': Translator.get('W2')
    };

    $scope.cashoutPopup = {
        active: false
    };

    $scope.canCashOut = true;

    $scope.profit = {
        show: false,
        result: 0
    };

    if (!$rootScope.gamePointers) {
        $rootScope.gamePointers = {};
    }
    var betHistory, BETS_PER_HISTORY_PAGE = 6;
    var sliderContentWatcherPromise;

    $scope.betHistoryParams = {
        dateRanges: [],
        dateRange: null,
        betType: '-1',
        outcome: '-1',
        betIdFilter: null,
        type: -1,
        category: '0',
        game: '0'

    };
    var allBets;
    var cashoutSubId;

    /**
     * @ngdoc method
     * @name getVisibleBets
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  Returns visible bets only
     * @param {Array} bets bets array
     */
    function getVisibleBets(bets) {
        return bets.slice($scope.offset, $scope.offset + $scope.BETS_TO_SHOW);
    }

    /**
     * @ngdoc method
     * @name convertStringFiledsToNumbers
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Convert string fileds to numbers
     * @param {Object} array
     */
    function convertStringFiledsToNumbers(arr) {
        arr.map(function (bet) { //convert string fields to numbers
            ['amount', 'bonus', 'bonus_amount', 'bonus_bet_amount', 'payout', 'possible_win', 'bonus_possible_win'].map(function (field) {
                bet[field] = parseFloat(bet[field]);
                bet[field] = isNaN(bet[field]) ? 0 : bet[field];
            });
        });
    }


    /**
     * @ngdoc method
     * @name fixBetItemNames
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  fixes game and event names in given bets (converts html entities to symbols)
     * @param {Object} bets bets array
     */
    function fixBetItemNames(bets) {
        bets.map(function (bet) {
            if (bet) {
                angular.forEach(bet.events, function (event) {
                    event.game_name =  Utils.convertHtmlEntitiesToSymbols(event.game_name);
                    event.event_name = Utils.convertHtmlEntitiesToSymbols(event.event_name);
                });
            }
        });
    }

    /**
     * @ngdoc method
     * @name calculateLiability
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  Calculate Liability
     * @param {Object} bets bets array
     */
    function calculateLiability(bets) {
        angular.forEach(bets, function (bet) {
            switch (bet.type) {
                case 0:
                case '0':
                    bet.liability = $filter('number')((parseFloat(bet.k) - 1) * parseFloat(bet.amount), 2);
                    break;
                case 1:
                case '1':
                    bet.liability = $filter('number')(parseFloat(bet.amount), 2);
                    break;
                default:
                    bet.liability = '...';
                    break;
            }

        });
    }

    /**
     * @ngdoc method
     * @name factorial
     * @methodOf betting.controller:myBetsCtrl
     * @param {Number} x x
     * @returns {Number} factorial
     * @description calculate factorial
     */
    function factorial(x) {
        if (x !== undefined && !isNaN(x) && x >= 0) {
            return x === 0 ? 1 : (x * factorial(x - 1));
        }
    }


    /**
     * @ngdoc method
     * @name calculateSystemCombinations
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  Calculate Liability
     * @param {Object} bets bets array
     */
    function calculateSystemCombinations(bets) {
        angular.forEach(bets, function (bet) {
            if (bet.type === 3) {
                var total = bet.events.length, k = bet.system_min_count;
                bet.systemCombinationsCount = Math.round(factorial(total) / (factorial(k) * factorial(total - k)));
            }
        });
    }



    /**
     * @ngdoc method
     * @name filterCashoutBet
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  filters bets with cashout only
     * @param {Object} bets bets array
     */
    function filterCashoutBet(bets) {
        var betsCashout = [];
        angular.forEach(bets, function (val) {
            if (val.cash_out && val.cash_out !== 0 && val.cash_out !== '0') {
                betsCashout.push(val);
            }
        });
        return betsCashout;
    }

    /**
     * @ngdoc method
     * @name fillBetsPointerInfo
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  get game regions and fill game Pointer info
     *
     * @param {Object} currentBets
     */
    function fillBetsPointerInfo(currentBets) {
        var betGameIdsObj = {};
        angular.forEach(currentBets, function (bet) {
            angular.forEach(bet.events, function (betEvent) {
                if (betEvent.game_id && !isNaN(betEvent.game_id) && !$rootScope.gamePointers[betEvent.game_id]) {
                    betGameIdsObj[betEvent.game_id] = parseInt(betEvent.game_id, 10);
                }
            });

            /*this functional only for car tournament*/
            if (Config.betting.popupMessageAfterBet && Config.betting.popupMessageAfterBet.startTime && bet.amount >= Config.betting.popupMessageAfterBet[bet.currency]) {
                var diffStart = Moment.get(Moment.moment.unix(bet.date_time)).diff(Moment.moment.utc(Config.betting.popupMessageAfterBet.startTime), 'seconds');
                var diffEnd = Moment.get(Moment.moment.unix(bet.date_time)).diff(Moment.moment.utc(Config.betting.popupMessageAfterBet.endTime), 'seconds');
                if (diffStart > 0 && diffEnd < 0) {
                    bet.showBetDrawIcon = true;
                    $scope.betDrawIconTitle = Config.betting.popupMessageAfterBet.tooltip;
                }
            }
        });

        var betGameIds = Utils.objectToArray(betGameIdsObj);
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'alias'],
                'region': ['id'],
                'competition': ['id'],
                'game': ['id', 'type']
            },
            'where': {
                'game': {
                    'id': {'@in': betGameIds}
                }
            }
        };
        if (betGameIds.length > 0) {
            Zergling.get(request).then(function (result) {
                if (result.data && result.data.sport) {
                    angular.forEach(result.data.sport, function (sport) {
                        angular.forEach(sport.region, function (region) {
                            angular.forEach(region.competition, function (competition) {
                                angular.forEach(competition.game, function (game) {
                                    angular.forEach(currentBets, function (bet) {
                                        angular.forEach(bet.events, function (betEvent) {
                                            if (betEvent.game_id == game.id) {
                                                $rootScope.gamePointers[betEvent.game_id] = {
                                                    'game': betEvent.game_id,
                                                    'sport': sport,
                                                    'competition': competition.id,
                                                    'type': game.type === 1 ? "1" : "0",
                                                    'region': region.id
                                                };
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                }
            })['catch'](function (reason) {
                console.log('Error:', reason);
            });
        }
    }

    /**
     * @ngdoc method
     * @name updateEventCashouts
     * @methodOf vbet5.controller:myBetsCtrl
     * @description calculate bet cashouts
     * @param {object} data from swarm
     */
    function updateEventCashouts(data) {
        var cashOutBetIds = [];
        var currentBets = Config.main.enableMixedView ? betHistory : allBets;
        angular.forEach(currentBets, function (betData) {
            // Only look at 'Single' and 'Multiple' bets that are not settled
            if ((betData.type == '1' || betData.type == '2') && betData.outcome == '0') {
                var hasInactiveEvents = false,
                    needsCalculation;

                angular.forEach(betData.events, function (betEvent) {
                    var isEventActive = betEvent.outcome == 3;
                    var betEventId = Config.main.GmsPlatform ? betEvent.selection_id : betEvent.id;

                    angular.forEach(data.event, function (currentEvent) {
                        if (betEventId == currentEvent.id && currentEvent.price && currentEvent.price > 1) {
                            isEventActive = true;
                            // We only need to make the call if there was a price change
                            needsCalculation = needsCalculation || currentEvent.price_change || !betData.cash_out;
                        }
                    });

                    if (!isEventActive) {
                        hasInactiveEvents = true;
                    }
                });
                /* If a bet doesn't have any inactive event and its cash out needs to be recalculated we push it to the array where the ids of those bets are stored.
                   If it doesn't need any recalculation, but all events are active, we keep the same amount which was set previously.
                   Finally, if none of the cases apply, we set it to undefined */
                if (!hasInactiveEvents && needsCalculation) {
                    cashOutBetIds.push(betData.id);
                } else if (hasInactiveEvents || parseFloat(betData.cash_out) == 0 || betData.cash_out === null) {
                    betData.cash_out = undefined;
                    betData.cashoutEnabled = false;
                } else {
                    betData.cashoutEnabled = true;
                    /* if ((parseInt(Moment.get().format('x')/1000) - betData.date_time) < 20) {
                        Utils.setJustForMoment(betData, 'cashoutEnabled', false, 20000);
                    } */
                }

            }
        });

        if (cashOutBetIds.length) {
            Zergling.get({"bet_ids": cashOutBetIds}, "calculate_cashout_amount")
                .then(function(response) {
                    if (response.details) {
                        var cashOutMap = Utils.createMapFromObjItems(response.details, 'Id');

                        angular.forEach(currentBets, function(betData) {
                            if (cashOutMap[betData.id]) {
                                betData.cash_out = cashOutMap[betData.id]['CashoutAmount'];

                                // This part is needed for dynamic pop up info update
                                if ($scope.cashoutBet && $scope.cashoutBet.id && cashOutMap[$scope.cashoutBet.id]) { // $scope.cashoutBet is the active bet that we want to cash out
                                    $scope.cashoutPopup.inputValue = cashOutMap[$scope.cashoutBet.id]['CashoutAmount'];
                                    $scope.cashoutPopup.sliderValue = 100; // 100 is the maximum slider value (100%)

                                    /* $scope.newCashoutData is created when pop up is opened and contains info on cash out price
                                       It is sent as the full cash out price (in case we don't manipulate either input value or slider value) */
                                    if ($scope.newCashoutData && $scope.newCashoutData.new_price) {
                                        $scope.newCashoutData.new_price = cashOutMap[$scope.cashoutBet.id]['CashoutAmount'];

                                        // We delete the partial price because it doesn't need to be sent if the cash out is 'full'
                                        if ($scope.newCashoutData.partial_price) {
                                            $scope.newCashoutData.partial_price = '';
                                        }
                                    }
                                }

                                if (parseFloat(betData.cash_out) == 0 || betData.cash_out === null) {
                                    betData.cashoutEnabled = false;
                                    betData.cash_out = undefined;
                                } else {
                                    betData.cashoutEnabled = true;
                                }
                            }
                        });
                    }

                });
        }

    }

    /**
     * @ngdoc method
     * @name subscribeToCashoutEvents
     * @methodOf vbet5.controller:myBetsCtrl
     * @param {Object} data
     * @description subscribe To Cashout Events
     **/
    function subscribeToCashoutEvents(data) {
        var cashoutEventIdsObj = {};
        angular.forEach(data.bets, function (bet) {
            if (bet.cash_out !== undefined) {
                angular.forEach(bet.events, function (betEvent) {
                    var betEventId = parseInt((Config.main.GmsPlatform ? betEvent.selection_id : betEvent.id), 10);
                    cashoutEventIdsObj[betEventId] = betEventId;
                });
            }
        });

        $scope.cashoutEventIds = Utils.objectToArray(cashoutEventIdsObj);

        if ($scope.cashoutEventIds.length) {
            Zergling
            .subscribe({
                    'source': 'betting',
                    'what': {
                        'event': ['id', 'price']
                    },
                    'where': {
                        'event': {
                            'id': {'@in': $scope.cashoutEventIds}
                        }
                    }
                },
                updateEventCashouts).then(function (response) {
                cashoutSubId = response.subid;
                updateEventCashouts(response.data);
            });
        }
    }

    /**
     * @ngdoc method
     * @name updateMyBets
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Update my bets section
     * @param {Object} bets data
     */
    function updateMyBets(data) {
        if (data && data.bets) {
            allBets = Utils.objectToArray(data.bets);
            fillBetsPointerInfo(allBets);
            convertStringFiledsToNumbers(allBets);
            fixBetItemNames(allBets);

            if (Config.env.sliderContent === 'recentBetsCashout') {
                allBets = filterCashoutBet(allBets);
            }

            $scope.allBetsCount = allBets.length;
            console.log(allBets, allBets.length);
            $scope.myBets = getVisibleBets(allBets);
        }
    }

    /**
     * @ngdoc method
     * @name slide
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Slides visible bets left or right by changing $scope's **offset** variable
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slide = function slide(direction) {
        if (direction === 'left') {
            if ($scope.offset > 0) {
                $scope.offset--;
            }
        } else if (direction === 'right') {
            if ($scope.offset < allBets.length - $scope.BETS_TO_SHOW) {
                $scope.offset++;
            }
        }
        $scope.myBets = getVisibleBets(allBets);
    };

    /**
     * @ngdoc method
     * @name loadMyBets
     * @methodOf vbet5.controller:myBetsCtrl
     * @description loads
     */
    $scope.loadMyBets = function loadMyBets() {
        $scope.myBetsLoaded = false;
        $scope.offset = 0;
        function doLoadMyBets() {
            var request = {
                'where': {
//             'from_date': int(time.time()) - 24*3600,
//             'to_date': int(time.time()),
//             'outcome': 3,
//             'bet_type': 1,
//             'with_pool_bets': true
                }
            };
            if ($rootScope.calculatedConfigs.poolBettingEnabled) {
                request.where.with_pool_bets = true;
            }

            if (Config.env.sliderContent === 'recentBetsCashout' || Config.main.betHistoryForMonth) {
                var time = Moment.get().subtract('months', 0).startOf('month');
                request.where.from_date = time.unix();
                request.where.to_date = time.clone().add('months', 1).unix();
            }

            Zergling.get(request, 'bet_history')
                .then(
                function (response) {
                    updateMyBets(response);
                    subscribeToCashoutEvents(response);
                    $scope.myBetsLoaded = true;
                },
                function (failResponse) {
                    console.log('failed loading my bets', failResponse);
                    $scope.errorLoadingBets = true;
                }
            );
        }

        if (Config.env.authorized) {
            doLoadMyBets();
        } else {
            $rootScope.loginRestored.then(doLoadMyBets);
        }
    };

    /**
     * @ngdoc method
     * @name gotoBetGame
     * @methodOf vbet5.controller:myBetsCtrl
     * @description  Navigates to Events game
     *
     * @param {Object} betEvent bet history Event
     */
    $scope.gotoBetGame = function gotoBetGame(betEvent) {
        if (GameInfo.getVirtualSportIds().indexOf(parseInt(betEvent.sport_id, 10)) === -1 && $rootScope.gamePointers[betEvent.game_id]) {
            $rootScope.$broadcast('gotoSelectedGame', $rootScope.gamePointers[betEvent.game_id]);
        }
    };

    /**
     * @ngdoc method
     * @name initBetHistory
     * @methodOf vbet5.controller:myBetsCtrl
     * @description init function. Generates  month and weeks data for select box and loads bets for the first month
     */
    $scope.initBetHistory = function initBetHistory(product) {
        function doInitBetHistory() {
            var i, iMax = 6, time, monthFormat = 'MMMM YYYY', weekFormat = 'DD MMM';
            if (Config.env.lang === 'jpn') {
                monthFormat = 'YYYY年 MMMM';
                weekFormat = 'DD日 MMM';
            }

            if ($rootScope.profile && $rootScope.profile.reg_date) {
                var format = ($rootScope.profile.reg_date.indexOf('.') > -1) ? 'DD.MM.YYYY' : '';
                var regPeriod = Moment.get().diff(Moment.get($rootScope.profile.reg_date, format).startOf('month'), 'days') / 30;
                iMax = (regPeriod && (regPeriod > 0) && (regPeriod < iMax)) ? (regPeriod < 1 ? 1 : regPeriod) : iMax;
            }
            for (i = 0; i < iMax; i++) {
                time = Moment.get().subtract('months', i).startOf('month');
                $scope.betHistoryParams.dateRanges.push({
                    fromDate: time.unix(),
                    toDate: time.clone().add('months', 1).unix(),
                    str: time.format(monthFormat),
                    type: 'month'
                });

                $scope.monthIndexes.push($scope.betHistoryParams.dateRanges.length - 1);

                var monthDays = i === 0 ? Moment.get().lang('en').format('D') : time.clone().endOf('month').lang('en').format('D'),
                    wCount = parseInt(monthDays / 7, 10),
                    moreDaysCount = monthDays % 7;
                var j, fromDate, toDate, weekDates = [];
                for (j = 0; j < wCount; j++) {
                    fromDate = time.clone().add('days', j * 7);
                    toDate = time.clone().add('days', (j + 1) * 7);
                    weekDates.push({
                        fromDate: fromDate.unix(),
                        toDate: toDate.unix(),
                        str: "· " + (fromDate.format(weekFormat) + " - " + toDate.format(weekFormat)),
                        type: 'week'
                    })
                }
                if (moreDaysCount > 0) {
                    fromDate = time.clone().add('days', j * 7);
                    toDate = fromDate.clone().add('days', moreDaysCount);
                    var str = moreDaysCount == 1 ? fromDate.format(weekFormat) : fromDate.format(weekFormat) + " - " + toDate.format(weekFormat);
                    weekDates.push({fromDate: fromDate.unix(), toDate: toDate.unix(), str: "· " + str, type: 'week'});
                }
                $scope.betHistoryParams.dateRanges = $scope.betHistoryParams.dateRanges.concat(weekDates.reverse());
            }
            $scope.dataSelectedIndex = product === 'Casino' ? "1" : "0";
            $scope.loadBetHistory(product);
        }

        if (Config.env.authorized) {
            doInitBetHistory();
        } else {
            $rootScope.loginRestored.then(doInitBetHistory);
        }
    };

    /**
     * @ngdoc method
     * @name loadBetHistory
     * @methodOf vbet5.controller:myBetsCtrl
     * @description loads bet history according to selected parameters from  **$scope.betHistoryParams**
     * and selects first page
     */
    $scope.loadBetHistory = function loadBetHistory(product,  callbackFunction) {
        if ($scope.betHistoryParams.dateRanges.length > 0) {
            $scope.betHistoryParams.dateRange = $scope.betHistoryParams.dateRanges[$scope.dataSelectedIndex];
        }
        var where = {},
            isVivaroShuka = (product === 'shukaBetHistory'),
            betType = parseInt($scope.betHistoryParams.betType, 10),
            type = parseInt($scope.betHistoryParams.type, 10),
            outcome = parseInt($scope.betHistoryParams.outcome, 10);

        if ($scope.betHistoryParams.dateRange && $scope.betHistoryParams.dateRange.fromDate !== -1) {
            if ($scope.selectedUpcomingPeriod) {
                where.from_date = Moment.get().unix() - $scope.selectedUpcomingPeriod * 3600;
                where.to_date = Moment.get().unix();
            } else {
                where.from_date = $scope.betHistoryParams.dateRange.fromDate;
                where.to_date = $scope.betHistoryParams.dateRange.toDate;
            }
        }

        if ($scope.betHistoryParams.betIdFilter && !isNaN(parseInt($scope.betHistoryParams.betIdFilter))) {
            where.bet_id = parseInt($scope.betHistoryParams.betIdFilter);
        }

        if (outcome !== -1) {
            where.outcome = outcome;
        }
        if (betType !== -1) {
            where.bet_type = betType;
        }
        if (type !== -1) {
            where.type = type.toString();
        }
        if ($rootScope.calculatedConfigs.poolBettingEnabled && !isVivaroShuka && !$scope.betHistoryParams.betIdFilter) {
            where.with_pool_bets = true;
        }
        var request = {'where': where};
        var command = 'bet_history';
        if (isVivaroShuka) {
            command = 'fair_bets_history';
            request = where;
        }
        if (product && !isVivaroShuka) {
            request.product = product;

            if (product === 'Casino') {
                var category = parseInt($scope.betHistoryParams.category, 10), game = 0;

                switch (category) {
                case 706:
                    category = 4;
                    game = 15; // the game is Financials; the actual Financials game id is 706
                    break;
                case 1297:
                    category = 4;
                    game = 55; // the game is Fantasy; the actual Fantasy game id is 1297
                    break;
                case 547:
                    category = 3;
                    game = 10; // the game is Belote; the actual Belote game id is 547
                    break;
                case 599:
                    category = 3;
                    game = 11; // the game is Backgammon; the actual Backgammon game id is 599
                    break;
                case 1:
                    game =  parseInt($scope.betHistoryParams.game, 10);
                    break;
                }

                where.category_id = category;
                where.game_id = game;
            }
        }
        $scope.betHistoryLoaded = false;
        $scope.errorLoadingHistory = false;
        $scope.profit.show = false;
        Zergling.get(request, command)
            .then(
                function (response) {
                    if (response.result === -1 || !response.bets) {
                        $scope.errorLoadingHistory = true;
                        return;
                    }

                    if (!(response.bets instanceof  Array)) {
                        var tempData = response.bets;
                        response.bets = [];
                        response.bets[0] = tempData;
                    }
                    fixBetItemNames(response.bets);
                    calculateLiability(response.bets);
                    calculateSystemCombinations(response.bets);
                    betHistory = response.bets;
                    fillBetsPointerInfo(betHistory);
                    convertStringFiledsToNumbers(response.bets);
                    allBets = Utils.objectToArray(response.bets);
                    var sortParam = response.bets[0] && response.bets[0]['bet_date'] !== undefined ? 'bet_date' : 'date_time';
                    response.bets = Utils.twoParamsSorting(response.bets, [sortParam]);
                    response.bets.reverse();
                    subscribeToCashoutEvents(response);
                    if (!Config.main.enableMixedView) {
                        $scope.betHistoryGotoPage(1);
                    } else {
                        $scope.betHistory = betHistory;
                    }

                    if ($scope.profit.checkAfterLoad) {
                        $scope.calculateProfit();
                    }

                    $scope.betHistoryLoaded = true;
                    console.log('bet history:', betHistory, where);
                    if(callbackFunction){
                        callbackFunction();
                    }
                },
                function (failResponse) {
                    console.log('failed loading bets history', failResponse);
                    $scope.errorLoadingHistory = true;
                }
            );
    };

    /**
     * @ngdoc method
     * @name betHistoryGotoPage
     * @methodOf vbet5.controller:myBetsCtrl
     * @description selects slice of bet history data according to given page number
     *
     * @param {Number} page page number
     */
    $scope.betHistoryGotoPage = function betHistoryGotoPage(page) {
        $scope.totalPages = parseInt(betHistory.length / BETS_PER_HISTORY_PAGE + (betHistory.length % BETS_PER_HISTORY_PAGE ? 1 : 0), 10);
        $scope.betHistoryPages = Utils.createPaginationArray($scope.totalPages, page, 10);
        $scope.betHistoryActivePage = page;
        var start = (page - 1) * BETS_PER_HISTORY_PAGE;
        var end = page * BETS_PER_HISTORY_PAGE;
        end = end > betHistory.length ? betHistory.length : end;
        $scope.betHistory = betHistory.slice(start, end);
    };

    /**
     * @ngdoc method
     * @name openPrintPreview
     * @methodOf vbet5.controller:myBetsCtrl
     * @description opens printPreview page specified by bet
     *
     * @param {object} betData bet data
     */
    $scope.openPrintPreview = function openPrintPreview(betData) {
        if (Config.main.enableBetPrint) {
            var betDataInfo = angular.copy(betData);
            betDataInfo.userId = ($rootScope.profile && ($rootScope.profile.id || $rootScope.profile.unique_id)) || '';
            betDataInfo.userName = ($rootScope.profile && $rootScope.profile.username) || '';
            var encodedBetData = encodeURIComponent(JSON.stringify(betDataInfo));
            $window.open('#/popup/?action=betprintpreview&data=' + encodedBetData, Config.main.skin + 'betprintpreview.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
        }
    };

    /**
     * @ngdoc method
     * @name doCashout
     * @methodOf vbet5.controller:myBetsCtrl
     * @description sends cashout requets
     *
     * @param {object} bet bet data
     * @param {object} suggested
     */
    $scope.doCashout = function doCashout(bet, suggested) {
        $scope.cashoutRequestInProgress = true;
        $scope.newCashoutData = null;
        var price = parseFloat(suggested && suggested.new_price ? suggested.new_price : bet.cash_out);
        var request = {bet_id: bet.id, price: price};

        if (suggested.partial_price) {
            request.partial_price = suggested.partial_price;
        }

        Zergling.get(request, 'cashout')
            .then(
                function (response) {
                    if (response.result === "Ok") {
                        var currentTimestamp = Moment.get().unix();
                        if (suggested.partial_price && (($scope.betHistoryParams.dateRange.fromDate <= currentTimestamp && currentTimestamp <= $scope.betHistoryParams.dateRange.toDate) || $scope.selectedUpcomingPeriod !== 0)){
                            $timeout(function() { //need to remove timeout after backend's fix
                                $scope.loadMixedBetHistory();
                            }, 950);
                        } else {
                            updateAfterCashout(bet.id);
                        }
                        $scope.cashoutDialogType = 'confirm';
                        $scope.cashoutSuccess = (response.details && (response.details.cash_out_price || response.details.price)) || true;
                        if (Config.partner.balanceRefreshPeriod || Config.main.rfid.balanceRefreshPeriod) { // refresh balance right after successed cashout in integration skin (or for rfid)
                            $rootScope.$broadcast('refreshBalance');
                        }
                    } else if (response.result === "Fail" && response.details && response.details.new_price) {
                        $scope.cashoutDialogType = 'cashout';
                        $scope.newCashoutData = response.details;
                        $scope.newCashoutData.priceChanged = true;
                        $scope.changeCashoutValue($scope.cashoutPopup.sliderValue, $scope.newCashoutData.new_price)
                        bet.cash_out = $scope.newCashoutData.new_price;
                        $scope.cashoutPopup.inputValue = bet.cash_out;
                    } else if (response.result === "NotAvailable" || response.result === "Fail") {
                        $scope.cashoutDialogType = 'confirm';
                        $scope.cashoutSuccess = false;
                    } else {
                        $scope.cashoutDialogType = 'confirm';
                        $scope.cashoutSuccess = false;
                        $scope.unknownError = true;
                    }
                },
                function (failResponse) {
                    $scope.cashoutPopup.active = true;
                    $scope.cashoutDialogType = 'confirm';
                    $scope.cashoutSuccess = false;
                    console.log('cashout failed', failResponse);
                }
            )['finally'](function () {
                $scope.cashoutRequestInProgress = false;
            });
    };

    /**
     * @ngdoc method
     * @name poolBettingSelection
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Translates backend selection to readable format 1 = W1, 2 = X, 3 = W2
     *
     * @param {string} data backend selection data
     */
    $scope.poolBettingSelection = function poolBettingSelection(data) {
        if (!data) {
            return '';
        }

        var r, length = data.length;
        var out = [];

        for (r = 0; r < length; r++) {
            if (data[r] && $scope.poolBettingMap[data[r]]) {
                out.push($scope.poolBettingMap[data[r]]);
            }
        }

        return out.join(', ');
    };

    $scope.$on('open.cashoutDialog', function (event, data) {
        $scope.cashoutPopup.active = true;
        $scope.cashoutPopup.sliderValue = 100;
        $scope.cashoutDialogType = 'cashout';
        $scope.cashoutBet = data;
        $scope.cashoutBet.originalPrice = data.cash_out;
        $scope.newCashoutData = {
            new_price: parseFloat(data.cash_out)
        };
        $scope.cashoutPopup.inputValue = $scope.cashoutBet.cash_out;
    });

    if (Config.main.betHistoryCashoutEnabled && (Config.env.sliderContent === 'recentBetsCashout' || Config.env.sliderContent === 'recentBets')) {
        sliderContentWatcherPromise = $scope.$watch('env.sliderContent', function (newValue, oldValue) {
            if ((newValue === 'recentBets' && oldValue === 'recentBetsCashout') || (newValue === 'recentBetsCashout' && oldValue === 'recentBets')) {
                $scope.loadMyBets();
            }
        });
    }

    $scope.$on('$destroy', function () {
        if (cashoutSubId) {
            Zergling.unsubscribe(cashoutSubId);
        }
        if (sliderContentWatcherPromise) {
            sliderContentWatcherPromise();
        }
        cashoutSubId = undefined;
    });

    /**
     * @ngdoc method
     * @name calculateProfitPrevMonth
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Month profit calculation for previous month
     */
    $scope.calculateProfitPrevMonth = function calculateProfitPrevMonth() {
        $scope.dataSelectedIndex = $scope.monthIndexes[1].toString();
        $scope.profit.checkAfterLoad = true;
        $scope.loadBetHistory();

    };

    /**
     * @ngdoc method
     * @name calculateProfitPrevMonth
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Month profit calculation for current month
     */
    $scope.calculateProfit = function calculateProfit(isThisMonth) {
        var request = {
            is_current_month: isThisMonth ? 1 : 0
        };

        Zergling.get(request, 'get_client_month_profit').then(function (response) {
            if (response && response.details) {
                $scope.profit.show = true;
                $scope.profit.result = response.details.profit;
                $scope.profit.checkAfterLoad = false;
            }
        });
        $scope.isThisMonth = isThisMonth;
    };

    /**
     * @ngdoc method
     * @name getGameInfo
     * @methodOf vbet5.controller:myBetsCtrl
     * @description Get game info from backend
     * @param {Object} event data
     */
    $scope.getGameInfo = function getGameInfo(event) {
        if (event.game_id && event.scores === undefined) {
            event.scores = false;
            Zergling.get({game_id: event.game_id}, 'get_result_games').then(function (response) {
                if (response && response.games && response.games.game && response.games.game.length) {
                    event.scores = response.games.game[0].scores;
                } else {
                    event.scores = Translator.get('Not Available');
                }
            }, function () {
                event.scores = Translator.get('Not Available');
            });
        }
    };

    /**
     * @ngdoc method
     * @name updateAfterCashout
     * @methodOf vbet5.controller:myBetsCtrl
     * @description updates cash out information of a specific event after a bet has been 'cashed out'
     */
    function updateAfterCashout(betId) {
        var request = {'where': { 'bet_id': betId }};

        $timeout(function() {
            Zergling.get(request, 'bet_history')
                .then(function(response) {
                    if (response && response.bets) {
                        var currentBets = Config.main.enableMixedView ? betHistory : allBets;
                        var cashedOutBet = response.bets[0];
                        for (var i = 0, length = currentBets.length; i < length; i++) {
                            if (currentBets[i].id === cashedOutBet.id) {
                                currentBets[i] = cashedOutBet;
                                break;
                            }
                        }
                        if (Config.main.enableMixedView) {
                            $scope.betHistory = currentBets
                        } else {
                            $scope.myBets = getVisibleBets(currentBets);
                        }
                    }
                });
        }, 950);

    }

    /**
     * @ngdoc method
     * @name changeCashoutValue
     * @methodOf vbet5.controller:myBetsCtrl
     * @description converts percent value(100% is the max cash-out price) to cash-out price
     */
    $scope.changeCashoutValue = function changeCashoutValue(value, calculated) {
        $scope.canCashOut = true;
        var minCashoutValue = ($rootScope.partnerConfig && $rootScope.partnerConfig.min_bet_stakes && $rootScope.partnerConfig.min_bet_stakes[$rootScope.profile.currency_name]) || 0.1;

        if (calculated < minCashoutValue) return;

        var price = 0.01 * calculated * value;

        if (price === 0) {
            $scope.canCashOut = false;
        }
        if (calculated >= 100 || $rootScope.conf.balanceFractionSize === 0) {
            price = Math.round(price);
        } else if (calculated >= 10) {
            price = Math.round(price * 10) / 10;
        } else {
            price = Math.round(price * 100) / 100;
        }

        price = $rootScope.conf.balanceFractionSize === 0 && price < 1 ? 1 : price;

        if (minCashoutValue <= calculated - price) {
            $scope.cashoutPopup.inputValue = price;
            $scope.newCashoutData.partial_price = price;
        } else {
            $scope.newCashoutData.partial_price = '';
            $scope.cashoutPopup.inputValue = calculated;
            $scope.newCashoutData.price = calculated;
        }
    };

    /**
     * @ngdoc method
     * @name changeBackCashoutValue
     * @methodOf vbet5.controller:myBetsCtrl
     * @description converts cash-out price to percent value
     */
    $scope.changeBackCashoutValue = function changeBackCashoutValue(calculated){
        if(isNaN(calculated)) {
            $scope.canCashOut = true;
            return;
        }

        var minCashoutValue = ($rootScope.partnerConfig && $rootScope.partnerConfig.min_bet_stakes && $rootScope.partnerConfig.min_bet_stakes[$rootScope.profile.currency_name]) || 0.1;
        minCashoutValue = parseFloat(minCashoutValue);
        var price = parseFloat($scope.cashoutPopup.inputValue);
        calculated = parseFloat(calculated);

        if (price < 0 || !price) {
            $scope.cashoutPopup.sliderValue = 0;
            $scope.canCashOut = false;
            return;
        } else if((price > calculated - minCashoutValue && price < calculated) || (price > calculated)) {
            $scope.cashoutPopup.sliderValue = 100;
            $scope.canCashOut = false;
            return;
        }

        if((calculated - price >= minCashoutValue) || price === calculated) {
            $scope.canCashOut = true;
            var value = price / (calculated * 0.01) ;
                value = Math.round(value);
                if(price === calculated) {
                    $scope.newCashoutData.partial_price = '';
                    $scope.cashoutPopup.sliderValue = value;
                    $scope.newCashoutData.price = price;
                } else {
                    $scope.cashoutPopup.sliderValue = value;
                    $scope.newCashoutData.partial_price = price;
                }
            }
    };

    /**
     * @ngdoc method
     * @name addEvents
     * @methodOf vbet5.controller:mixedMyBetsCtrl
     * @description place bet from bet history
     */
    $scope.addEvents = function addEvents(eventsFromBetHistory) {
        $scope.betHistoryLoaded = false;
        $rootScope.$broadcast('clearbets');
        var eventIds = [],
            betsToPlace = [],
            oddType = 'odd',
            bet;
        angular.forEach(eventsFromBetHistory.events, function(event) {
            if(event.outcome == null) {
                eventIds.push(event.selection_id);
            }
        });

        Zergling.get({
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order'],
                'competition': ['id', 'order', 'name'],
                'region': ['id', 'name', 'alias'],
                'game': ['id', 'team1_id', 'team1_name', 'team2_id', 'team2_name', 'type'],
                'market': ['base', 'type', 'name', 'express_id'],
                'event': []
            },
            'where': {
                'event': {
                    'id': {'@in': eventIds}
                }
            }
        }).then(function(response) {
            angular.forEach(response.data.sport, function(sport) {
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {
                            bet = {};
                            bet.gameInfo = game;
                            bet.gameInfo.competition = competition;
                            bet.gameInfo.region = region;
                            bet.gameInfo.sport = sport;
                            bet.gameInfo.title = game.team1_name + (game.team2_name ? ' - ' + game.team2_name : '');

                            angular.forEach(game.market, function(market) {
                                bet.marketInfo = market;
                                bet.marketInfo.name = $filter('improveName')(market.name, game);

                                angular.forEach(market.event, function(event) {
                                    bet.eventInfo = event;
                                    betsToPlace.push(bet);
                                });
                            });
                        });
                    });
                });
            });
            for (var i = 0; i < betsToPlace.length; i++) {
                if (!GameInfo.isEventInBetSlip(betsToPlace[i].eventInfo)) {
                    $rootScope.$broadcast('bet', {event: betsToPlace[i].eventInfo, market: betsToPlace[i].marketInfo, game: betsToPlace[i].gameInfo, oddType: oddType});
                }
            }
            $rootScope.env.showSlider=false;
            $rootScope.env.sliderContent='';
            $scope.betHistoryLoaded = true;

        });
        if($location.path() != '/sport/' && $location.path() != '/dashboard/' && $location.path() != '/multiview/' && $location.path() != '/livecalendar/') {
            $location.url('/sport/?type=1');
        }
    }
}]);


