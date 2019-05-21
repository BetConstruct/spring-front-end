/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:keyboardNavigation
 *
 * @description Enables keyboard navigation in search results.
 * Watches for 'search.ResultsClosed' event to disable keyboard navigation when result list is closed
 *
 *
 * @param {string} result-id-prefix required. Prefix of id of result item elements (suffixed by game id).
 * Needed for scrolling to selected result on navigation
 *
 * @param {Expression} select-result-by-id-func function that will be called when result is selected. Selected result id will be passed to function
 * @param {Expression} result-ids array containing ids of results
 * @param {Expression} show-results-flag boolean variable indicating when results are shown
 * @param {Expression} selected-result-id scope variable with selected result id
 */
VBET5.directive('keyboardNavigation', ['$window', 'keyboardManager', 'DomHelper', function ($window, keyboardManager, DomHelper) {
    'use strict';

    function unbindSearchKeyboardNavigation() {
        keyboardManager.unbind('down');
        keyboardManager.unbind('up');
        keyboardManager.unbind('return');
    }

    return {
        restrict: 'A',
        scope: {
            selectResultByIdFunc: '=',
            resultsIds: '=',
            showResultsFlag: '=',
            selectedResultId: '='
        },
        link: function (scope, element, attrs) {

            scope.$on('search.ResultsClosed', unbindSearchKeyboardNavigation);

            function scrollToResult(selectedIndex) {
                var i, offset = 0;
                for (i = 0; i < selectedIndex; i++) {
                    offset += $window.document.getElementById(attrs.resultIdPrefix + scope.resultsIds[i]).scrollHeight;
                }
                scope.selectedResultId = scope.resultsIds[selectedIndex];
                DomHelper.scrollTop(attrs.id, offset);
            }


            scope.$watch('showResultsFlag', function () {

                if (scope.showResultsFlag) {

                    var selectedSearchResultIndex = 0;
                    // ------------------------------------------- enable  keyboard navigation ---------------------------
                    scope.selectedResultId = scope.resultsIds[selectedSearchResultIndex];
                    scrollToResult(selectedSearchResultIndex);

                    keyboardManager.bind('up', function () {
                        if (selectedSearchResultIndex > 0) {
                            selectedSearchResultIndex--;
                        }
                        scrollToResult(selectedSearchResultIndex);
                    });


                    keyboardManager.bind('down', function () {
                        if (selectedSearchResultIndex < scope.resultsIds.length - 1) {
                            selectedSearchResultIndex++;
                        }
                        scrollToResult(selectedSearchResultIndex);
                    });


                    keyboardManager.bind('return', function () {
                        scope.selectResultByIdFunc(scope.selectedResultId);
                        unbindSearchKeyboardNavigation();
                    });
                } else {
                    unbindSearchKeyboardNavigation();
                }
            });
        }
    };
}]);
