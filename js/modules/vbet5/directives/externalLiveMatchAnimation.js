/* global VBET5 */
/* global STATSCORE */
/* global SIR */

/**
 * @ngdoc directive
 * @name vbet5.directive:externalLiveMatchAnimation
 *
 * @description displays external Live Match Animations
 *
 */
VBET5.directive('externalLiveMatchAnimation', ['$rootScope', 'Config', 'LanguageCodes', 'DomHelper', function ($rootScope, Config, LanguageCodes, DomHelper) {
    'use strict';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/external-live-match-animation.html',

        link: function ($scope, element, attrs) {
            $scope.animationType = attrs.animationType;
            var externalAnimation, isBetRadar;

            if (attrs.animationType === 'prematchpro') {
                externalAnimation = Config.main.externalAnimation.prematchpro;
            }

            if (attrs.animationType === 'livematchpro') {
                if (Config.main.externalAnimation.livematchpro && Config.main.externalAnimation.livematchpro.enabled) {
                    externalAnimation = Config.main.externalAnimation.livematchpro;
                } else {
                    externalAnimation = Config.main.externalAnimation.betradar;
                    isBetRadar = true;
                }
            }

            (function init() {
                if (!$scope.externalAnimation){
                    return;
                }

                if (externalAnimation.enabled) {
                    if (!isBetRadar) {
                        var trackerGenerator;
                        var tracker;
                        var trackerContainer;
                        var trackerId = "";

                        DomHelper.onMessage(function (message) {
                            var data = message.data;
                            if (data.tracker && data.tracker === trackerId.toString()) {
                                switch (data.type) {
                                    case 'statscore.livematchpro.ready': {
                                        $scope.externalAnimation.show = true;
                                        $scope.externalAnimation.loading = false;
                                        break;
                                    }
                                    case 'statscore.livematchpro.error': {
                                        $scope.externalAnimation.show = false;
                                        $scope.externalAnimation.loading = false;
                                        break;
                                    }
                                    case 'statscore.livematchpro.resize': { // min width < 320 scale ui fix
                                        var styles = window.getComputedStyle(trackerContainer);
                                        var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/;
                                        var transform = styles['transform'] || styles['-webkit-transform'] || styles['-ms-transform'] || styles['-o-transform'] || styles['-moz-transform'];
                                        if (transform) {
                                            var matches = transform.match(matrixRegex);
                                            var scale = matches && matches[1] ? parseFloat(matches[1]) : 1;
                                            trackerContainer.style.marginBottom = (scale - 1) * trackerContainer.offsetHeight + 'px';
                                        }
                                        break;
                                    }
                                }
                            }
                        });

                        $scope.initStateScoreProWidget = function initStateScoreProWidget(id) {
                            function createWidget() {
                                if (window.STATSCORE) {
                                    if (!trackerGenerator) {
                                        trackerGenerator = new STATSCORE.LSP.Generator();
                                    }
                                    if (tracker) {
                                        tracker.remove();
                                    }
                                    if (!trackerContainer) {
                                        trackerContainer = document.getElementById('statscore-tracker-container');
                                    }
                                    if (trackerContainer) {
                                        trackerContainer.innerHTML = "";
                                    }

                                    trackerGenerator.create('#statscore-tracker-container', id, id, externalAnimation.config_id, {
                                        lang: LanguageCodes[Config.env.lang],
                                        timezone: Config.env.selectedTimeZone,
                                        configuration: externalAnimation.configs
                                    });
                                    tracker = trackerGenerator.get(id);
                                }
                            }

                            if (!window.STATSCORE) {
                                (function () {
                                    var s1 = document.createElement("script"),
                                        s0 = document.getElementsByTagName("script")[0];
                                    s1.async = true;
                                    s1.src = 'https://live.statscore.com/livescorepro/generator?auto_init=false';
                                    s1.charset = 'UTF-8';
                                    s1.onload = createWidget;
                                    s0.parentNode.insertBefore(s1, s0);
                                })();
                            }
                            trackerId = id;
                            $scope.externalAnimation.show = false;
                            $scope.externalAnimation.loading = true;

                            createWidget();
                        };
                    } else {
                        var settings = externalAnimation;
                        if (!window.SIR) {
                            var betradarMapedLanguage = {
                                "eng": "en",
                                "fre": "fr",
                                "tur": "tr",
                                "arb": "aa"
                            }[Config.env.lang] || 'en';
                            (function (a, b, c, d, e, f, g, h, i) {
                                a[e] || (i = a[e] = function () {
                                    (a[e].q = a[e].q || []).push(arguments)
                                }, i.l = 1 * new Date, i.o = f, g = b.createElement(c), h = b.getElementsByTagName(c)[0], g.async = 1, g.src = d, g.setAttribute("n", e), h.parentNode.insertBefore(g, h))
                            })(window, document, "script", "https://widgets.sir.sportradar.com/" + settings.id + "/widgetloader", "SIR", {
                                theme: settings.customTheme || false, // using custom theme
                                language: betradarMapedLanguage
                            });
                        }
                        settings.configs.onTrack = function (a, b) { // todo betradar events trachking
                            if (a === 'data_change' && b && b.matchId) {
                                console.log('betradar-success ', 'match_id-', b.matchId);
                            } else {
                                console.log('betradar-error', a, b);
                            }
                            // $scope.externalAnimation.loading = false;
                        };

                        $scope.initBetradarWidget = function initBetradarWidget(id) {
                            settings.configs.matchId = (settings.matchIdPrefix || '') + id;
                            $scope.externalAnimation.show = true;
                            SIR('removeWidget', "#betradar-container");
                            SIR("addWidget", "#betradar-container", "match.lmtPlus", settings.configs);
                        };
                        $scope.externalAnimation.loading = false;
                    }
                }
            })();
            if ($scope.externalAnimation) {
                $scope.$watch('openGame.id', function (id, old) {
                    if (id && externalAnimation.enabled) {
                        isBetRadar ? $scope.initBetradarWidget(id) : $scope.initStateScoreProWidget(id, (id !== old) ? old : false);
                    }
                });
            }
        }
    };
}]);

