/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:drawCtrl
 * @description
 *  draw controller.
 */
VBET5.controller('drawCtrl', ['$scope', '$rootScope', '$timeout', 'casinoData', function ($scope, $rootScope, $timeout, casinoData) {
    'use strict';

    var PROMO_IDS = {
        '1': { // vivarobet
            'arm': 216714,
            'rus': 216726,
            'eng': 216719,
            'geo': 216723,
            'fas': 216721

        },
        '4': { //vbet
            'arm': 216229,
            'rus': 215394,
            'eng': 215399,
            'ger': 219218,
            'spa': 219428,
            'por': 219429,
            'pt-br': 219430,
            'pol': 219430,
            'ukr': 219432,
            'tur': 219217,
            'kor': 219225,
            'jpn': 219227,
            'chi': 219220,
            'zhh': 219221,
            'arb': 219219,
            'geo': 215408,
            'fas': 219219
        },
        '128': { //zirkabet
            'eng': 200949,
            'rus': 200951,
            'ukr': 201223
        }
    };
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

    $scope.resultUrl = '#/promos/?slug=all&news=' + (PROMO_IDS[$rootScope.conf.site_id] && PROMO_IDS[$rootScope.conf.site_id][$rootScope.env.lang] ||
        PROMO_IDS[$rootScope.conf.site_id]['eng']);

    getData();
}]);
