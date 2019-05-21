/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:X2js
 * @description X2JS(https://code.google.com/p/x2js/) lib wrapper service (XML2JSON)
 */

VBET5.service('X2js', function () {
    'use strict';
    var x2js = new X2JS();
    return x2js;
});
