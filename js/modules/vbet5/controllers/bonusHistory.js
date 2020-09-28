/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:bonusHistoryController
 * @description  bonus history controller
 */

VBET5.controller('bonusHistoryCtrl', ['$scope', '$controller', 'Zergling', 'BackendConstants', '$rootScope', 'Translator', "Config", function($scope, $controller, Zergling, BackendConstants, $rootScope, Translator, Config) {
    'use strict';

    angular.extend(this, $controller('historyBaseCtrl', {
        $scope: $scope
    }));

    $scope.loadingBonusHistory = false;
    $scope.bonusHistory = [];
    $scope.bonusHistoryParams = {
        availableProducts: [],
        bonusCategory: ''
    };

    if (Config.main.promotionalBonuses.sportsbook) {
        $scope.bonusHistoryParams.availableProducts.push('Sport');
    }

    if (Config.main.promotionalBonuses.casino) {
        $scope.bonusHistoryParams.availableProducts.push('Casino');
    }

    // Select category by default
    $scope.bonusHistoryParams.bonusCategory = $scope.bonusHistoryParams.availableProducts[0];

    $scope.loadBonusHistory = function loadBonusHistory() {
        $scope.loadingBonusHistory = true;

        Zergling.get(
            {
                from_date: $scope.bonusHistoryParams.fromDate,
                to_date: $scope.bonusHistoryParams.toDate,
                product: $scope.bonusHistoryParams.bonusCategory,
                operation_type: 1
            },
            'get_client_bonus_balance_history'
        ).then(
            function success(response) {
                if (response.details && response.details) {
                    var i, length, bonusHistory;

                    bonusHistory = response.details;

                    for (i = 0, length = bonusHistory.length; i < length; i += 1) {
                        bonusHistory[i].Amount = parseFloat(bonusHistory[i].Amount);
                        bonusHistory[i].Balance = parseFloat(bonusHistory[i].Balance);

                        if (bonusHistory[i].PaymentSystemName) {
                            bonusHistory[i].PaymentSystemName += ' (' + Translator.get(bonusHistory[i].PaymentSystemName) + ')';
                        }
                    }
                    $scope.bonusHistory.data = bonusHistory;
                } else {
                    $scope.bonusHistory.data = [];
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: Translator.get('Failed to load bonus history')
                    });
                }
            }
        )['finally'](function stopLoader() { $scope.loadingBonusHistory = false; });
    };

    $scope.adjustDate = function adjustDate(type) {
        var date = $scope.calcDate(type, 1);

        $scope.bonusHistoryParams.fromDate = date.fromDate;
        $scope.bonusHistoryParams.toDate = date.toDate;
    };

    $scope.loadBonusHistory();
}]);
