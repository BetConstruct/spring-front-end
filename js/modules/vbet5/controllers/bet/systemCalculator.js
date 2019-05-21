/**
 * @ngdoc controller
 * @name vbet5.controller:systemCalculatorController
 * @description stand alone system calculator
 */
angular.module('vbet5').controller('systemCalculatorController', ['$scope', 'Utils', 'analytics', '$location','Translator', function ($scope, Utils, analytics, $location, Translator) {
    'use strict';

    /**
     * @ngdoc method
     * @name init
     * @methodOf betting.controller:systemCalculatorController
     * @description Initialization
     */
    $scope.init = function init () {

        analytics.gaSend('send', 'event', 'betting', 'system calculator', {'page': $location.path(), 'eventLabel': 'open'});
        var maxSystemEventCount = 16;
        var minSystemEventCount = 3;
        $scope.systemPicker = [];
        $scope.result = {win: 0, options: 0};


        for (var i=minSystemEventCount; i <= maxSystemEventCount; i++){
            for (var j=minSystemEventCount - 1; j < i; j++){
                $scope.systemPicker.push({label: (j + ' / '+ i), sysValue: j, eventCount: i});
            }
        }

        $scope.params = {
            selectedSysOption: $scope.systemPicker[0],
            events: [],
            stake: 0,
            stakePerBet: 0
        };

        $scope.resetCalculator();
    };

    /**
     * @ngdoc method
     * @name calculateSystemPossibleWin
     * @methodOf betting.controller:systemCalculatorController
     * @returns {Object} possible win and options count
     * @description calculate system possible winning sets system selected value
     */
    function calculateSystemPossibleWin() {
        var tempPosWin = 0;
        var indexArray = [];
        var indexMaxArray = [];
        var tempOdd;
        var tempIterator;
        var numOfSysOptions;
        var sysPerBetStake;
        var k = $scope.params.selectedSysOption.sysValue;
        var i;
        for (i = 0; i < k; i++) {
            indexArray[i] = i;
            indexMaxArray[i] = $scope.params.events.length - i;
        }

        indexMaxArray = indexMaxArray.reverse();
        tempIterator = k - 1;

        var m, j;
        while (indexArray[0] <= indexMaxArray[0]) {
            if (indexArray[tempIterator] < indexMaxArray[tempIterator]) {
                if (tempIterator !== k - 1) {
                    tempIterator = k - 1;
                    continue;
                }
                tempOdd = 1;
                for (m = 0; m < k; m++) {
                    if ($scope.params.events[indexArray[m]].flag === 0) {
                        tempOdd *= $scope.params.events[indexArray[m]].odd;
                    } else if ($scope.params.events[indexArray[m]].flag === 1) {
                        tempOdd = 0;
                    }

                }

                //tempPosWin += tempOdd;
                tempPosWin = (tempPosWin * 10 * 10 + Utils.mathCuttingFunction(tempOdd * 10 * 10)) / 100;

                indexArray[tempIterator]++;
            } else {
                tempIterator--;

                indexArray[tempIterator]++;

                for (j = tempIterator; j < k - 1; j++) {
                    indexArray[j + 1] = indexArray[j] + 1;
                }
            }
        }

        numOfSysOptions = Math.round(
            Utils.factorial($scope.params.events.length) / (Utils.factorial(k) * Utils.factorial($scope.params.events.length - k))
        );

        sysPerBetStake = $scope.params.stake / numOfSysOptions;

        //$scope.params.stakePerBet = sysPerBetStake.toFixed(2);
        $scope.params.stakePerBet = (Utils.mathCuttingFunction(sysPerBetStake*10*10)/100).toFixed(2);

        return {win: (Utils.mathCuttingFunction(tempPosWin * sysPerBetStake*10*10)/100).toFixed(2), options: numOfSysOptions};
    }

    /**
     * @ngdoc method
     * @name reCalculate
     * @methodOf betting.controller:systemCalculatorController
     * @description Recalculate
     */
    $scope.reCalculate = function reCalculate () {
        $scope.result = calculateSystemPossibleWin();
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf betting.controller:systemCalculatorController
     * @description get back calculator to it's initial state
     */
    $scope.resetCalculator = function resetCalculator() {
        $scope.params.stake = null;
        $scope.params.stakePerBet = 0;

        $scope.selectionChangeHandler();
        $scope.reCalculate();
    };

    /**
     * @ngdoc method
     * @name selectionChangeHandler
     * @methodOf betting.controller:systemCalculatorController
     * @description system selection change handler
     */
    $scope.selectionChangeHandler = function selectionChangeHandler() {
        $scope.params.events = [];

        for (var i=0; i < $scope.params.selectedSysOption.eventCount; i++){
            $scope.params.events.push({odd: '1.00', flag: 0});
        }

        $scope.reCalculate();
    };

    /**
     * @ngdoc method
     * @name changeAllFlags
     * @methodOf betting.controller:systemCalculatorController
     * @param {Number} x x
     * @description set all flags to selected value
     */
    $scope.changeAllFlags = function changeAllFlags(value) {
        for (var i=0; i < $scope.params.selectedSysOption.eventCount; i++){
            $scope.params.events[i].flag = value;
        }

        $scope.reCalculate();
    };

    /**
     * @ngdoc method
     * @name calculateSystemOptionsCount
     * @methodOf betting.controller:systemCalculatorController
     * @param {Number} number of selected events
     * @description calculate system options count
     */
    $scope.calculateSystemOptionsCount = function calculateSystemOptionsCount(k) {
        return Math.round(Utils.factorial($scope.params.events.length) / (Utils.factorial(k) * Utils.factorial($scope.params.events.length - k)));
    };
}]);