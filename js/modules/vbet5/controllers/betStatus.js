/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:betStatusCtrl
 */
VBET5.controller('betStatusCtrl', ['$scope', 'Config', 'Zergling', function ($scope, Config, Zergling) {
    'use strict';
    $scope.betStatus = {
        open: false,
        displayRecaptcha: !Config.main.recaptchaV3
    };

    $scope.resultMap = {
        'Won': 'won',
        'Lost': 'lose',
        'Accepted': 'wait',
        'CashOut': 'won',
        'Returned': 'lose',
        'Ticket number not found.': 'lose'
    };

    $scope.getBetStatus = function getBetStatus() {
        if (!$scope.betStatus.ticketNumber) { return; }

        var request = {};

        if ($scope.betStatus.displayRecaptcha) {
            request.g_recaptcha_response = $scope.betStatus.g_recaptcha_response;
        }
        if ($scope.betStatus.ticketNumber.length < 15) { // If the number contains less than 15 characters then it's a bet id, otherwise - a bet ticket id
            request.bet_id = parseInt($scope.betStatus.ticketNumber, 10);
        } else {
            request.ticket_number = parseInt($scope.betStatus.ticketNumber, 10);
        }

        $scope.betStatus.loading = true;
        $scope.clearBetStatus();

        Zergling.get(request, 'check_bet_status').then(function (response) {
            console.log('BET STATUS', response);
            $scope.betStatus.details = (response && response.details) || {StateName: 'Ticket number not found.'};
            $scope.betStatus.ticketNumber = '';
            if ($scope.betStatus.displayRecaptcha) {
                $scope.$broadcast('recaptcha.reload');
                $scope.betStatus.g_recaptcha_response = '';
            }
        })['finally'](function () {
            $scope.betStatus.loading = false;
        });
    };

    $scope.clearBetStatus = function clearBetStatus () {
        $scope.betStatus.details = false;
        $scope.betStatus.ticketNumber = '';
    };

    if ($scope.betStatus.displayRecaptcha) {
        $scope.$on('recaptcha.response', function (event, response) {
            $scope.betStatus.g_recaptcha_response = response;
        });
    }
}]);
