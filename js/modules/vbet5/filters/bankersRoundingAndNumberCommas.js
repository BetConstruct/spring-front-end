VBET5.filter("bankersRoundAndNumberCommas",['Utils', function(Utils) {
    'use strict';

   return  function (num, decimalPlaces) {
        return Utils.numberWithCommas(Utils.bankersRounding(+num, decimalPlaces));
    };
}]);
