/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:buddyCtrl
 * @description
 *  buddy transfer controller
 */
VBET5.controller('buddyCtrl', ['$rootScope', '$scope', 'Translator', 'Zergling', 'Config', 'Utils', '$sce', '$filter', function ($rootScope, $scope, Translator, Zergling, Config, Utils, $sce, $filter) {
    'use strict';

    var request = {};
    $scope.maxAmount = $scope.profile.balance || 0;
    $scope.transferFormModel = {
        amount: 0,
        myAccount: 'Sport',
        buddyAccount: 'Sport',
        buddyUsername: ''
    };
    $scope.transferData = {};
    $scope.attr = {
        currentStep: 'step1'
    };
    $scope.friendList = [];
    $scope.confirmResponse = null;
    $scope.friendListLoaded = true;
    $scope.confirmationLoaded = true;

    var knownErrors = {
        '-20099': Translator.get('Unknown error'),
        '-20007': Translator.get('Internal service fault'),
        '-3001': Translator.get('Users Currencies are different'),
        '-1131': Translator.get("You have an Active Bonus therefore it's not possible to make a Withdrawal"),
        '21': Translator.get('User link blocked, please contact support.'),
        '-2403': Translator.get('Transfer request is already in progress')
    };


    /**
     * @ngdoc method
     * @name chooseBuddy
     * @methodOf vbet5.controller:buddyCtrl
     * @description choose buddy to transfer
     */
    $scope.chooseBuddy = function chooseBuddy(data) {
        if (data) {
            $scope.transferData = {
                buddyName: data.fullName || '',
                buddyUsername: data.username
            };
            $scope.transferFormModel.buddyUsername = data.username;
            return;
        }
        $scope.transferData.buddyUsername = $scope.transferFormModel.buddyUsername;

        console.log($scope.transferData);
    };

    /**
     * @ngdoc method
     * @name setMaxAmount
     * @methodOf vbet5.controller:buddyCtrl
     * @description set max amount depend of Account type
     */
    $scope.setMaxAmount = function setMaxAmount() {
        $scope.transferFormModel.amount = $scope.maxAmount;
    };

    /**
     * @ngdoc method
     * @name prepareToTransfer
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step3
     */
    $scope.prepareToTransfer = function prepareToTransfer(type) {
        if (!type) {
            $scope.transferData = {};
            $scope.transferFormModel.buddyUsername = '';
            $scope.transferFormModel.amount = 0;
            $scope.attr.currentStep = 'step1';
            return;
        }

        $scope.transferData.account = ($scope.transferFormModel.myAccount === 'Sport') ? 'Main' : $scope.transferFormModel.myAccount;
        $scope.transferData.amount = $scope.transferFormModel.amount;
        $scope.attr.currentStep = 'step3';

        console.log($scope.transferData);
    };

    /**
     * @ngdoc method
     * @name searchFriend
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step3
     */
    $scope.searchFriend = function searchFriend (name) {
        angular.forEach($scope.friendList, function (friend) {
            friend.show = name === '' || friend.username.indexOf(name) !== -1;
        });
    };

    /**
     * @ngdoc method
     * @name confirm
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step3
     */
    $scope.confirm = function confirm(type) {
        if (!type) {
            $scope.transferData.amount = 0;
            $scope.attr.currentStep = 'step2';
            return;
        }

        request = {
            amount: $scope.transferData.amount,
            username: $scope.transferData.buddyUsername
        };
        console.log(request);
        $scope.confirmationLoaded = false;

        Zergling.get(request, 'agent_transfer').then(function (data) {
            $scope.confirmationLoaded = true;
            console.log('buddy transfer request response', data);
            var message = Translator.get("There was an error processing your request.");
            var messageType;
            if (data && data.result !== undefined && data.result == 0) {
                message = Translator.get((data.details && data.details.status_message) || 'Transfer was successful');
                messageType = 'success';
            } else if (data && data.result !== undefined && knownErrors[data.result.toString()] !== undefined) {
                message += "\n" + knownErrors[data.result.toString()];
                if (data.details && data.details.error) {
                    message += ' (' + data.details.error + ')';
                }
                messageType = 'error';
            } else if (data.details && data.details.error) {
                message += (data.details.message || '') + ' (' + data.details.error + ')';
                $scope.messageType = 'error';
            } else {
                message += Translator.get("Please try later or contact support.");
                messageType = 'error';
            }
            $scope.attr.currentStep = 'step4';
            $scope.confirmResponse = {
                type: messageType === 'success' ? 'Success' : 'Error',
                message: message
            };
        }, function (failResponse) {
            console.log('!!!!! error', failResponse);
            $scope.confirmationLoaded = true;
            $scope.confirmResponse = {
                type: 'Error',
                message: 'Request failed'
            };
            $scope.attr.currentStep = 'step4';
        });
    };


    /**
     * @ngdoc method
     * @name userTransfers
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step1
     */
    function userTransfers() {
        $scope.friendListLoaded = false;
        Zergling.get({}, 'user_transfers').then(function (response) {
            $scope.friendListLoaded = true;
            console.log('user_transfers response', response);
            $scope.friendList = [];

            if (response && response.details && response.details.transfers_to && response.details.transfers_to.transfer && response.details.transfers_to.transfer.length) {

                var friendList, friendListLength, i, j, k;
                friendList = response.details.transfers_to.transfer;
                friendListLength = response.details.transfers_to.transfer.length;


                for (j = 0; j < friendListLength; j++) {
                    for (i = 0; i < j; i++) {
                        if (friendList[i].id === friendList[j].id) {
                            friendList.splice(j--, 1);
                            friendListLength--;
                        }
                    }
                }

                for (k = 0; k < friendListLength; k++) {
                    $scope.friendList.push({
                        id: friendList[k].id,
                        username: friendList[k].to_login,
                        fullName: friendList[k].to_name
                    });
                }
            }
        }, function (failResponse) {
            $scope.friendListLoaded = true;
            console.log('user_transfers failResponse', failResponse);
        });
    }

    /**
     * @ngdoc method
     * @name userTransfersGms
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step1
     */
    function userTransfersGms() {
        $scope.friendListLoaded = false;
        Zergling.get({}, 'get_buddy_list').then(function (response) {
            $scope.friendListLoaded = true;
            console.log('user_transfers response', response);
            $scope.friendList = [];
            var friendListCache = {};
            if (response && response.details) {
                angular.forEach(response.details, function (friend) {
                    friendListCache[friend.BuddyLogin] = {
                        id: friend.ClientId,
                        username: friend.BuddyLogin,
                        show: true
                    };
                });
                $scope.friendList = Utils.objectToArray(friendListCache);
            }

        }, function (failResponse) {
            $scope.friendListLoaded = true;
            console.log('user_transfers failResponse', failResponse);
        });
    }

    /**
     * @ngdoc method
     * @name makeTransfer
     * @methodOf vbet5.controller:buddyCtrl
     * @description do trasnfer for Gms
     */
    $scope.makeTransfer = function makeTransfer(confirmed) {


        if (!confirmed && Config.main.buddyTransfer.version === 2) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                title: 'Info',
                content: 'Please confirm money transfer',
                hideCloseButton: true,
                buttons: [
                    {title: 'Confirm', callback: function () {
                        $scope.makeTransfer(true);
                        }},
                    {title: 'Cancel', callback: function () {
                        $scope.attr.currentStep = 'step2';
                        }}
                ]
            });
            return;
        }

        var request;

        if (Config.main.buddyTransfer.version === 1) {
            request = {
                to_user: ($scope.transferData.friendName || '').trim(),
                amount: parseFloat($scope.transferData.transferAmount || 0)
            };
        } else if (Config.main.buddyTransfer.version === 2) {
            request = {
                to_user: ($scope.transferData.buddyUsername || '').trim(),
                amount: parseFloat($scope.transferFormModel.amount || 0)
            };
        } else {
            return;
        }



        console.log('Buddy transfer request', request);

        $scope.transactionInProgress = true;

        Zergling.get(request, 'buddy_to_buddy_transfer').then(function (response) {
            $scope.transactionInProgress = false;

            if (Config.main.buddyTransfer.version === 2) {
                if (response.result === 0) {
                    $scope.confirmResponse = {
                        type: 'Success',
                        message: 'Your transfer is successfully completed'
                    };
                    $scope.transferFormModel.amount = 0;
                } else {
                    $scope.confirmResponse = {
                        type: 'Error',
                        message: Translator.get('There was an error processing your request') + '<br>' + Translator.get(response.result_text),
                        nextStep: 'step2'
                    };
                }
                return;
            }


            if (response.result === 0) {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Info',
                    content: 'Your transfer is successfully completed'
                });
                $scope.transferData = {};
            } else {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: Translator.get('There was an error processing your request') + '<br>' + Translator.get(response.result_text)
                });
            }
        }, function (response) {
            $scope.transactionInProgress = false;
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: Translator.get('There was an error processing your request') + '<br>' + Translator.get(response.result_text)
            });
            $scope.confirmResponse = {
                nextStep: 'step2'
            };
        });
    };


    function getInfoText(payments) {
        var i = payments.length,
            text = '';

        while (i--) {
            if (payments[i].name === 'BuddyToBuddyTransfer' && payments[i].withdrawInfoText) {
                text = payments[i].withdrawInfoText[Config.env.lang] || payments[i].withdrawInfoText.eng || payments[i].withdrawInfoText || '';
                i = 0;
            }
        }

        if ($rootScope.profile && $rootScope.profile.currency_name && text && text.split) {
            text = text.split('{currency}').join($filter('currency')($rootScope.profile.currency_name));
        }

        return $sce.trustAsHtml(text);
    }


    (function init() {
        if (Config.main.GmsPlatform) {
            $scope.b2bInfoText = getInfoText(Config.payments);
            if (Config.main.buddyTransfer.version === 2) {
                userTransfersGms();
            }
        } else {
            userTransfers();
        }
    })();

}]);
