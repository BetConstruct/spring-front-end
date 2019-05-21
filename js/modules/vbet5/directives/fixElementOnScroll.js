/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:fixOnScroll
 * @description keep element visible in case of page scrolling
 *
 * @param {string} scrollable-area-id id of element containing the scrollable area which must be watched
 * @param {string} footer-id id of footer element
 * @param {string} watch-elements space delimited list of additional elements ids to monitor and reposition element on height change
 * @param {number} top-offset space between element and window top at which element should stay fixed
 */
VBET5.directive('fixonscroll', ['$window', 'DomHelper', 'UserAgent', function ($window, DomHelper, UserAgent) {
    'use strict';
    return function (scope, element, attrs) {
        if (attrs.ignoreIe && UserAgent.IEVersion()) {
            return;
        }
        function positioning() {
            var scrollableAreaContainerElement = $window.document.getElementById(attrs.scrollableAreaId);
            if (scrollableAreaContainerElement === null) { //in case we're in another view
                return;
            }
            var elementDefaultOffset =  parseInt(attrs.defaultOffset, 10);
            var headerHeight = $window.document.getElementById(attrs.headerId).offsetHeight || 0;
            if(!elementDefaultOffset) {
                elementDefaultOffset =  DomHelper.getOffset(element[0].parentElement).top  - headerHeight;
            }
            var parentLeftPosition = DomHelper.getOffset(element[0].parentElement).left + element[0].parentElement.scrollWidth - element[0].scrollWidth + "px"; 
            var parentHeight = element[0].parentElement.offsetHeight + "px";
            var parentWidth = element[0].parentElement.offsetWidth + "px";
            var elementTopOffset = parseInt(attrs.topOffset, 10) || 0;

           if ($window.pageYOffset < elementDefaultOffset - elementTopOffset ) { //|| containerHeight < elementHeight || UserAgent.isIE8orOlder()
                angular.element(element[0]).removeClass('scrollable-absolute scrollable-fixed');
                element[0].parentElement.style="";
                if(attrs.autoPositon || attrs.parentWidth) {
                    element[0].style="";
                }
            } else {
               angular.element(element[0]).removeClass('scrollable-absolute');
               angular.element(element[0]).addClass('scrollable-fixed');
               element[0].parentElement.style.minHeight = parentHeight;
               if(attrs.autoPositon === "left" || attrs.autoPositon === "true") {
                   element[0].style.left = parentLeftPosition;
               }
               if(attrs.autoPositon === "top" || attrs.autoPositon === "true") {
                   element[0].style.top = headerHeight + "px";
               }
               if(attrs.parentWidth === "true") {
                   element[0].style.width = parentWidth;
               }
            }
        }

        if (attrs.watchElements) {
            angular.forEach(attrs.watchElements.split(' '), function (id) {
                if (id.trim()) {
                    DomHelper.onElementHeightChange(id, positioning);
                }
            });
        }

        DomHelper.onDocumentHeightChange(positioning);
        scope.$on('onWindowResize', positioning);
        scope.$on('onWindowScroll', positioning);

        /**
         * @description forces the element to stay fixed on the page
         */
        scope.$on('forceElementFix', function(e, data) {
            var el = $window.document.getElementById(data.id);
            angular.element(el).removeClass('scrollable-absolute');
            angular.element(el).addClass('scrollable-fixed');
        });

        /**
         * @description forces the element refresh
         */
        scope.$on('forceElementRefresh', function() {
            angular.element(element[0]).removeClass('scrollable-absolute scrollable-fixed');
            element[0].parentElement.style="";
            if(attrs.autoPositon || attrs.parentWidth) {
                element[0].style="";
            }
        });
    };
}]);