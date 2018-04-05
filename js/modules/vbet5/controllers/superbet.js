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

    function showSuperBetNotification (message) {
        if (Config.main.GmsPlatform || $scope.superBetId > 0) {
            if (Config.betting.showSuperBetNotificationsViaPopup) {

                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Offer',
                    content: message
                });

            } else {
                $rootScope.broadcast("notification", {title: "Note:", content:  message, type: "superBetResult", hideCheckBox: true});
            }
        }
    }

    /**
     * @ngdoc method
     * @name stopSuperBetProcessing
     * @methodOf vbet5.controller:superBetCtrl
     * @description Stop Process pending superBets.
     */
    function stopSuperBetProcessing() {
        $scope.showCounterOfferPopup = false;
        $scope.originalSuperBet = undefined;
        $scope.trackingInProgress = false;
        $scope.counterOfferCountDown = 0;
        $scope.superBetId = -1;
        Storage.remove('superBet');
        $interval.cancel($scope.superBetTimer);
        $interval.cancel($scope.counterOfferTimer);
    }

    /**
     * @ngdoc method
     * @name declineCounterOffer
     * @methodOf vbet5.controller:superBetCtrl
     * @description Decline pending superBet offer.
     */
    $scope.declineCounterOffer = function declineCounterOffer() {
        Zergling
            .get({bet_id: $scope.superBetId}, 'decline_super_bet').then(function (data){console.log(data)})['catch'](function (reason) {
            console.log('Error:', reason);
        });
        analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'decline counter offer'});
        stopSuperBetProcessing();
    };

    /**
     * @ngdoc method
     * @name declineCounterOffer
     * @methodOf vbet5.controller:superBetCtrl
     * @description Approve pending superBet offer.
     */
    $scope.approveCounterOffer = function approveCounterOffer() {
        Zergling
            .get({bet_id: $scope.superBetId}, 'approve_super_bet').then(function (data){console.log(data)})['catch'](function (reason) {
            console.log('Error:', reason);
        });
        stopSuperBetProcessing();
        analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'approve counter offer'});
    };

    /**
     * @ngdoc method
     * @name getOriginalBetInfo
     * @methodOf vbet5.controller:superBetCtrl
     * @description Get Original SuperBet Info to show when counter offer accrue
     */
    function getOriginalBetInfo() {
        if (Storage.get('superBet') && Storage.get('superBet').id === $scope.superBetId) {
            $scope.originalSuperBet = Storage.get('superBet');
        } else {
            Zergling.get({
                'where': {
                }
            }, 'bet_history')
                .then(function (response) {
                    angular.forEach(response.bets, function (bet) {
                        if (bet.id === $scope.superBetId) {
                            $scope.originalSuperBet = bet;
                            Storage.set('superBet', bet);
                        }
                    });
                });
        }
    }

     /**
     * @ngdoc method
     * @name makeCounterOffer
     * @methodOf vbet5.controller:superBetCtrl
     * @description process counter offer
     */
    function makeCounterOffer(offer) {
         if (offer.changed_field !== 0) {
             if (offer.down_counter < 0) {
                 $scope.declineCounterOffer();
                 return;
             }
             $scope.counterOffer = offer;
             $scope.superBetId = offer.bet_id;
             $scope.showCounterOfferPopup = true;
             $scope.counterOfferCountDown = offer.down_counter;
             $scope.counterOfferTimer = $interval(function () {
                 if ($scope.counterOfferCountDown > 0) {
                     $scope.counterOfferCountDown--;
                 } else {
                     $scope.declineCounterOffer();
                 }

             }, 1000);
         }
    }



    /**
     * @ngdoc method
     * @name startSuperBetProcessing
     * @methodOf vbet5.controller:superBetCtrl
     * @description Process pending superBets and show notifications and counter offers.
     */
    function startSuperBetProcessing() {
        $scope.trackingInProgress = true;
        $scope.originalSuperBetId = $scope.superBetId;
        getOriginalBetInfo();
        $scope.superBetTimer = $interval(function () {
            if(!$rootScope.env.authorized) {
                stopSuperBetProcessing();
                return;
            }
            Zergling
                .get({bet_id:  $scope.superBetId}, 'get_super_bet_info').then(function (data) {
                    console.log(data);
                    switch (data.bet.bet_status) {
                    case '-4':
                        showSuperBetNotification(Translator.get('Your superbet ({1}) request is declined', [$scope.superBetId]));
                        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'onHoldConfirm');
                        stopSuperBetProcessing();
                        analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'declined'});
                        break;
                    case '0':
                        showSuperBetNotification(Translator.get('Your superbet ({1}) request is accepted', [$scope.superBetId]));
                        stopSuperBetProcessing();
                        analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'accepted'});
                        break;
                    case '-7':
                        makeCounterOffer(data.bet);
                        $interval.cancel($scope.superBetTimer);
                        analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'counter offer'});
                        break;
                    }
                })['catch'](function (reason) {
                console.log('Error:', reason);
            });
        }, 2000);
    }

    /**
     * @ngdoc method
     * @name checkSuperBet
     * @methodOf vbet5.controller:superBetCtrl
     * @description Receives profile update messages and check if superbet available
     *
     * @param {Object} event event
     * @param {Object} data profile data
     */
    function checkSuperBet(event, data) {
        if ($scope.trackingInProgress || !data || data === -1 || $scope.superBetId === data) {
            return;
        }
        $scope.superBetId = data;
        startSuperBetProcessing();
    }

    $scope.$on('checkSuperBet', checkSuperBet);


    /********************** SUPERBET FOR SPRING ***************************************/

    /**
     * @ngdoc method
     * @name checkSuperBetStatusGMS
     * @methodOf betting.controller:superBetCtrl
     * @description check if super bet is accepted or declined
     */

    function checkSuperBetStatusGMS() {
        if($scope.profile && $scope.profile.super_bet && $scope.profile.super_bet !== -1) {
            var superBets = Utils.objectToArray($scope.profile.super_bet);
            var superBet = superBets && superBets.filter(function(value) { // remove null items
                return value;
            });
            if (superBet[0].super_bet_status === -1 || superBet[0].super_bet_status === '-1') {
                showSuperBetNotification(Translator.get('Your offer ({1}) request is declined', [superBet[0].super_bet_id]));
                $rootScope.offersCount = ($rootScope.offersCount === 1) ? 0 : $rootScope.offersCount-1;
                $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'onHoldConfirm');
                analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'declined'});
            } else {
                Zergling.get({
                    'where': {
                        'bet_id': superBet[0].super_bet_id,
                        'outcome': 0
                    }
                }, 'bet_history')
                    .then(function (response) {
                        var event = response.bets && response.bets[0] && response.bets[0].events && response.bets[0].events[0];
                        var message = !event ? superBet[0].super_bet_id : event.team1 + (event.team2 && (" - " + event.team2)) + " : " + event.event_name;
                        if(superBet[0].super_bet_status === 0 || superBet[0].super_bet_status === '0') {//Counter Offer part
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'info',//what type of image to choose???
                                title: 'Counter offer',
                                hideCloseButton: true,
                                content: Translator.get('Do you wish to accept our counter offer ({1}) with the following conditions? Offered Odd: {2} Offered Amount: {3}', [message , superBet[0].super_bet_price , superBet[0].super_bet_amount]),
                                yesno: true,
                                yesButton: ['acceptCounterOffer', superBet[0]],
                                noButton: ['declineCounterOffer', superBet[0]]
                            });
                        } else {
                            $rootScope.offersCount = ($rootScope.offersCount === 1) ? 0 : $rootScope.offersCount-1;
                            showSuperBetNotification(Translator.get('Your offer ({1}) request is accepted', [message]));
                            analytics.gaSend('send', 'event', 'betting', 'SuperBet ' + (Config.main.sportsLayout) + ($rootScope.env.live ? '(LIVE)' : '(PM)'), {'page': $location.path(), 'eventLabel': 'accepted'});
                        }
                    });
            }
        }
    }

    if(Config.main.GmsPlatform){
        profilePromise = $scope.$watch('profile.super_bet', function () {
            checkSuperBetStatusGMS();
        }, true);
    }


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