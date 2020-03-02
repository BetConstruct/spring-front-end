/* global VBET5, JSON */
/* jshint -W024 */

/**
 * @ngdoc service
 * @name vbet5.service:BetService
 */
VBET5.factory('giftService', ['$rootScope', 'Zergling', function betService($rootScope, Zergling) {
    'use strict';

    var giftService = {};
    var $scope;
    giftService.acceptGiftBet = function acceptGiftBet(giftCode) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: 'info',
            title: 'Confirmation',
            content: 'Do you want accept gift bet?',
            buttons: [{
                title: 'Yes',
                callback: function () {
                    Zergling.get({'hash_code': giftCode}, 'receive_gift_bet').then(function (data) {
                        if (data && data.result === 0) {
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'info',
                                title: 'Success',
                                content: 'You have successfully accepted gift bet'
                            });
                        }
                    });
                }
            }, {
                title: 'No'
            }]
        });
    };
    giftService.init = function init(scope) {
        scope.giftState = {
            showPopup: false,
            email: ''
        };

        scope.showGiftPopup = function showGiftPopup(bet) {
            scope.giftState.bet = bet;
            scope.giftState.showPopup = true;
        };


        scope.sendGiftBet = function sendGiftBet() {
            var request = {
                'bet_id': scope.giftState.bet.id,
                'email': scope.giftState.email
            };
            scope.giftState.loading = true;
            Zergling.get(request, 'send_gift_bet').then(function (response) {
                if (response && response.result === 0) {
                    scope.giftState.status = 'success';
                    scope.giftState.bet.is_gift = true;
                } else {
                    scope.giftState.status = 'fail';
                }

            }, function (response) {
                scope.giftState.status = 'fail';
            })['finally'](function () {
                scope.giftState.loading = false;
            });

        };

        scope.closeGiftPopup = function closeForm() {
            scope.giftState.showPopup = false;
            scope.giftState.email = '';
            scope.giftState.status = null;
            scope.giftState.loading = false;
            scope.giftState.bet = null;
        };

        scope.$on("showGiftPopup", function (event, data) {
            scope.showGiftPopup(data);
        });
    };


    return giftService;


}]);
