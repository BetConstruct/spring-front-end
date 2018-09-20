/**
 * @ngdoc controller
 * @name CMS.controller:cmsPagesCtrl
 * @description
 * Static pages controller
 */
angular.module('CMS').controller('helpPagesCtrl', ['$location', '$rootScope', '$scope', '$routeParams', 'content', 'Config', function ($location, $rootScope, $scope, $routeParams, content, Config) {
    'use strict';
    $scope.nav = {
        top: 0,
        left: 0,
        mid: 0
    };

    $rootScope.footerMovable = true;

    function initRoute () {
        var slug = $location.path().split('/');
        angular.forEach($scope.faq, function (top, index) {
            if (top.slug === slug[2] || top.id === parseInt(slug[2], 10)) {
                $scope.nav.top = index;
            }
            angular.forEach($scope.faq[$scope.nav.top].children, function (left, index) {
                if (left.slug === slug[3] || left.id === parseInt(slug[3], 10)) {
                    $scope.nav.left = index;
                }
                angular.forEach($scope.faq[$scope.nav.top].children[$scope.nav.left].children, function (mid, index) {
                    if (mid.slug === slug[4] || mid.id === parseInt(slug[4], 10)) {
                        $scope.nav.mid = index;
                    }
                });
            });
        });
    }

    $scope.setRoute = function setRoute () {
        var calculated = [], pc;

        pc = $scope.faq[$scope.nav.top];
        if (pc) {
            calculated[0] = pc.slug || pc.id;
            pc = $scope.faq[$scope.nav.top].children[$scope.nav.left];
            if (pc) {
                calculated[1] = pc.slug || pc.id;
                pc = $scope.faq[$scope.nav.top].children[$scope.nav.left].children[$scope.nav.mid];
                if (pc) {
                    calculated[2] = pc.slug || pc.id;
                }
            }
        }

        $location.path('/help/' + calculated.join('/'));
    };

    function init() {
        content.getPage('help-root-' + Config.env.lang, true, true).then(function (data) {
            $scope.faq = data.data.page.children;
            initRoute();
        });
    }

    init();
}]);
