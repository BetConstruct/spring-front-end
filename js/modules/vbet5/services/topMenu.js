/**
 * @ngdoc service
 * @name vbet5.service:TopMenu
 * @description main top menu data and methods
 *
 */
angular.module('vbet5').service('TopMenu', ['$rootScope', '$location', '$timeout' ,'$window', '$route', 'Translator', 'Config', 'Utils', function ($rootScope, $location, $timeout, $window, $route, Translator, Config, Utils) {
    'use strict';
    var TopMenu = {};

    var $scope; // this is set to scope of mainHeaderCtrl in init()
    /**
     * The huge top menu objects array
     */
    var topMenuItems = {
        'news': {
            displayName : Translator.get("News"),
            href: "#/news",
            click: null,
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: Config.main.enableNewsLinkInMenu
        },
        'livemodule-live': {
            displayName : Translator.get("Live"),
            click: function () { $scope.switchIntegratedTo('live'); },
            showCondition: Config.main.liveModule.enabled
        },
        'livemodule-sport': {
            displayName : Translator.get("Sport"),
            click: function () { $scope.switchIntegratedTo('prematch'); },
            showCondition: Config.main.liveModule.enabled
        },
        live: {
            displayName : Translator.get("Live"),
            href: Config.main.sportsLayout == 'combo' ? "#/overview" : "#/sport/?type=1",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.setGamesType(true); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: Config.main.sportEnabled
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
            href: '#/sport',
            showCondition: true
        },
        'dashboard': {
            displayName: Translator.get("Dashboard"),
            href: '#/dashboard',
            showCondition: Config.main.dashboard.enabled
        },
        overview: {
            displayName: Translator.get("Live Overview"),
            href: '#/overview',
            showCondition: Config.main.liveOverviewEnabled && (Config.main.sportsLayout !== 'modern')
        },
        multiview: {
            displayName: Translator.get("Live MultiView"),
            href: '#/multiview',
            showCondition: Config.main.liveMultiViewEnabled && (Config.main.sportsLayout !== 'modern')
        },
        statistics: {
            displayName: Translator.get("Statistics"),
            href: '{{Config.main.headerStatisticsLink}}',
            showCondition: Config.main.statisticsInsportsbookTab
        },
        results: {
            displayName: Translator.get("Results"),
            href: '#/results',
            showCondition: Config.main.showResultsTabInSportsbook
        },
        sport: {
            displayName : Translator.get("Sport"),
            href: Config.main.topMenuCustomUrl && Config.main.topMenuCustomUrl.sport ? Config.main.topMenuCustomUrl.sport : "#/sport/?type=0",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.setGamesType(false);  $scope.goToTop();$scope.setDefaultIfVirtual(); },
            classObject: {'active': false},
            staticClass: "menu-live",
            showCondition: Config.main.sportEnabled &&
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
            href: "#/livecalendar",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "menu-livecalendar",
            showCondition: Config.main.liveCalendarEnabled
        },
        'virtual-sports': {
            displayName : Translator.get("Virtual sports"),
            href: '#/virtualsports',
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); if (Config.main.sportsLayout !== 'asian' && Config.main.sportsLayout !== 'external') {$scope.setGamesType(false); $location.search('sport', -3);  $timeout(function () { $route.reload(); }, 100);}},
            classObject: {'active': false},
            staticClass: "casino fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.virtualSport),
            showCondition: Config.main.virtualSportEnabledInTopMenu
        },
        poolbetting: {
            specialCase: 'poolbetting',
            displayName : Translator.get("Pool Betting"),
            href: "#/poolbetting",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false },
            staticClass: "poolbetting-menu-item ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.poolBetting),
            showCondition: Config.main.poolBettingEnabled
        },
        'virtual-betting': {
            displayName : Translator.get("Virtual Betting"),
            href: "#/casino/?category=35",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); $rootScope.$broadcast('casino.selectCategory', {id: 35});},
            classObject: {'active': false},
            staticClass: "casino fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.virtualBetting),
            showCondition: Config.main.virtualBettingEnabledInTopMenu
        },
        belote: {
            displayName : Translator.get("Belote"),
            href: Config.belote.redirectOnInstantPlay ? Config.belote.instantPlayLink : "#/belote",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.belote),
            showCondition: Config.main.beloteEnabledInTopMenu,
            target: Config.belote.redirectOnInstantPlay ? Config.belote.instantPlayTarget : "_self"
        },
        backgammon: {
            displayName : Translator.get("Backgammon"),
            href: Config.backgammon.redirectOnInstantPlay ? Config.backgammon.instantPlayLink : "#/backgammon",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.backgammon),
            showCondition: Config.main.backGammonEnabledInTopMenu,
            target: Config.backgammon.redirectOnInstantPlay ? "_blank" : "_self"
        },
        pokerklas: {
            displayName : Translator.get("Poker Klas"),
            href: "#/pokerklas",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.pokerklas),
            showCondition: Config.main.pokerKlasEnabledInTopMenu
        },
        casino: {
            displayName : Translator.get("Casino"),
            href: "#/casino",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.casino),
            showCondition: Config.main.casinoEnabled
        },
        poker: {
            displayName : Translator.get("Poker"),
            href: Config.poker.redirectOnInstantPlay ? Config.poker.instantPlayLink : "#/poker",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "poker ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.poker),
            showCondition: Config.main.pokerEnabled,
            target: Config.poker.redirectOnInstantPlay ? "_blank" : "_self"
        },
        livedealer: {
            specialCase: Config.main.liveDealerMenuSpecialText ? 'liveDealerMenuSpecialText' : false,
            displayName : Translator.get("Live casino"),
            href: "#/livedealer",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "livecasino ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.liveCasino),
            showCondition: Config.main.livedealerEnabled
        },
        keno: {
            displayName : Translator.get("Keno"),
            href: "#/keno",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "keno ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.keno),
            showCondition: Config.main.kenoEnabled
        },
        games: {
            specialCase: Config.main.gameMenuSpecialText ? 'gamesSpecialText' : false,
            displayName : Translator.get("Games"),
            href: "#/games",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.games),
            showCondition: Config.main.skillgamesEnabled
        },
        ogwil: {
            displayName : Translator.get("OGWIL"),
            href: "#/ogwil",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "games ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.ogwil),
            showCondition: Config.main.ogwilEnabled
        },
        freebet: {
            displayName : Translator.get("Free Bet"),
            href: "#/freebet",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "freebet ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.freebet),
            showCondition: Config.main.freeBetEnabled
        },
        fantasy: {
            displayName : Translator.get("Fantasy Sports"),
            href: "#/fantasy",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "fantasy ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.fantasy),
            showCondition: Config.main.fantasyEnabled
        },
        jackpot: {
            displayName : Translator.get("Jackpot"),
            href: "#/jackpot",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "jackpot ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.jackpot),
            showCondition: Config.main.jackpotEnabled
        },
        financials: {
            displayName : Translator.get("Finbet"),
            href: "#/financials",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: Config.main.financialsEnabled
        },
        financials1: {
            displayName : Translator.get("Finbet"),
            supDisplayName: 'v1',
            href: "#/financials",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: Config.main.financialsEnabled
        },
        financials2: {
            displayName : Translator.get("Finbet"),
            supDisplayName: 'v2',
            href: "#/game/TLCTLC/provider/TLC/exid/14000",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "financials ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.financials),
            showCondition: Config.main.financialsEnabled
        },
        exchange: {
            displayName : Translator.get("Bookmaker"),
            href: Config.main.exchangeCustomLink || "#/exchange/0/",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "exchange ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.exchange),
            showCondition: Config.main.exchangeEnabled
        },
        winners: {
            displayName : Translator.get("Winners"),
            href: "#/winners",
            click: function () { $rootScope.topMenuDropDown = false; $scope.closeSlider(); $scope.goToTop(); },
            classObject: {'active': false},
            staticClass: "winners ",
            dynamicClass: correctDynamicClass(Config.main.newMenuItems.winners),
            showCondition: Config.main.winnersEnabled
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
                    menuItem.classObject.active = ($location.path() === '/sport/' && !Config.env.live && ($location.search().sport != '-3' || !Config.main.virtualSportEnabledInTopMenu)) || $location.path() === '/livecalendar/';
                    break;
                case 'virtual-sports':
                    menuItem.classObject.active = ($location.path() === '/virtualsports/');
                    break;
                case 'virtual-betting':
                    menuItem.classObject.active = ($location.path() === '/casino/' && $location.search().category == "35");
                    break;
                case 'casino':
                    menuItem.classObject.active = $location.path() === '/casino/' && ($location.search().category != 35 || !Config.main.virtualBettingEnabledInTopMenu);
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

            // case when additional menu item links to a sport
            if ($location.path() === '/sport/' && $location.search().sport && Config.main.menuItems && Config.main.menuItems.length) {
                angular.forEach(Config.main.menuItems, function (additionalMenuItem) {
                    var itemSportId = (additionalMenuItem[Config.env.lang] && additionalMenuItem[Config.env.lang].sportId) || additionalMenuItem.sportId;
                    if (Number($location.search().sport) === itemSportId) {
                        menuItem.classObject.active = menuItem.href.indexOf(itemSportId) !== -1;
                    }
                });
            }
        });

        if (!isActive) {
            $scope.subMenuItems = null;
        }
    };

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
                subItem.classObject.active = ('#' + $location.path() === subItem.href || '#' + $location.path() === subItem.href + '/') || ($location.path() === (subItem.activeLink ? subItem.activeLink : ('/' + subItem.name + '/')) || $location.url() === (subItem.activeLink ? subItem.activeLink : ('/' + subItem.name + '/')));
                if (subItem.classObject.active) {
                    menuItem.classObject.active = true;
                }
            }
        }

        if (menuItem.classObject.active) {
            $scope.subMenuItems = menuItem.subMenu;
        }
    }

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

        $scope.topMenuItemsCount = ['sportEnabled', 'casinoEnabled', 'pokerEnabled', 'skillgamesEnabled', 'poolBettingEnabled', 'liveDealerEnabled', 'financialsEnabled']
            .reduce(function (count, current) { return Config.main[current] ? count + 1 : count; }, 0);

        $scope.topMenu = [];

        // in order to have multi level (actually 2) menu
        // define 'Config.main.multiLevelMenu' field in the skin's config file (example is in testskin.com.js)
        var orderCount = 0, menuData = Config.main.multiLevelMenu || Config.main.menuOrder;

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
                                activeLink: subMenuItem.activeLink
                            });
                        });
                    }

                    menuItem.authorized = menuData[menuName].authorized;
                    menuItem.displayName = (menuData[menuName].label && Translator.get(menuData[menuName].label)) || menuItem.displayName;



                }

                menuItem.name = menuName;
                if (isVisible(menuItem, countryCode)) {
                   $scope.topMenu.push(menuItem);
                }
            }
        });

        // combine menu items into single array // lot of legacy support
        var menuItemsMerged = Utils.combineArrays([Config.main.multiLevelMenu, Config.main.menuItems]);
        angular.forEach(menuItemsMerged, function (value) {
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
                        if (value.broadcast) {
                            $rootScope.broadcast(value.broadcast, value.broadcastData);
                        }
                    },
                    classObject: {'active': false},
                    supDisplayName: value.supDisplayName || null,
                    dynamicClass: value.dynamicClass || null,
                    subMenu: value.subMenu || [],
                    target: value.target || '',
                    staticClass: value.cssclass || value.name + " " + (Config.main.newMenuItems.freebet ? 'new-top-nav' : ""),
                    showCondition: true,
                    activeLink: value.activeLink,
                    visibleForLayout: value.visibleForLayout,
                    authorizedOnly: value.authorizedOnly || false,
                    authorized: value.authorized
                };

                if (isVisible(menuObj, countryCode)) {
                    $scope.topMenu.push(menuObj);

                    if (menuData.indexOf) {
                        if (value.order !== undefined) {
                            menuData.splice(value.order - 1, 0, value.name || value.title);
                        } else {
                            menuData.push(value.name || value.title);
                        }
                    } else {
                        menuData[value.name || value.title] = {order: value.order || $scope.topMenu.length + 1000};
                    }
                }
            }
        });

        TopMenu.refresh();

        if (menuData.indexOf) {
            Utils.sortByIndex($scope.topMenu, menuData);
        } else {
            Utils.sortByField($scope.topMenu, menuData);
        }

        $rootScope.$on('$locationChangeSuccess', TopMenu.updateMenuItemsState);
        $timeout(TopMenu.updateMenuItemsState); //initial
    };

    /**
     * @ngdoc method
     * @name refresh
     * @methodOf vbet5.service:TopMenu
     * @description Correct dynamic class of the menu item
     * @param {Object} [params]  Menu item object
     */
    TopMenu.refresh = function refresh() {
        if (!$scope.topMenu) {
            return;
        }
        Config.env.hideCasinoFavorites = false;
        var itemIndex;
        $scope.topMenuLength = $scope.topMenu.length;
        // remove items if not authorized or there is a dependency from Layout
        for (itemIndex = $scope.topMenu.length - 1; itemIndex >= 0; itemIndex --) {
            $scope.topMenu[itemIndex].showCondition = !($scope.topMenu[itemIndex].authorized && !Config.env.authorized) && !($scope.topMenu[itemIndex].visibleForLayout && $scope.topMenu[itemIndex].visibleForLayout.indexOf(Config.main.sportsLayout) == -1);
            if (!$scope.topMenu[itemIndex].showCondition) {
                $scope.topMenuLength--;
                Config.env.hideCasinoFavorites = $scope.topMenu[itemIndex].name === 'casino'? true : false;
                if($location.path().indexOf($scope.topMenu[itemIndex].name) !== -1) {
                    $location.path('#/');
                }
            }
        }
    };

    return TopMenu;
}]);

