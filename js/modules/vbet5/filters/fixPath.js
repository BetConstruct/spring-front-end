/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:fixPath
 * @description returns template path(needed to override templates in skins if needed)
 * @param {string} path template path
 * @returns {string} skin template path
 *
 */
VBET5.filter('fixPath', ['Config', function (Config) {
    'use strict';
    return function (path) {
        if (Config.customTemplates) {
            var replacedPath = path.replace(/(.*)(\/version_.+\/)(.*)/i, "$1/$3");
            var templatesPath = replacedPath.match(/.*(templates[^\/]*)\//)[1];
            var pathExcludedVersion = replacedPath.split(templatesPath + '/')[1];
            if (Config.customTemplates.indexOf(pathExcludedVersion) !== -1) {
                return "skins/" + Config.main.skin + "/" + templatesPath + "/"  + pathExcludedVersion;
            }
        }
        return path;
    };
}]);