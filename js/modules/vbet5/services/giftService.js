/* global VBET5, JSON */
/* jshint -W024 */

/**
 * @ngdoc service
 * @name vbet5.service:BetService
 */
VBET5.factory('giftService', ['$rootScope', 'Zergling', function betService($rootScope, Zergling) {
    'use strict';

    var giftService = {};
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
            var giftState = scope.giftState;
            var request = {
                'bet_id': giftState.bet.id,
                'email': giftState.email
            };
            giftState.loading = true;
            Zergling.get(request, 'send_gift_bet').then(function (response) {
                if (response && response.result === 0) {
                    giftState.status = 'success';
                    giftState.bet.is_gift = true;
                } else {
                    giftState.status = 'fail';
                    giftState.errorMessage = response.result_text;
                }

            }, function (response) {
                giftState.status = 'fail';
                giftState.errorMessage = response.result_text;
            })['finally'](function () {
                giftState.loading = false;
            });

        };

        scope.closeGiftPopup = function closeForm() {
            var giftState = scope.giftState;
            giftState.showPopup = false;
            giftState.email = '';
            giftState.status = null;
            giftState.loading = false;
            giftState.bet = null;
            giftState.errorMessage = '';
        };

        scope.$on("showGiftPopup", function (event, data) {
            scope.showGiftPopup(data);
        });
    };


    return giftService;


}]);
