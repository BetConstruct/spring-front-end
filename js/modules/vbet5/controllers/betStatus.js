/**
 * @ngdoc controller
 * @name vbet5.controller:betStatusCtrl
 */
VBET5.controller('betStatusCtrl', ['$scope', 'Config', 'Zergling', function ($scope, Config, Zergling) {
    'use strict';
    $scope.betStatus = {
        open: false,
        displayRecaptcha: true
    };

    $scope.resultMap = {
        'Won': 'won',
        'Lost': 'lose',
        'Accepted': 'wait',
        'Ticket number not found.': 'lose'
    };

    $scope.getBetStatus = function getBetStatus() {
        if (!$scope.betStatus.ticketNumber) {
            return;
        }

        var request = {
            ticket_number: parseInt($scope.betStatus.ticketNumber, 10),
            g_recaptcha_response: $scope.betStatus.g_recaptcha_response
        };

        $scope.betStatus.loading = true;
        $scope.clearBetStatus();

        Zergling.get(request, 'check_bet_status').then(function (response) {
            console.log('BET STATUS', response);
            $scope.betStatus.details = (response && response.details) || {StateName: 'Ticket number not found.'};
            $scope.betStatus.ticketNumber = '';
            $scope.$broadcast('recaptcha.reload');
            $scope.betStatus.g_recaptcha_response = '';
        })['finally'](function () {
            $scope.betStatus.loading = false;
        });
    };

    $scope.clearBetStatus = function clearBetStatus () {
        $scope.betStatus.details = false;
        $scope.betStatus.ticketNumber = '';
    }

    $scope.$on('recaptcha.response', function (event, response) {
        $scope.betStatus.g_recaptcha_response = response;
    });
}]);
