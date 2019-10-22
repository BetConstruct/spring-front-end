/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:trackClickCount
 *
 * @description For every click of link send google analytics request
 *
 */
VBET5.directive('trackClickCount', ['analytics', function (analytics) {
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.bind("click", function () {
        analytics.gaSend('send', 'event', 'banner', 'Clicked ' + attrs.href);
      });
    }
  };

}]);
