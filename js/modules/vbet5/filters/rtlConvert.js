/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:rtlConvert
 * @description changes data according rtl and returns it
 * @param {string} value
 * @returns {string} changed value
 *
 */
VBET5.filter('rtlConvert', ['Config', function (Config) {
    'use strict';

    var rtlMap = {
        side: {
            "1": "2",
            "2": "1"
        },
        pass_team: {
            "team1": "team2",
            "team2": "team1"
        }
    };

    return function (value, type) {
        if (value) {
            if (value[type] && Config.main.availableLanguages[Config.env.lang].rtl) {
                return rtlMap[type][value[type]];
            }

            return value[type];
        }
    };
}]);