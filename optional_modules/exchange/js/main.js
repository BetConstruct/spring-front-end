
var EXCHANGE = angular.module('exchange', ['ngLodash']);

EXCHANGE.run(['$rootScope', 'Utils', 'ExchangeConfig', 'SkinExchangeConfig', 'RuntimeConfig', function ($rootScope, Utils, ExchangeConfig, SkinExchangeConfig, RuntimeConfig) {
    'use strict';

    Utils.MergeRecursive(ExchangeConfig, SkinExchangeConfig); //load skin specific config overrides
    Utils.MergeRecursive(ExchangeConfig, RuntimeConfig && RuntimeConfig.SkinExchangeConfig); //load config overrides from conf.json

    // make these available to all scopes for Exchange Module
    $rootScope.exchangeConf = ExchangeConfig.main;

}]);

angular.module('vbet5').config(['$routeProvider', 'SkinConfig', function ($routeProvider, SkinConfig) {
    'use strict';

    function getTemplate(path) {
        if (SkinConfig.customTemplates && SkinConfig.customTemplates.indexOf(path.substr(10)) !== -1) {
            return "skins/" + SkinConfig.main.skin + "/" + path;
        }
        return path;
    }
    $routeProvider
        .when('/exchange/:type/:sportId/:regionId/:competitionId/:gameId/', {
            templateUrl: getTemplate('optional_modules/exchange/templates/exchange/main.html'),
            reloadOnSearch: false
        })
        .when('/exchange/:type/', {
            templateUrl: getTemplate('optional_modules/exchange/templates/exchange/main.html'),
            reloadOnSearch: false
        }).when('/exchange', {
            redirectTo: '/exchange/0/'
        });

}]);

