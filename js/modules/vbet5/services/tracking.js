/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Tracking
 * @description tracking integration helper service
 *
 */
VBET5.service('Tracking', ['$rootScope', '$location', 'Config', 'Storage', 'Zergling', 'analytics',  function ($rootScope, $location, Config, Storage, Zergling, analytics) {
    'use strict';
    var Tracking = {};

    /**
     * @description initializes Tracking and stores parameters in the storage
     */
    Tracking.init = function init() {
        var key, keys = Config.tracking || Config.main.trackingScripts;
        var locationSearch = $location.search();

        for (key in keys) {
            Storage.set('tracking_param_' + keys[key].param, locationSearch[keys[key].param]);
            $location.search(keys[key].param, undefined);
        }
    };

    /**
     * @description fix alias url
     */
    Tracking.fixURL = function fixURL(url) {
        return url.replace(/^\/+|\/+$/gm, '');
    };

    /**
     * @description replaces tokens
     */
    Tracking.renderTokens = function renderTokens(content, items) {
        var item, val;
        items = items || {};

        if (items.amount && items.fromAmount && items.amount < items.fromAmount) {
            return false;
        }

        if (items.amount && items.toAmount && items.amount > items.toAmount) {
            return false;
        }

        for (item in items) {
            val = items[item];
            if (!val) {
                val = Storage.get('tracking_param_' + item);
            }
            content = content.replace('{' + item + '}', val);
        }

        if ($rootScope.profile) {
            for (item in $rootScope.profile) {
                val = $rootScope.profile[item];
                content = content.replace('{user.' + item + '}', val);
            }
        }

        return content;
    };

    /**
     * @description check is event exists
     */
    Tracking.eventExists = function eventExists(evt) {
        var key, keys = Config.tracking || Config.main.trackingScripts;

        for (key in keys) {
            if (keys[key].event === evt) {
                return keys[key];
            }
        }
        return false;
    };

    /**
     * @description fires a custom event
     */
    Tracking.event = function event(evt, data, force) {
        data = data || {};

        if (Storage.get('tracking_event_fired_' + evt) && !$location.search().debug && !force) {
            return;
        }

        Storage.set('tracking_event_fired_' + evt, true);

        var callURL = '', item, allow, key, keys = Config.tracking || Config.main.trackingScripts;

        var callbackBackend = function callbackBackend(data) {
            console.log('Callback backend:', data);
        };

        for (key in keys) {
            item = keys[key];
            allow = item.event === evt && (!item.paramRequired || item.param) && (!item.alias || Tracking.fixURL($location.path()) === item.alias);

            if ($rootScope.profile) {
                if (item.currency  && item.currency !== $rootScope.profile.currency_name) {
                    allow = false;
                }
            }

            data.fromAmount = item.fromAmount;
            data.toAmount = item.toAmount;

            if (allow) {
                // track by postback
                if (item.postback) {
                    Zergling
                        .get({param: item.param, value: Storage.get('tracking_param_' + item.param)}, 'backend_tracking')
                        .then(callbackBackend, callbackBackend);
                }

                // track by url
                if (item.url) {
                    data[item.param] = Storage.get('tracking_param_' + item.param);
                    callURL = Tracking.renderTokens(item.url, data);

                    if (callURL) {
                        var tracking = document.createElement(item.tag || "IMG");
                        tracking.src = callURL;
                        tracking.style.display = 'none';
                        document.body.appendChild(tracking);
                    }
                }

                // facebook tracking
                if (item.fbq) {
                    fbq('track', item.fbq);
                }

                // reconvert tracking
                if (item.reconvert && window.RECONVERT && window.RECONVERT[item.reconvert]) {
                    window.RECONVERT[item.reconvert]();
                }

                // tfa tracking
                if (item.tfa && window._tfa) {
                    window._tfa.push({notify: 'event', name: item.tfa});
                }

                if (item.ga) {
                    analytics.gaSend('send', 'event', 'tracking', item.event, item.ga);
                }
                if(item.dataLayer && window.dataLayer) {
                    window.dataLayer.push(item.dataLayer);
                }
                if (item.callback) {
                    item.callback($rootScope);
                }

                if (item.popup) {
                    window.open(item.popup, 'trackingPopup', 'height=320,width=240');
                }

                if (item.dialog) {
                    $rootScope.globalDialog = item.dialog;
                }
            }
        }

        console.log('Tracking:', evt, callURL);

    };

    return Tracking;
}]);
