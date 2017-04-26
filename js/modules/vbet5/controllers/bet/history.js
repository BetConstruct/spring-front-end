/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:myBetsCtrl
 * @description
 *  bet history controller.
 */
VBET5.controller('myBetsCtrl', ['$scope', 'Utils', 'ConnectionService', 'Zergling', 'Moment', 'Translator', 'Config', 'GameInfo', '$rootScope', '$window', '$filter', function ($scope, Utils, ConnectionService, Zergling, Moment, Translator, Config, GameInfo, $rootScope, $window, $filter) {
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

    $scope.profit = {
        show: false,
        result: 0
    };

    if (!$rootScope.gamePointers) {
        $rootScope.gamePointers = {};
    }
    var betHistory, BETS_PER_HISTORY_PAGE = 6;
    var sliderContentWatcherPromise;
    var connectionService = new ConnectionService($scope);

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
        });

        var betGameIds = Utils.objectToArray(betGameIdsObj);
        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'alias'],
                'region': ['id'],
                'competition': ['id'],
                'game': ['id']
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
                                                    'type': betEvent.is_live || '0',
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
     * @name updateEventChashouts
     * @methodOf vbet5.controller:myBetsCtrl
     * @description calculate bet cashouts
     * @param {object} data data from swarm
     */
    function updateEventChashouts(data) {
        angular.forEach(allBets, function (betData) {
            if (betData.type == '1' || betData.type == '2') {
                var hasInactiveEvents = false;
                var newCoef = 1;
                var amountCoefPow = 0; // count of unsettled events: used for GmsPlatform
                angular.forEach(betData.events, function (betEvent) {
                    var isEventActive = false;
                    angular.forEach(data.event, function (currentEvent) {
                        var betEventId = Config.main.GmsPlatform ? betEvent.selection_id : betEvent.id;
                        if (betEventId == currentEvent.id && currentEvent.price && currentEvent.price > 1) {
                            isEventActive = true;
                            newCoef *= currentEvent.price;
                            amountCoefPow += 1;
                        } else if (Config.main.GmsPlatform && betEvent.outcome === 3) {
                            isEventActive = true;
                        }
                    });
                    if (!isEventActive) {
                        hasInactiveEvents = true;
                    }
                });

                if (!hasInactiveEvents) {
                    var amountCoef = Config.main.GmsPlatform ? Math.pow(0.9, amountCoefPow) : betData.type == '1' ? 0.9 : 0.8;

                    betData.calculatedCashout =  ((betData.k / newCoef) * betData.amount * amountCoef).toFixed(Math.abs(($rootScope.currency && $rootScope.currency.rounding) || 0));
                    if (parseFloat(betData.calculatedCashout) == 0) {
                        betData.cashoutEnabled = false;
                    } else {
                        betData.cashoutEnabled = true;
                        if (betData.cash_out === '0' || (parseInt(Moment.get().format('x')/1000) - betData.date_time) < 20) {
                            Utils.setJustForMoment(betData, 'cashoutEnabled', false, 20000);
                        }
                    }
                } else {
                    betData.calculatedCashout = undefined;
                }
            }
        });
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
            connectionService
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
                updateEventChashouts,
                {
                    'thenCallback': function (response) {
                        cashoutSubId = response.subid;
                    }
                }
            );
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
            if (Config.main.poolBettingEnabled) {
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
                    fillBetsPointerInfo(response);
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
        if (Config.main.virtualSportIds.indexOf(parseInt(betEvent.sport_id, 10)) === -1 && $rootScope.gamePointers[betEvent.game_id]) {
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
            var i, iMax = 6, time;
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
                    str: time.format('MMMM YYYY'),
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
                        str: "· " + (fromDate.format('DD MMM') + " - " + toDate.format('DD MMM')),
                        type: 'week'
                    })
                }
                if (moreDaysCount > 0) {
                    fromDate = time.clone().add('days', j * 7);
                    toDate = fromDate.clone().add('days', moreDaysCount);
                    var str = moreDaysCount == 1 ? fromDate.format('DD MMM') : fromDate.format('DD MMM') + " - " + toDate.format('DD MMM');
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
            where.from_date = $scope.betHistoryParams.dateRange.fromDate;
            where.to_date = $scope.betHistoryParams.dateRange.toDate;
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
        if (Config.main.poolBettingEnabled && !isVivaroShuka && !$scope.betHistoryParams.betIdFilter) {
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
                    if (!(response.bets instanceof  Array)) {
                        var tempData = response.bets;
                        response.bets = [];
                        response.bets[0] = tempData;
                    }
                    fixBetItemNames(response.bets);
                    calculateLiability(response.bets);
                    calculateSystemCombinations(response.bets);
                    betHistory = response.bets;
                    if (response.result === -1) {
                        $scope.errorLoadingHistory = true;
                        return;
                    }
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
            var userId = $rootScope.profile && $rootScope.profile.unique_id ? $rootScope.profile.unique_id : '';
            var encodedBetData = encodeURIComponent(JSON.stringify(betData));
            $window.open('#/popup/?action=betprintpreview&userId=' + userId + '&data=' + encodedBetData, Config.main.skin + 'betprintpreview.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
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
        var price = parseFloat(suggested && suggested.new_price ? suggested.new_price : bet.calculatedCashout);
        Zergling.get({bet_id: bet.id, price: price}, 'cashout')
            .then(
                function (response) {
                    if (response.result === "Ok") {
                        $scope.cashoutDialogType = 'confirm';
                        $scope.cashoutSuccess = (response.details && (response.details.cash_out_price || response.details.price)) || true;
                    } else if (response.result === "Fail" && response.details && response.details.new_price) {
                        $scope.cashoutDialogType = 'cashout';
                        $scope.newCashoutData = response.details;
                        bet.cash_out = $scope.newCashoutData.new_price;
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
        $scope.cashoutDialogType = 'cashout';
        $scope.cashoutBet = data;
        $scope.cashoutBet.originalPrice = data.cash_out;
        $scope.newCashoutData = null;
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
}]);
