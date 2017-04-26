/**
 * Created by anna on 5/4/16.
 */
angular.module('vbet5').service('asianViewGmsBasaltChanger', ['Config', 'Utils', '$filter', function (Config, Utils, $filter) {

    function eventCompareFunc(a, b) { return a.price - b.price;}
    var correctScorePattern = /\d:\d/;

    var FIRST_HALF = ['HalfTimeResult', 'HalfTimeAsianHandicap', 'HalfTimeOverUnder', 'HalfTimeCorrectScore', '1stInningOver/Under'];
    var SECOND_HALF = ['SecondHalfResult', '2ndHalfAsianHandicap', '2ndHalfTotalOver/Under', '2ndHalfCorrectScore'];
    var ACTIVE_SEQUENCES_GMS = ['MATCH', 'PERIOD', 'HALF', 'SET'];
    function handicapSortFunc(market1, market2) {
        if (!market1.hasOwnProperty('Handicap1') || !market1.hasOwnProperty('Handicap2')) {
            return 1;
        }
        if (!market2.hasOwnProperty('Handicap1') || !market2.hasOwnProperty('Handicap2')) {
            return -1;
        }
        return Math.abs(market1.Handicap1.price - market1.Handicap2.price) - Math.abs(market2.Handicap1.price - market2.Handicap2.price);
    }

    function overUnderSortFunc(market1, market2) {
        if (!market1.hasOwnProperty('OVER') || !market1.hasOwnProperty('UNDER')) {
            return 1;
        }
        if (!market2.hasOwnProperty('OVER') || !market2.hasOwnProperty('UNDER')) {
            return -1;
        }
        return Math.abs(market1.OVER.price - market1.UNDER.price) - Math.abs(market2.OVER.price - market2.UNDER.price);
    }
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
            var scores, index1 = 0, index2 = 0, index3 = 0;
            market.linesEvents = [];
            angular.forEach(market.event, function (event) {
                event.scores = '' + (correctScorePattern.exec(event.name) || event.name);
                scores =  event.scores.split("-");
                if (scores[0] > scores[1]) {
                    market.linesEvents[index1] = market.linesEvents[index1] || {};
                    market.linesEvents[index1++].firstWin = event;
                } else if (scores[0] < scores[1]) {
                    market.linesEvents[index2] = market.linesEvents[index2] || {};
                    market.linesEvents[index2++].secondWin = event;
                } else {
                    market.linesEvents[index3] = market.linesEvents[index3] || {};
                    market.linesEvents[index3++].handicap = event;
                }
            });
            return false;
        }
        if (market.show_type === 'OUTRIGHT' || market.display_key === 'OUTRIGHT') {
            market.events = Utils.objectToArray(market.event).sort(eventCompareFunc);
            return false;
        }
        return true;
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
    function groupBySequenceAndTypesForGms(game, AsianMarkets) {
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

                availableSequences[market.display_sub_key] = availableSequences[market.display_sub_key] || [];

                if (ACTIVE_SEQUENCES_GMS.indexOf(market.display_sub_key) !== -1 && (!Utils.getArrayObjectElementHavingFieldValue(availableSequences, 'subKey', market.display_sub_key, true)
                    || !Utils.getArrayObjectElementHavingFieldValue(availableSequences, 'sequence', market.sequence, true))) {
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

        if (game.avalableMarketTypes.HANDICAP) {
            angular.forEach(markets, function (market) {
                angular.forEach(market, function (seq) {
                    if (seq.HANDICAP && seq.HANDICAP.length > 1) {
                        seq.HANDICAP.sort(sortingFunc);
                    }
                })
            });
        }

        var sportType = AsianMarkets.marketsBySport[game.sport.alias] || AsianMarkets.marketsBySport.Default;
        var pointsTypeForMarket = sportType.HDP[sportType.HDP.length - 1];
        if (game.avalableMarketTypes[pointsTypeForMarket]) {
            angular.forEach(markets, function (market) {
                angular.forEach(market, function (seq) {
                    if (seq[pointsTypeForMarket] && seq[pointsTypeForMarket].length > 1) {
                        seq[pointsTypeForMarket].sort(sortingFunc);
                    }
                });
            });
        }

        angular.forEach(game.marketRows, function (marketRow, key) {
            angular.forEach(marketRow, function (sequence, index) {
                marketRow[index] = new Array(marketRow[index]);
            });
        });
        game.halfTimeSequence = game.sport.alias + '1'; //  markets['1STHALF'] ? '1STHALF' : '2NDHALF';  //for now it always 1st half
        game.moreMarketsCount = game.markets_count - $filter("count")(game.avalableMarketTypes);
        game.markets = markets;
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
    function groupBySequenceAndTypesForBasalt(game, AsianMarkets) {
        var markets = {};
        game.marketRows = {};
        game.availableSequences = game.availableSequences || [];
        angular.forEach(game.market, function (market) {
            var groupingNeeded = groupMarketEvents(market);          // if special grouping is needed for market,
            if (groupingNeeded) {                                    // the normal grouping won't be done
                angular.forEach(market.event, function (event) {
                    market[event.show_type || event.type] = event;
                });
            }
            game.avalableMarketTypes = game.avalableMarketTypes || {};
            game.avalableMarketTypes[market.show_type] = market.show_type;

            if (market.sequence) {
                if (game.availableSequences.indexOf(market.sequence) === -1) {
                    game.availableSequences.push(market.sequence);
                }
                markets[market.sequence] = markets[market.sequence] || {};
                markets[market.sequence][market.show_type] = markets[market.sequence][market.show_type] || [];
                markets[market.sequence][market.show_type].push(market);
                game.marketRows[market.sequence] = Math.max(markets[market.sequence][market.show_type].length, game.marketRows[market.sequence] || 0);
            }
        });
        if (game.availableSequences.length) {
            game.availableSequences.sort(function(a,b) {
                return a.subKey > b.subKey;
            });
         //   markets = Utils.objectToArray(game.market);
        }

        if (!game.selectedSequence) {
            if (Config.main.customSelectedSequenceInAsianSportsbook) {
                angular.forEach(game.availableSequences, function (sequences) {
                    if (Config.main.customSelectedSequenceInAsianSportsbook === sequences) {
                        game.selectedSequence = sequences;
                    }
                });
            }
            game.selectedSequence = game.selectedSequence || game.availableSequences[0];
        }

        if (game.avalableMarketTypes.HANDICAP) {
            angular.forEach(markets, function (seq) {
                if (seq.HANDICAP && seq.HANDICAP.length > 1) {
                    seq.HANDICAP.sort(handicapSortFunc);
                }
            });
        }

        var sportType = AsianMarkets.marketsBySport[game.sport.alias] || AsianMarkets.marketsBySport.Default;
        var pointsTypeForMarket = sportType.HDP[sportType.HDP.length - 1];
        if (game.avalableMarketTypes[pointsTypeForMarket]) {
            angular.forEach(markets, function (seq) {
                if (seq[pointsTypeForMarket] && seq[pointsTypeForMarket].length > 1) {
                    seq[pointsTypeForMarket].sort(overUnderSortFunc);
                }
            });
        }

        angular.forEach(game.marketRows, function (marketRow, key) {
            game.marketRows[key] = new Array(game.marketRows[key] - 1);
        });
        game.halfTimeSequence = '1STHALF'; //  markets['1STHALF'] ? '1STHALF' : '2NDHALF';  //for now it always 1st half
        game.moreMarketsCount = game.markets_count - $filter("count")(game.avalableMarketTypes);
        game.markets = markets;
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
    function groupByTypesAndSequenceForGms(game) {
        var markets = {};
        game.marketRows = {};
        game.otherMarkets = [];
        game.availableSequences = {};
        game.selectedSequence = game.selectedSequence || {};
        var currentSequence;
        angular.forEach(game.market, function (market) {

            var groupingNeeded = groupMarketEvents(market);          // if special grouping is needed for market,
            if (groupingNeeded) {                                    // the normal grouping won't be done
                angular.forEach(market.event, function (event) {
                    var key = event.show_type || event.type_1 || event.type;
                    key = key === 'W1' ? 'P1': (key === 'W2' ? 'P2': key);
                    market[key] = event;
                });
            }
            if(market.display_key === "HANDICAP") {
                console.log("market");
            }

            if("PERIOD" === market.display_sub_key && 0 === market.sequence) {
                setGmsMarketSequence(market);
            }
            currentSequence = "PERIOD" === market.display_sub_key ? game.sport.alias + market.sequence : market.display_sub_key;

            if (market.display_key) {
                game.availableSequences[market.display_key] = game.availableSequences[market.display_key] || [];
                if (currentSequence) {
                    if(ACTIVE_SEQUENCES_GMS.indexOf(market.display_sub_key) !== -1 && (!Utils.getArrayObjectElementHavingFieldValue(game.availableSequences[market.display_key], 'subKey', market.display_sub_key)
                        || !Utils.getArrayObjectElementHavingFieldValue(game.availableSequences[market.display_key], 'sequence', market.sequence))) {
                        game.availableSequences[market.display_key].push({
                            'subKey': market.display_sub_key,
                            'sequence': market.sequence
                        });
                    }
                }
                if (market.display_sub_key) {
                    markets[market.display_key] = markets[market.display_key] || {};
                    markets[market.display_key][market.display_sub_key] = markets[market.display_key][market.display_sub_key] || {};
                    markets[market.display_key][market.display_sub_key][market.sequence] = markets[market.display_key][market.display_sub_key][market.sequence] || [];
                    markets[market.display_key][market.display_sub_key][market.sequence].push(market);
                } else if (market.display_key) {
                    markets[market.display_key] = markets[market.display_key] || [];
                    markets[market.display_key].push(market);
                }
            } else {
                game.otherMarkets.push(market);
            }
        });

        angular.forEach(game.availableSequences, function (sequences, key) {
            sortAvailableSequences(sequences);

            if (!game.selectedSequence[key]) {
                if (Config.main.customSelectedSequenceInAsianSportsbook) {
                    var i, length = sequences.length;
                    for (i = 0; i < length; i += 1) {
                        if (sequences[i].subKey === Config.main.customSelectedSequenceInAsianSportsbook) {
                            game.selectedSequence[key] = sequences[i];
                            break;
                        }
                    }
                    game.selectedSequence[key] = game.selectedSequence[key] || sequences[0];
                }
            }
        });

        angular.forEach(game.marketRows, function (marketRow, key) {
            game.marketRows[key] = new Array(game.marketRows[key] - 1);
        });

        game.markets = markets;
    }

    function sortAvailableSequences(sequences) {
        var sort1 = function(a,b) {
            if(a.subKey === b.subKey){
                return a.sequence > b.sequence;
            }
            return a.subKey > b.subKey;
        };
        var sort2 = function(a,b) {
            if (a.subKey === Config.main.asian.firstSequence) {
                return -1;
            }
            if (b.subKey === Config.main.asian.firstSequence) {
                return 1;
            }
            if(a.subKey === b.subKey){
                return a.sequence > b.sequence;
            }
            return a.subKey > b.subKey;
        };
        sequences.sort(Config.main.asian && Config.main.asian.firstSequence ? sort2 : sort1);
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
    function groupByTypesAndSequenceForBazalt(game) {
        var markets = {};
        game.marketRows = {};
        game.otherMarkets = [];
        game.availableSequences = {};
        game.selectedSequence = game.selectedSequence || {};
        angular.forEach(game.market, function (market) {

            var groupingNeeded = groupMarketEvents(market);          // if special grouping is needed for market,
            if (groupingNeeded) {                                    // the normal grouping won't be done
                angular.forEach(market.event, function (event) {
                    market[event.show_type || event.type] = event;
                });
            }
            if (market.show_type) {
                game.availableSequences[market.show_type] = game.availableSequences[market.show_type] || [];
                if (market.sequence) {
                    if (game.availableSequences[market.show_type].indexOf(market.sequence) === -1) {
                        game.availableSequences[market.show_type].push(market.sequence);
                    }
                    game.availableSequences[market.show_type].sort();
                    game.selectedSequence[market.show_type] = game.selectedSequence[market.show_type] || game.availableSequences[market.show_type][0];

                }
                markets[market.show_type] = markets[market.show_type] || {};
                markets[market.show_type][market.sequence] = markets[market.show_type][market.sequence] || [];
                markets[market.show_type][market.sequence].push(market);
            } else {
                game.otherMarkets.push(market);
            }
        });
        if (markets.HANDICAP) {
            angular.forEach(markets.HANDICAP, function (seq) {
                if (seq.length > 1) {
                    seq.sort(handicapSortFunc);
                }
            });
        }
        angular.forEach(game.marketRows, function (marketRow, key) {
            game.marketRows[key] = new Array(game.marketRows[key] - 1);
        });

        game.markets = markets;
    }

    function setGmsMarketSequence(market) {
        //market.sequence = FIRST_HALF.indexOf(market.market_type) > -1 ? 1 : SECOND_HALF.indexOf(market.market_type) > -1 ? 2 : parseInt(market.name);
        if(FIRST_HALF.indexOf(market.market_type) > -1) {
            market.sequence = 1;
        } else if(SECOND_HALF.indexOf(market.market_type) > -1) {
            market.sequence = 2;
        } else {
            market.sequence = parseInt(market.name) || parseInt(market.market_type.replace(/[^\d.-]/g, ''));
        }
    }

    return {
        groupBySequenceAndTypes: Config.main.GmsPlatform ? groupBySequenceAndTypesForGms : groupBySequenceAndTypesForBasalt,
        groupByTypesAndSequence: Config.main.GmsPlatform ? groupByTypesAndSequenceForGms : groupByTypesAndSequenceForBazalt
    }
}]);