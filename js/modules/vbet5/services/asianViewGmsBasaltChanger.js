/* global VBET5 */
VBET5.service('asianViewGmsBasaltChanger', ['Config', 'Utils', '$filter', 'GameInfo', 'AsianMarkets', function (Config, Utils, $filter, GameInfo, AsianMarkets) {
    'use strict';

    var FIRST_HALF = ['HalfTimeResult', 'HalfTimeAsianHandicap', 'HalfTimeOverUnder', 'HalfTimeCorrectScore', '1stInningOver/Under', 'FirstHalfEvenOddTotal', 'HalfTimeCornersOverUnder', 'HalfTimeOverUnderAsian', 'HalfTimeAsianHandicapAsian', 'HalfTimeEvenOddTotal'];
    var SECOND_HALF = ['SecondHalfResult', '2ndHalfAsianHandicap', '2ndHalfTotalOver/Under', '2ndHalfCorrectScore', 'SecondHalfEvenOddTotal', 'SecondHalfTotalGoals'];
    var ACTIVE_SEQUENCES_GMS = ['MATCH', 'PERIOD', 'HALF', 'SET'];

    function eventCompareFunc(a, b) { return a.price - b.price;}

    /**
     * @ngdoc method
     * @name groupMarketEvents
     * @methodOf vbet5.controller:asianViewMainController
     * @description Performs special event grouping for market if needed
     *
     * @param {Object} market the market object
     * @returns {boolean} true if market events still need the generic grouping, false if no(when needed grouping is already done in this function)
     */
    function groupMarketEvents(market) {
        if (market.show_type === 'CORRECTSCORE' || market.display_key === 'CORRECT SCORE') {
            market.linesEvents = [];
            var columns = GameInfo.divideIntoColumns(market, 'correctScore');
            var leftCol = columns[0], midCol = columns[1], rightCol = columns[2];
            var maxLength = Math.max(leftCol.length, midCol.length, rightCol.length);
            for (var i = 0; i < maxLength; i++) {
                market.linesEvents.push({
                    firstWin: leftCol[i],
                    handicap: midCol[i],
                    secondWin: rightCol[i]
                });
            }
            return false;
        }
        if (market.show_type === 'OUTRIGHT' || market.display_key === 'OUTRIGHT') {
            market.events = Utils.objectToArray(market.event).sort(eventCompareFunc);
            return false;
        }
        return true;
    }

    function sortAvailableSequences(sequences) {
        var sort1 = function(a,b) {
            if(a.subKey === b.subKey){
                return a.sequence - b.sequence;
            }
            return a.subKey < b.subKey ? -1 : 1;
        };
        var sort2 = function(a,b) {
            if (a.subKey === Config.main.asian.firstSequence) {
                return -1;
            }
            if (b.subKey === Config.main.asian.firstSequence) {
                return 1;
            }
            return sort1(a, b);
        };
        sequences.sort(Config.main.asian && Config.main.asian.firstSequence ? sort2 : sort1);
    }

    function setGmsMarketSequence(market) {
        if(FIRST_HALF.indexOf(market.type) > -1) {
            market.sequence = 1;
        } else if(SECOND_HALF.indexOf(market.type) > -1) {
            market.sequence = 2;
        } else {
            market.sequence = parseInt(market.name, 10) || parseInt(market.type.replace(/[^\d.-]/g, ''), 10);
        }
    }

    /**
     * @ngdoc method
     * @name groupBySequenceAndTypes
     * @methodOf vbet5.controller:asianViewMainController
     * @description Performs grouping of markets by sequence and show_type.
     * additionally groups events inside markets
     *
     * @param {Object} game the game object
     */
    function groupBySequenceAndTypesForGms(game) {
        var markets = {};
        game.marketRows = {};
        var availableSequences = [];
        angular.forEach(game.market, function (market) {
            var groupingNeeded = groupMarketEvents(market);          // if special grouping is needed for market,
            if (groupingNeeded) {                                    // the normal grouping won't be done
                angular.forEach(market.event, function (event) {
                    var key = event.show_type || event.type_1 || event.type  || event.name;
                    key = key === 'W1' ? 'P1': (key === 'W2' ? 'P2': key);

                    market[key] = event;
                });
            }
            game.avalableMarketTypes = game.avalableMarketTypes || {};
            game.avalableMarketTypes[market.display_key] = market.display_key;

            if (market.display_sub_key) {
                if("PERIOD" === market.display_sub_key && 0 === market.sequence) {
                    setGmsMarketSequence(market);
                }

                if (ACTIVE_SEQUENCES_GMS.indexOf(market.display_sub_key) !== -1 && (!Utils.getArrayObjectElementHavingFieldValue(availableSequences, 'subKey', market.display_sub_key, true) ||
                    !Utils.getArrayObjectElementHavingFieldValue(availableSequences, 'sequence', market.sequence, true))) {
                    availableSequences.push({
                        'subKey': market.display_sub_key,
                        'sequence': market.sequence
                    });
                }
                markets[market.display_sub_key] = markets[market.display_sub_key] || {};
                markets[market.display_sub_key][market.sequence] = markets[market.display_sub_key][market.sequence] || {};
                markets[market.display_sub_key][market.sequence][market.display_key] = markets[market.display_sub_key][market.sequence][market.display_key] || [];
                markets[market.display_sub_key][market.sequence][market.display_key].push(market);


                game.marketRows[market.display_sub_key] = game.marketRows[market.display_sub_key] || {};
                game.marketRows[market.display_sub_key][market.sequence] =
                    Math.max(markets[market.display_sub_key][market.sequence][market.display_key].length, game.marketRows[market.display_sub_key][market.sequence] || 0);


            } else if (market.display_key) {
                markets[market.display_key] = markets[market.display_key] || [];
                markets[market.display_key].push(market);
            }
        });
        if (availableSequences.length) {
            sortAvailableSequences(availableSequences);
        }

        var defaultSelectedSequence = availableSequences[0];
        for (var i = 0, length = availableSequences.length; i < length; ++i)
        {
            if (game.selectedSequence) {
                if (availableSequences[i].subKey === game.selectedSequence.subKey && availableSequences[i].sequence === game.selectedSequence.sequence) {
                    defaultSelectedSequence = availableSequences[i];
                    break;
                }
            }
            if (Config.main.customSelectedSequenceInAsianSportsbook && Config.main.customSelectedSequenceInAsianSportsbook === availableSequences[i].subKey)
            {
                defaultSelectedSequence = availableSequences[i];
            }
        }

        game.availableSequences = availableSequences;
        game.selectedSequence = defaultSelectedSequence || game.availableSequences[0];

        var sortingFunc = function (a, b) {
            return a.main_order - b.main_order;
        };

        var dontNeedToBeSorted = AsianMarkets.ignoreMainOrderFor;
        angular.forEach(game.avalableMarketTypes, function(availableMarket) {
            if (!dontNeedToBeSorted[availableMarket]) {
                angular.forEach(markets, function (market) {
                    angular.forEach(market, function (seq) {
                        if (seq[availableMarket] && seq[availableMarket].length > 1) {
                            seq[availableMarket].sort(sortingFunc);
                        }
                    });
                });
            }
        });


        angular.forEach(game.marketRows, function (marketRow) {
            angular.forEach(marketRow, function (sequence, index) {
                marketRow[index] = new Array(marketRow[index]);
            });
        });
        game.halfTimeSequence = game.sport.alias + '1'; //  markets['1STHALF'] ? '1STHALF' : '2NDHALF';  //for now it always 1st half
        game.moreMarketsCount = game.markets_count - $filter("count")(game.avalableMarketTypes);
        game.markets = markets;
    }


    return groupBySequenceAndTypesForGms;
}]);
