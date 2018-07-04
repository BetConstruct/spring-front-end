/* global VBET5 */
/**
 * @ngdoc directive
 * @name CMS.directive:cmsAnalytics
 *
 * @description Processes a banner click and sends analytics data to the server
 *
 */
VBET5.directive('cmsAnalytics',['$http', 'Storage', 'Config', 'WPConfig', function ($http, Storage, Config, WPConfig) {
    'use strict';
    return {
        restrict: 'A',
        scope: {
            cmsAnalytics: "="
        },
        link: function (scope, element) {
            if (scope.cmsAnalytics.is_analytical && !Storage.get('cms-a-' + scope.cmsAnalytics.id)) {
                var apiUrl = (Config.main.cmsDataDomain || WPConfig.wpUrl.replace('/json', '')) + '/statistics/addclick';
                element.bind('click', function () {

                    $http.post(apiUrl, {resource_id: scope.cmsAnalytics.id}).then(function (response) {
                        if (response.data && response.data.status === 'ok') {
                            Storage.set('cms-a-' + scope.cmsAnalytics.id, true);
                            element.unbind('click');
                        }
                    });
                });

                scope.$on('$destroy', function() {
                    element.unbind('click');
                });
            }
        }
    };
}] );
