/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:analytics
 * @description
 * google analytics
 */
VBET5.service('analytics', ['$rootScope', '$window', '$location', '$timeout', 'Config', function ($rootScope, $window, $location, $timeout, Config) {
    'use strict';


    var analytics = {};
    /**
     * @ngdoc method
     * @name initGtag
     * @methodOf vbet5.service:analytics
     * @description Gtag initialization
     */
    function initGtag(googleTagManagerId,googleTagManagerDomain) {
        if (googleTagManagerId) {
            var newScript = document.createElement('script');
            var src = googleTagManagerDomain || 'https://www.googletagmanager.com/gtag/js?id=';
            newScript.setAttribute('src', src + googleTagManagerId);
            newScript.setAttribute("async", "");

            document.head.appendChild(newScript);

            $window.dataLayer = $window.dataLayer || [];
            $window.gtag = function () {
                dataLayer.push(arguments);
            };
            $window.gtag('js', new Date());
            $window.gtag('config', googleTagManagerId);
        }
    }

    /**
     * @ngdoc method
     * @name track
     * @methodOf vbet5.service:analytics
     * @description Runtime call
     */
    var track = function track() {
        if ($window.ga) {
            $window.ga('send', 'pageview', {
                'page': $location.path()
            });
        }
        if ($window.hj) {
            $window.hj('stateChange', $location.url());
        }
    };
    $rootScope.$on('$viewContentLoaded', track);

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service:analytics
     * @description Hotjar initialization
     */
    function initHotjar(hotjarId, hotjarSV) {
        (function (window, document, url, sv, head, script) {
            window.hj = window.hj || function () {
                    (window.hj.q = window.hj.q || []).push(arguments);
                };
            window._hjSettings = {
                hjid: parseInt(hotjarId, 10),
                hjsv: parseInt(hotjarSV, 10)
            };
            head = document.getElementsByTagName('head')[0];
            script = document.createElement('script');
            script.async = 1;
            script.src = url + window._hjSettings.hjid + sv + window._hjSettings.hjsv;
            head.appendChild(script);
        })(window, document,'//static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    function initGoogleAnalytics() {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        (function init() {
            $timeout(function () {
                if ($window.ga) {
                    $window.ga('create', Config.main.googleAnalyticsId, Config.main.googleAnalyticsDomain || {'cookieDomain': 'none'});
                    if (Config.main.googleAnalyticsEnableDisplayFeatures) {
                        $window.ga('require', 'displayfeatures');
                    }
                } else {
                    init();
                }
            }, 200);
        })();
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service:analytics
     * @description Initialization
     */
    analytics.init = function init() {
        if (Config.main.googleAnalyticsId) {
            initGoogleAnalytics();
        }

        if (Config.main.hotjarAnalyticsId) {
            initHotjar(Config.main.hotjarAnalyticsId, Config.main.hotjarAnalyticsSV || 5);
        }

        if (Config.main.googleTagManagerId) {
            initGtag(Config.main.googleTagManagerId,Config.main.googleTagManagerDomain);
        }

        if (Config.main.yandexMetricaId) {
            (function (d, w, c) {
                (w[c] = w[c] || []).push(function () {
                    try {
                        w['yaCounter' + Config.main.yandexMetricaId] = new Ya.Metrika({id: Config.main.yandexMetricaId,
                            webvisor: false,
                            clickmap: false,
                            trackLinks: false,
                            accurateTrackBounce: false});
                    } catch (ignore) {
                    }
                });

                var n = d.getElementsByTagName("script")[0],
                    s = d.createElement("script"),
                    f = function () {
                        n.parentNode.insertBefore(s, n);
                    };
                s.type = "text/javascript";
                s.async = true;
                s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

                if (w.opera == "[object Opera]") {
                    d.addEventListener("DOMContentLoaded", f, false);
                } else {
                    f();
                }
            }($window.document, $window, "yandex_metrika_callbacks"));
        }
    };

    /**
     * @ngdoc method
     * @name gaSend
     * @methodOf vbet5.service:analytics
     * @description calls window.ga with passed parameters
     */
    analytics.gaSend = function gaSend() {
        if ($window.ga) {
            if (arguments.length >= 5 && angular.isObject(arguments[4]) && $rootScope.profile && $rootScope.profile.unique_id) {
                arguments[4].eventValue = $rootScope.profile.unique_id;
            }
            $window.ga.apply(this, arguments);
        }

        if ($window.hj && arguments && arguments.length && arguments.length >= 5 && arguments[3] && arguments[4] && arguments[4].eventLabel) {
            console.log('Hotjar', arguments[3], arguments[4].eventLabel);
            $window.hj(arguments[3], arguments[4].eventLabel);
        }
    };

    $rootScope.gaSend = analytics.gaSend;

    return analytics;

}]);
