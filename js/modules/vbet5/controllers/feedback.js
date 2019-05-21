/**
 * @ngdoc controller
 * @name vbet5.controller:FeedbackController
 * @description
 *  FeedbackController to send users feedback's to our backend
 */
angular.module('vbet5').controller('FeedbackController', ['$scope', '$rootScope', 'Zergling', function ($scope, $rootScope, Zergling) {
    'use strict';

    /**
     * @ngdoc method
     * @name toggleView
     * @methodOf vbet5.controller:FeedbackController
     * @description Toggle view
     */
    $scope.toggleView = function () {
        $scope.showFeedBackPopup = !$scope.showFeedBackPopup;
        $scope.messageBody = '';
    };

    $scope.$on('feedback.toggle', $scope.toggleView);

    /**
     * @ngdoc method
     * @name feedbackFailed
     * @methodOf vbet5.controller:FeedbackController
     * @description Displays dialog for feedback error
     */
    function feedbackFailed(reason) {
        console.log("feedbackFailed", reason);
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: 'error',
            title: 'Feedback',
            content: "Error while sending message." + reason
        });
    }

    /**
     * @ngdoc method
     * @name sendMessage
     * @methodOf vbet5.controller:FeedbackController
     * @description Sends a feedback message
     */
    $scope.sendMessage = function () {
        $scope.sendingFeedBackInProgress = true;
        Zergling.get({body: $scope.messageBody, email: $scope.email}, 'user_feedback').then(function (response) {
            $scope.showFeedBackPopup = false;
            if (response.result) {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'success',
                    title: 'Feedback',
                    content: "Your message has been sent."
                 });
            } else {
                feedbackFailed('');
                console.warn('ERROR WHILE sending message', response);
            }
        },
        function(failResponse) {
            $scope.showFeedBackPopup = false;
            feedbackFailed(failResponse.data);
        })['finally'](function() {
            $scope.sendingFeedBackInProgress = false;
        });
    };
}]);
