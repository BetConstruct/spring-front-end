/**
 * @ngdoc controller
 * @name vbet5.controller:pmuCtrl
 */
VBET5.controller('skinningCtrl', [ '$scope', 'Utils', function ($scope, Utils) {
    'use strict';

    $scope.copyToClipboard = function copyToClipboard(event) {
        var className = event.currentTarget.className;
        var element = document.getElementsByClassName(className);
        Utils.copyToClipboard((getComputedStyle(element[0], ':before').getPropertyValue('content')));
    }
}]);
