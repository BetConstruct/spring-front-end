/**
 * @ngdoc service
 * @name vbet5.service:TopMenu
 * @description main top menu data and methods
 *
 */
angular.module('vbet5').service('RoutesValidity', ['$rootScope', '$location', '$timeout' ,'$window', '$route', 'Translator', 'Config', 'Utils', 'Moment', function ($rootScope, $location, $timeout, $window, $route, Translator, Config, Utils, Moment) {
    'use strict';
    var RoutesValidity = {};

    var menuPaths = {
        "news": {
            path: "#/news",
            config: "enableNewsLinkInMenu"
        },
        "live": {
            path: Config.main.sportsLayout === 'combo' ? "#/overview" : "#/sport",
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
        "virtualsports": {
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
        },
        "blast": {
            path: "#/blast",
            config: "blastEnabled"
        },
        "expressofday": {
            path: "#/expressofday"
        },
        "sport-tournaments": {
            path: "#/sport-tournaments",
            config: "enableSportsbookTournaments"
        },
        "euro-2020": {
            path: "#/euro-2020"
        }

    };

    RoutesValidity.makeValid = function makeValid(path) {
        angular.forEach (menuPaths, function (value) {
            if (value.path === path){
                $rootScope.calculatedConfigs[value.config] = true;
                $rootScope.validPaths[path] = true;
            }
        });
    };

    function fixPath(path) {
        var fixedPath = path.split('?')[0];

        if (fixedPath.substr(fixedPath.length - 1) === '/') {
            return fixedPath.substr(0, fixedPath.length - 1);
        }
        return fixedPath;
    }

    RoutesValidity.manage = function manage() {
        $rootScope.validPaths = {};
        $rootScope.calculatedConfigs = {};

        angular.forEach (Config.main.multiLevelMenu, function(value , key) {
            var menuDetails = menuPaths[key];
            if (menuDetails !== undefined) {
                $rootScope.calculatedConfigs[menuDetails.config] = true;
                $rootScope.validPaths[menuDetails.path] = true;
            }
            if (value !== null) {
                if (value.subMenu !== undefined) {
                    angular.forEach(value.subMenu, function (subMenuItem) {
                        if (subMenuItem.href || subMenuItem.link) {
                            var path = subMenuItem.href || subMenuItem.link;
                            path = fixPath(path);
                            $rootScope.validPaths[path] = true;
                            RoutesValidity.makeValid(path);
                        }
                    });
                } else if (value.href || value.link) {
                    var path = value.href || value.link;
                    path = fixPath(path);
                    $rootScope.validPaths[path] = true;
                    RoutesValidity.makeValid(path);
                }
            }
        });

        if (Config.main.integrationMode || (Config.main.subHeaderItems && Config.main.subHeaderItems.length)) {
            $rootScope.calculatedConfigs["sportEnabled"] = true;
        }

        if($rootScope.calculatedConfigs.sportEnabled) {
            angular.forEach(Config.main.subHeaderItems, function(item) {
                var menuDetails = menuPaths[item.alias];
                var config = true;
                if (item.enabledConfig !== undefined) {
                    if (item.enabledConfig === "dashboardEnabled") {
                        config = Config.main.dashboard.enabled;
                    }else if(item.enabledConfig === "enableSportsbookTournaments"){
                        config = Config.main.sportTournaments.enabled;
                    } else {
                        config = Config.main[item.enabledConfig];
                    }
                }
                if (menuDetails !== undefined && config) {
                    $rootScope.calculatedConfigs[menuDetails.config] = true;
                    if (item.url === undefined) {
                        $rootScope.validPaths[menuDetails.path] = true;
                    } else {
                        $rootScope.validPaths[fixPath(item.url)] = true;
                    }
                }

            });
        }

        var manageMenu = function (menu) {
            if (menu) {
                for (var i = menu.length; i--;) {
                    if (menu[i].href) {
                        var path = fixPath(menu[i].href);
                        if (!$rootScope.validPaths[path]) {
                            $rootScope.validPaths[path] = true;
                            RoutesValidity.makeValid(path);
                        }
                    }
                }
            }
        };

        manageMenu(Config.main.headerNavigation.aboveLogo);
        manageMenu(Config.main.headerNavigation.nearLogo);
    };

    return RoutesValidity;
}]);

