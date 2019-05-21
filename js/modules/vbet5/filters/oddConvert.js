/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:oddConvert
 * @description Converts odds to format specified in Config.env.oddFormat.
 *
 * Results are cached, so every calculation is done only once
 *
 */
VBET5.filter('oddConvert', [ 'Config', 'Utils', function (Config, Utils) {
    'use strict';

    // ladder = ['100/1', '22/1', '11/1', '13/2', '4/1', '16/5', '12/5', '15/8', '11/8', '10/11', '10/17', '5/11', '5/16', '1/5', '1/10', '1/25', '80/1', '20/1', '10/1', '6/1', '19/5', '3/1', '23/10', '9/5', '13/10', '5/6', '4/7', '4/9', '3/10', '2/11', '1/11', '1/28', '66/1', '18/1', '19/2', '11/2', '15/4', '29/10', '9/4', '7/4', '5/4', '4/5', '5/9', '5/12', '5/17', '1/6', '1/12', '1/33', '50/1', '100/6', '9/1', '21/4', '18/5', '14/5', '11/5', '17/10', '6/5', '8/11', '8/15', '2/5', '2/7', '2/13', '1/14', '1/40', '40/1', '16/1', '17/2', '5/1', '7/2', '11/4', '85/40', '13/8', '11/10', '5/7', '10/19', '5/13', '5/18', '1/7', '1/16', '1/50', '33/1', '100/7', '8/1', '19/4', '17/5', '27/10', '21/10', '8/5', '21/20', '4/6', '1/2', '4/11', '5/19', '2/15', '1/18', '1/66', '28/1', '14/1', '15/2', '9/2', '10/3', '13/5', '2/1', '6/4', '1/1', '5/8', '10/21', '5/14', '1/4', '1/8', '1/20', '1/80', '25/1', '12/1', '7/1', '17/4', '13/4', '5/2', '19/10', '7/5', '20/21', '8/13', '40/85', '1/3', '2/9', '1/9', '1/22', '1/100', '100/1', '125/1', '150/1', '175/1', '200/1', '250/1', '300/1', '400/1', '500/1', '750/1', '999/1'];

    var ladder = {
        1.001: '1/1000',
        1.002: '1/500',
        1.004: '1/250',
        1.005: '1/200',
        1.01: '1/100',
        1.015: '1/66',
        1.02: '1/50',
        1.03: '1/33',
        1.04: '1/25',
        1.05: '1/20',
        1.06: '1/16',
        1.07: '1/14',
        1.08: '1/12',
        1.09: '1/11',
        1.1: '1/10',
        1.11: '1/9',
        1.13: '1/8',
        1.14: '1/7',
        1.15: '2/13',
        1.17: '1/6',
        1.18: '2/11',
        1.2: '1/5',
        1.22: '2/9',
        1.25: '1/4',
        1.27: '27/100',
        1.28: '2/7',
        1.3: '3/10',
        1.31: '31/100',
        1.33: '1/3',
        1.34: '17/50',
        1.36: '4/11',
        1.37: '37/100',
        1.4: '2/5',
        1.41: '41/100',
        1.44: '4/9',
        1.45: '9/20',
        1.47: '47/100',
        1.48: '12/25',
        1.5: '1/2',
        1.51: '51/100',
        1.53: '8/15',
        1.54: '27/50',
        1.55: '11/20',
        1.57: '4/7',
        1.58: '29/50',
        1.6: '3/5',
        1.62: '8/13',
        1.63: '5/8',
        1.64: '16/25',
        1.66: '4/6',
        1.67: '67/100',
        1.7: '7/10',
        1.71: '5/7',
        1.72: '8/11',
        1.73: '73/100',
        1.75: '3/4',
        1.76: '19/25',
        1.79: '79/100',
        1.8: '4/5',
        1.81: '81/100',
        1.83: '5/6',
        1.84: '21/25',
        1.87: '87/100',
        1.88: '22/25',
        1.9: '9/10',
        1.91: '10/11',
        1.92: '23/25',
        1.95: '20/21',
        1.96: '48/50',
        1.99: '99/100',
        2: '1/1',
        2.01: '101/100',
        2.02: '51/50',
        2.03: '103/100',
        2.05: '21/20',
        2.06: '53/50',
        2.07: '107/100',
        2.09: '109/100',
        2.1: '11/10',
        2.11: '111/100',
        2.13: '113/100',
        2.15: '23/20',
        2.17: '117/100',
        2.19: '119/100',
        2.2: '6/5',
        2.21: '121/100',
        2.23: '123/100',
        2.25: '5/4',
        2.26: '63/50',
        2.27: '127/100',
        2.29: '129/100',
        2.3: '13/10',
        2.31: '131/100',
        2.33: '133/100',
        2.35: '27/20',
        2.37: '137/100',
        2.38: '11/8',
        2.39: '139/100',
        2.4: '7/5',
        2.41: '141/100',
        2.45: '29/20',
        2.47: '147/100',
        2.49: '149/100',
        2.5: '6/4',
        2.51: '151/100',
        2.53: '153/100',
        2.55: '31/20',
        2.57: '157/100',
        2.6: '8/5',
        2.61: '161/100',
        2.63: '13/8',
        2.65: '33/20',
        2.67: '167/100',
        2.7: '17/10',
        2.73: '173/100',
        2.75: '7/4',
        2.77: '177/100',
        2.8: '9/5',
        2.81: '181/100',
        2.83: '183/100',
        2.85: '37/20',
        2.87: '187/100',
        2.88: '15/8',
        2.89: '189/100',
        2.9: '19/10',
        2.91: '191/100',
        2.93: '193/100',
        2.95: '39/20',
        2.97: '197/100',
        3: '2/1',
        3.01: '201/100',
        3.03: '203/100',
        3.07: '207/100',
        3.1: '21/10',
        3.13: '213/100',
        3.17: '217/100',
        3.2: '11/5',
        3.21: '221/100',
        3.25: '9/4',
        3.27: '227/100',
        3.3: '23/10',
        3.33: '233/100',
        3.37: '237/100',
        3.4: '12/5',
        3.41: '241/100',
        3.45: '49/20',
        3.5: '5/2',
        3.51: '251/100',
        3.55: '51/20',
        3.6: '13/5',
        3.61: '261/100',
        3.65: '53/20',
        3.7: '27/10',
        3.71: '271/100',
        3.75: '11/4',
        3.76: '69/25',
        3.8: '14/5',
        3.81: '281/100',
        3.85: '57/20',
        3.9: '29/10',
        3.91: '291/100',
        3.95: '59/20',
        4: '3/1',
        4.01: '301/100',
        4.1: '31/10',
        4.2: '16/5',
        4.3: '33/10',
        4.33: '10/3',
        4.4: '17/5',
        4.5: '7/2',
        4.55: '71/20',
        4.65: '73/20',
        4.75: '15/4',
        4.85: '77/20',
        4.9: '39/10',
        5: '4/1',
        5.1: '41/10',
        5.2: '21/5',
        5.3: '43/10',
        5.4: '22/5',
        5.5: '9/2',
        5.6: '23/5',
        5.7: '47/10',
        5.8: '24/5',
        5.9: '49/10',
        6: '5/1',
        6.1: '51/10',
        6.2: '26/5',
        6.3: '53/10',
        6.4: '27/5',
        6.5: '11/2',
        6.6: '28/5',
        6.7: '57/10',
        6.8: '29/5',
        6.9: '59/10',
        7: '6/1',
        7.1: '61/10',
        7.2: '31/5',
        7.3: '63/10',
        7.4: '32/5',
        7.5: '13/2',
        7.6: '33/5',
        7.7: '67/10',
        7.8: '34/5',
        7.9: '69/10',
        8: '7/1',
        8.1: '71/10',
        8.2: '36/5',
        8.3: '73/10',
        8.4: '37/5',
        8.5: '15/2',
        8.7: '77/10',
        8.9: '79/10',
        9: '8/1',
        9.1: '81/10',
        9.3: '83/10',
        9.5: '17/2',
        9.7: '87/10',
        9.9: '89/10',
        10: '9/1',
        10.1: '91/10',
        10.3: '93/10',
        10.5: '19/2',
        10.7: '97/10',
        10.9: '99/10',
        11: '10/1',
        12: '11/1',
        13: '12/1',
        14: '13/1',
        15: '14/1',
        16: '15/1',
        17: '16/1',
        19: '18/1',
        21: '20/1',
        23: '22/1',
        26: '25/1',
        29: '28/1',
        34: '33/1',
        41: '40/1',
        51: '50/1',
        67: '66/1',
        71: '70/1',
        81: '80/1',
        91: '90/1',
        101: '100/1',
        126: '125/1',
        151: '150/1',
        201: '200/1',
        251: '250/1',
        301: '300/1',
        401: '400/1',
        501: '500/1',
        751: '750/1',
        1001: '1000/1',
        1501: '1500/1',
        2001: '2000/1',
        2501: '2500/1',
        3001: '3000/1',
        3501: '3500/1',
        4001: '4000/1'
      };
    var customLadder;
    if (Config.main.showCustomNameForFractionalFormat ) {
        customLadder = {
            "EVS": "1/1"
        };
        ladder[2] = "EVS";
    }

    // ladder decimals list
     var ladderKeys = Object.keys(ladder);
    ladderKeys.sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });


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
    function convert(value, format) {
        var fValue = parseFloat(value);
        var iValue = parseInt(value, 10);
        var rValue = (value !== undefined && value !== '') ? Math.round(parseFloat(value) * 1000 || 0) / 1000 : value;

        switch (format) {
            case 'decimal':{
                var returnValue;
                if (value === undefined || value === '') {
                    return value;
                }
                if (Config.main.decimalFormatRemove3Digit) {
                    returnValue = (Utils.mathCuttingFunction(fValue * 10 * 10) / 100).toFixed(2); // 10 * 10 because javascript have bug 8.2 * 100 = 819.9999999999999
                } else{
                    returnValue = (iValue !== fValue && value.toString().split('.')[1] && value.toString().split('.')[1].length > 2) ? (Math.round(value * Math.pow(10, Config.main.roundDecimalCoefficients)) / Math.pow(10, Config.main.roundDecimalCoefficients)) : fValue.toFixed(2);
                }
                return (Config.main.notLockedOddMinValue ? (returnValue < Config.main.notLockedOddMinValue ? 1 : returnValue) : returnValue);
            }
            case 'fractional':
                return value ? (Config.main.useLadderForFractionalFormat ? dec2fracFromLadder(fValue) : dec2frac(rValue)) : value;
            case 'american':
                return value ? rValue > 2 ? '+' + Math.round(100 * (rValue - 1)) : rValue !== 1 ? Math.round(-100 / (rValue - 1)) : '-' : rValue;
            case 'hongkong':
                var hValue = (value !== undefined && value !== '') ? (iValue !== fValue && value.toString().split('.')[1].length > 2) ? (Math.round((value - 1) * Math.pow(10, Config.main.roundDecimalCoefficients)) / Math.pow(10, Config.main.roundDecimalCoefficients)) : (fValue - 1.0).toFixed(2) : value;
                if (Config.main.decimalFormatRemove3Digit) {
                    hValue = (Utils.mathCuttingFunction(hValue * 10 * 10) / 100).toFixed(2);
                }
                return hValue;
            case 'malay':
                if (fValue === 2) {
                    return '1.00';
                } else if (fValue > 2) {
                    return (Math.round(((1 / (1 - fValue)).toFixed(Config.main.roundDecimalCoefficients + 3)) * Math.pow(10, Config.main.roundDecimalCoefficients + 3)) / Math.pow(10, Config.main.roundDecimalCoefficients + 3)).toFixed(Config.main.roundDecimalCoefficients);
                }
                return (fValue - 1).toFixed(Config.main.roundDecimalCoefficients);
            case 'indo':
                if (fValue === 2) {
                    return '1.00';
                } else if (fValue > 2) {
                    return (fValue - 1).toFixed(Config.main.roundDecimalCoefficients);
                }
                return (Math.round(((1 / (1 - fValue)).toFixed(Config.main.roundDecimalCoefficients + 3)) * Math.pow(10, Config.main.roundDecimalCoefficients + 3)) / Math.pow(10, Config.main.roundDecimalCoefficients + 3)).toFixed(Config.main.roundDecimalCoefficients);
            default:
                return rValue;
        }
    }

    return function (value, format, type, displayKey, showCustomFractionalFormat) {
        if (value === null || value === undefined || isNaN(value)) {
            return value;
        }
        if (value === 1) {
            return null;
        }
        if(Config.main.specialOddFormat && Config.main.specialOddFormat[format]) {
            format = Config.main.specialOddFormat[format].displayKey[displayKey] || Config.main.specialOddFormat[format].default;
        }
        var cacheKey = (format || Config.env.oddFormat).concat(value);
        if (cache[cacheKey] === undefined) {
            format = format || Config.env.oddFormat;

            if (possibleFormats.indexOf(format) === -1) { //select default format if current one is invalid
                format = possibleFormats[0];
            }
            if (format === 'fractional' && type === 'fictional' && Config.main.useLadderForFractionalFormat && value !== undefined) { // use it to calculate express odds as you see on bet365 :)
                cache[cacheKey] = Math.round(parseFloat(value - 1) * 100 || 0) / 100 + '/1';
            } else {
                cache[cacheKey] = convert(value, format);
            }
        }
        if (showCustomFractionalFormat && customLadder[cache[cacheKey]]){
            return customLadder[cache[cacheKey]];
        }
        return cache[cacheKey];
    };


}]);


