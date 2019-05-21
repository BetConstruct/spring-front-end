/**
 * @ngdoc controller
 * @name CMS.controller:cantrollerGo
 * @description vivarogo controller
 */
angular.module('CMS').controller('goCtrl', ['$location', '$rootScope', '$scope', 'content', 'Config', function ($location, $rootScope, $scope, content, Config) {
    'use strict';

    (function init() {
        $scope.vivaroGoData = {};

        content.getPage('vivaro-go-' + Config.env.lang).then(function (response) {
            if (response.data && response.data.page) {
                $scope.vivaroGoData.sliders = response.data.page.children[0].children;
                $scope.vivaroGoData.appInfo = response.data.page.children[1].children;
                $scope.vivaroGoData.sectionInfo = response.data.page.children[2].children;
            }
        });

        content.getPage('vivaro-go-backgrounds-' + Config.env.lang).then(function (response) {
            if (response.data && response.data.page) {
                $scope.vivaroGoData.background = response.data.page;
            }
        });
    })();

}]);
