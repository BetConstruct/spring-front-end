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
angular.module('vbet5').run(['$rootScope', '$location', '$routeParams', '$timeout', '$window', '$cookies', 'Utils', 'Config', 'SkinConfig', 'Storage', 'analytics', 'UserAgent', 'DomHelper', 'liveChat', 'partner', 'RegConfig', 'RuntimeConfig', 'Zergling', 'Tracking', 'Moment', 'Translator','facebookPixel', 'everCookie', 'Geoip',
    function ($rootScope, $location, $routeParams, $timeout, $window, $cookies, Utils, Config, SkinConfig, Storage, analytics, UserAgent, DomHelper, liveChat, partner, RegConfig, RuntimeConfig, Zergling, Tracking, Moment, Translator,facebookPixel, everCookie, Geoip) {
        'use strict';

        $rootScope.availableModules = availableModules;

        if (SkinConfig.regConfig) {
            Utils.MergeRecursive(RegConfig, SkinConfig.regConfig);
        }
        if (RuntimeConfig && !Utils.isObjectEmpty(RuntimeConfig)) {
            Utils.MergeRecursive(Config, RuntimeConfig.SkinConfig);
        } else {
            Utils.MergeRecursive(Config, SkinConfig);
        }

        Utils.fixDomainChanges(Config, 'sportsbook');

        if (Config.main.localStorageKeyNamePrefix) {
            Storage.setKeyNamePrefix(Config.main.localStorageKeyNamePrefix);
        }

        if (Config.main.integrationMode){
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
            } else if ($location.search().classic) {
                Config.main.sportsLayout = "classic";
            } else if (Storage.get('sportsBookLayout') !== undefined && (Config.main.availableSportsbookViews[Storage.get('sportsBookLayout')] || (Config.additionalModules && Config.additionalModules.indexOf(Storage.get('sportsBookLayout')+'View') !== -1))) {
                Config.main.sportsLayout = Storage.get('sportsBookLayout');
            } else if (Config.main.defaultSportsLayoutByCountry) {
                Geoip.getGeoData(false).then(function(data) {
                    if (Config.main.defaultSportsLayoutByCountry[data.countryCode]) {
                        Config.main.sportsLayout = Config.main.defaultSportsLayoutByCountry[data.countryCode];
                    }
                });
            }
            // need to remove after refactor
            Config.main.sportsLayout === "classic" && !Config.main.availableSportsbookViews.classic && Config.main.availableSportsbookViews.euro2016 && (Config.main.sportsLayout = 'euro2016');
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

        // make these available to all scopes
        $rootScope.conf = Config.main;
        $rootScope.releaseDate = Config.releaseDate;
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

        if ($location.search().btag) {
            Storage.set('promo_code', $location.search().btag, Config.main.registration.promoCodeLifetime);
            $cookies.putObject('promo_code', $location.search().btag, Config.main.registration.promoCodeLifetime);
        }

        Tracking.init();
        Tracking.event('NUV');
        Tracking.event('runtime', null, true);

        $location.search().btag && $location.search('btag', undefined);

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


        $rootScope.validPaths = {};
        $rootScope.calculatedConfigs = {};

        var menuPaths = {
            "news": {
                path: "#/news",
                config: "enableNewsLinkInMenu"
            },
            "live": {
                path: Config.main.sportsLayout == 'combo' ? "#/overview" : "#/sport",
                config: "sportEnabled"
            },
            "dashboard": {
                path: '#/dashboard',
                config: "dashboardEnabled"
            },
            "overview": {
                path: "#/overview",
                config: "liveOverviewEnabled"
            },
            "multiview": {
                path: "#/multiview",
                config: "liveMultiViewEnabled"
            },
            "statistics": {
                path: "#/statistics",
                config: "statisticsInsportsbookTab"
            },
            "results": {
                path: '#/results',
                config: "showResultsTabInSportsbook"
            },
            "sport": {
                path: Config.main.topMenuCustomUrl && Config.main.topMenuCustomUrl.sport ? Config.main.topMenuCustomUrl.sport : "#/sport",
                config: "sportEnabled"
            },
            "livecalendar": {
                path: "#/livecalendar",
                config: "liveCalendarEnabled"
            },
            "virtual-sports": {
                path: "#/virtualsports",
                config: "virtualSportsEnabled"
            },
            "poolbetting": {
                path: "#/poolbetting",
                config: "poolBettingEnabled"
            },
            "virtual-betting": {
                path: "#/casino",
                config: "virtualBettingEnabledInTopMenu"
            },
            "belote": {
                path: Config.belote.redirectOnInstantPlay ? Config.belote.instantPlayLink : "#/belote",
                config: "beloteEnabled"
            },
            "backgammon": {
                path: Config.backgammon.redirectOnInstantPlay ? Config.backgammon.instantPlayLink : "#/backgammon",
                config: "backgammonEnabled"
            },
            "pokerklas": {
                path: "#/pokerklas",
                config: "pokerKlasEnabledInTopMenu"
            },
            "ggpoker": {
                path: "#/ggpoker",
                config: "ggpokerEnabledInTopMenu"
            },
            "casino": {
                path: "#/casino",
                config: "casinoEnabled"
            },
            "tournaments": {
                path: "#/tournaments",
                config: "tournamentsEnabled"
            },
            "poker": {
                path: Config.poker.redirectOnInstantPlay ? Config.poker.instantPlayLink : "#/poker",
                config: "pokerEnabled"
            },
            "chinese-poker": {
                path: "#/chinesepoker",
                config: "chinesePokerEnabled"
            },
            "livedealer": {
                path: "#/livedealer",
                config: "livedealerEnabled"
            },
            "keno": {
                path: "#/keno",
                config: "kenoEnabled"
            },
            "games": {
                path: "#/games",
                config: "skillgamesEnabled"
            },
            "ogwil": {
                path: "#/ogwil",
                config: "ogwilEnabled"
            },
            "freebet": {
                path: "#/freebet",
                config: "freeBetEnabled"
            },
            "fantasy": {
                path: "#/fantasy",
                config: "fantasyEnabled"
            },
            "jackpot": {
                path: "#/jackpot",
                config: "jackpotEnabled"
            },
            "financials": {
                path: "#/financials",
                config: "financialsEnabled"
            },
            "financials1": {
                path: "#/financials",
                config: "financialsEnabled"
            },
            "financials2": {
                path: "#/game/TLCTLC/provider/TLC/exid/14000",
                config: "financialsEnabled"
            },
            "exchange": {
                path: Config.main.exchangeCustomLink || "#/exchange/0/",
                config: "exchangeEnabled"
            },
            "winners": {
                path: "#/winners",
                config: "winnersEnabled"
            },
            "betonpolitics": {
                path: "#/betonpolitics",
                config: "betOnPoliticsEnabled"
            },
            "esports": {
                path: "#/esports",
                config: "esportsEnabled"
            }
        };

        var findAndChangeConfig = function (path) {
            angular.forEach (menuPaths, function (value) {
                if (value.path === path){
                    $rootScope.calculatedConfigs[value.config] = true;
                    $rootScope.validPaths[path] = true;
                }
            });
        };
        $rootScope.findAndChangeConfig = findAndChangeConfig;
        var fixPath = function(path) {
            var fixedPath = path;
            var questionMarkIndex = fixedPath.indexOf("?");
            if(questionMarkIndex !== -1) {
                fixedPath =  fixedPath.substr(0, questionMarkIndex);
            }
            var lastCharacter = fixedPath.substr(fixedPath.length - 1);
            if (lastCharacter === '/') {
                fixedPath = fixedPath.substr(0, fixedPath.length - 1);
            }
            return fixedPath;
        };

        angular.forEach (Config.main.multiLevelMenu, function(value , key) {
            var menuDetails = menuPaths[key];
            if (menuDetails !== undefined) {
                $rootScope.calculatedConfigs[menuDetails.config] = true;
                $rootScope.validPaths[menuDetails.path] = true;
            }
            if(value !== null){
                if (value.subMenu !== undefined) {
                    angular.forEach(value.subMenu, function (subMenuItem) {
                        if (subMenuItem.href || subMenuItem.link) {
                            var path = subMenuItem.href || subMenuItem.link;
                            path = fixPath(path);
                            $rootScope.validPaths[path] = true;
                            findAndChangeConfig(path);
                        }
                    });
                } else if (value.href || value.link) {
                    var path = value.href || value.link;
                    path = fixPath(path);
                    $rootScope.validPaths[path] = true;
                    findAndChangeConfig(path);
                }
            }
        });

        if (Config.main.integrationMode || (Config.main.subHeaderItems && Config.main.subHeaderItems.length)) {
            $rootScope.calculatedConfigs["sportEnabled"] = true;
        }

        if($rootScope.calculatedConfigs.sportEnabled){
            angular.forEach(Config.main.subHeaderItems, function(item) {
                var menuDetails = menuPaths[item.alias];
                var config = true;
                if (item.enabledConfig != undefined) {
                    if (item.enabledConfig === "dashboardEnabled") {
                        config = Config.main.dashboard.enabled;
                    } else {
                        config = Config.main[item.enabledConfig];
                    }
                }
                if (menuDetails !== undefined && config) {
                    $rootScope.calculatedConfigs[menuDetails.config] = true;
                    if (item.url === undefined) {
                        $rootScope.validPaths[menuDetails.path] = true;
                    }
                }

            });
        }

        var topMenu = Config.main.theVeryTopMenu ?
            (Config.main.theVeryTopMenu.length ? Config.main.theVeryTopMenu : Config.main.theVeryTopMenu[$rootScope.env.lang] || Config.main.theVeryTopMenu['default']) : '';

        if (topMenu) {
            angular.forEach(topMenu, function(item){
                if (item.href) {
                    var path = fixPath(item.href);
                    if (!$rootScope.validPaths[path]) {
                        $rootScope.validPaths[path] = true;
                        findAndChangeConfig(path);
                    }
                }
            });
        }

    }]);
