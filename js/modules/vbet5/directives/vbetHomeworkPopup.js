/**
 * @ngdoc controller
 * @name vbet5.directive:vbetHomework
 * @description
 * Popular matches controller
 */
VBET5.directive('vbetHomeworkPopup', ['HomeworkService', function (HomeworkService) {
    'use strict';


    return {
        restrict: 'E',
        templateUrl: 'templates/directive/vbet-homework-popup.html',
        link: function (scope) {
            scope.popup = {
                url: null,
                isReady: false
            };

            function setIsReady(isReady) {
                scope.popup.isReady = isReady;
            }

            function setUrl(url) {
                scope.popup.url = url;

                if (!url) {
                    setIsReady(false);
                }
            }

            HomeworkService.init(scope, setUrl, setIsReady);
        }
    };
}]);

