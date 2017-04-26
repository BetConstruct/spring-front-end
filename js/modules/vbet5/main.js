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
 * defines getTemplate function which returns template path(needed to override templates in skins if needed)
 */
angular.module('vbet5').run(['$rootScope', '$location', '$routeParams', '$timeout', '$window', '$cookies', 'Utils', 'Config', 'SkinConfig', 'Storage', 'analytics', 'UserAgent', 'DomHelper', 'liveChat', 'partner', 'RegConfig', 'RuntimeConfig', 'Zergling', 'Tracking', 'Moment', 'Translator',
    function ($rootScope, $location, $routeParams, $timeout, $window, $cookies, Utils, Config, SkinConfig, Storage, analytics, UserAgent, DomHelper, liveChat, partner, RegConfig, RuntimeConfig, Zergling, Tracking, Moment, Translator) {
        'use strict';

        $rootScope.availableModules = availableModules;

        Utils.MergeRecursive(Config, SkinConfig);
        if (SkinConfig.regConfig) {
            Utils.MergeRecursive(RegConfig, SkinConfig.regConfig);
        }
        Utils.MergeRecursive(Config, RuntimeConfig && RuntimeConfig.SkinConfig);
        if (Config.main.localStorageKeyNamePrefix) {
            Storage.setKeyNamePrefix(Config.main.localStorageKeyNamePrefix);
        }

        Zergling.init();

        var lang = $location.search().lang || $cookies.get('lang') || Storage.get('lang') || (Config.main.getBrowserLanguage && Utils.getBrowserLanguage());

        if (!lang && Config.main.transLangByDomain && Config.main.transLangByDomain[$location.host()]) {
            lang = Config.main.transLangByDomain[$location.host()];
        }

        if (lang && Config.main.availableLanguages[lang] !== undefined) {
            Config.env.lang = lang;
            Storage.set('lang', lang);
            Translator.addTranslations(Config.main.addLowerCaseTranslations, Config.main.addUpperCaseTranslations);
        }

        Moment.setLang(Config.env.lang);

        if ($location.search().pid && (Config.main.site_id === null || Config.main.allowSiteIdOverride)) {
            Config.main.site_id = $location.search().pid;
        }
        if (Config.swarm.sendTerminalIdlInRequestSession) {
            Config.main.terminalId = $location.search().tid;
        }
        if (!Config.main.sportsLayout && Config.main.sportsClassicLayout) {
            Config.main.sportsLayout = "classic"; //legacy support
        }
        if (Config.main.enableSportsbookLayoutSwitcher) {
            if($cookies.get("sportsBookLayout") !== undefined){
                Config.main.sportsLayout = $cookies.get("sportsBookLayout");
            }else if (Storage.get('sportsBookLayout') !== undefined) {
                Config.main.sportsLayout = Utils.getActiveSportsLayout();
            } else if ($location.search().classic) {
                Config.main.sportsLayout = "classic";
            } else if ($location.search().sportsBookLayout) {
                if($location.search().sportsBookLayout !== 'classic' || Config.main.sportsLayout !== 'euro2016') {
                    Config.main.sportsLayout = $location.search().sportsBookLayout;
                }
                $location.search('sportsBookLayout', undefined);
            }
            //Config.env.showSportsbookToolTip = !Storage.get('dontShowLayoutSwitcherHint');
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

        // make these available to all scopes
        $rootScope.conf = Config.main;
        $rootScope.confPartner = Config.partner;
        $rootScope.poker = Config.poker;
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

        /**
         * @description returns template path(needed to override templates in skins if needed)
         * @param {string} path template path
         * @returns {string} skin template path
         */
        $rootScope.getTemplate = function getTemplate(path) {
            if (Config.customTemplates) {
                var replacedPath = path.replace(/(.*)(\/version_.+\/)(.*)/i, "$1/$3");
                var templatesPath = replacedPath.match(/.*(templates[^\/]*)\//)[1];
                var pathExcludedVersion = replacedPath.split(templatesPath + '/')[1];
                if (Config.customTemplates.indexOf(pathExcludedVersion) !== -1) {
                    return "skins/" + Config.main.skin + "/" + templatesPath + "/"  + pathExcludedVersion;
                }
            }
            return path;
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

        if (DomHelper.getWindowSize().width >= Config.main.wideScreenModeWidth) {
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

        if ($location.search().btag) {
            Storage.set('promo_code', $location.search().btag, Config.main.registration.promoCodeLifetime);
        }

        Tracking.init();
        Tracking.event('NUV');
        Tracking.event('runtime', null, true);

        /**
         *
         * @param {string} moduleName
         * @description checks if module is enabled from config. If not, redirects to homepage
         */
        $rootScope.checkIfEnabled = function (moduleName) {
            if (Config.main[moduleName + 'Enabled'] !== true) {
                console.log(moduleName, ' disabled');
                $location.path("/");
            }
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

        if (Config.main.preventPuttingInIFrame && $window.top.location != $window.location) {
            $window.top.location = $window.location.href;
        }

    }]);
