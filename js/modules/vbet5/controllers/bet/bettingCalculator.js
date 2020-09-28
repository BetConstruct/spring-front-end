/**
 * @ngdoc controller
 * @name vbet5.controller:bettingCalculatorController
 * @description stand alone system calculator
 */
angular.module('vbet5').controller('bettingCalculatorController', ['$scope', '$rootScope','Utils', 'analytics', '$location', 'Config', 'BetService', function ($scope, $rootScope ,Utils, analytics, $location, Config, BetService) {
    'use strict';

    /**
     * @ngdoc method
     * @name init
     * @methodOf betting.controller:bettingCalculatorController
     * @description Initialization
     */
    $scope.init = function init() {
        analytics.gaSend('send', 'event', 'betting', 'betting calculator', {
            'page': $location.path(),
            'eventLabel': 'open'
        });
        $scope.calculator = new BetCalculator($scope);

    };

    $scope.resetCalculator = function () {
        $scope.calculator = new BetCalculator($scope);
    };

    /**
     * @ngdoc method
     * @name BetCalculator
     * @methodOf betting.controller:bettingCalculatorController
     * @description Initialization
     */
    function BetCalculator(n) {
        this.container = n;
        this.accumulatorCount = 0;
        this.baseStake = 1;
        this.stake = 10;
        this.perBetStack = 0;
        this.totalStake = 0;
        this.totalOdd = 0;
        this.totalOddEW = 0;
        this.betsCount = 1;
        this.totalProfit = 0;
        this.totalOdd = 0;
        this.maxMultipleEventCount = 20;
        this.maxSystemEventCount = 16;
        this.minSystemEventCount = 3;
        this.enableUKTypes = Config.betting.fullCoverBetTypes.enabled;

        var fullCoverTypesMap = BetService.constants.fullCoverTypesMap;
        var fullCoverAdditionalTypesMap = BetService.constants.fullCoverAdditionalTypesMap;



        this.betTypes = [
            {
                name: "Trixie",
                betCount: 3,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 9,
                globalType: 4
            }, {
                name: "Yankee",
                betCount: 4,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 10,
                globalType: 4
            }, {
                name: "Canadian / Super Yankee",
                betCount: 5,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 11,
                globalType: 4
            }, {
                name: "Patent",
                betCount: 3,
                isAccumulator: true,
                isSingle: true,
                addrow: true,
                removerow: true,
                value: 12,
                globalType: 4
            }, {
                name: "Lucky 15",
                betCount: 4,
                isAccumulator: true,
                isSingle: true,
                addrow: true,
                removerow: true,
                value: 13,
                globalType: 4
            }, {
                name: "Lucky 31",
                betCount: 5,
                isAccumulator: true,
                isSingle: true,
                addrow: true,
                removerow: true,
                value: 14,
                globalType: 4
            }, {
                name: "Lucky 63",
                betCount: 6,
                isAccumulator: true,
                isSingle: true,
                addrow: true,
                removerow: true,
                value: 15,
                globalType: 4
            }, {
                name: "Heinz",
                betCount: 6,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 16,
                globalType: 4
            }, {
                name: "Super Heinz",
                betCount: 7,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 17,
                globalType: 4
            }, {
                name: "Goliath",
                betCount: 8,
                isAccumulator: true,
                isSingle: false,
                addrow: true,
                removerow: true,
                value: 18,
                globalType: 4
            }, {
                name: "Super Heinz with Singles",
                betCount: 7,
                isAccumulator: true,
                isSingle: true,
                addrow: true,
                removerow: true,
                value: 19,
                globalType: 4
            }, {
                name: "Super Goliath",
                betCount: 8,
                isAccumulator: true,
                isSingle: true,
                addrow: false,
                removerow: true,
                value: 20,
                globalType: 4
            }];



        this.createSystemTypes = function (minSystemEventCount, maxSystemEventCount, withSingles) {
            for (var betCount = minSystemEventCount; betCount <= maxSystemEventCount; betCount++) {
                var _betCount = withSingles ? betCount + 1 : betCount;
                for (var systemValue = minSystemEventCount; systemValue < _betCount; systemValue++) {
                    var globalType = 3; // system
                    var name = "System " + systemValue + "/" + betCount;
                    var isSingle = false;
                    var isAccumulator = true;

                    if (systemValue !== 1 && systemValue === betCount) {
                        globalType = 2; // express
                        name = 'Express';
                        isAccumulator = false;
                    } else if (systemValue === 1) {
                        globalType = 1; // single
                        name = 'Singles';
                        isSingle = true;
                    }

                    if (this.enableUKTypes) {
                        globalType = 4 // uk
                    }
                    this.betTypes.push(
                        {
                            name: name,
                            betCount: betCount,
                            sysValue: systemValue,
                            isAccumulator: isAccumulator,
                            isSingle: isSingle,
                            addrow: maxSystemEventCount !== betCount,
                            removerow: betCount > 1,
                            value: this.betTypes.length + 1,
                            globalType: globalType
                        });
                }
            }
        };


        this.createSystemTypes(1,this.maxSystemEventCount,true);




        if (this.enableUKTypes) {
            angular.forEach(this.betTypes, function (type) {
                var betTypes;
                var betType;
                var name;
                if (type.globalType === 4) { // UK
                    if (!type.sysValue) {
                        betTypes = fullCoverAdditionalTypesMap[type.betCount];
                        betType = (betTypes && betTypes[type.isSingle ? 1 : 0]);
                        name = betType ? betType.name : null;
                    } else {
                        betType = fullCoverTypesMap[type.sysValue > 3 ? 'default' : type.sysValue];
                        name =  (type.sysValue > 3 ? type.sysValue + ' ' + betType : betType);
                    }

                    type.name = name;
                }
            });
        }


        this.selectedBetType = this.betTypes[23];
        this.ewChecked = false;
        this.rfChecked = false;
        this.dhChecked = false;


        /**
         * @ngdoc method
         * @name decimalOddRounding
         * @methodOf betting.controller:bettingCalculatorController
         * @description decimal odds rounding
         */
        this.decimalOddRounding = function decimalOddRounding(value) { // todo
            return value;
        };

        function formatDecimal(value) {
            return Utils.formatDecimal(value, $rootScope.partnerConfig.price_round_method, $rootScope.partnerConfig.price_decimals);
        }

        function formatMultipleOdd(value) {
            return Utils.formatDecimal(value, $rootScope.partnerConfig.price_round_method, ($rootScope.partnerConfig.multiple_price_decimals || 3));
        }

        function roundPossibleWin(value) {
            return ($rootScope.partnerConfig.multiple_possiblewin_round_method === 0)? Utils.cuttingDecimals(value, $rootScope.conf.balanceFractionSize).toFixed($rootScope.conf.balanceFractionSize) : Utils.bankersRounding(value, $rootScope.conf.balanceFractionSize);

        }

        // Utils.formatDecimal

        this.getSpecialKeys = function () {
            var n = ["Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab"];
            for (i = 1; i <= 12; i++) {
                n.push("F" + i);
            }

            return n;
        };
        this.getCompareValue = function (n, t, i, r) {
            return n.substr(0, t) + r + n.substr(i, n.length);
        };

        this.fractToDecimDown = function (row) {
            var t = parseInt(row.odd_fractional_pricedown),
                i = parseInt(row.odd_fractional_priceup),
                r = i / t + 1;
            row.odd_decimal = this.decimalOddRounding(r);
            this.Calc();
        };
        this.fractToDecim = function (row) {
            var t = parseInt(row.odd_fractional_priceup),
                i = parseInt(row.odd_fractional_pricedown),
                r = t / i + 1;
            row.odd_decimal = this.decimalOddRounding(r);
            this.Calc();
        };
        this.decimToFract = function (row) {
            row.odd_decimal = formatMultipleOdd(row.odd_decimal);
            var t = row.odd_decimal - 1;

            var r = Math.round(t) + "/1";
            var e = Math.round(t);
            var o = Math.abs(e - t), f, u;
            for (var i = 2; i <= 200; i++) if (f = Math.round(t * i) / i, u = Math.abs(f - t), u < o) {
                if (r = Math.round(t * i) + "/" + i, e = f, u == 0) break;
                o = u
            }
            r = r.split("/");
            row.odd_fractional_priceup = parseInt(r[0]) || 1;
            row.odd_fractional_pricedown = parseInt(r[1]) || 1;
            this.Calc();
        };
        this.ToggleEachWay = function () {
            if (!this.ewChecked) {
                for (var i = 0; i < this.BetSlipRows.length; i++) {
                    if (this.BetSlipRows[i].wp_option === 'placed') {
                        this.BetSlipRows[i].wp_option = 'win';
                    }
                }
            }

            this.Calc();
        };
        this.ToggleRule4 = function () {
            this.Calc();
        };
        this.ToggleDeadHeat = function () {
            this.Calc();
        };

        this.GetBetInfo = function (index) {
            var result = {};
            var row = this.BetSlipRows[index];
            if (row) {
                var odd_fractional_priceup = parseInt(row.odd_fractional_priceup);
                var odd_fractional_pricedown = parseInt(row.odd_fractional_pricedown);
                var odd_decimal = this.decimalOddRounding(odd_fractional_pricedown <= 0 || odd_fractional_priceup <= 0 ? Number.NaN : odd_fractional_priceup / odd_fractional_pricedown);
                var ewDecimal = this.decimalOddRounding(row.ew_option);
                var rule4 = parseFloat(row.rule_4) / 100, dh_option;

                (isNaN(rule4) || rule4 < 0 || !this.rfChecked) && (rule4 = 0);
                dh_option = parseInt(row.dh_option);
                (isNaN(dh_option) || !this.dhChecked) && (dh_option = 1);

                result = {
                    PriceDecimal: odd_decimal,
                    EwDecimal: ewDecimal,
                    Rule4: rule4,
                    DeadHeat: dh_option,
                    Result: row.wp_option
                };
            }
            return result;
        };

        this.systemCombinations = {};
        this.addSystemCompination = function (system) {
           var systemName = this.enableUKTypes ? (system > 3 ? system + ' ' + fullCoverTypesMap['default'] : fullCoverTypesMap[system]) : system;
            if (!this.systemCombinations[systemName]) {
                this.systemCombinations[systemName] = 1;
            } else {
                this.systemCombinations[systemName]++;
            }
        };

        this.Calc = function () {
            var ewChecked = this.ewChecked;
            this.baseStake = 1;
            this.totalOdd = 0;
            this.totalOddEW = 0;
            this.perBetStack = 0;
            this.totalStake = 0;
            this.betsCount = 0;
            this.systemCombinations = {};
            this.CalcOddReturn(0, this.baseStake, this.baseStake);
            if (ewChecked) {
                this.totalOdd += this.totalOddEW;
                this.totalStake = 2 * this.totalStake;
                this.betsCount = 2 * this.betsCount;
            }

            this.perBetStack = formatDecimal(this.selectedStackType === 'total' ? this.stake / this.betsCount: this.stake).toFixed(2);
            var stackK =  this.perBetStack / this.baseStake;

            this.totalStake = formatDecimal(this.totalStake * stackK);
            this.totalOdd = this.totalOdd / this.betsCount;
            this.totalWin = roundPossibleWin(this.totalOdd * stackK * this.betsCount);
            this.totalProfit = roundPossibleWin(this.totalWin - this.totalStake);
        };
        this.CalcOddReturn = function (index, totalOdd, odd, system) {
            system = system || 1;
            var betCount = this.selectedBetType.betCount;
            var rowIndex;
            var betInfo;
            var returnOdd;
            var returnEWOdd;
            if (this.accumulatorCount > this.selectedBetType.betCount) {
                betCount = this.accumulatorCount;
            }

            for (rowIndex = index; rowIndex < betCount; rowIndex++) {
                betInfo = this.GetBetInfo(rowIndex);
                if (!(isNaN(betInfo.PriceDecimal) && this.selectedBetType.name === "Accumulator")) {
                    returnOdd = this.calcReturnOdds(totalOdd, false, betInfo);
                    returnEWOdd = this.calcReturnOdds(odd, true, betInfo);

                    if (this.selectedBetType.isAccumulator) {
                        if ((index !== 0) || this.selectedBetType.isSingle) {
                            if (this.selectedBetType.sysValue) {
                                if (this.selectedBetType.sysValue === system) {
                                    this.totalOdd += formatMultipleOdd(returnOdd);
                                    this.totalOddEW += formatMultipleOdd(returnEWOdd);
                                    this.totalStake += this.baseStake;
                                    this.betsCount++;
                                    this.addSystemCompination(system);
                                }
                            } else {
                                this.totalOdd += formatMultipleOdd(returnOdd);
                                this.totalOddEW += formatMultipleOdd(returnEWOdd);
                                this.totalStake += this.baseStake;
                                this.betsCount++;
                                this.addSystemCompination(system);
                            }
                        }
                        this.CalcOddReturn(rowIndex + 1, returnOdd, returnEWOdd, 1 + (system || 1));
                    } else {
                        this.totalOdd = returnOdd;
                        totalOdd = returnOdd;
                        this.totalOddEW = returnEWOdd;
                        odd = returnEWOdd;
                        this.totalStake = this.baseStake;
                        this.betsCount = 1;
                    }
                }
            }
        };
        this.calcReturnOdds = function (odd, ew, betInfo) {

            if (betInfo.Result === 'return') {
                betInfo.PriceDecimal = 0;
                betInfo.EwDecimal = 0;
                betInfo.Result = 'win';
            }

            var result;
            if (betInfo.Result === "lost") {
                result = 0;
            } else {
                if (!ew && betInfo.Result === "win") {
                    result = (odd + betInfo.PriceDecimal * odd - betInfo.PriceDecimal * odd * betInfo.Rule4) / betInfo.DeadHeat
                } else {
                    if (ew && (betInfo.Result === "win" || betInfo.Result === "placed")) {
                        result = odd + betInfo.PriceDecimal * betInfo.EwDecimal * odd - betInfo.PriceDecimal * betInfo.EwDecimal * odd * betInfo.Rule4
                    } else {
                        result = 0;
                    }
                }
            }
            return result;
        };

        this.setOptionForAll = function (option_name, value) {
            for (var i = 0; i < this.BetSlipRows.length; i++) {
                this.BetSlipRows[i][option_name] = value;
            }
            this.Calc();
        };

        this.ewOptions = [
            {name: '1/1', value: "1"},
            {name: '1/2', value: "0.5"},
            {name: '1/3', value: "0.333333"},
            {name: '1/4', value: "0.25"},
            {name: '1/5', value: "0.2"}

        ];
        this.dhOptions = [
            {
                name: '-',
                value: '1'
            },
            {
                name: '2 horses',
                value: '2'
            },
            {
                name: '3 horses',
                value: '3'
            },
            {
                name: '4 horses',
                value: '4'
            }
        ];

        this.wpOptions = [
            {
                name: 'Win',
                value: 'win'
            },
            {
                name: 'Lose',
                value: 'lost'
            },
            {
                name: 'Returned',
                value: 'return'
            },
            {
                name: 'Placed',
                value: 'placed'
            }
        ];


        this.oddTypes = [
            {name: 'Decimal', value: 'decimal'},
            {name: 'Fractional', value: 'fractional'}
        ];

        this.stackTypes = [
            {name: 'Per Selection', value: 'unit'},
            {name: 'Total combined bet', value: 'total'}
        ];

        this.selectedStackType = this.stackTypes[0].value;

        this.filterOddTypes = function () {
            var filteredOddTypes = [];
            var oddTypes = this.oddTypes;
            angular.forEach(Config.main.oddFormats, function (confType) {
                angular.forEach(oddTypes, function (type) {
                    if (confType.format === type.value) {
                        filteredOddTypes.push(type);
                    }
                });
            });

            if (filteredOddTypes.length) {
                this.oddTypes = filteredOddTypes;
            } else {
                this.oddTypes = [oddTypes[0]];
            }
        };

        this.filterOddTypes();
        this.selectedOddType = this.oddTypes[0].value;

        this.BetSlipRows = [{
            odd_decimal: 2,
            odd_fractional_priceup: 1,
            odd_fractional_pricedown: 1,
            ew_option: this.ewOptions[2].value,
            rule_4: 0,
            dh_option: '1',
            wp_option: 'win'

        }];
        this.BuildBetSlipRows = function (betCount /*n*/, rowCount /*t*/, i) {
            var o, f, r, s, u, e;
            if (betCount < rowCount) {
                this.BetSlipRows = this.BetSlipRows.slice(0, betCount)
            } else {
                for (o = betCount - rowCount, f = 0; f < o; f++) {
                    r = angular.copy(this.BetSlipRows[0]);
                    r.odd_decimal = 2;
                    r.wp_option = 'win';
                    r.odd_fractional_priceup = r.odd_fractional_pricedown = 1;

                    this.BetSlipRows.push(r);
                    u = this;
                }
            }
        };

        this.filterBetTypes = function () {
            var eventsCount = this.BetSlipRows.length;
            var enableUKtypes = this.enableUKTypes;
            var selectedBetTypeGlobalType = this.selectedBetType && this.selectedBetType.globalType;

            this.filteredBetTypes = this.betTypes.filter(function (type) {
                return  type.betCount === eventsCount && type.name && (!enableUKtypes ? type.globalType !== 4 : true);
            });

            this.selectedBetType = this.filteredBetTypes[0];

            if(selectedBetTypeGlobalType &&  this.filteredBetTypes.length > 1 &&  this.filteredBetTypes[0].globalType !== selectedBetTypeGlobalType){
               var filteredByGlobalType = this.filteredBetTypes.filter(function (type) {
                    return type.globalType === selectedBetTypeGlobalType;
                });

                if(filteredByGlobalType && filteredByGlobalType.length){
                    this.selectedBetType = filteredByGlobalType[0];
                }
            }
        };


        this.CreateBetList = function () {
            if (this.selectedBetType) {
                var rowCount = this.BetSlipRows.length;
                var betCount = this.selectedBetType.betCount;
                this.selectedBetType.name !== "Accumulator" ? this.accumulatorCount = 0 : betCount = rowCount;
                if (this.selectedBetType !== null) {
                    this.BuildBetSlipRows(betCount, rowCount, false);
                    this.Calc();
                }
            }
        };
        this.addRow = function () {
            var n = this.BetSlipRows.length;
            this.BuildBetSlipRows(n + 1, n, false);
            this.filterBetTypes();
            this.Calc();
        };


        this.removeRow = function (index) {
            this.BetSlipRows.splice(index, 1);
            this.accumulatorCount--;
            var n = this.BetSlipRows.length - 1;

            this.BuildBetSlipRows(this.BetSlipRows.length, this.BetSlipRows.length, true);
            this.filterBetTypes();
            this.Calc();
        };

        this.filterBetTypes();
        this.CreateBetList();

    }


}]);
