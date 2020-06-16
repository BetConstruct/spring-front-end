VBET5.filter("roundPossibleWin",['$rootScope', 'Utils', function($rootScope, Utils) {
    'use strict';


    return  function (num, decimalPlaces, betType) {
        var roundedNum = ($rootScope.partnerConfig.multiple_possiblewin_round_method === 0 && !{1: 1, 4: 1}[betType])? Utils.cuttingDecimals(+num, decimalPlaces).toFixed(decimalPlaces) : Utils.bankersRounding(+num, decimalPlaces);
        return Utils.numberWithCommas(roundedNum);
    };
}]);
