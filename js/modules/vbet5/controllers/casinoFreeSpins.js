/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:casinoFreeSpinsCtrl
 * @description  casino free spins controller
 */

VBET5.controller('casinoFreeSpinsCtrl', ['$scope', 'Zergling', 'BackendConstants', 'casinoData', 'casinoManager', '$rootScope', "Config", function ($scope, Zergling, BackendConstants, casinoData, casinoManager, $rootScope, Config) {
    'use strict';

    $scope.details = {};
    $scope.selectedState = $scope.backendBonusConstants.BonusAcceptanceType.None;

    function getFreeSpins() {
        if (Config.main.promotionalBonuses.casino) {
            $scope.loadingBonuses = true;
            Zergling.get({
                "acceptance_type": $scope.selectedState,
                "max_rows":30
            }, 'get_free_spin_bonuses').then(function (data) {
                if ($scope.selectedState === $scope.backendBonusConstants.BonusAcceptanceType.None) {
                    $scope.bonusesAmount.freeSpins = data.details.length;
                    $rootScope.$broadcast('promotionalbonuses.data', {data: data, product: 'freeSpins'});

                }
                $scope.casinoFreeSpins = data.details;
            })['finally'](function () {
                $scope.loadingBonuses = false;
            });
        }
    }

    $scope.selectState = function selectState(newState) {
        if (newState !== $scope.selectedState) {
            $scope.selectedState = newState;
            getFreeSpins();
        }
        $scope.dropdownOpen = false;
    };

    function showMessage(type, title, content) {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: type,
            title: title,
            content: content
        });
    }

    $scope.claimFreeSpin = function claimFreeSpin(bonus) {

        Zergling.get({
            bonus_id: bonus.PartnerBonusId,
            client_bonus_id: bonus.Id
        }, 'claim_bonus').then(function (response) {
            if (response.result === 0) {
                showMessage("success", "Success", "Bonus claimed");
                getFreeSpins();
            } else {
                showMessage("error", "Error", response.result_text);
            }
        });
    };

    $scope.toggleBonusDetails = function toggleBonusDetails(id, externalId) {
        $scope.details[id] = $scope.details[id] || { opened: false};
        $scope.details[id].opened = !$scope.details[id].opened;

        if ($scope.details[id].opened && !$scope.details[id].games) {
            $scope.details[id].loading = true;
            Zergling.get({bonus_id: externalId}, "get_bonus_definition_games").then(function (response) {
                if (response.result === 0 && response.details.Result.length) {
                    casinoData.getGames({external_id:response.details.Result}).then(function (response) {
                        if (response && response.data && response.data.status !== -1) {
                            $scope.details[id].games = response.data.games;
                            $scope.details[id].loading = false;
                        } else {
                            throw new Error();
                        }
                    });
                } else {
                    throw new Error();
                }
            })['catch'](function () {
                    $scope.details[id].loading = false;
                }
            );
        }
    };

    $scope.$on('casinoGamesList.openGame', function (e, data) {
        $rootScope.env.sliderContent = '';
        $rootScope.env.showSlider = false;
        casinoManager.navigateToRightRouteAndOpenGame(data.game, data.playMode);
    });

    getFreeSpins();
}]);
