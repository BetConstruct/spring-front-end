/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:drawCtrl
 * @description
 *  draw controller.
 */
VBET5.controller('drawCtrl', ['$scope', '$rootScope', '$timeout', 'casinoData', 'content', function ($scope, $rootScope, $timeout, casinoData, content) {
    'use strict';

    function getData() {
        casinoData.getDraw().then(function(response) {
            if (response && response.data) {
                $scope.data = response.data;
            }
        })['finally'](function () {
            $timeout(function () {
                getData();
            }, 3000);
        });
    }

    (function init() {
        getData();

        content.getPage('special-promotions-' + $rootScope.env.lang).then(function (data) {
            if (data && data.data.page && data.data.page.children) {
                var children =  data.data.page.children;
                for (var i = children.length; i--;) {
                    if (children[i].slug === 'live-draw') {
                        $scope.pageData = {
                            background: children[i].thumbnail,
                            promoUrl: children[i].url,
                            title: children[i].title,
                            target: children[i].linktarget
                        };
                        break;
                    }
                }
            }
        });
    })();
}]);
