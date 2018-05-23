/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:analytics
 * @description
 * google analytics
 */
VBET5.service('analytics', ['$rootScope', '$window', '$location', 'Config', function ($rootScope, $window, $location, Config) {
    'use strict';


    var analytics = {};

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
    };
    $rootScope.$on('$viewContentLoaded', track);

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service:analytics
     * @description Hotjar initialization
     */
    function initHotjar (hotjarId) {
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () {
                    (h.hj.q = h.hj.q || []).push(arguments);
                };
            h._hjSettings = {hjid: parseInt(hotjarId, 10), hjsv: 5};
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service:analytics
     * @description Initialization
     */
    analytics.init = function init() {
        if ($window.ga && Config.main.googleAnalyticsId) {
            $window.ga('create', Config.main.googleAnalyticsId, Config.main.googleAnalyticsDomain || {'cookieDomain': 'none'});
            if (Config.main.googleAnalyticsEnableDisplayFeatures) {
                $window.ga('require', 'displayfeatures');
            }
        }

        if (Config.main.hotjarAnalyticsId) {
            initHotjar(Config.main.hotjarAnalyticsId);
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
