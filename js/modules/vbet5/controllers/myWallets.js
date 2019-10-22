/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:cashierCtrl
 * @description
 *  cashier controller
 */
VBET5.controller('myWalletsCtrl', ['$scope', '$rootScope', '$location', '$filter', 'Translator', 'Zergling', 'Config', function ($scope, $rootScope, $location, $filter, Translator, Zergling, Config) {
    'use strict';


    $scope.removeWallet = function removeWallet(id) {
        Zergling.get({id: id}, 'delete_player_payment_wallet').then(function(response) {
            if (response.result === 0) {
                $scope.wallets = $scope.wallets.filter(function(wallet) {
                    return wallet.Id !== id;
                });
            } else {
                //open popup about error
            }

        });

    };

    $scope.goToPayment = function goToPayment(id) {
        $location.search('system', id);
        $rootScope.env.sliderContent = 'deposit';

    };

    (function init() {
        $scope.loadingProcess = true;
        Zergling.get({}, 'get_payment_wallets').then(function(response) {
            if (response.details) {
                var wallets = response.details;

                for (var i = 0; i < wallets.length; i++) {
                    innerLoop:
                    for (var j = 0; j < Config.payments.length; j++) {
                        if (Array.isArray(Config.payments[j].systemId) && Config.payments[j].systemId.indexOf(wallets[i].PaymentSystemId) !== -1) {
                            wallets[i].image = Config.payments[j].image;
                            wallets[i].name = Config.payments[j].name;
                            wallets[i].paymentID = Config.payments[j].paymentID;
                            break innerLoop;
                        }
                    }
                }
                $scope.wallets = wallets;
            }
        })['finally'](function() {
            $scope.loadingProcess = false;
        });

    })();
}]);
