/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:cashBackCashOutCtrl
 * @description
 *  Receive X percent of cashBack amount before the cashBack awarding date.
 */
VBET5.controller('cashBackCashOutCtrl', ['$rootScope', '$scope', 'Zergling', 'Translator', function ($rootScope, $scope, Zergling, Translator) {
    'use strict';

    $scope.availableBonuses = [];
    $scope.isLoading = false;

    /**
     * @ngdoc function
     * @name getAvailableBonuses
     * @description Load cashOut available bonuses
     */
    function getAvailableBonuses() {
        $scope.isLoading = true;

        Zergling.get({}, 'get_casino_cash_out_available_bonuses').then(function (response) {
            if (response.result === 0) {
                $scope.availableBonuses = response.details;
            }
        })['finally'](function () {
            $scope.isLoading = false;
        });
    }

    /**
     * @ngdoc function
     * @name showErrorPopup
     * @description Show error popup when something went wrong
     */
    function showErrorPopup(errorMessage) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: 'error',
            title: 'Error',
            content: Translator.get(errorMessage)
        });
    }

    /**
     * @ngdoc method
     * @name calculateCashOutAmount
     * @methodOf vbet5.controller:cashBackCashOutCtrl
     * @description Calculate cashBack cashOut amount
     */
    $scope.calculateCashOutAmount = function calculateCashOutAmount(definitionId) {
        $scope.isLoading = true;

        Zergling.get({"bonus_definition_id": definitionId}, 'calculate_cash_back_cash_out').then(function (response) {
            if (response.result === 0) {
                for (var i = 0; i < $scope.availableBonuses.length; i++) {
                    if ($scope.availableBonuses[i].BonusDefinitionId === definitionId) {
                        $scope.availableBonuses[i].cashBackCashOut = response.details;
                        break;
                    }
                }
            } else {
                showErrorPopup(response.details.ErrorDescription);
            }
        })['finally'](function () {
            $scope.isLoading = false;
        });
    };

    /**
     * @ngdoc method
     * @name processCashOutAmount
     * @methodOf vbet5.controller:cashBackCashOutCtrl
     * @description Process cashBack cashOut amount
     */
    $scope.processCashOutAmount = function processCashOutAmount(definitionId, bonusAmount) {
        if(!bonusAmount) {return}
        $scope.isLoading = true;

        Zergling.get({"bonus_definition_id": definitionId}, 'process_cash_back_cash_out').then(function (response) {
            if (response.result === 0) {
                getAvailableBonuses();
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'success',
                    title: 'Success',
                    content: 'Cash out was successfully done'
                });
            } else {
                showErrorPopup(response.details.ErrorDescription);
            }
        })['finally'](function () {
            $scope.isLoading = false;
        });
    };

    getAvailableBonuses();
}]);
