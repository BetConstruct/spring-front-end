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

    if (RuntimeConfig && RuntimeConfig.SkinWPConfig) {
        Utils.MergeRecursive(WPConfig, RuntimeConfig.SkinWPConfig); //load config overrides from conf.json
    } else {
        Utils.MergeRecursive(WPConfig, SkinWPConfig); //load skin specific config overrides
    }
}]);
