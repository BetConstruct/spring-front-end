/**
 * @ngdoc controller
 * @name vbet5.directive:vbetHomework
 * @description
 * Popular matches controller
 */
VBET5.directive('vbetHomeworkStatus', ['HomeworkService', function (HomeworkService) {
    'use strict';


    return {
        restrict: 'E',
        templateUrl: 'templates/directive/vbet-homework-status.html',
        link: function (scope) {
            function updateStatus(newStatus) {
                scope.homeworkStatus = newStatus;
            }

            HomeworkService.subscribeForStatus(updateStatus);

            scope.openHomeworkPopup = function openHomeworkPopup() {
                HomeworkService.openHomeworkPopup();
            };

            scope.$on("$destroy", function() {
                HomeworkService.unsubscribeFromStatus(updateStatus);
            });
        }
    };
}]);

