/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:betslipscroll
 * @description keep betslip visible in case of page scrolling
 *
 * @param {string} scrollable-area-id id of element containing the scrollable area which must be watched
 * @param {string} footer-id id of footer element
 * @param {string} watch-elements space delimited list of additional elements ids to monitor and reposition betslip on height change
 */
VBET5.directive('betslipscroll', ['$window', 'DomHelper', 'UserAgent', 'Config', function ($window, DomHelper, UserAgent, Config) {
    'use strict';
    return function (scope, element, attrs) {
        var bsPositioning = function () {
            var y = ($window.pageYOffset !== undefined) ? $window.pageYOffset : ($window.document.documentElement || $window.document.body.parentNode || $window.document.body).scrollTop;
            var footerElement = $window.document.getElementById(attrs.footerId);
            var footerOffset = footerElement ? footerElement.offsetTop - y : null;
            var scrollableAreaContainerElement = $window.document.getElementById(attrs.scrollableAreaId);
            if (scrollableAreaContainerElement === null) { //in case we're in another view
                return;
            }
            var gamesHeight = scrollableAreaContainerElement.scrollHeight;
            var bsHeight = element[0].scrollHeight;

            if ($window.pageYOffset < 130 || gamesHeight < bsHeight || UserAgent.isIE8orOlder()) {
                element[0].removeAttribute('style');
            } else {
                if (footerOffset <= element[0].scrollHeight + 50) {
                    element[0].style.position = "absolute";
                    element[0].style.left = "auto";
                    element[0].style.top = Config.betting.modernBetSlipTopAlign ? ($window.pageYOffset - 50) + 'px' : "auto";
                    element[0].style.right = 0;
                    element[0].style.bottom = 0;
                } else {
                    element[0].style.left = DomHelper.getOffset(element[0]).left + "px";
                    element[0].style.position = "fixed";
                    element[0].style.top = "50px";
                    element[0].style.right = 0;
                    element[0].style.bottom = "auto";
                }
            }

        };

        if (attrs.watchElements) {
            angular.forEach(attrs.watchElements.split(' '), function (id) {
                if (id.trim()) {
                    DomHelper.onElementHeightChange(id, bsPositioning);
                }
            });
        }

        DomHelper.onDocumentHeightChange(bsPositioning);
        angular.element($window).bind("scroll", bsPositioning);
        angular.element($window).bind("resize", function () {
            if (element[0].style.position === "fixed") {
                element[0].style.left = DomHelper.getOffset(element[0].parentElement).left + element[0].parentElement.scrollWidth - element[0].scrollWidth + "px";
            }
        });
    };
}]);