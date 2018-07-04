/**
 * @ngdoc service
 * @name vbet5.service:TopMenu
 * @description main top menu data and methods
 *
 */
angular.module('vbet5').service('TopMenu', ['$rootScope', '$location', '$timeout' ,'$window', '$route', 'Translator', 'Config', 'Utils', 'Moment', function ($rootScope, $location, $timeout, $window, $route, Translator, Config, Utils, Moment) {
    'use strict';
    var TopMenu = {};

    var $scope; // this is set to scope of mainHeaderCtrl in init()
    /**
     * The huge top menu objects array
     */
    var topMenuItems = {
        'news': {
            displayName : Translator.get("News"),
            href: "#/news/",
            click: null,
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: $rootScope.calculatedConfigs.enableNewsLinkInMenu
        },
        'livemodule-live': {
            displayName : Translator.get("Live"),
            click: function () { $scope.switchIntegratedTo('live'); },
            showCondition: Config.main.liveModule.enabled
        },
        'livemodule-sport': {
            displayName : Translator.get("Sports"),
            click: function () { $scope.switchIntegratedTo('prematch'); },
            showCondition: Config.main.liveModule.enabled
        },
        live: {
            displayName : Translator.get("Live"),
            href: Config.main.sportsLayout == 'combo' ? "#/overview/" : "#/sport/?type=1",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.setGamesType(true); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: $rootScope.calculatedConfigs.sportEnabled
            && (
                   (Config.main.sportsLayout === 'modern' && Config.main.customSportsBook.modern.showLive)
                || (Config.main.sportsLayout === 'classic' && Config.main.customSportsBook.classic.showLive)
                || (Config.main.sportsLayout === 'combo' && Config.main.customSportsBook.combo.showLive)
                || (Config.main.sportsLayout === 'external' && Config.main.customSportsBook.external.showLive)
                || (Config.main.sportsLayout === 'asian' && Config.main.customSportsBook.asian.showLive)
                || (Config.main.sportsLayout === 'euro2016' && Config.main.customSportsBook.euro2016.showLive)
            )
        },
        'event-view': {
            displayName: Translator.get("Event View"),
            href: '#/sport/',
            showCondition: true
        },
        'dashboard': {
            displayName: Translator.get("Dashboard"),
            href: '#/dashboard/',
            showCondition: $rootScope.calculatedConfigs.dashboardEnabled
        },
        overview: {
            displayName: Translator.get("Live Overview"),
            href: '#/overview/',
            showCondition: $rootScope.calculatedConfigs["liveOverviewEnabled"] && (Config.main.sportsLayout !== 'modern')
        },
        multiview: {
            displayName: Translator.get("Live MultiView"),
            href: '#/multiview/',
            showCondition: $rootScope.calculatedConfigs["liveMultiViewEnabled"] && (Config.main.sportsLayout !== 'modern')
        },
        statistics: {
            displayName: Translator.get("Statistics"),
            href: '{{Config.main.header.statisticsLink}}',
            showCondition: Config.main.statisticsInsportsbookTab
        },
        results: {
            displayName: Translator.get("Results"),
            href: '#/results/',
            showCondition: $rootScope.calculatedConfigs["showResultsTabInSportsbook"]
        },
        sport: {
            displayName : Translator.get("Sports"),
            href: Config.main.topMenuCustomUrl && Config.main.topMenuCustomUrl.sport ? Config.main.topMenuCustomUrl.sport : "#/sport/?type=0",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider();  $scope.goToTop(); if (!Config.main.topMenuCustomUrl || !Config.main.topMenuCustomUrl.sport) { $scope.setGamesType(false); $scope.setDefaultIfVirtual(); }},
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: $rootScope.calculatedConfigs.sportEnabled &&
            (
                   (Config.main.sportsLayout === 'modern' && Config.main.customSportsBook.modern.showPrematch)
                || (Config.main.sportsLayout === 'classic' && Config.main.customSportsBook.classic.showPrematch)
                || (Config.main.sportsLayout === 'euro2016' && Config.main.customSportsBook.euro2016.showPrematch)
                || (Config.main.sportsLayout === 'combo' && Config.main.customSportsBook.combo.showPrematch)
                || (Config.main.sportsLayout === 'external' && Config.main.customSportsBook.external.showPrematch)
                || (Config.main.sportsLayout === 'asian' && Config.main.customSportsBook.asian.showPrematch)
            )
        },
        livecalendar: {
            displayName : Translator.get("Live calendar"),
            href: "#/livecalendar/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "menu-livecalendar",
            showCondition: $rootScope.calculatedConfigs.liveCalendarEnabled
        },
        'virtual-sports': {
            displayName : Translator.get("Virtual sports"),
            href: '#/virtualsports/',
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop();},
            classObject: {'active': false},
            staticClass: "casino fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.virtualSport),
            showCondition: $rootScope.calculatedConfigs.virtualSportsEnabled
        },
        poolbetting: {
            specialCase: 'poolbetting',
            displayName : Translator.get("Pool Betting"),
            href: "#/poolbetting/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false },
            staticClass: "poolbetting-menu-item ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.poolBetting),
            showCondition: $rootScope.calculatedConfigs.poolBettingEnabled
        },
        'virtual-betting': {
            displayName : Translator.get("Virtual Betting"),
            href: "#/casino/?category=35",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); $rootScope.$broadcast('casino.selectCategory', {id: "35"});},
            classObject: {'active': false},
            staticClass: "casino fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.virtualBetting),
            showCondition: $rootScope.calculatedConfigs.virtualBettingEnabledInTopMenu
        },
        belote: {
            displayName : Translator.get("Belote"),
            href: Config.belote.redirectOnInstantPlay ? Config.belote.instantPlayLink : "#/belote/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.belote),
            showCondition: $rootScope.calculatedConfigs.beloteEnabled,
            target: Config.belote.redirectOnInstantPlay ? Config.belote.instantPlayTarget : "_self"
        },
        backgammon: {
            displayName : Translator.get("Backgammon"),
            href: Config.backgammon.redirectOnInstantPlay ? Config.backgammon.instantPlayLink : "#/backgammon/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.backgammon),
            showCondition: $rootScope.calculatedConfigs.backgammonEnabled,
            target: Config.backgammon.redirectOnInstantPlay ? "_blank" : "_self"
        },
        pokerklas: {
            displayName : Translator.get("Poker Klas"),
            href: "#/pokerklas/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.pokerklas),
            showCondition: $rootScope.calculatedConfigs.pokerKlasEnabledInTopMenu
        },
        ggpoker: {
            displayName : Translator.get("GG Poker"),
            href: "#/ggpoker/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.ggpoker),
            showCondition: $rootScope.calculatedConfigs.ggpokerEnabledInTopMenu
        },
        casino: {
            displayName : Translator.get("Casino"),
            href: "#/casino/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.casino),
            showCondition: $rootScope.calculatedConfigs.casinoEnabled
        },
        tournaments: {
            displayName : Translator.get("Tournaments"),
            href: "#/tournaments/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); $rootScope.$broadcast('goToHomepage') },
            classObject: {'active': false},
            staticClass: "tournaments ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.tournaments),
            showCondition: $rootScope.calculatedConfigs.tournamentsEnabled
        },
        poker: {
            displayName : Translator.get("Poker"),
            href: Config.poker.redirectOnInstantPlay ? Config.poker.instantPlayLink : "#/poker/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "poker ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.poker),
            showCondition: $rootScope.calculatedConfigs.pokerEnabled,
            target: Config.poker.redirectOnInstantPlay ? "_blank" : "_self"
        },
        'chinese-poker': {
            displayName : Translator.get("Chinese Poker"),
            href: "#/chinesepoker/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.chinesePoker),
            showCondition: $rootScope.calculatedConfigs.chinesePokerEnabled
        },
        livedealer: {
            specialCase: Config.main.liveDealerMenuSpecialText ? 'liveDealerMenuSpecialText' : false,
            displayName : Translator.get("Live casino"),
            href: "#/livedealer/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "livecasino ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.liveCasino),
            showCondition: $rootScope.calculatedConfigs.livedealerEnabled
        },
        keno: {
            displayName : Translator.get("Keno"),
            href: "#/keno/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "keno ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.keno),
            showCondition: $rootScope.calculatedConfigs.kenoEnabled
        },
        games: {
            specialCase: Config.main.gameMenuSpecialText ? 'gamesSpecialText' : false,
            displayName : Translator.get("Games"),
            href: "#/games/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.games),
            showCondition: $rootScope.calculatedConfigs.skillgamesEnabled
        },
        ogwil: {
            displayName : Translator.get("OGWIL"),
            href: "#/ogwil/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.ogwil),
            showCondition: $rootScope.calculatedConfigs.ogwilEnabled
        },
        freebet: {
            displayName : Translator.get("Free Bet"),
            href: "#/freebet/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "freebet ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.freebet),
            showCondition: $rootScope.calculatedConfigs.freeBetEnabled
        },
        fantasy: {
            displayName : Translator.get("Fantasy Sports"),
            href: "#/fantasy/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.fantasy),
            showCondition: $rootScope.calculatedConfigs.fantasyEnabled
        },
        jackpot: {
            displayName : Translator.get("Jackpot"),
            href: "#/jackpot/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "jackpot ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.jackpot),
            showCondition: $rootScope.calculatedConfigs.jackpotEnabled
        },
        financials: {
            displayName : Translator.get("Finbet"),
            href: "#/financials/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: $rootScope.calculatedConfigs.financialsEnabled
        },
        financials1: {
            displayName : Translator.get("Finbet"),
            supDisplayName: 'v1',
            href: "#/financials/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: $rootScope.calculatedConfigs.financialsEnabled
        },
        financials2: {
            displayName : Translator.get("Finbet"),
            supDisplayName: 'v2',
            href: "#/game/TLCTLC/provider/TLC/exid/14000",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: $rootScope.calculatedConfigs.financialsEnabled
        },
        exchange: {
            displayName : Translator.get("Bookmaker"),
            href: Config.main.exchangeCustomLink || "#/exchange/0/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "exchange ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.exchange),
            showCondition: $rootScope.calculatedConfigs.exchangeEnabled
        },
        winners: {
            displayName : Translator.get("Winners"),
            href: "#/winners/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "winners ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.winners),
            showCondition: $rootScope.calculatedConfigs.winnersEnabled
        },
        'today-bets': {
            displayName : Translator.get("Today"),
            href: "#/sport/?type=0&sport=-11&dayshift=0",
            click: function () {$rootScope.$broadcast('openTodayBets'); $scope.closeSlider();},
            showCondition: true
        },
        'tomorrow-bets': {
            displayName : Translator.get("Tomorrow"),
            href: "#/sport/?type=0&sport=-11&dayshift=1",
            click: function () {$rootScope.$broadcast('openTodayBets'); $scope.closeSlider();},
            showCondition: true
        }
    };

    /**
     * @ngdoc method
     * @name correctDynamicClass
     * @methodOf vbet5.service:TopMenu
     * @description Correct dynamic class of the menu item
     * @param {Object} [params]  Menu item object
     */
    function correctDynamicClass(menuItemDynamicConf) {
        if (menuItemDynamicConf) {
            if (menuItemDynamicConf === true) {
                return 'new-top-nav';
            } else {
                return menuItemDynamicConf + '-top-nav';
            }
        }
        return "";
    }

    /**
     * @ngdoc method
     * @name handleSubMenuState
     * @methodOf vbet5.service:TopMenu
     * @description Change sub meni item state based on url data
     * @param {Object} [params]  Menu item object
     */
    function handleSubMenuState(menuItem) {
        var subItem;
        if (menuItem.subMenu) {
            for (var i = 0, length = menuItem.subMenu.length; i < length; ++i) {
                subItem = menuItem.subMenu[i];
                subItem.classObject = subItem.classObject || {};
                subItem.classObject.active = !subItem.excludeParam && (('#' + $location.path() === subItem.href || '#' + $location.path() === subItem.href + '/') || ($location.path() === (subItem.activeLink ? subItem.activeLink : ('/' + subItem.name + '/')) || $location.url() === (subItem.activeLink ? subItem.activeLink : ('/' + subItem.name + '/'))));
                if (subItem.classObject.active) {
                    menuItem.classObject.active = true;
                }
            }
        }

        if (menuItem.classObject.active) {
            $scope.subMenuItems = menuItem.subMenu;
            $rootScope.currentPage.hasSubHeader = true;
        }
    }

    /**
     * @ngdoc method
     * @name updateMenuItemsState
     * @methodOf vbet5.service:TopMenu
     * @description updates objects passed to ng-class (will be called on location change)
     */
    TopMenu.updateMenuItemsState = function updateMenuItemsState() {
        var isActive = false;
        angular.forEach($scope.topMenu, function (menuItem) {
            menuItem.classObject = menuItem.classObject || {};
            switch (menuItem.name) {
                case 'live':
                    menuItem.classObject.active = (($location.path() === '/sport/' && Config.env.live) || $location.path() === '/overview/' || $location.path() === '/multiview/');
                    break;
                case 'sport':
                    menuItem.classObject.active = ($location.path() === '/sport/' && !Config.env.live && ($location.search().sport != '-3' || !$rootScope.calculatedConfigs.virtualSportsEnabled)) || $location.path() === '/livecalendar/';
                    break;
                case 'virtual-sports':
                    menuItem.classObject.active = ($location.path() === '/virtualsports/');
                    break;
                case 'virtual-betting':
                    menuItem.classObject.active = ($location.path() === '/casino/' && $location.search().category == "35");
                    break;
                case 'casino':
                    menuItem.classObject.active = $location.path() === '/casino/' && ($location.search().category != 35 || !$rootScope.calculatedConfigs.virtualBettingEnabledInTopMenu);
                    break;
                case 'poker':
                    menuItem.classObject.active = ($location.path() === '/poker/' || $location.path() === '/poker');
                    break;
                case 'games':
                    menuItem.classObject.active = ($location.path() === '/games/');
                    break;
                case 'financials':
                    menuItem.classObject.active = ($location.path() === '/financials/') || ($location.path() === '/game/TLCTLC/provider/TLC/exid/14000');
                    break;
                case 'financials1':
                    menuItem.classObject.active = ($location.path() === '/financials/');
                    break;
                case 'financials2':
                    menuItem.classObject.active = ($location.path() === '/game/TLCTLC/provider/TLC/exid/14000');
                    break;
                case 'cyber':
                    menuItem.classObject.active = ($location.path() === '/customsport/cyber/');
                    break;
                case 'Promotions':
                    menuItem.classObject.active = ($location.path() === '/promos/');
                    break;
                default:
                    menuItem.classObject.active = ($location.path() === (menuItem.activeLink ? menuItem.activeLink : ('/' + menuItem.name + '/')) || $location.url() === (menuItem.activeLink ? menuItem.activeLink : ('/' + menuItem.name + '/')));
                    break;
            }

            handleSubMenuState(menuItem);

            if (menuItem.classObject.active) {
                isActive = true;
            }


        });

        if (!isActive) {
            $scope.subMenuItems = null;
        }
    };

    /**
     * @ngdoc method
     * @name isVisible
     * @methodOf vbet5.service:TopMenu
     * @description Returns true or false based on country code  for each menu item
     * @param {Object} [params]  Menu item object
     * @param {String} Country code
     */
    function isVisible (menuItem, countryCode) {
        if (countryCode && Config.main.menuCountryFilter && Config.main.menuCountryFilter[countryCode]) {
            return Config.main.menuCountryFilter[countryCode].indexOf(menuItem.name) !== -1;
        }
        return true;
    }

    //TODO remove after the world cup
    function addRussia2018() {
        if (Config.main.integrationMode) {
            Config.main.subHeaderItems.splice(1, 0, {
                alias: "russia2018",
                displayName: Translator.get("Russia 2018"),
                badge: 'new'
            });
            return;
        }

        for (var i = 0; i < $scope.topMenu.length; ++i) {
            if ($scope.topMenu[i].href.indexOf('#/sport') !== -1) {
                $scope.topMenu.splice(0, 0, {
                    "name": "Russia 2018",
                        "displayName": Translator.get("Russia 2018"),
                    "href": "#/russia2018/?p=calendar",
                    "classObject": {
                        "active": false
                    },
                    "supDisplayName": null,
                    "dynamicClass": 'new-top-nav',
                    "subMenu": [],
                    "target": "",
                    "staticClass": "undefined ",
                    "showCondition": true,
                    "activeLink": "/russia2018/",
                    "authorizedOnly": false,
                    "reload": "false"
                });

                $rootScope.validPaths['#/russia2018'] = true;
                break;
            }
        }
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service.TopMenu
     * @description
     *
     * @param {Object} scope scope to use
     */
    TopMenu.init = function init(scope, countryCode) {
        $scope = scope;

        $scope.topMenuItemsCount = ['sport', 'casino', 'poker', 'games', 'poolbetting', 'livedealer', 'financials']
            .reduce(function (count, current) { return $rootScope.calculatedConfigs[current  + "Enabled"] ? count + 1 : count; }, 0);

        $scope.topMenu = [];

        // in order to have multi level (actually 2) menu
        // define 'Config.main.multiLevelMenu' field in the skin's config file (example is in testskin.com.js)
        var orderCount = 0, menuData = Config.main.multiLevelMenu;

        // add order and restore object if not set in multiLevelMenu
        // combine menu items into single array // lot of legacy support

        if (!menuData.indexOf) {
            angular.forEach(menuData, function (value, name) {
                menuData[name] = value || {};
                if (!menuData[name].order) {
                    menuData[name].order = orderCount;
                }
                orderCount++;
            });
        }

        angular.forEach(topMenuItems, function (menuItem, menuName) {
            // only items from config will remain
            if (((menuData.indexOf && menuData.indexOf(menuName) !== -1) || menuData[menuName]) && menuItem.showCondition) {
                if (menuData[menuName]) {
                    if (menuData[menuName].disableLink) {
                        menuItem.href = "";
                        menuItem.click = function() {};
                    }

                    if (menuData[menuName].supDisplayName !== undefined) {
                        menuItem.supDisplayName = menuData[menuName].supDisplayName;
                    }

                    if (menuData[menuName].subMenu) {
                        menuItem.subMenu = [];
                        angular.forEach(menuData[menuName].subMenu, function (subMenuItem) {
                            menuItem.subMenu.push({
                                href: subMenuItem.href || topMenuItems[subMenuItem.name].href,
                                displayName: subMenuItem.displayName ? Translator.get(subMenuItem.displayName) : topMenuItems[subMenuItem.name].displayName,
                                name: subMenuItem.name || '',
                                activeLink: subMenuItem.activeLink,
                                excludeParam: subMenuItem.excludeParam
                            });
                        });
                    }
                    menuItem.authorized = menuData[menuName].authorized || false;
                    menuItem.authorizedOnly = menuData[menuName].authorizedOnly || false;
                    menuItem.positiveBalanceOnly = menuData[menuName].positiveBalanceOnly || false;
                    menuItem.displayName = (menuData[menuName].label && Translator.get(menuData[menuName].label)) || menuItem.displayName;
                    menuItem.reload = menuData[menuName].reload ? 'true' : 'false';
                    menuItem.dynamicClass = menuData[menuName].dynamicClass || menuItem.dynamicClass;
                    menuItem.subTitle = menuData[menuName].subTitle || menuItem.subTitle || "";
                }

                menuItem.name = menuName;
                if (isVisible(menuItem, countryCode)) {
                   $scope.topMenu.push(menuItem);
                }
            }
        });

        angular.forEach(Config.main.multiLevelMenu, function (value) {
            value = value[Config.env.lang] || value.eng || value;
            if (value.name || value.title || value.displayName) {
                var menuObj = {
                    name: value.name || value.title,
                    displayName: Translator.get(value.displayName || value.name || value.title || ''),
                    href: value.href || value.link,
                    click: function () {
                        $rootScope.topMenuDropDown = false;
                        $scope.closeSlider();
                        $scope.goToTop();

                        if (value.authorizedOnly && !$rootScope.env.authorized) {
                            $rootScope.broadcast( 'openLoginForm')
                        } else if (value.broadcast) {
                            $rootScope.broadcast(value.broadcast, value.broadcastData);
                        }
                    },
                    classObject: {'active': false},
                    subTitle: value.subTitle,
                    supDisplayName: value.supDisplayName || null,
                    dynamicClass: value.dynamicClass || null,
                    subMenu: value.subMenu || [],
                    target: value.target || '',
                    staticClass: value.cssclass || value.name + " " + (Config.main.newMenuItems.freebet ? 'new-top-nav' : ""),
                    showCondition: true,
                    activeLink: value.activeLink,
                    visibleForLayout: value.visibleForLayout,
                    authorizedOnly: value.authorizedOnly || false,
                    authorized: value.authorized,
                    positiveBalanceOnly: value.positiveBalanceOnly,
                    reload: value.reload ? 'true' : 'false'
                };
                if(value.broadcastData){
                    menuObj.id = value.broadcastData.id;
                }

                if (isVisible(menuObj, countryCode)) {
                    $scope.topMenu.push(menuObj);
                    menuData[value.name || value.title] = {order: value.order || $scope.topMenu.length + 1000};

                }
            }
        });

        TopMenu.refresh();

        if (menuData.indexOf) {
            Utils.sortByIndex($scope.topMenu, menuData);
        } else {
            Utils.sortByField($scope.topMenu, menuData);
        }

        addRussia2018();

        $rootScope.$on('$locationChangeSuccess', TopMenu.updateMenuItemsState);
        $timeout(TopMenu.updateMenuItemsState); //initial
    };

    function productAvailibilityForAge(item, age) {
        if (age && age < 21 && item.href) { // disable casino items
            var i = 0, length = $rootScope.casinoPaths.length;
            for (; i < length; ++i) {
                if (item.href.indexOf($rootScope.casinoPaths[i]) !== -1) {
                    $rootScope.casinoEnabled = false;
                    $rootScope.calculatedConfigs.pokerEnabled = false;
                    return false;
                }
            }
        }
        return true;
    }

    function getAvailability(item, age) {

        var availability = !(item.authorized && !Config.env.authorized) && !(item.positiveBalanceOnly && (!$rootScope.profile || !$rootScope.profile.calculatedBalance)) && !(item.visibleForLayout && item.visibleForLayout.indexOf(Config.main.sportsLayout) === -1) && productAvailibilityForAge(item, age);
        if(item.name === 'casino' && item.showCondition && availability && !$rootScope.casinoEnabled){
            $rootScope.casinoEnabled = true;
        }
        if(item.name === 'poker' && item.showCondition && availability && !$rootScope.calculatedConfigs.pokerEnabled){
            $rootScope.calculatedConfigs.pokerEnabled = true;
        }
        if (!availability && item.name && ($location.path().indexOf(item.name) !== -1) ) {
            $location.path('#/');
        }
        return availability;
    }

    /**
     * @ngdoc method
     * @name refresh
     * @methodOf vbet5.service:TopMenu
     * @description Correct dynamic class of the menu item
     *
     */
    TopMenu.refresh = function refresh() {
        if (!$scope.topMenu) {
            return;
        }

        var age = 21;
        if (Config.main.domainSpecificPrefixes && $rootScope.profile && $rootScope.profile.birth_date) {
            age = Moment.get().diff(Moment.get(Moment.moment.utc($rootScope.profile.birth_date)), 'year');
        }

        Config.env.hideCasinoFavorites = false;
        var itemIndex;
        $scope.topMenuLength = $scope.topMenu.length;
        // remove items if not authorized or there is a dependency from Layout
        for (itemIndex = $scope.topMenu.length - 1; itemIndex >= 0; itemIndex --) {
            $scope.topMenu[itemIndex].showCondition = getAvailability($scope.topMenu[itemIndex], age);
            if (!$scope.topMenu[itemIndex].showCondition) {
                $scope.topMenuLength--;
                Config.env.hideCasinoFavorites = $scope.topMenu[itemIndex].name === 'casino';
            } else if ($scope.topMenu[itemIndex].subMenu && $scope.topMenu[itemIndex].subMenu.length) {
                for (var subIndex = $scope.topMenu[itemIndex].subMenu.length - 1; subIndex >=0; --subIndex) {
                    $scope.topMenu[itemIndex].subMenu[subIndex].showCondition = getAvailability($scope.topMenu[itemIndex].subMenu[subIndex], age);
                }
            }

            if ($rootScope.validPaths && $rootScope.validPaths['#/' + $scope.topMenu[itemIndex].name] !== undefined) {
                $rootScope.validPaths['#/' + $scope.topMenu[itemIndex].name] = !!$scope.topMenu[itemIndex].showCondition;
            }
        }

        console.log('VALID PATH', $rootScope.validPaths);
        $rootScope.$broadcast('root.checkAndCorrectPath');

    };

    return TopMenu;
}]);

