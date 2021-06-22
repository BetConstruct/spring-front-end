/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:promotionalBonusCtrl
 * @description  promotional bonuses controller.
 */

VBET5.controller('promotionalBonusCtrl', ['$scope', '$location', 'Zergling', 'BackendConstants', '$rootScope', 'Translator', '$q', '$filter', 'Config', 'Utils', 'RecaptchaService', 'analytics', function($scope, $location, Zergling, BackendConstants, $rootScope, Translator, $q, $filter, Config, Utils, RecaptchaService, analytics) {
    'use strict';

    $scope.backendBonusConstants = BackendConstants.PromotionalBonus;
    $scope.bonusList = [];

    if ($location.search().bonustab) {
        var isAllowed = false;
        var bonusTab = $location.search().bonustab;
        switch(bonusTab) {
            case "1":
                isAllowed = $scope.conf.promotionalBonuses.sportsbook;
                break;
            case "2":
                isAllowed = $scope.conf.promotionalBonuses.casino && $scope.casinoEnabled;
                break;
            case "0":
                isAllowed = $scope.conf.promotionalBonuses.casino && $scope.casinoEnabled;
                break;
            case "3":
                isAllowed = $scope.conf.promotionalBonuses.bonusRequestURL;
                break;
            case "4":
                isAllowed = true;
                break;
            case "5":
                isAllowed = $scope.conf.promotionalBonuses.enableReferToFriend;
        }
        $location.search("bonustab", undefined);
        if (!isAllowed) {
            $scope.env.sliderContent = "";
            $scope.env.showSlider = false;
        }else {
            $scope.activeBonusTab = parseInt(bonusTab);
        }

    } else {
        $scope.activeBonusTab = Config.main.promotionalBonuses.casino && ($rootScope.currentPage.isInCasino || !Config.main.promotionalBonuses.sportsbook) ? $scope.backendBonusConstants.BonusSource.Casino : $scope.backendBonusConstants.BonusSource.SportsBook;
    }

    $scope.loadingBonus = false;

    $scope.bonusesAmount = {
        sportsBook: 0,
        casino: 0
    };

    /**
     * @ngdoc method
     * @name showConfirmationDialog
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {String} [messageText] Dialog message text
     * @param {String} [messageType] Dialog message Type // prompt, error, success
     * @description show confirmation dialog in case of claim / cancel bonus operations
     */
    function showConfirmationDialog(messageText, messageType) {
        if (messageType === 'success') {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'success',
                title: 'Success',
                content: Translator.get(messageText)
            });
            return;
        }

        if (messageType === 'warning') {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'warning',
                title: 'Warning',
                content: Translator.get(messageText)
            });
            return;
        }

        if (messageType === 'error') {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: Translator.get(messageText)
            });
            return;
        }

        if (messageType === 'prompt') {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'confirm',
                title: 'Confirm',
                cancel: true,
                content: Translator.get(messageText),
                okButton: ['bonusDialog.confirm'],
                cancelButton: ['bonusDialog.reject'],
                closeButton: ['bonusDialog.reject']
            });

            return $q(function(resolve, reject) {
                var confirm = $scope.$on('bonusDialog.confirm', function () {
                    reject();
                    resolve('user confirm');
                });
                var reject = $scope.$on('bonusDialog.reject', function () {
                    confirm();
                    reject('user reject');
                });
            });
        }
    }

    /**
     * @ngdoc method
     * @name processActiveBonusData
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {Object} [activeBonusData] Active bonus data
     * @description processing Active bonus data
     */
    function processActiveBonusData(activeBonusData) {
        if (activeBonusData) {
            $scope.activeBonusDetails = activeBonusData;
        }
        $scope.loadingActiveBonusDetails = false;
    }

    /**
     * @ngdoc method
     * @name getActiveBonusDetails
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @description get active bonus details from backend
     */
    function getActiveBonusDetails() {
        $scope.loadingActiveBonusDetails = true;
        Zergling.get({},'get_casino_bonuse_details').then(processActiveBonusData)['catch'](function (reason) {
            showConfirmationDialog(BackendConstants.ErrorCodesByValue[reason.result], 'error');
        })['finally'](function () {
            $scope.loadingActiveBonusDetails = false;
        });
    }

    /**
     * @ngdoc method
     * @name processBonusData
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {Object} [bonusData] Bonus data
     * @description processing bonus data
     */
    function processBonusData(bonusData) {
        if (bonusData && bonusData.bonuses && Array.isArray(bonusData.bonuses)) { //bonusData.bonuses can be error message.
            $scope.bonusList = bonusData.bonuses;
            angular.forEach ($scope.bonusList, function (bonusVal){
                if (bonusVal && bonusVal.money_requirenments && $rootScope.currency_name && bonusVal.money_requirenments[$rootScope.currency_name.toLowerCase()]) {
                    bonusVal.max_amount = bonusVal.money_requirenments[$rootScope.currency_name.toLowerCase()].max_amount;
                    bonusVal.min_amount = bonusVal.money_requirenments[$rootScope.currency_name.toLowerCase()].min_amount;
                }
                if (bonusVal && bonusVal.bonus_type === $scope.backendBonusConstants.BonusType.WageringBonus && bonusVal.acceptance_type === $scope.backendBonusConstants.BonusAcceptanceType.Activated) {
                    getActiveBonusDetails();
                }
            });
        }
        $scope.loadingBonus = false;
    }

    /**
     * @ngdoc method
     * @name getPromotionalBonus
     * @methodOf vbet5.controller:promotionalBonusCtrl
     *
     * @description get bonus data from backend
     */
    function getPromotionalBonus() {
        var request = {
            free_bonuses: $scope.activeBonusTab === $scope.backendBonusConstants.BonusSource.SportsBook
        };
        $scope.loadingBonus = true;
        Zergling.get(request,'get_bonus_details').then(function (data) {
            processBonusData(data);
            if(request.free_bonuses === true) {
                $scope.bonusesAmount.sportsBook = data.bonuses.length;
            } else {
                $scope.bonusesAmount.casino = data.bonuses.length;
            }
            $rootScope.$broadcast('promotionalbonuses.data', {data: data, product: request.free_bonuses ? 'sportsbook' : 'casino'});
        })['catch'](function (reason) {
            showConfirmationDialog(BackendConstants.ErrorCodesByValue[reason.result], 'error');
        })['finally'](function () {
            $scope.loadingBonus = false;
        });
    }

    /**
     * @ngdoc method
     * @name getCasinoBonusesAmount
     * @methodOf vbet5.controller:promotionalBonusCtrl
     *
     * @description get casino bonus data from backend
     */
    function getCasinoBonusesAmount() {
        var request = {
            free_bonuses: $scope.activeBonusTab === $scope.backendBonusConstants.BonusSource.Casino
        };
        Zergling.get(request,'get_bonus_details').then(function (data) {
            if(request.free_bonuses === true) {
                $scope.bonusesAmount.sportsBook = data.bonuses.length;
            } else {
                $scope.bonusesAmount.casino = data.bonuses.length;
            }
        });
    }

    /**
     * @ngdoc method
     * @name cancelBonus
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {object} [bonus] Bonus

     * @description Cancel active bonus
     */
    $scope.cancelBonus = function cancelBonus(bonus) {
        Zergling.get({client_bonus_id: bonus.id}, 'get_bonus_real_money').then(function (response){
            var msg = Translator.get('Are you sure want to cancel this bonus?');
            msg = msg + '<br />' + Translator.get('After the Cancellation {1} will be returned to you`r main balance.', [$filter('number')(response.details.Balance) + ' ' + $rootScope.profile.currency_name]);


            var promise = showConfirmationDialog(msg, 'prompt');
            var request = {bonus_id: bonus.partner_bonus_id};
            promise.then(function () {
                Zergling.get(request,'cancel_bonus').then(function (response) {
                    if (response.result === 0){
                        showConfirmationDialog('Bonus canceled', 'success');
                        getPromotionalBonus();
                    } else {
                        showConfirmationDialog(BackendConstants.ErrorCodesByValue[response.result], 'error');
                    }
                });
            }, function (reason) {
                console.log(reason);
            });
        });

    };

    /**
     * @ngdoc method
     * @name claimBonus
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {Number} [bonusId] Bonus id
     * @param {boolean} navigateToDeposit is navigate after successful claim into deposit page
     * @description Claim bonus
     */
    $scope.claimBonus = function claimBonus(bonus, navigateToDeposit) {

        if(bonus['is_for_verified_players_only'] && !$rootScope.profile['is_verified']) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'warning',
                title: 'Warning',
                content: Translator.get('This bonus is available for verified users only. Please verify your account to be able to claim it.', 'warning'),
                hideCloseButton: true,
                buttons: [
                    {title: 'Ok', callback: function() {
                            if($rootScope.conf.enableAccountVerification || $rootScope.conf.accountVerificationMessage) {
                                $rootScope.env.sliderContent = 'settings';
                                $rootScope.env.mixedSettingsPage = 'verifyaccount';
                            }
                        }}
                ]
            });
            return;
        }

        var promise = showConfirmationDialog('Are you sure you want to claim this bonus?', 'prompt');
        var request = {bonus_id: bonus.partner_bonus_id, client_bonus_id: bonus.id };
        promise.then(function () {
            Zergling.get(request,'claim_bonus').then(function (response) {
                if (response.result === 0){
                    showConfirmationDialog('Bonus claimed', 'success');
                    getPromotionalBonus();
                    navigateToDeposit && $rootScope.broadcast("toggleSliderTab", "deposit");
                } else {
                    showConfirmationDialog(BackendConstants.ErrorCodesByValue[response.result], 'error');
                }
            });
        }, function (reason) {
            console.log(reason);
        });
    };

    /**
     * @ngdoc method
     * @name switchBonusTab
     * @methodOf vbet5.controller:promotionalBonusCtrl
     * @param {Number} [target] Bonus Product type
     * @description Switch between bonus types
     */
    $scope.switchBonusTab = function switchBonusTab(target) {

        if (target !== $scope.activeBonusTab){
            $scope.bonusList = [];
            $scope.activeBonusTab = target;
            if ([$scope.backendBonusConstants.BonusSource.SportsBook, $scope.backendBonusConstants.BonusSource.Casino].indexOf(target) > -1) {
                getPromotionalBonus();
            }
        }
    };

    $scope.applyBonus = function applyBonus() {
        if ($scope.applyingBonus || $scope.loadingBonus || !$scope.promoCode) { return; }

        $scope.applyingBonus = true;
        RecaptchaService.execute('apply_promo_codes', { debounce: false }).then(function () {
            Zergling.get({ 'code': $scope.promoCode }, 'apply_promo_codes')
                .then(function success(response) {
                    var dialogOpts = {
                        type: '',
                        title: '',
                        content: ''
                    };

                    switch (response.result) {
                        case 0:
                            dialogOpts.type = 'success';
                            dialogOpts.title = 'Success';
                            dialogOpts.content = Translator.get('Your promo code has been applied');
                            $rootScope.broadcast("promoCodeApplied", $scope.promoCode);
                            break;
                        case '-99':
                        case '-2471':
                            dialogOpts.content = Translator.get('Promo code has been already applied');
                            break;
                        default:
                            dialogOpts.type = 'error';
                            dialogOpts.title = 'Error';
                            dialogOpts.content = dialogOpts.content || Translator.get('Invalid promo code');
                    }

                    if (dialogOpts.type === 'success') {
                        dialogOpts.buttons = [
                            {
                                title: 'Ok',
                                callback: getPromotionalBonus
                            }
                        ];
                    }

                    $rootScope.$broadcast("globalDialogs.addDialog", dialogOpts);
                })['finally'](function() { $scope.applyingBonus = false; });
        })

    };

    $scope.formatBonusRequestURL = function formatBonusRequestURL() {
        var iframeUrl = Config.main.promotionalBonuses.bonusRequestURL;

        $scope.bonusRequestURL = Utils.replaceTextPlaceholdersByObjectValues(iframeUrl, $rootScope.profile);

    };

    function getFreeSpins() {
        if ($rootScope.partnerConfig.is_freespin_claimable) {
            Zergling.get({
                "acceptance_type": $scope.backendBonusConstants.BonusAcceptanceType.None,
                "max_rows":30
            },'get_free_spin_bonuses').then(function(data) {
                $scope.bonusesAmount.freeSpins = data.details.length;
                $rootScope.$broadcast('promotionalbonuses.data', {data: data, product: 'freeSpins'});
            });
        }
    }
    if (Config.main.promotionalBonuses.casino) {
        getFreeSpins();
    }
    getCasinoBonusesAmount();
    getPromotionalBonus(); //first step

}]);
