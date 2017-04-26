VBET5.controller('mainHeaderVersion2Controller', ['$rootScope', '$scope', '$location', 'Config', 'Zergling', 'Storage', 'ActiveStep', function ($rootScope, $scope, $location, Config, Zergling, Storage, ActiveStep) {
    'use strict';

    Config.main.dashboardEnabled = Config.main.dashboard.enabled; // @TODO need to remove after solution is  found

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Initialization
     */
    $scope.init = function init () {
        $scope.headerVersion2Icons = {};
    };

    /**
     * @ngdoc method
     * @name headerIconClick
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Handle header icons click (LiveChat, GAQ e.t.c.)
     */
    $scope.headerIconClick = function headerIconClick() {
        if (Config.main.header && Config.main.header.iconAction) {
            switch (Config.main.header.iconAction) {
                case 'faq':
                    $scope.openFaq();
                    return;
            }
        }
        $scope.headerVersion2Icons.helpIsToggled = !$scope.headerVersion2Icons.helpIsToggled;
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
     * @name doSkypeRequest
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Opens skype confirmation dialog
     */
    $scope.doSkypeRequest = function doSkypeRequest() {
        $rootScope.$broadcast('skypeAuthorization.show');
        $scope.showSkypeRequest = false;
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
            $scope.env.paymentListShown = true;
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

    /**
     * @ngdoc method
     * @name userDataConfirm
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Handles user age verification call
     */
    function userDataConfirm() {
        Zergling.get({}, 'verify_user_age').then(function (result) {
            if (parseInt(result.code, 10) === 0) {
                $rootScope.env.showSlider = false;
                $scope.doSkypeRequest();
            } else {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "error",
                    title: "Error",
                    content: 'Error occured.'
                });
            }

            console.log(result);
        })['catch'](function (reason) {
            console.log('Error:'); console.log(reason);
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "error",
                title: "Error",
                content: 'Error occured.'
            });
        });
    }

    $scope.env.paymentListShown = Config.main.showPaymentsDescriptionByDefault || false;

    // this part of code is used on
    if (Config.activeStepsConfig) {

        $scope.$on('profile', function () {
            processProfileActiveStep();
        });

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

    /**
     * @ngdoc method
     * @name userDataConfirm
     * @methodOf vbet5.controller:mainHeaderVersion2Controller
     * @description Process user authorization (Not used in all skins)
     */
    function processUserAuthorization(event, data) {
        if ($rootScope.profile && $rootScope.profile.paymentSystems && $rootScope.profile.paymentSystems.status) {
            $rootScope.env.showSlider = true;
            $rootScope.env.sliderContent = 'customContent';
            $rootScope.env.sliderCustomContent = {
                content: 'Authorization error.'
            };

            //$rootScope.profile.paymentSystems.status = 'UnknownCustomer';
            //$rootScope.profile.paymentSystems.redirect = '223322';

            switch ($rootScope.profile.paymentSystems.status) {
                case 'OutdatedCustomer':
                case 'UnidentifiedCustomer':
                    $rootScope.env.sliderCustomContent = {
                        content: 'Your account is not authorized yet'
                    };
                    break;
                case 'UnknownCustomer':
                    $rootScope.env.sliderCustomContent = {
                        content: 'In order to make a deposit you have to be authorized'
                    };
                    break;
            }

            $rootScope.env.sliderCustomContent.contentType = 'userAuthorization';
            $rootScope.env.sliderCustomContent.userConfirmationFaqUrl = Config.main.userConfirmationFaqUrl;

            if ($rootScope.profile.paymentSystems.redirect) {
                $rootScope.env.sliderCustomContent.buttonText = 'Goto autorization url';
                $rootScope.env.sliderCustomContent.buttonUrl = $rootScope.profile.paymentSystems.redirect;
            }
        }
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
    $rootScope.$on('slider.userDataConfirm', userDataConfirm);
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

}]);