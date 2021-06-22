VBET5.service('PaymentPreCalculation', ['$rootScope', '$q', 'AuthData', 'Zergling', function ($rootScope, $q, AuthData, Zergling) {
    'use strict';

    var t = this;
    this.getData =  function getData() {
        var checked = $q.defer();
        var result = checked.promise;
        Zergling
            .get({}, 'get_client_pre_calculation')
            .then(function (data) {
                if (data && data.details) {
                    checked.resolve(data.details);
                } else {
                    checked.resolve({});
                }
            })['catch'](function() {
            checked.resolve({});
        });

        return result;
    };

    this.checkFirstDeposit = function () {
        var promisHandler = $q.defer();
        var token = AuthData.getAuthToken();
        var result = promisHandler.promise;
        var getData = function getData() {
            t.getData().then(function (res) {
                promisHandler.resolve(res.DepositCount <= 1);
            });
        };
        if ($rootScope.profile) {
            getData();
        } else if (token) {
            var loginListener = $rootScope.$on('loggedIn', function () {
                getData();
                loginListener();
            });
        }  else {
             promisHandler.resolve(null);
         }
        return result;
    };
}]);
