/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:messagesCtrl
 * @description
 *  messages controller
 */
VBET5.controller('mixedTicketsCtrl', ['$scope', 'Zergling', function ($scope, Zergling) {
    'use strict';

    /**
     * @ngdoc method
     * @name loadTickets
     * @methodOf vbet5.service:mixedTicketsCtrl
     * @description Load tickets
     */
    $scope.loadTickets = function loadTickets(){
        $scope.tickets = [];
        $scope.isLoading = true;
        Zergling.get({}, 'get_user_promo_codes').then(function (response) {
            angular.forEach(response.details, function(detail){
                angular.forEach(detail.Codes, function(code){
                    var ticket = {};
                    ticket.id = code;
                    ticket.date = detail.Created;
                    $scope.tickets.push(ticket);
                });
            });
            $scope.tickets.sort(function (ticket1, ticket2){
                return ticket1.date < ticket2.date;
            });
            $scope.isLoading = false;
        }, function (failResponse) {
            $scope.isLoading = false;
            console.log(failResponse);
        });
    };
}]);
