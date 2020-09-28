VBET5.filter("roundPossibleWin",['$rootScope', 'Utils',  'Config', function($rootScope, Utils, Config) {
    'use strict';


    return  function (num, decimalPlaces, betType) {
        var isCut = $rootScope.partnerConfig.multiple_possiblewin_round_method === 0 && (Config.betting.fullCoverBetTypes.enabled || !{1: 1, 4: 1}[betType] );
        var roundedNum = isCut? Utils.cuttingDecimals(+num, decimalPlaces).toFixed(decimalPlaces) : Utils.bankersRounding(+num, decimalPlaces);
        return Utils.numberWithCommas(roundedNum);
    };
}]);
