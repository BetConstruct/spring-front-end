/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:superBetCtrl
 * @description
 * superBet controller
 */
VBET5.controller('superBetCtrl', ['$rootScope', '$scope', '$interval', 'Storage', 'Zergling', 'Utils', 'Translator', '$location', 'Config', 'analytics', function ($rootScope, $scope, $interval, Storage, Zergling, Utils, Translator, $location, Config, analytics) {
    'use strict';

    $scope.trackingInProgress = false;
    var profilePromise;

    /**
     * @ngdoc method
     * @name showSuperBetNotification
     * @methodOf vbet5.controller:superBetCtrl
     * @description Show notifications
     * @param {String} Notification message
     */

    function showSuperBetNotification (message, isAccepted) {
        if (Config.betting.showSuperBetNotificationsViaPopup) {
            var type = isAccepted ? 'info accepted' : 'info declined';

            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: type,
                title: 'Offer',
                content: message
            });

        } else {
            $rootScope.broadcast("notification", {title: "Note:", content:  message, type: "superBetResult", hideCheckBox: true});
        }
    }


    /********************** SUPERBET FOR SPRING ***************************************/

    /**
     * @ngdoc method
     * @name checkSuperBetStatus
     * @methodOf betting.controller:superBetCtrl
     * @description check if super bet is accepted or declined
     */

    function checkSuperBetStatus() {
        if($scope.profile && $scope.profile.super_bet && $scope.profile.super_bet !== -1) {
            var superBets = Utils.objectToArray($scope.profile.super_bet);
            var superBet = superBets && superBets.filter(function(value) { // remove null items
                return value;
            }).sort(function sortDescending(a, b) { return b.super_bet_id - a.super_bet_id; });
            superBet = superBet[0];

            var superBetIndex = $rootScope.superbetIds.superBets.indexOf(superBet.super_bet_id);
            var counterOfferIndex = $rootScope.superbetIds.counterOffers.indexOf(superBet.super_bet_id);

            if (superBetIndex !== -1) {
                $rootScope.superbetIds.superBets.splice(superBetIndex, 1);
            }
            if (counterOfferIndex !== -1) {
                $rootScope.superbetIds.counterOffers.splice(counterOfferIndex, 1);
            }

            if (superBet.super_bet_status === -1 || superBet.super_bet_status === '-1') {
                showSuperBetNotification(Translator.get('Your offer ({1}) request is declined', [superBet.super_bet_id]));
                $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'onHoldConfirm');
                analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'declined'});
            } else {
                if(superBet.super_bet_status === 0 || superBet.super_bet_status === '0') {//Counter Offer part
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',//what type of image to choose???
                        title: 'Counter offer',
                        hideCloseButton: true,
                        content: Translator.get('Do you wish to accept our counter offer ({1}) with the following conditions? Offered Odd: {2} Offered Amount: {3}', [superBet.super_bet_id , superBet.super_bet_price , superBet.super_bet_amount]),
                        yesno: true,
                        yesButton: ['acceptCounterOffer', superBet],
                        noButton: ['declineCounterOffer', superBet]
                    });
                } else {
                    showSuperBetNotification(Translator.get('Your offer ({1}) request is accepted',  [superBet.super_bet_id]), true);
                    analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'accepted'});
                }
            }
        }
    }

    profilePromise = $scope.$watch('profile.super_bet', function () {
        checkSuperBetStatus();
    }, true);

    $scope.$on('acceptCounterOffer', function (event, superBet) {
        Zergling.get({bet_id: superBet.super_bet_id, accept: true}, 'super_bet_answer').then(function (data){console.log(data);})['catch'](function (reason) {
            console.log('Error:', reason);
        })['finally'](function () {
            scope.activeTab === activeTab && (scope.winnersLoading = false);
        });
    });

    $scope.$on('declineCounterOffer', function (event, superBet) {
        Zergling.get({bet_id: superBet.super_bet_id, accept: false}, 'super_bet_answer').then(function (data) {console.log(data);})['catch'](function (reason) {
            console.log('Error:', reason);
        })['finally'](function () {
            scope.activeTab === activeTab && (scope.winnersLoading = false);
        });
    });

    $scope.$on('$destroy',function() {
        profilePromise();
    });
}]);
