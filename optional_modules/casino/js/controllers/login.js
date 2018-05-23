/**
 * @ngdoc controller
 * @name CASINO.controller:casinoLoginCtrl
 * @description
 * casino login controller
 */

CASINO.controller('casinoLoginCtrl', ['$rootScope', '$scope', 'TimeoutWrapper', '$location', 'CConfig', 'Config', 'Zergling', function ($rootScope, $scope, TimeoutWrapper, $location, CConfig, Config, Zergling) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    var casinoBalanceTimer, isInCasino;

    /**
     * @ngdoc method
     * @name getCasinoBalance
     * @methodOf CASINO.controller:casinoLoginCtrl
     * @description
     * @param {Boolean} [once] optional. If true, request will be made once (no timer will be registered to make request again)
     */
    function getCasinoBalance(once) {
        if (casinoBalanceTimer) {
            TimeoutWrapper.cancel(casinoBalanceTimer);
        }
        if (!isInCasino || !$rootScope.env.authorized) {
            return console.log('skipping casino balance request');
        }
        Zergling.get({product: 'Casino'}, 'get_balance').then(function (response) {
            console.log('Casino balance(swarm)', response);
            $rootScope.env.casinoBalance = response;
            if (once) {
                return;
            }
            casinoBalanceTimer = TimeoutWrapper(getCasinoBalance, CConfig.balance.timeout);
        });
    }

    function checkIfisInCasino() {
        if ($rootScope.isInCasino() || $rootScope.isInPoker() || !$rootScope.calculatedConfigs.sportEnabled) {
            isInCasino = true;
            getCasinoBalance(); //make an extraordinary request for not having a delay displaying casino balance when switching to casino pages
        } else {
            isInCasino = false;
        }
    }


    if(!Config.main.GmsPlatformMultipleBalance) {
        checkIfisInCasino();

        $scope.$on('$routeChangeSuccess', function () {
            if (!$location.$$replace) {
                checkIfisInCasino();
            }
        });

        $scope.$on("profile", function (event, data) {
            getCasinoBalance();
        });

        $scope.$on('login.loggedOut', function () {
            TimeoutWrapper.cancel(casinoBalanceTimer);
            casinoBalanceTimer = false;
        });

    }
}]);