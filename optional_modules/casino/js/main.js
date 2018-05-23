/**
 * @ngdoc module
 * @name CASINO.module:CASINO
 * @description
 *
 * casino module.  Responsible for retrieving data from  casino server.
 *
 */

var CASINO = angular.module('casino', ['ngRoute']);

CASINO.run(['$rootScope', 'Utils', 'CConfig', 'SkinCConfig', 'RuntimeConfig', function ($rootScope, Utils, CConfig, SkinCConfig, RuntimeConfig) {
    'use strict';

    if (RuntimeConfig && RuntimeConfig.SkinCConfig) {
        Utils.MergeRecursive(CConfig, RuntimeConfig.SkinCConfig); //load config overrides from conf.json
    } else {
        Utils.MergeRecursive(CConfig, SkinCConfig); //load skin specific config overrides
    }

    Utils.fixDomainChanges(CConfig, 'casino');

    $rootScope.cUrlPrefix = CConfig.cUrlPrefix;
}]);