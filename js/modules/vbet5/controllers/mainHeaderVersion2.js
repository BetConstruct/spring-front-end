VBET5.controller('mainHeaderVersion2Controller', ['$rootScope', '$scope', '$location', 'Config', 'Zergling', 'Storage', 'ActiveStep', 'BackendConstants', 'Translator',  function ($rootScope, $scope, $location, Config, Zergling, Storage, ActiveStep, BackendConstants, Translator) {
    'use strict';

    /**
     * @ngdoc method
     * @name headerIconClick
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Handle header icons click (LiveChat, GAQ e.t.c.)
     */
    $scope.headerIconClick = function headerIconClick(state) {
        if (Config.main.header && Config.main.header.iconAction) {
            switch (Config.main.header.iconAction) {
                case 'faq':
                    $scope.openFaq();
                    return;
            }
        }
        if (state !== undefined && Config.main.openProfileMenuByHover) {
            $scope.headerVersion2Icons.helpIsToggled = state;
        } else if (!Config.main.openProfileMenuByHover && state === undefined) {
            $scope.headerVersion2Icons.helpIsToggled = !$scope.headerVersion2Icons.helpIsToggled;
        }

    };

    $scope.notificationPopup = {};
    // posible verification codes
    /*
    EmailVerification = 1,
    PhoneVerification = 2,
    LetterVerification = 3,
    TsupisVerification = 4,
    SkypeVerification = 5
    18+ = 20
    */

    /**
     * @ngdoc method
     * @name checkSkypeRequestStatus
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Check active step to show skype confirmation dialog @TODO this must me moved to activeStep service
     */
    function checkSkypeRequestStatus () {
        if (Config.env.authorized && $rootScope.profile && $rootScope.profile.active_step) {
            switch ($rootScope.profile.active_step) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    if (!$scope.skypeRequestOpened) {
                        $scope.showSkypeRequest = true;
                        $scope.skypeRequestOpened = true;
                        $scope.activeStep = $rootScope.profile.active_step;
                    }
                    break;
                case 20:
                    $rootScope.env.showSlider = true;
                    $rootScope.env.sliderContent = 'customContent';
                    $rootScope.env.sliderCustomContent = {
                        contentType: 'userAgeConfirmation'
                    };
                    break;
            }

        }
    }

    /**
     * @ngdoc method
     * @name selectBalanceMenuItem
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Select balance menu item
     * @param {Object} Event not used
     * @param {String} Slider name
     */
    $scope.selectBalanceMenuItem = function selectBalanceMenuItem (e, itemName) {
        if (!Config.main.enableMixedView) {
            $scope.headerVersion2Icons.balanceIsToggled = false;
            $scope.headerVersion2Icons.profileToggled = false;
        }
        $scope.env.selectedPayment = '';
        $scope.env.paymentListShown = Config.main.showPaymentsDescriptionByDefault || false;
        if ($scope.env.sliderContent === itemName && $scope.env.showSlider) {
            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
            return;
        }
        $scope.env.showSlider = true;
        $scope.env.sliderContent = itemName;

        e.stopPropagation();
    };


    /**
     * @ngdoc method
     * @name hideSkypeRequest
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Hides skype confirmation dialog
     */
    $scope.hideSkypeRequest = function hideSkypeRequest() {
        $scope.showSkypeRequest = false;
    };

    $scope.$on('profile', function () {
        if ($rootScope.profile) {
            $rootScope.profile.skype_request = true;
            checkSkypeRequestStatus();
            if ($rootScope.profile.exclude_type === 2) { //auto logout on backoffice self exclusion
                $rootScope.broadcast('doLogOut');
            }
        }
        if (Config.activeStepsConfig) {
            processProfileActiveStep();
        }
    });

    $scope.$on('openPayment.deposit', function(e, args) {
        $scope.selectBalanceMenuItem(args.event, 'deposit');

    });

    /**
     * @ngdoc method
     * @name openHelpPage
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Opens help page based on config
     * @param {String} Help page slug
     * @param {String} From where Help has been opened (header, footer e.t.c.)
     */
    $scope.openHelpPage = function (helpPageItem, from) {
        if (helpPageItem === "payments" && Config.main.enableMixedView) {
            $scope.env.paymentListShown = !Config.main.removePaymentMethodBlockInWithdrawPage;
            $scope.toggleSliderTab('deposit');
        } else {
            $rootScope.$broadcast('openHelpPage', {slug: helpPageItem, from: from});
        }
    };

    /**
     * @ngdoc method
     * @name toggleProfileMenu
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Toggle profile menu
     * @param {Object} Event not used
     * @param {String} Forces state if defined
     */
    $scope.toggleProfileMenu = function toggleProfileMenu(event, state) {
        if (state !== undefined && Config.main.openProfileMenuByHover) {
            $scope.headerVersion2Icons.profileToggled = state;
        } else if (!Config.main.openProfileMenuByHover && state === undefined) {
            $scope.headerVersion2Icons.profileToggled = !$scope.headerVersion2Icons.profileToggled;
        }
        event.stopPropagation();
    };

    /**
     * @ngdoc method
     * @name processProfileActiveStep
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Process active step from profile
     * @param {String} Process specific type if set
     */
    function processProfileActiveStep (type) {
        $scope.notificationPopup = ActiveStep.getNotificationPopup(type);
    }

    $scope.env.paymentListShown = Config.main.showPaymentsDescriptionByDefault || false;

    // this part of code is used on
    if (Config.activeStepsConfig) {
        $scope.notificationPopupClick = function notificationPopupClick(popup) {
            if (popup.param) {
                $location.search(popup.param[0], popup.param[1]);
            }
            if (popup.settingsPage) {
                $rootScope.env.mixedSettingsPage = popup.settingsPage;
            }
        };

        $scope.notificationPopupInput = function notificationPopupInput () {
            Zergling.get({"verification_code": $scope.notificationPopup.input}, 'verify_address_request').then(function (response) {
                if (response && response.result) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: 'Wrong verification code'
                    });
                } else {
                    processProfileActiveStep();
                }
            });
        };
    }

    $scope.$on('profilemenu.closed', function () {
        $scope.headerVersion2Icons.profileToggled = false;
    });

    $scope.$on('activeStep.accept_terms_conditions', function (event, data) {
        Zergling.get({}, 'accept_terms_conditions').then(function (response) {
            if (response.result === 0){
                ActiveStep.resetProfileData();
                console.log('accept_terms_conditions OK');
            } else {
                console.error('accept_terms_conditions ERROR');
            }
        }, function () {
            console.error('accept_terms_conditions ERROR');
        });
    });

    $scope.env.paymentListShown = Config.main.showPaymentsDescriptionByDefault || false;
    $scope.getStorageState = function getStorageState (name) {
        return !!Storage.get(name);
    };

    /**
     * @ngdoc method
     * @name setStorageState
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Used to set storage state from template
     * @param {String} Storage key
     * @param {String} Value
     */
    $scope.setStorageState = function setStorageState (name, state) {
        Storage.set(name, !!state);
    };

    function calculateBonusesCount(data, product) {
        if (data && data.bonuses) {
            $scope.bonusesCount[product] = data.bonuses.length;
            $rootScope.allBonusesCount[product] = data.bonuses.length;
        }
    }
    function handleFreeSpinsResponse(data) {
        $scope.bonusesCount.freeSpins = data.details.length;
        $rootScope.allBonusesCount.freeSpins = data.details.length;
    }

    function getFreeSpins() {
        Zergling.get({
            "acceptance_type": BackendConstants.PromotionalBonus.BonusAcceptanceType.None,
            "max_rows":30
        },'get_free_spin_bonuses').then(handleFreeSpinsResponse);
    }

    /**
     * @ngdoc method
     * @name getBonusesCount
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Checks the availability of product bonuses and gets the number of active bonuses
     */
    $scope.getBonusesCount = function getBonusesCount() {
        if (Config.main.promotionalBonuses.disableCountOnIcon || ($rootScope.profile && $rootScope.profile.is_bonus_allowed === false)) {
            return;
        }
        $scope.bonusesCount = {
            'sportsbook': 0,
            'casino': 0,
            'freeSpins': 0
        };

        $rootScope.allBonusesCount = {
            'sportsbook': 0,
            'casino': 0,
            'freeSpins': 0
        };

        var getProductBonuses  = function (product) {
            Zergling.get({free_bonuses: product === 'sportsbook'},'get_bonus_details').then(function (data) {
                calculateBonusesCount(data, product);
            });
        };

        if (Config.main.promotionalBonuses.sportsbook) getProductBonuses('sportsbook');
        if (Config.main.promotionalBonuses.casino) {
            getProductBonuses('casino');
            if ($rootScope.partnerConfig.is_freespin_claimable) {
                getFreeSpins();
            }
        }



    };

    /**
     * @ngdoc method
     * @name closeAboveHeader
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Close above header section
     */
    if (Config.main.header && Config.main.header.aboveHeader && Config.main.header.aboveHeader.enabled && Storage.get('aboveHeaderOpened') !== false) {
        $scope.aboveHeaderOpened = true;
        $scope.closeAboveHeader = function closeAboveHeader() {
            $scope.aboveHeaderOpened = false;
            Storage.set('aboveHeaderOpened', false);
        };
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Initialization
     */
    (function init () {
        $scope.headerVersion2Icons = {};

        if (Config.main.promotionalBonuses.enable && !Config.main.promotionalBonuses.disableCountOnIcon) {
            $scope.$on('promotionalbonuses.data', function (event, data) {
                if (data.product === 'freeSpins') {
                    handleFreeSpinsResponse(data.data);
                    return;
                }
                calculateBonusesCount(data.data, data.product);
            });
        }
    })();
}]);