/* sportradar available languages
var a = [{
    "Albanian": "sqi",
    "Arabic": "ar",
    "Armenian": "hye",
    "Azerbaijan": "aze",
    "Belarusian": "bel",
    "Bosnian": "bs",
    "Brazilian Portuguese": "br",
    "Bulgarian": "bg",
    "Chinese (simplified)": "zh",
    "Chinese (traditional)": "zht",
    "Croatian": "hr",
    "Czech": "cs",
    "Danish": "da",
    "Dutch": "nl",
    "English": "en",
    "Estonian": "et",
    "Faroese": "fao",
    "Finnish": "fi",
    "French": "fr",
    "Georgian": "ka",
    "German": "de",
    "Greek": "el",
    "Hebrew": "heb",
    "Hungarian": "hu",
    "Icelandic": "isl",
    "Indonesian": "id",
    "Italian": "it",
    "Japanese": "ja",
    "Kazakh": "kaz",
    "Korean": "ko",
    "Latvian": "lv",
    "Lithuanian": "lt",
    "Macedonian": "mk",
    "Malay": "ms",
    "Moldavian": "mol",
    "Montenegrin": "me",
    "Norwegian": "no",
    "Polish": "pl",
    "Portuguese": "pt",
    "Romanian": "ro",
    "Russian": "ru",
    "Serbian": "sr",
    "Serbian Latin": "srl",
    "Slovak": "sk",
    "Slovenian": "sl",
    "Spanish": "es",
    "Swahili": "sw",
    "Swedish": "sv",
    "Thai": "th",
    "Turkish": "tr",
    "Ukrainian": "ukr",
    "Vietnamese": "vi"
}];
*/
