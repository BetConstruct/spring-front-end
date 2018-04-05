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

    var i,
        decimals = [],
       // ladder = ['100/1', '22/1', '11/1', '13/2', '4/1', '16/5', '12/5', '15/8', '11/8', '10/11', '10/17', '5/11', '5/16', '1/5', '1/10', '1/25', '80/1', '20/1', '10/1', '6/1', '19/5', '3/1', '23/10', '9/5', '13/10', '5/6', '4/7', '4/9', '3/10', '2/11', '1/11', '1/28', '66/1', '18/1', '19/2', '11/2', '15/4', '29/10', '9/4', '7/4', '5/4', '4/5', '5/9', '5/12', '5/17', '1/6', '1/12', '1/33', '50/1', '100/6', '9/1', '21/4', '18/5', '14/5', '11/5', '17/10', '6/5', '8/11', '8/15', '2/5', '2/7', '2/13', '1/14', '1/40', '40/1', '16/1', '17/2', '5/1', '7/2', '11/4', '85/40', '13/8', '11/10', '5/7', '10/19', '5/13', '5/18', '1/7', '1/16', '1/50', '33/1', '100/7', '8/1', '19/4', '17/5', '27/10', '21/10', '8/5', '21/20', '4/6', '1/2', '4/11', '5/19', '2/15', '1/18', '1/66', '28/1', '14/1', '15/2', '9/2', '10/3', '13/5', '2/1', '6/4', '1/1', '5/8', '10/21', '5/14', '1/4', '1/8', '1/20', '1/80', '25/1', '12/1', '7/1', '17/4', '13/4', '5/2', '19/10', '7/5', '20/21', '8/13', '40/85', '1/3', '2/9', '1/9', '1/22', '1/100', '100/1', '125/1', '150/1', '175/1', '200/1', '250/1', '300/1', '400/1', '500/1', '750/1', '999/1'];

      ladder = {
          1.001: '1/1000',
          1.002: '1/500',
          1.003: '1/300',
          1.005: '1/200',
          1.01: '1/100',
          1.02: '1/50',
          1.03: '1/33',
          1.04: '1/25',
          1.05: '1/20',
          1.06: '1/17',
          1.07: '1/14',
          1.08: '1/12',
          1.09: '1/11',
          1.1: '1/10',
          1.11: '1/9',
          1.12: '1/8',
          1.13: '2/15',
          1.14: '1/7',
          1.15: '2/13',
          1.16: '2/13',
          1.17: '1/6',
          1.18: '2/11',
          1.19: '2/11',
          1.2: '1/5',
          1.21: '1/5',
          1.22: '2/9',
          1.23: '2/9',
          1.24: '1/4',
          1.25: '1/4',
          1.26: '1/4',
          1.27: '1/4',
          1.28: '2/7',
          1.29: '2/7',
          1.3: '3/10',
          1.31: '3/10',
          1.32: '1/3',
          1.33: '1/3',
          1.34: '1/3',
          1.35: '1/3',
          1.36: '4/11',
          1.37: '4/11',
          1.38: '4/11',
          1.39: '2/5',
          1.4: '2/5',
          1.41: '2/5',
          1.42: '2/5',
          1.43: '4/9',
          1.44: '4/9',
          1.45: '4/9',
          1.46: '40/85',
          1.47: '40/85',
          1.48: '40/85',
          1.49: '1/2',
          1.5: '1/2',
          1.51: '1/2',
          1.52: '8/15',
          1.53: '8/15',
          1.54: '8/15',
          1.55: '8/15',
          1.56: '4/7',
          1.57: '4/7',
          1.58: '4/7',
          1.59: '4/7',
          1.6: '8/13',
          1.61: '8/13',
          1.62: '5/8',
          1.63: '5/8',
          1.64: '5/8',
          1.65: '4/6',
          1.66: '4/6',
          1.67: '4/6',
          1.68: '4/6',
          1.69: '5/7',
          1.7: '5/7',
          1.71: '5/7',
          1.72: '8/11',
          1.73: '8/11',
          1.74: '8/11',
          1.75: '8/11',
          1.76: '8/11',
          1.77: '4/5',
          1.78: '4/5',
          1.79: '4/5',
          1.8: '4/5',
          1.81: '4/5',
          1.82: '4/5',
          1.83: '4/5',
          1.84: '5/6',
          1.85: '5/6',
          1.86: '5/6',
          1.87: '5/6',
          1.88: '10/11',
          1.89: '10/11',
          1.9: '10/11',
          1.91: '10/11',
          1.92: '10/11',
          1.93: '10/11',
          1.94: '20/21',
          1.95: '20/21',
          1.96: '20/21',
          1.97: '20/21',
          1.98: '1/1',
          1.99: '1/1',
          2: '1/1',
          2.02: '1/1',
          2.04: '21/20',
          2.06: '21/20',
          2.08: '11/10',
          2.1: '11/10',
          2.12: '11/10',
          2.14: '11/10',
          2.16: '6/5',
          2.18: '6/5',
          2.2: '6/5',
          2.22: '6/5',
          2.24: '5/4',
          2.26: '5/4',
          2.28: '5/4',
          2.3: '5/4',
          2.32: '11/8',
          2.34: '11/8',
          2.36: '11/8',
          2.38: '11/8',
          2.4: '7/5',
          2.42: '7/5',
          2.44: '7/5',
          2.46: '6/4',
          2.48: '6/4',
          2.5: '6/4',
          2.52: '6/4',
          2.54: '6/4',
          2.56: '8/5',
          2.58: '8/5',
          2.6: '8/5',
          2.62: '13/8',
          2.64: '13/8',
          2.66: '13/8',
          2.68: '13/8',
          2.7: '7/4',
          2.72: '7/4',
          2.74: '7/4',
          2.76: '7/4',
          2.78: '9/5',
          2.8: '9/5',
          2.82: '9/5',
          2.84: '15/8',
          2.86: '15/8',
          2.88: '15/8',
          2.9: '15/8',
          2.92: '15/8',
          2.94: '2/1',
          2.96: '2/1',
          2.98: '2/1',
          3: '2/1',
          3.05: '2/1',
          3.1: '85/40',
          3.15: '11/5',
          3.2: '11/5',
          3.25: '9/4',
          3.3: '9/4',
          3.35: '12/5',
          3.4: '12/5',
          3.45: '5/2',
          3.5: '5/2',
          3.55: '5/2',
          3.6: '13/5',
          3.65: '13/5',
          3.7: '11/4',
          3.75: '11/4',
          3.8: '14/5',
          3.85: '14/5',
          3.9: '3/1',
          3.95: '3/1',
          4: '3/1',
          4.1: '3/1',
          4.2: '16/5',
          4.3: '10/3',
          4.4: '7/2',
          4.5: '7/2',
          4.6: '7/2',
          4.7: '7/2',
          4.8: '4/1',
          4.9: '4/1',
          5: '4/1',
          5.1: '4/1',
          5.2: '4/1',
          5.3: '9/2',
          5.4: '9/2',
          5.5: '9/2',
          5.6: '9/2',
          5.7: '9/2',
          5.8: '5/1',
          5.9: '5/1',
          6: '5/1',
          6.2: '5/1',
          6.4: '11/2',
          6.6: '11/2',
          6.8: '6/1',
          7: '6/1',
          7.2: '6/1',
          7.4: '13/2',
          7.6: '13/2',
          7.8: '7/1',
          8: '7/1',
          8.2: '7/1',
          8.4: '15/2',
          8.6: '15/2',
          8.8: '8/1',
          9: '8/1',
          9.2: '8/1',
          9.4: '17/2',
          9.6: '17/2',
          9.8: '9/1',
          10: '9/1',
          10.5: '19/2',
          11: '10/1',
          11.5: '10/1',
          12: '11/1',
          12.5: '11/1',
          13: '12/1',
          13.5: '12/1',
          14: '13/1',
          14.5: '13/1',
          15: '14/1',
          15.5: '14/1',
          16: '15/1',
          16.5: '15/1',
          17: '16/1',
          17.5: '16/1',
          18: '17/1',
          18.5: '17/1',
          19: '18/1',
          19.5: '18/1',
          20: '19/1',
          21: '20/1',
          22: '21/1',
          23: '22/1',
          24: '23/1',
          26: '25/1',
          28: '27/1',
          29: '28/1',
          30: '29/1',
          31: '30/1',
          32: '31/1',
          34: '33/1',
          36: '35/1',
          38: '37/1',
          40: '39/1',
          41: '40/1',
          42: '41/1',
          44: '43/1',
          46: '45/1',
          48: '47/1',
          50: '49/1',
          51: '50/1',
          55: '54/1',
          60: '59/1',
          61: '60/1',
          65: '64/1',
          66: '65/1',
          67: '66/1',
          70: '69/1',
          71: '70/1',
          75: '74/1',
          76: '75/1',
          80: '79/1',
          81: '80/1',
          85: '84/1',
          90: '89/1',
          91: '90/1',
          95: '94/1',
          100: '99/1',
          101: '100/1',
          110: '109/1',
          111: '110/1',
          120: '119/1',
          126: '125/1',
          130: '129/1',
          140: '139/1',
          150: '149/1',
          151: '150/1',
          160: '159/1',
          170: '169/1',
          176: '175/1',
          180: '179/1',
          190: '189/1',
          200: '199/1',
          201: '200/1',
          210: '209/1',
          220: '219/1',
          226: '225/1',
          230: '229/1',
          240: '239/1',
          250: '249/1',
          251: '250/1',
          260: '259/1',
          270: '269/1',
          276: '275/1',
          280: '279/1',
          290: '289/1',
          300: '299/1',
          301: '300/1',
          310: '309/1',
          320: '319/1',
          330: '329/1',
          340: '339/1',
          350: '349/1',
          351: '350/1',
          360: '359/1',
          370: '369/1',
          380: '379/1',
          390: '389/1',
          400: '399/1',
          401: '400/1',
          410: '409/1',
          420: '419/1',
          430: '429/1',
          440: '439/1',
          450: '449/1',
          460: '459/1',
          470: '469/1',
          480: '479/1',
          490: '489/1',
          500: '499/1',
          501: '500/1',
          510: '509/1',
          520: '519/1',
          530: '529/1',
          540: '539/1',
          550: '549/1',
          560: '559/1',
          570: '569/1',
          580: '579/1',
          590: '589/1',
          600: '599/1',
          610: '609/1',
          620: '619/1',
          630: '629/1',
          640: '639/1',
          650: '649/1',
          660: '659/1',
          670: '669/1',
          680: '679/1',
          690: '689/1',
          700: '699/1',
          710: '709/1',
          720: '719/1',
          730: '729/1',
          740: '739/1',
          750: '749/1',
          751: '750/1',
          760: '759/1',
          770: '769/1',
          780: '779/1',
          790: '789/1',
          800: '799/1',
          810: '809/1',
          820: '819/1',
          830: '829/1',
          840: '839/1',
          850: '849/1',
          860: '859/1',
          870: '869/1',
          880: '879/1',
          890: '889/1',
          900: '899/1',
          910: '909/1',
          920: '919/1',
          930: '929/1',
          940: '939/1',
          950: '949/1',
          960: '959/1',
          970: '969/1',
          980: '979/1',
          990: '989/1',
          1000: '999/1',
          1001: '1000/1'
      };

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
        } else{
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
                    return (Math.round(((1 / (1 - fValue)).toFixed(Config.main.roundDecimalCoefficients + 1)) * Math.pow(10, Config.main.roundDecimalCoefficients)) / Math.pow(10, Config.main.roundDecimalCoefficients)).toFixed(Config.main.roundDecimalCoefficients);
                } else {
                    return (fValue - 1).toFixed(Config.main.roundDecimalCoefficients);
                }
            case 'indo':
                if (fValue === 2) {
                    return '1.00';
                } else if (fValue > 2) {
                    return (fValue - 1).toFixed(Config.main.roundDecimalCoefficients);
                } else {
                    return (Math.round(((1 / (1 - fValue)).toFixed(Config.main.roundDecimalCoefficients + 1)) * Math.pow(10, Config.main.roundDecimalCoefficients)) / Math.pow(10, Config.main.roundDecimalCoefficients)).toFixed(Config.main.roundDecimalCoefficients);
                }
            default:
                return rValue;
        }
    }

    return function (value, format, type, displayKey) {
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
            if (format === 'fractional' && Config.main.useLadderForFractionalFormat && type === 'fictional' && value !== undefined) { // use it to calculate express odds as you see on bet365 :)
                cache[cacheKey] = Math.round(parseFloat(value - 1) * 100 || 0) / 100 + '/1';
            } else {
                cache[cacheKey] = convert(value, format);
            }
        }
        return cache[cacheKey];
    };


}]);


