angular.module('vbet5').config(['$routeProvider', '$anchorScrollProvider', 'SkinConfig', 'Config', function ($routeProvider, $anchorScrollProvider, SkinConfig, Config) {
    'use strict';

    $anchorScrollProvider.disableAutoScrolling();

    function getTemplate(path) {
        if (SkinConfig.customTemplates && (SkinConfig.customTemplates.indexOf(path.substr(10)) !== -1 || SkinConfig.customTemplates.indexOf(path) !== -1)) { // substr's "10" param is the length of "templates/"
            return "skins/" + SkinConfig.main.skin + "/" + path;
        }
        return path;
    }

    $routeProvider
        .when('/about/:section?', {
            templateUrl: getTemplate('templates/about/main.html'),
            reloadOnSearch: false
        })
        .when('/sport/', {
            templateUrl: getTemplate('templates/sport/main.html'),
            reloadOnSearch: false
        })
        .when('/help/:part1?/:part2?/:part3?', {
            templateUrl: getTemplate('templates/help-page/main.html'),
            reloadOnSearch: false
        })
        .when('/overview/', {
            templateUrl: function () {
                return getTemplate('templates/sport/classic/overview/main.html');
            },
            reloadOnSearch: false
        })
        .when('/multiview/', {
            templateUrl: function () {
                return getTemplate('templates/sport/dashboard/main2016.html');
            },
            reloadOnSearch: false
        })
        .when('/dashboard/', {
            templateUrl: function () {
                return getTemplate('templates/sport/dashboard/main2016.html');
            },
            reloadOnSearch: false
        }).when('/statistics/', {
            templateUrl: getTemplate('templates/sport/statistics/main.html'),
            reloadOnSearch: false
        })
        .when('/customsport/:section/', {
            templateUrl: getTemplate('templates/sport/main.html'),
            reloadOnSearch: false
        })
        .when('/virtualsports/', {
            templateUrl: function () {
                if (Config.virtualSport.integrationMode) {
                    return getTemplate('templates/integratedIframeProducts/virtualSport.html');
                }

                return getTemplate('templates/sport/classic/virtualsportsContainer.html');
            },
            reloadOnSearch: false
        })
        .when('/expressofday/', {
            templateUrl: function () {
                return getTemplate('templates/sport/expressOfDay/main.html');
            },
            reloadOnSearch: false
        })
        .when('/pinnacle/', {
            templateUrl: getTemplate('templates/sport/pinnacle.html'),
            reloadOnSearch: false
        })
        .when('/insvirtualsports/', {
            templateUrl: function () {
                return getTemplate('templates/sport/classic/virtualsportsContainer.html');
            },
            reloadOnSearch: false
        })
        .when('/wonderwheel/', {
            templateUrl: getTemplate('optional_modules/casino/templates/wonderWheel.html'),
            reloadOnSearch: false
        })
        .when('/vsports/', {
            templateUrl: getTemplate('templates/virtualSportsAPI/main.html'),
            reloadOnSearch: false
        })
        .when('/poolbetting/', {
            templateUrl: getTemplate('templates/sport/main.html'),
            reloadOnSearch: false
        })
        .when('/sport-tournaments/', {
            templateUrl: getTemplate('templates/sport/tournaments/main.html'),
            reloadOnSearch: false
        })
        .when('/freebet/', {
            templateUrl: getTemplate('templates/freebet/main.html'),
            reloadOnSearch: false
        })
        .when('/page/:slug', {
            templateUrl: getTemplate('templates/pages/main.html')
        })
        .when('/section/:slug', {
            templateUrl: getTemplate('templates/section/main.html')
        })
        .when('/casino/', {
            templateUrl: getTemplate('optional_modules/casino/templates/main.html'),
            reloadOnSearch: false
        })
        .when('/jackpots/', {
            templateUrl: getTemplate('optional_modules/casino/templates/casino-jackpot-page.html'),
            reloadOnSearch: false
        })
        .when('/tournaments/', {
            templateUrl: getTemplate('optional_modules/casino/templates/tournament/main.html'),
            reloadOnSearch: false
        })
        .when('/promos/', {
            templateUrl: getTemplate('templates/promos/main.html'),
            reloadOnSearch: false
        })
        .when('/vip-promos/', {
            templateUrl: getTemplate('templates/promos/vip-main.html'),
            reloadOnSearch: false
        })
	    .when('/exchange-shop/', {
            templateUrl: getTemplate('templates/exchange-shop/main.html'),
            reloadOnSearch: false
        })
        .when('/dealership/', {
            templateUrl: getTemplate('templates/promos/vip-main.html'),
            reloadOnSearch: false
        })
        .when('/promonews/', {
            templateUrl: getTemplate('templates/promos/promonews.html'),
            reloadOnSearch: false
        })
        .when('/cas-promos/', {
            templateUrl: getTemplate('templates/promos/casinoPromo.html'),
            reloadOnSearch: false
        })
        .when('/first_deposit_bonus/', {
            templateUrl: getTemplate('templates/promos/firstDepositBonusPromo.html'),
            reloadOnSearch: false
        })
        .when('/first_deposit_bonus_and_20_free_spins/', {
            templateUrl: getTemplate('templates/promos/firstDepositBonusAnd20FreeSpinsPromo.html'),
            reloadOnSearch: false
        })
        .when('/livedealer/', {
            templateUrl: getTemplate('optional_modules/casino/templates/livedealer/main.html'),
            reloadOnSearch: false
        })
        .when('/keno/', {
            templateUrl: getTemplate('optional_modules/casino/templates/livedealer/keno.html'),
            reloadOnSearch: false
        })
        .when('/fantasy/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/fantasy.html'),
            reloadOnSearch: false
        })
        .when('/ogwil/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/ogwil.html'),
            reloadOnSearch: false
        })
        .when('/poker/:type?', {
            templateUrl: getTemplate('optional_modules/casino/templates/poker/main.html'),
            reloadOnSearch: false
        })
        .when('/blast/', {
            templateUrl: getTemplate('optional_modules/casino/templates/blast/main.html'),
            reloadOnSearch: false
        })
        .when('/chinesepoker/', {
            templateUrl: getTemplate('optional_modules/casino/templates/poker/chinesepoker.html'),
            reloadOnSearch: false
        })
        .when('/belote/', {
            templateUrl: getTemplate('optional_modules/casino/templates/belote/main.html'),
            reloadOnSearch: false
        })
        .when('/vrcasino/', {
            templateUrl: getTemplate('optional_modules/casino/templates/vrcasino/main.html'),
            reloadOnSearch: false
        })
        .when('/vrlivedealer/', {
            templateUrl: getTemplate('optional_modules/casino/templates/vrlivedealer/main.html'),
            reloadOnSearch: false
        })
        .when('/backgammon/', {
            templateUrl: getTemplate('optional_modules/casino/templates/backgammon/main.html'),
            reloadOnSearch: false
        })
        .when('/pokerklas/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/pokerklas.html'),
            reloadOnSearch: false
        })
        .when('/ggpoker/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/ggpoker.html'),
            reloadOnSearch: false
        })
        .when('/iphone/', {
            templateUrl: getTemplate('templates/golg/main.html'),
            reloadOnSearch: false
        })
        .when('/lottery/', {
            templateUrl: getTemplate('templates/lottery/main.html'),
            reloadOnSearch: false
        })
        .when('/affiliate/', {
            templateUrl: getTemplate('templates/affiliate/main.html'),
            reloadOnSearch: false
        })
        .when('/landpage/', {
            templateUrl: getTemplate('templates/affiliate/landpage.html'),
            reloadOnSearch: false
        })
        .when('/landing/', {
            templateUrl: getTemplate('templates/landing/main.html'),
            reloadOnSearch: false
        })
        .when('/gameslanding/', {
            templateUrl: getTemplate('templates/landing/games-landing.html'),
            reloadOnSearch: false
        })
        .when('/free_winners/', {
            templateUrl: getTemplate('templates/free/main.html'),
            reloadOnSearch: false
        })
        .when('/winners/', {
            templateUrl: getTemplate('templates/pages/winners.html'),
            reloadOnSearch: false
        })
        .when('/games/', {
            templateUrl: getTemplate('optional_modules/casino/templates/skillgames/main.html'),
            reloadOnSearch: false
        })
        .when('/provider/:keys', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/providerGames.html'),
            reloadOnSearch: false
        })
        .when('/csbpoolbetting/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/csbpoolbetting.html'),
            reloadOnSearch: false
        })
        .when('/game/:slug/provider/:slug/exid/:slug', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/specialgame.html'),
            reloadOnSearch: false
        })
        .when('/game/:slug/provider/:slug/exid/:slug/table/:slug', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/specialgame.html'),
            reloadOnSearch: false
        })
        .when('/jackpot/', {
            templateUrl: getTemplate('optional_modules/casino/templates/jackpot/main.html'),
            reloadOnSearch: false
        })
        .when('/financials/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/financials.html'),
            reloadOnSearch: false
        })
        .when('/', {
            templateUrl: getTemplate('templates/homepage/main.html'),
            reloadOnSearch: false
        })
        .when('/popup/', {
            templateUrl: getTemplate('templates/popup/main.html'),
            reloadOnSearch: true
        })
        .when('/news/', {
            templateUrl: getTemplate('templates/news/main.html'),
            reloadOnSearch: false
        })
        .when('/livecalendar/', {
            templateUrl:  getTemplate('templates/livecalendar/classic/main.html'),
            reloadOnSearch: false
        })
        .when('/results/', {
            templateUrl: getTemplate('templates/results/main.html'),
            reloadOnSearch: false
        })
        .when('/mobile/', {
            templateUrl: getTemplate('templates/mobile/main.html'),
            reloadOnSearch: false
        })
        .when('/apppokerist/', {
            templateUrl: getTemplate('optional_modules/casino/templates/specialgames/apppokerist.html'),
            reloadOnSearch: false
        })
        .when('/widget/:widgetid', {
            templateUrl: getTemplate('templates/widget/main.html'),
            reloadOnSearch: false
        })
        .when('/europlayoff/:tabId?', {
            templateUrl: getTemplate('templates/sport/championship/classic/main.html'),
            reloadOnSearch: false
        })
        .when('/subscriptions/', {
            templateUrl: getTemplate('templates/pages/subscriptions.html'),
            reloadOnSearch: false
        })
        .when('/winninglimits/', {
            templateUrl: getTemplate('templates/pages/winningLimits.html'),
            reloadOnSearch: false
        })
        .when('/404/', {
            templateUrl: getTemplate('templates/pages/pageNotFound.html'),
            reloadOnSearch: false
        })
        .when('/checkers/', {
            templateUrl: getTemplate('optional_modules/casino/templates/checkers/main.html'),
            reloadOnSearch: false
        })
        .when('/skinning/', {
            templateUrl: getTemplate('templates/skinning/main.html'),
            reloadOnSearch: false
        })
        .when('/betonpolitics/', {
            templateUrl: 'templates/bet-on-politics/main.html',
            reloadOnSearch: false
        })
        .when('/esports/', {
            templateUrl: getTemplate('templates/sport/esports/main.html'),
            reloadOnSearch: false
        })
        .when('/go/', {
            templateUrl: getTemplate('templates/landing/go.html'),
            reloadOnSearch: false
        })
        .when('/pmu/', {
            templateUrl: getTemplate('templates/integratedIframeProducts/pmu.html'),
            reloadOnSearch: false
        })
        .when('/euro-2020/', {
            templateUrl: getTemplate('templates/integratedIframeProducts/euro2020.html'),
            reloadOnSearch: false
        })
        .when('/bet-on-lineup/', {
            templateUrl: getTemplate('templates/sport/betOnLineup/main.html'),
            reloadOnSearch: false
        })
        .when('/quiz/', {
            templateUrl: getTemplate('templates/quiz/main.html'),
            reloadOnSearch: false
        })
        .when('/frame/', {
            templateUrl: getTemplate('templates/frame/main.html'),
            reloadOnSearch: false
        })
        .otherwise({
            redirectTo: '/sport/'
        });

}]);
