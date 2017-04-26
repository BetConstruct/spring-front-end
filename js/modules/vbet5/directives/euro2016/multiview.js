/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:row
 *
 * @description directive for displaying game, market information in 'comboView'
 *
 */
 VBET5.directive('euro2016Multiview', ['$rootScope', 'Config', function ($rootScope, Config) {
     return {
        scope: {
            multiViewLiveOpenedGames: '=*'
        },
        templateUrl: function templateUrl (el, attr) {
            return $rootScope.getTemplate('templates/sport/euro2016/center/multiview.html');
        },
        link: function (scope, element, attr) {
            scope.Math=Math;
            scope.conf = Config.main;
            scope.getTemplate = function getTemplate(path) {
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
        }
     };
 }]);