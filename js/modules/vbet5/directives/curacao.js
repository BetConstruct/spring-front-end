/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:cegSeal
 * @description Ceg seal integration
 */
VBET5.directive("cegSealId", [function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var cegScript = window.document.createElement('script');
            cegScript.type = 'text/javascript';
            cegScript.async = true;
            cegScript.src = '//' + attrs.cegSealId + '.curacao-egaming.com/ceg-seal.js';
            var cegScriptS = window.document.getElementsByTagName('script')[0];
            cegScriptS.parentNode.insertBefore(cegScript, cegScriptS);
            cegScript.onload = function () {
                setTimeout(function () {
                    if (window.CEG) {
                        window.CEG.init();
                    }
                }, 2000);
            };

        }
    };
}]);

/**
 * @ngdoc directive
 * @name vbet5.directive:apgSeal
 * @description Apg seal integration
 */
VBET5.directive("apgSealId", [function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var apgScript = window.document.createElement('script');
            apgScript.type = 'text/javascript';
            apgScript.async = true;
            apgScript.src = 'https://' + attrs.apgSealId + '.snippet.antillephone.com/apg-seal.js';

            var apgScriptS = window.document.getElementsByTagName('script')[0];
            apgScriptS.parentNode.insertBefore(apgScript, apgScriptS);
            apgScript.onload = function () {
                setTimeout(function () {
                    if (window.APG && window.APG.init) {
                        window.APG.init();
                    }
                }, 2000);
            };
        }
    };
}]);