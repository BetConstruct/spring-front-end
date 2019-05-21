/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Intro
 * @description  <a href="http://usablica.github.io/intro.js/">Intro.js</a> lib wrapper service
 */

VBET5.service('Intro', ['Translator', function (Translator) {
    'use strict';
    var Intro = {};

    Intro.intro = introJs();
    Intro.intro.setOptions({
        doneLabel: Translator.get('Done'),
        nextLabel: Translator.get('Next'),
        prevLabel: Translator.get('Previous'),
        skipLabel: Translator.get('Skip')
    });
    /**
     * @ngdoc method
     * @name start
     * @methodOf vbet5.service:Intro
     * @description Starts the intro
     */
    Intro.start = function start() {
        Intro.intro.start();
    };

    return Intro;

}]);
