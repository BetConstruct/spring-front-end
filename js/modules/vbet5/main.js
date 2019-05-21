/**
 * @ngdoc module
 * @name vbet5.module:vbet5
 * @description
 *
 * Main module working with swarm
 */
var VBET5 = angular.module('vbet5', ['vbet5.betting', 'ngRoute', 'ngAnimate', 'ngCookies', 'truncate', 'smoothScroll', 'liveChat', 'monospaced.qrcode', 'rangeSlider', 'barcodeGenerator', 'ui.bootstrap', 'rzModule', 'angular.bind.notifier']);

/**
 * @ngdoc module
 * @name betting.module:vbet5.betting
 * @description
 *
 * Betting module
 */
var BettingModule = angular.module('vbet5.betting', ['ngMap']);

/**
 * @name vbet5
 * @id vbet5
 * @description #Bootstrap
 * makes Config.main and Config.env available at root scope
 *
 */
angular.module('vbet5').run(['$rootScope', '$location', '$routeParams', '$route', '$timeout', '$window', '$cookies', 'Utils', 'Config', 'SkinConfig', 'Storage', 'analytics', 'UserAgent', 'DomHelper', 'liveChat', 'partner', 'RegConfig', 'RuntimeConfig', 'Zergling', 'Tracking', 'Moment', 'Translator','facebookPixel', 'everCookie', 'Geoip', 'RoutesValidity', 'RecaptchaV3',
    function ($rootScope, $location, $routeParams, $route, $timeout, $window, $cookies, Utils, Config, SkinConfig, Storage, analytics, UserAgent, DomHelper, liveChat, partner, RegConfig, RuntimeConfig, Zergling, Tracking, Moment, Translator,facebookPixel, everCookie, Geoip, RoutesValidity, RecaptchaV3) {
        'use strict';

        $rootScope.availableModules = availableModules;
        (function manageConfigs() {
            if (SkinConfig.regConfig) {
                Utils.MergeRecursive(RegConfig, SkinConfig.regConfig);
            }
            if (RuntimeConfig && !Utils.isObjectEmpty(RuntimeConfig)) {
                Utils.MergeRecursive(Config, RuntimeConfig.SkinConfig);
            } else {
                Utils.MergeRecursive(Config, SkinConfig);
            }
        })();

        Utils.fixDomainChanges(Config, 'sportsbook');

        if (Config.main.localStorageKeyNamePrefix) {
            Storage.setKeyNamePrefix(Config.main.localStorageKeyNamePrefix);
        }

        if (Config.main.integrationMode) {
            Config.main.multiLevelMenu = {};
        }

        if (typeof Config.main.registration.minimumAllowedAge === 'object') { //bad solution and need to refactor
            Config.main.registration.minimumAllowedAge = Config.main.registration.minimumAllowedAge[$location.host()] || Config.main.registration.minimumAllowedAge['default'];
        }

        everCookie.init();
        Zergling.init();

        var lang = $location.search().lang || $cookies.get('lang') || Storage.get('lang') || (Config.main.getBrowserLanguage && Utils.getBrowserLanguage());

        if (!lang && Config.main.transLangByDomain && Config.main.transLangByDomain[$location.host()]) {
            lang = Config.main.transLangByDomain[$location.host()];
        }

        if (Config.main.redirectOnLanguage && Config.main.redirectOnLanguage[lang]) {
            Storage.set('lang', Config.env.lang);
            $location.search("lang", undefined);
            // Need the redirect function to work on timeout so the location changes properly
            $timeout(function redirect() { $window.location = Config.main.redirectOnLanguage[lang] +  $window.location.hash; }, 0);
        } else {
            if ($location.search().notrans === 'id') {
                Config.env.lang = 'notrans';
            } else if (lang && Config.main.availableLanguages[lang] !== undefined) {
                Config.env.lang = lang;
                Storage.set('lang', lang);
                Translator.addTranslations(Config.main.addLowerCaseTranslations, Config.main.addUpperCaseTranslations);
            }

            Moment.setLang(Config.env.lang);
        }

        if ($location.search().pid && (Config.main.site_id === null || Config.main.allowSiteIdOverride)) {
            Config.main.site_id = $location.search().pid;
        }
        if (Config.swarm.sendTerminalIdlInRequestSession) {
            Config.main.terminalId = $location.search().tid;
        }
        if (Config.main.enableSportsbookLayoutSwitcher) {
            if ($location.search().sportsBookLayout) {
                Config.main.sportsLayout = $location.search().sportsBookLayout;
                $location.search('sportsBookLayout', undefined);
            } else if ($cookies.get("sportsBookLayout") !== undefined){
                Config.main.sportsLayout = $cookies.get("sportsBookLayout");
            } else {
                var layout = Storage.get('sportsBookLayout');
                if (layout !== undefined && (Config.main.availableSportsbookViews[layout] || (Config.additionalModules && Config.additionalModules.indexOf(layout+'View') !== -1))) {
                    Config.main.sportsLayout = layout;
                } else if (Config.main.defaultSportsLayoutByCountry) {
                    Geoip.getGeoData(false).then(function(data) {
                        if (Config.main.defaultSportsLayoutByCountry[data.countryCode]) {
                            Config.main.sportsLayout = Config.main.defaultSportsLayoutByCountry[data.countryCode];
                        }
                    });
                }
            }
        }
        $rootScope.domainClass = $window.location.hostname.replace(/[\.\-]/g, '');

        if (Config.main.liveChat) {
            if (Config.main.liveChat.perLanguage && Config.main.liveChat.perLanguage[Config.env.lang]) {
                Config.main.liveChat = Config.main.liveChat.perLanguage[Config.env.lang];
            }
            liveChat.init(Config.main.liveChat);
        }

        function redirectIfNeeded() {
            if (Config.main.initialUrl  && $location.path() === '/') {
                if ($location.search().code) {
                    Config.main.initialUrl.params = Config.main.initialUrl.params || {};
                    Config.main.initialUrl.params.code = $location.search().code;
                }
                $location.path(Config.main.initialUrl.path).search(Config.main.initialUrl.params);
            } else if (Config.main.enableLandingPage && $location.path() === '/' && !Storage.get('lastLoggedInUsername')) {
                $location.path('/landing');
            }
        }
        var delay = $location.search().action ? 500 : 100;
        $timeout(redirectIfNeeded, delay);
        analytics.init();
        facebookPixel.init();


        Config.main.theVeryTopMenu  = Config.main.theVeryTopMenu && (Config.main.theVeryTopMenu[Config.env.lang] || Config.main.theVeryTopMenu.default || Config.main.theVeryTopMenu) || [];
        //need to sort them before adding a reference to the conf property of rootScope
        Utils.sortItemsArray(Config.main.theVeryTopMenu);

        // do filter and remove unavailable components for current host
        Config.main.homepage = Config.main.homepage.filter(function(item) {
            return (!item.availableHosts || item.availableHosts.indexOf($location.host()) !== -1);
        });

        Utils.sortItemsArray(Config.main.homepage);
        if (Config.main.footer.socialLinks) {
            Config.main.footer.socialLinks = Utils.objectToArray(Config.main.footer.socialLinks, 'key');
            Utils.sortItemsArray(Config.main.footer.socialLinks);
        }
        // make these available to all scopes
        $rootScope.conf = Config.main;
        $rootScope.releaseDate = Config.releaseDate;
        $rootScope.confPartner = Config.partner;
        $rootScope.env = Config.env;
        $rootScope.$location = $location;
        $rootScope.$routeParams = $routeParams;
        $rootScope.print = function print() {
            $window.print();
        };
        $rootScope.myGames = $rootScope.myGames || [];
        $rootScope.broadcast = function (msg, args) {
            if (msg) {
                $rootScope.$broadcast(msg, args);
            }
        };

        partner.init(); //init partner stuff  (for cases when we're opened in iframe and Gaspars sportsbook)
        UserAgent.ifTablet(function () {
            if (!$rootScope.conf.redirectOnTablets || $location.search().redirect === 'disabled' || $location.search().tablet || $location.path() === '/popup/') {
                $location.search('redirect', undefined);
                return;
            }
            var tabletUrl = $rootScope.conf.enableAutoDetectionOfTabletsUrl ? 'http://tablet.' + $window.location.host.replace('www.', '') + '/' : $rootScope.conf.redirectOnTablets;
            $window.location = tabletUrl + $window.location.hash;
        });

        $rootScope.userOS = UserAgent.getOS();
        $rootScope.userOSVersion = UserAgent.getOSVersion();

        if (DomHelper.getWindowSize().width >= 1833) {
            $rootScope.wideScreenMode = true;
        }

        $rootScope.setTitle = function setTitle(title) {
            if (Config.main.siteTitle.fixed && (Config.main.siteTitle[Config.env.lang] || Config.main.siteTitle['eng'])) {
                $rootScope.siteTitle = Config.main.siteTitle[Config.env.lang] || Config.main.siteTitle['eng'];
                return;
            }
            if (Config.main.siteTitle[title] && Config.main.siteTitle[title][Config.env.lang]) {
                $rootScope.siteTitle = Config.main.siteTitle[title][Config.env.lang];
                return;
            }
            if (Config.main.siteTitle[Config.env.lang]){
                $rootScope.siteTitle = (title ? Translator.get(title) + ' @ ' : '') + Config.main.siteTitle[Config.env.lang];
                return;
            }
            $rootScope.siteTitle = (title ? Translator.get(title) + ' @ ' : '') +  Config.main.siteTitle['eng'] ;
        };

        // handle online-offline status
        if (Config.main.offlineMessage) {
            $rootScope.$on('zergling.gotSession', function () {
                Config.env.isOffline = false;
            });

            $rootScope.$on('zergling.sessionLost', function () {
                Config.env.isOffline = true;
            });

            $rootScope.$on('zergling.lostWSConnection', function () {
                Config.env.isOffline = true;
            });
        }

        if (Config.main.preventPuttingInIFrame && $window.top.location !== $window.location) {
            $window.top.location = $window.location.href;
        }

        RoutesValidity.manage();

        (function init() {
            //in some cases the application runs with encoded url and it come from affiliate
            // this is the bad solution and need to remove after affiliates fix
            var url = $window.location.href;
            var decodedUrl = decodeURIComponent(url);
            if (url !== decodedUrl && decodedUrl.indexOf('AFFAGG') !== -1) {
                var spitedUrl = decodedUrl.split('#/');
                $window.location.href = spitedUrl[0] + '#/' + spitedUrl[spitedUrl.length - 1];
                $route.reload();
            }

            var params = $location.search();

            if (params.btag) {
                Storage.set('promo_code', params.btag, Config.main.registration.promoCodeLifetime);
                $cookies.putObject('promo_code', params.btag, Config.main.registration.promoCodeLifetime);
                if (params.AFFAGG) {
                    $location.search('AFFAGG', undefined);
                }
            }

            if (params.loyaltycode) {
                Storage.set('loyalty_code', params.loyaltycode, Config.main.registration.promoCodeLifetime);
            }

            Tracking.init();
            Tracking.event('NUV');
            Tracking.event('runtime', null, true);

            if (params.btag) {
                $location.search('btag', undefined);
            }

            if (params.loyaltycode) {
                $location.search('loyaltycode', undefined);
            }

            if(Config.betting.deleteBetsOnReload) {
                Storage.remove('vs_favorite_market_types');
                Storage.remove('favouriteMarketsTypes');
                Storage.remove('betslip');
            }
            RecaptchaV3.init();
            Config.main.sportsLayout === 'euro2016' && (Config.main.sportsLayout = 'classic'); //Todo remove after changing all configs
        })();
    }]);

