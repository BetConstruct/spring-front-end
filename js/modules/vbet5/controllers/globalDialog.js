/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:globalDialogCtrl
 * @description
 * Custom dialog controller
 * Dialogs can be added in two ways
 * 1. by assigning the dialog to $rootScope.globalDialog global variable
 *      in this case the new dialog will overwrite previous dialogs
 *      for deleting/closing null can be assigned to $rootScope.globalDialog variable
 * 2. by broadcasting globalDialogs.addDialog event and passing the dialog object to the event
 *      in this case the new dialog will be saved in $scope.globalDialogs array,
 *      first input dialog will be output first (FIFO)
 *      the passed dialog should have the following structure
 *      {
 *          type: 'info', // required field - type of dialog can be info warning error success (feedback - only for feedback dialog)
 *          title: 'Information', // optional field - headline of dialog
 *          subTitle: 'Information', // optional field - title of dialog text
 *          content: "content of first dialog" // required field
 *      }
 */
VBET5.controller('globalDialogCtrl', ['$rootScope', '$scope', '$location', '$window', '$filter', '$cookies', '$route', 'Config', 'Storage', 'Utils', 'content', 'Geoip', 'TimeoutWrapper', 'Moment', 'Translator', 'Tracking', 'Zergling', 'analytics', 'PaymentPreCalculation',
    function ($rootScope, $scope, $location, $window, $filter, $cookies, $route, Config, Storage, Utils, content, Geoip, TimeoutWrapper, Moment, Translator, Tracking, Zergling, analytics, PaymentPreCalculation) {
        'use strict';

        // $scope.globalDialogs is array where the dialogs are stored
        $scope.globalDialogs = [];
        $scope.activeDialog = null;
        TimeoutWrapper = TimeoutWrapper($scope);
        var runtimePopupCache;
        /**
         * @ngdoc method
         * @name dialog
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description returns active dialog
         */
        $scope.dialog = function dialog(param) {
            if (param) {
                return $rootScope.globalDialog[param];
            }
            return $rootScope.globalDialog;
        };

        /**
         * @ngdoc method
         * @name updateActiveDialog
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description returns active dialog (from globalDialogs)
         */
        function updateActiveDialog() {

            if ($scope.globalDialogs.length === 0) {
                $scope.activeDialog = null;
                Config.env.isGlobalDialog = false;
            } else {
                Config.env.isGlobalDialog = true;
            }

            $scope.activeDialog = $scope.globalDialogs[$scope.globalDialogs.length - 1];
        }

        function removeDialogByTag(tag) {
            var i, length = $scope.globalDialogs.length;
            for (i = 0; i < length; i += 1) {
                if ($scope.globalDialogs[i].tag && $scope.globalDialogs[i].tag === tag) {
                    $scope.closeDialog($scope.globalDialogs[i]);
                    break;
                }
            }
        }

        /**
         * @ngdoc method
         * @name addDialog
         * @methodOf vbet5.controller:globalDialogCtrl
         * @param {Object} dialog to add
         * @description adds dialog and updates its arrays
         */
        function addDialog(dialog) {
            if (!dialog.src && !dialog.content && !dialog.template && !dialog.iframe) {
                return;
            }

            dialog.tag && removeDialogByTag(dialog.tag);
            dialog.index = $scope.globalDialogs.length;
            dialog.standardPopup = true;

            $scope.globalDialogs.unshift(dialog);
            updateActiveDialog();
        }

        function disableButtons(state) {
            if ($scope.activeDialog && $scope.activeDialog.buttons) {
                $scope.activeDialog.disableButtons = state;
                angular.forEach($scope.activeDialog.buttons, function (button) {
                    button.disabled = state;
                });
            }
        }


        /**
         * @ngdoc method
         * @name closeDialog
         * @methodOf vbet5.controller:globalDialogCtrl
         * @param {Object} item dialog that should be removed
         * @param {Object} target
         * @param {Object} button
         * @param {Object} event
         * @description removes given dialog from $scope.globalDialogs array
         */
        $scope.closeDialog = function closeDialog(item, target, button, event) {

            if (event) {
                var preventEvent = true;
                var foundElement = null;
                var path = event.path || (event.composedPath && event.composedPath());
                if (path) {
                    for (var i = 0; i < path.length; i++) {
                        if (path[i].nodeName === 'A') {
                            preventEvent = false;
                            foundElement = path[i];
                            break;
                        }
                    }
                } else if (event.target) {// IE fix
                    var element = event.target;
                    for (var j = 0; j < 20; j++) {
                        if (element && element.nodeName === 'A') {
                            preventEvent = false;
                            foundElement = element;
                            break;
                        } else if (element.parentNode) {
                            element = element.parentNode;
                        } else {
                            break
                        }
                    }
                }
                if (preventEvent) {
                    return;
                }
                if (foundElement) {
                    var linkData = Utils.getAllUrlParams(foundElement.href);
                    if ($location.path() !== '/' && linkData.path.indexOf($location.path()) > -1) {
                        $route.reload();
                    }
                }

            }

            var index = $scope.globalDialogs.indexOf(item);
            if (index !== -1) {
                if (target && $scope.globalDialogs[index][target]) {
                    if (typeof $scope.globalDialogs[index][target] === 'string' || $scope.globalDialogs[index][target] instanceof String) {
                        $rootScope.$broadcast($scope.globalDialogs[index][target]);
                    } else {
                        $rootScope.$broadcast($scope.globalDialogs[index][target][0], $scope.globalDialogs[index][target][1]);
                    }
                } else if (button) {
                    if (button.url) {
                        $window.location = button.url;
                    } else if (button.callback && typeof button.callback === "function") {
                        button.callback();
                    } else if (button.action) {
                        $rootScope.$broadcast(button.action, button.data);
                    }
                }

                if (item.runtime_popup_id && item.dont_show_runtime_popup) {
                    storeData('popup' + (item.runtime_popup_id) + 'ShowedTime', -1000); // don't show again
                }

                $scope.globalDialogs.splice(index, 1);
                updateActiveDialog();
            }
        };

        /**
         * @ngdoc method
         * @name buttonClick
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Button clicked
         */
        $scope.buttonClick = function buttonClick() {
            if ($rootScope.globalDialog) {
                if ($rootScope.globalDialog.buttonBroadcast) {
                    $rootScope.$broadcast($rootScope.globalDialog.buttonBroadcast);
                }
            }
            $scope.closeDialog();
        };

        /**
         * @ngdoc method
         * @name closeDialog
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Close the dialog
         */
        $scope.closeGlobalDialog = function closeGlobalDialog(reloadOnClose) {

            if ($rootScope.globalDialog && $rootScope.globalDialog.reloadOnClose && reloadOnClose) {
                $scope.refresh();
            }

            $rootScope.globalDialog = null;
        };

        /**
         * @ngdoc method
         * @name refresh
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Refresh main window
         */
        $scope.refresh = function refresh() {
            TimeoutWrapper(function () {
                $window.location.reload();
            }, 100);
        };

        /**
         * @ngdoc method
         * @name answer
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description closes yes/no dialog and broadcasts user's answer
         * @param {String} usersAnswer user's answer
         */
        $scope.answer = function answer(usersAnswer) {
            $rootScope.$broadcast('dialog.' + usersAnswer);
            $scope.closeDialog();
        };

        /**
         * @ngdoc method
         * @name showRuntimeMessage
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description handles dialog on runtime.
         */
        function showRuntimeMessage() {
            var params = $location.search();
            var message = params.message;
            if (message) {
                var isPopup = $location.path() === '/popup/',
                    messageAmount = params.amount,
                    messageCurrency = params.currency;

                addDialog({
                    type: 'info',
                    title: 'info',
                    content: message,
                    index: $scope.globalDialogs.length,
                    standardPopup: true,
                    hideButtons: isPopup,
                    hideCloseButton: isPopup
                });
                $location.search('message', undefined); //remove it after displaying
                $location.search('amount', undefined); //remove it after displaying
                $location.search('currency', undefined); //remove it after displaying
                analytics.gaSend('send', 'event', 'dialog', 'message', {
                    'page': $location.path(),
                    'eventLabel': message
                });

                if (Config.main.trackingOnMessage && Config.main.trackingOnMessage[message]) {
                    Tracking.event(Config.main.trackingOnMessage[message], {}, true);
                }
                if (messageAmount && messageCurrency) {
                    PaymentPreCalculation.checkFirstDeposit().then(function (isFirstDeposit) {
                        $rootScope.broadcast("payment.success",
                            {
                                'type':  'deposit',
                                'payment_amount': +messageAmount ,
                                'payment_currency': messageCurrency,
                                'isFirstDeposit': isFirstDeposit
                            });
                    });


                }

            }
        }

        /**
         * @ngdoc method
         * @name storeData
         * @methodOf vbet5.controller:globalDialogCtrl
         * @param {String} key the id of stored data
         * @param {Number} value the stored value
         * @description stores value in Storage or cookie
         */
        function storeData(key, value) {
            Utils.checkAndSetCookie(key, value, 8640000000); //8640000000 = 100 day
            Storage.set(key, value);
        }

        /**
         * @ngdoc method
         * @name showRuntimePopup
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Get custom popup content from cms
         */
        function showRuntimePopup(popup) {

            var loginStatus = parseInt(popup.login || 0, 10),
                ageRestriction = parseInt(popup.age_restriction || 0, 10),
                userTime = Moment.get().utc().unix(),
                customRepeat = popup.custom_repeat || (popup.custom_fields && popup.custom_fields.custom_repeat),
                lastShow = parseInt($cookies.getObject('popup' + (popup.id || '') + 'ShowedTime') || Storage.get('popup' + (popup.id || '') + 'ShowedTime'), 10),
                repeatType = lastShow === -1000 ? 'never' : popup.repeat_type || (popup.custom_fields && popup.custom_fields.repeat_type), // -1000 don't show again
                expiryTime = 1,
                calculatedAge = calculateAge();

            switch (repeatType) {
                case 'never':
                    expiryTime = false;
                    break;
                case 'once_a_day':
                    expiryTime = 86400;
                    break;
                case 'once_a_week':
                    expiryTime = 604800;
                    break;
                case 'once_a_month':
                    expiryTime = 2592000;
                    break;
                case 'custom':
                    expiryTime = parseInt(customRepeat, 10) * 60;
                    break;
            }

            loginStatus = ageRestriction ? 1 : loginStatus;

            if ((loginStatus === 0 && !Config.env.authorized) || (loginStatus === 1 && Config.env.authorized) || loginStatus === 2) {

                if (lastShow && expiryTime === false) {
                    return;
                }

                if (ageRestriction && (calculatedAge >= ageRestriction || !calculatedAge)) {
                    return;
                }

                if (!lastShow || userTime > lastShow + expiryTime || popup.slug === 'registration-popup') {
                    var dialog = {
                        type: 'cms-popup',
                        title: popup.title,
                        content: popup.content + ' ',
                        runtime_popup_id:popup.id,
                        dont_show_runtime_popup : false

                    };
                    popup.link && (dialog.link = popup.link);
                    popup.custom_fields && (dialog.custom_fields = popup.custom_fields);
                    popup.linktarget && (dialog.linktarget = popup.linktarget);
                    addDialog(dialog);
                    storeData('popup' + (popup.id || '') + 'ShowedTime', userTime);
                }
            }
        }

        function showOnAnotherPage(popups) {
            $scope.$on('$routeChangeSuccess', function () {
                for (var i = 0; i < popups.length; i++) {
                    if ($location.path().replace(/\//g, '') === popups[i].show_on_page || (popups[i].show_on_page === 'home' && $location.path() === '/')) {
                        showRuntimePopup(popups[i]);
                    }
                }
            });
        }

        /**
         * @ngdoc method
         * @name processAllPopups
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Process dialogs and process registration fialog separately
         */
        function processAllPopups() {
            var dependPopups = [];
            angular.forEach(runtimePopupCache, function (popup) {
                if (popup.slug !== 'registration-popup' && popup.slug !== 'after_bet') {
                    if ($location.path().replace(/\//g, '') === popup.show_on_page || (popup.show_on_page === 'home' && $location.path() === '/')) {
                        showRuntimePopup(popup);
                    } else {
                        dependPopups.push(popup);
                    }
                }
            });

            if (dependPopups.length) {
                showOnAnotherPage(dependPopups);
            }
        }

        /**
         * @ngdoc method
         * @name calculateAge
         * @methodOf vbet5.controller:globalDialogCtrl
         * @description Recalculate user age and set to userAge
         */
        function calculateAge() {
            if ($rootScope.profile && $rootScope.profile.birth_date) {
                return Moment.get().diff(Moment.get(Moment.moment.utc($rootScope.profile.birth_date)), 'year');
            }
            return false;
        }

        function showPrefConfirmation() {
            if ($rootScope.profile && $rootScope.profile.is_gdpr_passed === false && !$rootScope.env.showSlider) {
                $scope.prefModel = {};
                $scope.prefConfirmation = Config.main.gdpr.options;
                addDialog({
                    type: 'profile',
                    class: 'preference-confirmation-t',
                    template: 'templates/dialogs/preferenceConfirmation.html',
                    info: {},
                    buttons: [
                        {
                            title: 'Confirm',
                            disabled: true,
                            callback: function () {
                                var request = {};
                                angular.forEach($scope.prefModel, function (val, key) {
                                    request[key] = val === 'true';
                                });
                                Zergling.get(request, 'update_client_gdpr_terms').then(function (response) {
                                    console.log(response);
                                });
                            }
                        },
                        {
                            title: 'Remind me later'
                        }

                    ]
                });
            }
        }

        $scope.prefConfirmationValid = function prefConfirmationValid() {
            var enableConfirmation = true;
            angular.forEach($scope.prefConfirmation, function (val, key) {
                if ($scope.prefModel[key] === undefined) {
                    enableConfirmation = false;
                }
            });
            enableConfirmation && disableButtons(false);
        };




        $scope.$on("globalDialogs.addDialog", function (event, dialog) {
            addDialog(dialog);
        });

        $scope.$on("globalDialogs.removeDialogsByTag", function (event, tag) {
            removeDialogByTag(tag);
        });

        $scope.$on('showPopupBySlug', function (event, slug) {
            if (runtimePopupCache) {
                for (var i = 0, length = runtimePopupCache.length; i < length; ++i) {
                    if (runtimePopupCache[i].slug === slug) {
                        showRuntimePopup(runtimePopupCache[i]);
                        break;
                    }
                }
            }
        });


        function callRuntimePopUp() {
            if (Config.main.enableRuntimePopup && $location.path() !== '/popup/') {
                content.getPopups().then(function (data) {
                    if (data && data.data && data.data.popups) {
                        runtimePopupCache = data.data.popups || [];
                        processAllPopups();
                    }
                });
            }
        }

        (function init() {
            $rootScope.geoDataAvailable = $rootScope.geoDataAvailable || Geoip.getGeoData();
            $rootScope.geoDataAvailable.then(
                function (data) {
                    $rootScope.geoCountryInfo = data;
                    console.log("$rootScope.geoCountryInfo", $rootScope.geoCountryInfo);
                },
                function () {
                    $rootScope.geoCountryInfo = false;
                })['finally'](function () {
                showRuntimeMessage();
                callRuntimePopUp();

                $scope.$on('loggedIn', function() {
                    callRuntimePopUp();
                    if (Config.main.gdpr.enabled && Config.main.gdpr.popup) {
                        showPrefConfirmation();
                    }
                });

                /**
                 * @description Show notification based on GEOloacation
                 */
                if (Config.dialog && Config.dialog.runtimePopup) {
                    var dialog = Config.dialog.runtimePopup;
                    if (!dialog.countryAllow && !dialog.unavailableCountries) {
                        addDialog(dialog);
                    } else if ($rootScope.geoCountryInfo) {
                        var country = $rootScope.geoCountryInfo.countryCode;
                        if (dialog.countryAllow) {
                            if (dialog.countryAllow.indexOf(country) === -1) {
                                addDialog(dialog);
                            }
                        } else {
                            if (dialog.unavailableCountries.indexOf(country) !== -1) {
                                addDialog(dialog);
                            }
                        }
                    }
                }
            });
        })();
    }]);
