/* global VBET5 */
/**
 * @ngparsedText directive
 * @name vbet5.directive:readMore
 * @description expand section, to view rest of the text
 *
 * @param {String} bigger value
 */
VBET5.directive('readMore',['$timeout',  function ($timeout) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: 'templates/directive/read-more.html',
        scope: {
            content: '@',
            maximumNumberOfLines: '='
        },
        link: function (scope, elem, attrs) {
            var element =  document.getElementById("readMoreText");

            scope.setShowState = function setShowState(showMore) {
                scope.showMore = showMore;
            };

            var timeoutPromise = null;

            function contentChangeHandler() {
                scope.showButtons = false;
                scope.showMore = false;
                if (scope.maximumNumberOfLines === 0) {
                    scope.hideContent = false;
                    return;
                }
                scope.hideContent = true;
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }
                $timeout(function () {
                    scope.hideContent = false;
                }, 100);
                timeoutPromise = $timeout(function calculateHeight() {
                    var height = element.offsetHeight;
                    if (!height) {
                        return;
                    }
                    var lineHeight = +(document.defaultView.getComputedStyle(element, null).lineHeight.replace('px', ''));
                    scope.availableHeight = scope.maximumNumberOfLines * lineHeight + 'px';
                    scope.showButtons = height > scope.maximumNumberOfLines * lineHeight;
                }, 100);


            }

            attrs.$observe('content', contentChangeHandler);

            scope.$on("$destroy", function () {
                $timeout.cancel(timeoutPromise);
            });


        }
    };
}]);
