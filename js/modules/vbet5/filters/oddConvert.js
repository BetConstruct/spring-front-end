/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:oddConvert
 * @description Converts odds to format specified in Config.env.oddFormat.
 *
 * Results are cached, so every calculation is done only once
 *
 */
VBET5.filter('oddConvert', ['$rootScope', 'Config', 'Utils', 'LadderLoader', function ($rootScope, Config, Utils, LadderLoader) {
    'use strict';

    // ladder = ['100/1', '22/1', '11/1', '13/2', '4/1', '16/5', '12/5', '15/8', '11/8', '10/11', '10/17', '5/11', '5/16', '1/5', '1/10', '1/25', '80/1', '20/1', '10/1', '6/1', '19/5', '3/1', '23/10', '9/5', '13/10', '5/6', '4/7', '4/9', '3/10', '2/11', '1/11', '1/28', '66/1', '18/1', '19/2', '11/2', '15/4', '29/10', '9/4', '7/4', '5/4', '4/5', '5/9', '5/12', '5/17', '1/6', '1/12', '1/33', '50/1', '100/6', '9/1', '21/4', '18/5', '14/5', '11/5', '17/10', '6/5', '8/11', '8/15', '2/5', '2/7', '2/13', '1/14', '1/40', '40/1', '16/1', '17/2', '5/1', '7/2', '11/4', '85/40', '13/8', '11/10', '5/7', '10/19', '5/13', '5/18', '1/7', '1/16', '1/50', '33/1', '100/7', '8/1', '19/4', '17/5', '27/10', '21/10', '8/5', '21/20', '4/6', '1/2', '4/11', '5/19', '2/15', '1/18', '1/66', '28/1', '14/1', '15/2', '9/2', '10/3', '13/5', '2/1', '6/4', '1/1', '5/8', '10/21', '5/14', '1/4', '1/8', '1/20', '1/80', '25/1', '12/1', '7/1', '17/4', '13/4', '5/2', '19/10', '7/5', '20/21', '8/13', '40/85', '1/3', '2/9', '1/9', '1/22', '1/100', '100/1', '125/1', '150/1', '175/1', '200/1', '250/1', '300/1', '400/1', '500/1', '750/1', '999/1'];

    var ladder;
    var customLadder;


    // ladder decimals list
     var ladderKeys;





    /**
     * Recursively finds the biggest decimal odd that is smaller than num
     * @param startIndex search start index
     * @param endIndex search end index
     * @param num decimal odd value to compare with
     */
    function findNearestLadderKey(startIndex, endIndex, num) {
        var middleIndex = startIndex + Math.ceil((endIndex - startIndex)/2);
        if((middleIndex === 0 && ladderKeys[middleIndex] > num) || (middleIndex === ladderKeys.length - 1 && ladderKeys[middleIndex] < num) || (ladderKeys[middleIndex] < num && num < ladderKeys[middleIndex + 1])) {
            return ladderKeys[middleIndex];
        } else {
            if(ladderKeys[middleIndex] < num) {
                return findNearestLadderKey(middleIndex, endIndex, num);
            } else {
                return findNearestLadderKey(startIndex, middleIndex-1, num);
            }
        }
    }

    if (Config.main.useLadderForFractionalFormat) {
        LadderLoader.setCallback(function (data) {
            ladder = data;
            if (Config.main.showCustomNameForFractionalFormat ) {
                customLadder = {
                    "EVS": "1/1"
                };
                ladder[2] = "EVS";
            }
            ladderKeys = Object.keys(ladder);
            ladderKeys.sort(function (a, b) {
                return parseFloat(a) - parseFloat(b);
            });
        });
    }

    function dec2fracFromLadder(dec) {
        var val;
        if(ladder[dec]) {
            return ladder[dec];
        } else {
            val = findNearestLadderKey(0, ladderKeys.length-1, dec);
            return ladder[val];
        }
    }

    /**
     * Recursively converts odd to fractional format
     * @param {string} decVal odd value from swarm(decimal)
     * @returns {string} converted odd
     */
    function dec2frac(decVal) {
        var Znxt;
        var Dnxt;
        var Nnxt;

        function recCalc(Zcur, Dcur, Dprev) {
            Dcur =  Dcur !== undefined ? Dcur : 1;
            Dprev = Dprev !== undefined ? Dprev : 0;
            Znxt = 1 / (Zcur - parseInt(Zcur, 10));
            Dnxt = Dcur * parseInt(Znxt, 10) + Dprev;
            Nnxt = Math.round(decVal * Dnxt);

            return (Nnxt / Dnxt === decVal) ? Nnxt.toString() + "/" + Dnxt.toString() : recCalc(Znxt, Dnxt, Dcur);
        }

        // Use this casting method because of JS number bug for example "2.2 - 1 = 1.1999(9)"
        if (decVal !== parseInt(decVal, 10)) {
            decVal = parseFloat((parseInt(decVal, 10) - 1).toString() + "." + String(decVal).split(".")[1]);
        } else {
            decVal = decVal - 1;
        }

        return decVal % 1 === 0 ? String(decVal) + '/1' : String(recCalc(decVal));
    }

    /**
     * object to cache calculated values not to calculate them every time
     * @type {Object}
     */
    var cache = {};

    /**
     * possible formats.  the first one will be used as default if no valid format is found in config
     * @type {Array}
     */
    var possibleFormats = ['decimal', 'fractional', 'american', 'hongkong', 'malay', 'indo'];

    /**
     * Converts odd to specified format
     * @param {string} value odd value from swarm(decimal)
     * @param {string} format destination format
     * @returns {string} converted odd
     */
    function convert(value, format, isMultiple) {
        var fValue = parseFloat(value);
        var iValue = parseInt(value, 10);
        var rValue = (value !== undefined && value !== '') ? Math.round(parseFloat(value) * 1000 || 0) / 1000 : value;
        var priceDecimals = isMultiple?($rootScope.partnerConfig.multiple_price_decimals || 3): $rootScope.partnerConfig.price_decimals;
        switch (format) {
            case 'decimal':{
                var returnValue;
                if (value === undefined || value === '') {
                    return value;
                }
                returnValue = (iValue !== fValue && value.toString().split('.')[1] && value.toString().split('.')[1].length > 2) ? (Utils.formatDecimal(fValue, $rootScope.partnerConfig.price_round_method, priceDecimals)) : fValue.toFixed(2);
                return (Config.main.notLockedOddMinValue ? (returnValue < Config.main.notLockedOddMinValue ? 1 : returnValue) : returnValue);
            }
            case 'fractional':
                return value ? (Config.main.useLadderForFractionalFormat ? dec2fracFromLadder(fValue) : dec2frac(rValue)) : value;
            case 'american':
                return value ? rValue > 2 ? '+' + Math.round(100 * (rValue - 1)) : rValue !== 1 ? Math.round(-100 / (rValue - 1)) : '-' : rValue;
            case 'hongkong':
                var hValue = (value !== undefined && value !== '') ? (iValue !== fValue && value.toString().split('.')[1].length > 2) ? (Math.round((value - 1) * Math.pow(10, priceDecimals)) / Math.pow(10, priceDecimals)) : (fValue - 1.0).toFixed(2) : value;
                if ($rootScope.partnerConfig.price_round_method === 0) {
                    hValue = Utils.formatDecimal(+hValue, 0, priceDecimals).toFixed(2);
                }
                return hValue;
            case 'malay':
                if (fValue === 2) {
                    return '1.00';
                } else if (fValue > 2) {
                    return (Math.round(((1 / (1 - fValue)).toFixed(priceDecimals + 3)) * Math.pow(10, priceDecimals + 3)) / Math.pow(10, priceDecimals + 3)).toFixed(priceDecimals);
                }
                return (fValue - 1).toFixed(priceDecimals);
            case 'indo':
                if (fValue === 2) {
                    return '1.00';
                } else if (fValue > 2) {
                    return (fValue - 1).toFixed(priceDecimals);
                }
                return (Math.round(((1 / (1 - fValue)).toFixed(priceDecimals + 3)) * Math.pow(10, priceDecimals + 3)) / Math.pow(10, priceDecimals + 3)).toFixed(priceDecimals);
            default:
                return rValue;
        }
    }
    function calculateFractionFormat(value) {
        return Math.round(parseFloat(value - 1) * 100 || 0) / 100 + '/1';
    }


    var filter = function (value, format, type, displayKey, showCustomFractionalFormat, isMultiple) {
        if (value === null || value === undefined || isNaN(value)) {
            return value;
        }
        if (value <= 1) {
            return null;
        }
        if (!$rootScope.partnerConfig || $rootScope.partnerConfig._not_loaded) {
            return null;
        }

        if (Config.main.useLadderForFractionalFormat && !ladder && format === 'fractional') {
            return null;
        }
        if (Config.main.specialOddFormat && Config.main.specialOddFormat[format]) {
            if (!displayKey || !Config.main.specialOddFormat[format].displayKey[displayKey]) {
                format = Config.main.specialOddFormat[format].default;
            } else {
                format = Config.main.specialOddFormat[format].displayKey[displayKey];
            }
        }
        var cacheKey = (format || Config.env.oddFormat).concat(value);
        if (isMultiple) { //total express odd case
            if (format === 'fractional' && type === 'fictional' && Config.main.useLadderForFractionalFormat) {
                return calculateFractionFormat(value);
            } else {
                return convert(value, format, isMultiple);
            }
        }
        if (cache[cacheKey] === undefined) {
            format = format || Config.env.oddFormat;

            if (possibleFormats.indexOf(format) === -1) { //select default format if current one is invalid
                format = possibleFormats[0];
            }
            if (format === 'fractional' && type === 'fictional' && Config.main.useLadderForFractionalFormat) { // use it to calculate express odds as you see on bet365 :)
                cache[cacheKey] = calculateFractionFormat(value);
            } else {
                cache[cacheKey] = convert(value, format, isMultiple);
            }
        }
        if (showCustomFractionalFormat && customLadder[cache[cacheKey]]){
            return customLadder[cache[cacheKey]];
        }
        return cache[cacheKey];
    };

    filter.$stateful = true;
    return filter;


}]);


