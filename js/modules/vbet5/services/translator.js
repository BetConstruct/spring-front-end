/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Translator
 * @description
 * Translator
 */
VBET5.factory('Translator', ['Config', 'Translations', '$location', function (Config, TranslationsConst, $location) {
    'use strict';
    console.log('translator initialized');
    var notrans = $location.search().notrans;
    var Translator = {},
        Translations = notrans && notrans !== 'id'? {} : TranslationsConst;

    var regExp = /\{(\d+)\}/g;

    /**
     * @ngdoc method
     * @name get
     * @methodOf vbet5.service:Translator
     * @description Translates string or returns it if no translation is available
     * @param {String} str string to translate
     * @param {Array} [placeholders] optional. values to put into placeholders ( {1}, {2}, etc..) in text
     * @param {String} lang optional. language to translate to. if not specified, taken from Config.env.lang
     * @param {String} alternativeStr optional
     * @returns {String} translated string
     */
    Translator.get = function get(str, placeholders, lang, alternativeStr) {
        var ret;

        var d = (lang && Translations[lang]) || Translations[Config.env.lang];
        if (d instanceof Object && d.hasOwnProperty(str)) {
            ret = d[str];
        } else {
            ret = str;
        }

        if (ret && placeholders && placeholders.length) {
            ret = ret.replace(regExp, function (match, number) {
                return placeholders[number - 1] !== undefined ? placeholders[number - 1] : match;
            });
        }

        if (Config.main.defaultTransLang && ret === str && lang !== Config.main.defaultTransLang) {
            return Translator.get(str, placeholders, Config.main.defaultTransLang, alternativeStr);
        }

        if (alternativeStr) { //todo for payment error codes SDC-51469
            if (Translator.translationExists(alternativeStr, lang) || notrans === 'id') {
                return Translator.get(alternativeStr, placeholders, lang);
            }
        }

        return ret;
    };

    /**
     * @ngdoc method
     * @name translationExists
     * @methodOf vbet5.service:Translator
     * @description Returns true is the translation exists
     * @param {String} str string to translate
     * @param {String} [lang] optional. language to translate to. if not specified, taken from Config.env.lang
     * @returns {Boolean} returns true is the translation exists
     */
    Translator.translationExists = function translationExists(str, lang) {
        var d = (lang && Translations[lang]) || Translations[Config.env.lang];

        return d instanceof Object && d.hasOwnProperty(str);
    };

    /**
     * @ngdoc method
     * @name addTranslations
     * @methodOf vbet5.service:Translator
     * @param {Boolean} true to create lowercase versions
     * * @param {Boolean} true to create uppercase versions
     * @description Add uppercase or lowercase translations
     */
    Translator.addTranslations = function addTranslations(lowerCase, upperCase) {
        if (lowerCase || upperCase) {
            console.log('add additional translations');
            angular.forEach(Translations[Config.env.lang], function (translation, key) {
                if (key.length <= 25 && key.substr(0, 8) !== 'message_') {
                    if (lowerCase && !Translations[Config.env.lang][key.toLowerCase()]) {
                        Translations[Config.env.lang][key.toLowerCase()] = translation.toLocaleLowerCase();
                    }
                    if (upperCase && !Translations[Config.env.lang][key.toUpperCase()]) {
                        Translations[Config.env.lang][key.toUpperCase()] = translation.toLocaleUpperCase();
                    }
                }
            });
        }
    };

    return Translator;

}]);