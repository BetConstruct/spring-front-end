/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:translate
 * @description  translator filter
 *
 * uses {@link vbet5.service:Translator Translator service}   to translate
 *
 */
VBET5.filter('translate', ['Translator', function (Translator) {
    'use strict';
    return function (str, placeholders, alternativeStr) {
        if (alternativeStr) {
            if (alternativeStr === true) {
                return Translator.translationExists(str);
            }
            if (Translator.translationExists(alternativeStr)) {
                return Translator.get(alternativeStr, placeholders);
            }
        }
        return Translator.get(str, placeholders);
    };
}]);