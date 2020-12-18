/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:capitalise
 * @description capitalises the strings first letter
 *
 */
VBET5.filter('currency', ['Config', 'Translator', function (Config, Translator) {
    'use strict';

    return function capitalise(string) {
        if (Config.main.convertCurrencyName && Config.main.convertCurrencyName[string]) {
            string = Config.main.convertCurrencyName[string];
        }
        return Translator.get(string);
    };
}]);