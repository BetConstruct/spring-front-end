/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:buddyCtrl
 * @description
 *  buddy transfer controller
 */
VBET5.controller('buddyCtrl', ['$scope', 'Translator', 'Zergling', function ($scope, Translator, Zergling) {
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
    $scope.currentStep = 'step1';
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
            $scope.currentStep = 'step1';
            return;
        }

        $scope.transferData.account = ($scope.transferFormModel.myAccount === 'Sport') ? 'Main' : $scope.transferFormModel.myAccount;
        $scope.transferData.amount = $scope.transferFormModel.amount;
        $scope.currentStep = 'step3';

        console.log($scope.transferData);
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
            $scope.currentStep = 'step2';
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
            $scope.currentStep = 'step4';
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
            $scope.currentStep = 'step4';
        });
    };


    /**
     * @ngdoc method
     * @name agentTransfer
     * @methodOf vbet5.controller:buddyCtrl
     * @description prepare and show data in step3
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

    userTransfers();

}]);
