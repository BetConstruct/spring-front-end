/**
 * @ngdoc module
 * @name CASINO.module:CASINO
 * @description
 *
 * casino module.  Responsible for retrieving data from  casino server.
 *
 */

var CASINO = angular.module('casino', ['ngRoute']);

CASINO.run(['Utils', 'CConfig', 'SkinCConfig', 'RuntimeConfig', function (Utils, CConfig, SkinCConfig, RuntimeConfig) {
    'use strict';

    Utils.MergeRecursive(CConfig, SkinCConfig); //load skin specific config overrides
    Utils.MergeRecursive(CConfig, RuntimeConfig && RuntimeConfig.SkinCConfig); //load config overrides from conf.json

}]);