/**
 * @ngdoc module
 * @name CMS.module:CMS
 * @description
 *
 * CMS module.  Responsible for retrieving data from  CMS.
 */
var CMS = angular.module('CMS', ['ngRoute', 'snapscroll']);

CMS.run(['Utils', 'WPConfig', 'SkinWPConfig', 'RuntimeConfig', function (Utils, WPConfig, SkinWPConfig, RuntimeConfig) {
    'use strict';

    Utils.MergeRecursive(WPConfig, SkinWPConfig); //load skin specific config overrides
    Utils.MergeRecursive(WPConfig, RuntimeConfig && RuntimeConfig.SkinWPConfig); //load config overrides from conf.json

}]);
