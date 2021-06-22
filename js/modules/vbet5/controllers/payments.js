/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:paymentsCtrl
 * @description
 *  payments controller
 */
VBET5.controller('paymentsCtrl', ['$scope', '$rootScope', '$sce', '$q', '$window', '$location', '$interval', '$filter', 'Utils', 'Config', 'Zergling', 'Translator', 'AuthData', 'Moment', 'analytics', 'Storage', 'Script', 'Tracking', 'TimeoutWrapper', 'RegConfig', 'CountryCodes', 'ActiveStep', 'PaymentPreCalculation',  function ($scope, $rootScope, $sce, $q, $window, $location, $interval, $filter, Utils, Config, Zergling, Translator, AuthData, Moment, analytics, Storage, Script, Tracking, TimeoutWrapper, RegConfig, CountryCodes, ActiveStep, PaymentPreCalculation) {
    'use strict';
    TimeoutWrapper = TimeoutWrapper($scope);
    var userConfirmedDepositListener = null;
    $scope.authData = AuthData.get();
    $scope.withdrawFormData = {};
    $scope.depositFormData = {};
    $scope.paymentHistory = [];
    $scope.parseNum = function parseNum(num) {
        return parseInt(num, 10);
    };
    $scope.hasPaymentInfo = false;

    $scope.countryCodes = Utils.getAvailableCountries(CountryCodes);
    var currencyRates = {};
    var currentOpenDropdown = null;
    var TIMEOUT_EXCLUDE_TYPE = 6;
   $scope.withdrawLimit = 0;
   var isFirstDeposit = false;
   var depositFailParams = [
        {
            key: 'message',
            value: Translator.get('Deposit failed.')
        }
    ];

   var withDrawDetailsData = null;

    $scope.withdrawStatus = {
        '0': 'New',
        '-1': 'Cancelled',
        '-2': 'Rejected',
        '1': 'Allowed',
        '2': 'Pending',
        '3': 'Paid',
        '4': 'Withdrawal Rollback'
    };

    $scope.cancelButton = {disabled : false };

    $scope.paymentAmount = {
        deposit: '',
        withdraw: '',
        availableWithdrawAmount: 0
    };

    $scope.cartExpiry = {

        month : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        year: []
    };
    $scope.fieldBirthday = {
        day: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15',  '16', '17', '18', '19', '20', '21', '22', '23', '24',  '25', '26', '27', '28', '29', '30', '31'],
        month : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
        year: []
    };
    /**
     * @ngdoc method
     * @name calculateAge
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Recalculate user age and set to userAge
     */
    $scope.calculateAge = function calculateAge() {
        var d1 = new Date($scope.depositFormData.year, $scope.depositFormData.month-1, $scope.depositFormData.day);
        var d2 = new Date();
        d2.setHours(0,0,0);
        var diff = d2.getTime() - d1.getTime();
        $scope.userAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    var profileWatcherPromise, amountWatcher, userConfirmed = false, userConfirmationConfig = {
        name: 'user_confirmation',
        canDeposit: true,
        canWithdraw: true,
        hideDepositAmmount: true,
        hideWithdrawAmount: true,
        hideDepositButton: true,
        hideWithdrawButton: true,
        userConfirmationButton: true,

        withdrawFormFields: [
            {name: 'user_confirmation_password', type: 'password', label: 'Еnter your password'}
        ],
        depositFormFields: [
            {name: 'user_confirmation_password', type: 'password', label: 'Еnter your password'}
        ]

    };

    /**
     * @ngdoc method
     * @name fieldBirthdayYears
     * @methodOf vbet5.controller:paymentsCtrl
     * @description initializes deposit form. Generates years range for select box
     */
    $scope.fieldBirthdayYears = function fieldBirthdayYears() {
        var i, start = 1920;
        var length = new Date().getFullYear() - 18;

        for (i = start; i <= length; i += 1) {
            $scope.fieldBirthday.year.push(i.toString());
        }
    };

    /**
     * @ngdoc method
     * @name cartExpiryYears
     * @methodOf vbet5.controller:paymentsCtrl
     * @description initializes withdraw form. Generates years range for select box
     */
    $scope.cartExpiryYears = function cartExpiryYears() {
        var i, start = new Date().getFullYear();
        var length = start + 10;

        for (i = start; i <= length; i += 1) {
            $scope.cartExpiry.year.push(i.toString());
        }
    };
    /**
     * @ngdoc method
     * @name filterPaymentsByCountryLanguageProduct
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Returns payments filtered by user country if needed
     * @param {Array} input all payment methods
     * @param {String} type the payment type: deposit or withdraw
     * @returns {Array} filtered payment methods
     */
    function filterPaymentsByCountryLanguageProduct(input, type) {
        var countryCode = $rootScope.profile.country_code || $scope.userDetails.country_code || "";
        var product = $rootScope.currentPage.isInSports ? "sport" : "casino";

        return input.filter(function (current) {
            return (
                (!current.countryAllow || current.countryAllow.indexOf(countryCode) !== -1) &&
                (!current.countryRestrict || current.countryRestrict.indexOf(countryCode) === -1) &&
                (!current[type + "DisableByLanguage"] || current[type + "DisableByLanguage"].indexOf(Config.env.lang) === -1) &&
                (!current[type + "Products"] || current[type + "Products"].indexOf(product) !== -1)
            );
        });
    }

    /**
     * @ngdoc method
     * @name getCurrencyRate
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Get currency rate and cache it in scope to avoid second call
     * @param {String} currencyName code
     */
    function getCurrencyRate(currencyName) {

        if (!$rootScope.profile || !$rootScope.profile.currency_name) {
            return;
        }

        if (currencyRates[currencyName] !== undefined || !currencyName) {
            startWatchingWithdrawAmount();
            return;
        }

        Zergling.get({
            'from_currency': $rootScope.profile.currency_name,
            'to_currency': currencyName
        }, 'get_currency_rate').then(function (response) {
            if (response.details) {
                currencyRates[currencyName] = response.details;
            }
        })['finally'](function () {
            startWatchingWithdrawAmount();
        });
    }

    var getUserPromise = null;

    /**
     * @ngdoc method
     * @name generateInfoText
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Generate payment info text and process {currency} token
     * @param {Object} text
     */
    function generateInfoText (text) {
        if (!text || typeof text === 'object') {
            return $sce.trustAsHtml('');
        }
        text = Translator.get(text.toString());
        if (text && text.substring) {
            if (text.substring(0, 13) === 'deposit_info_' || text.substring(0, 14) === 'withdraw_info_') {
                text = '';
            }
        }
        if ($rootScope.profile && $rootScope.profile.currency_name && text && text.split) {
            text = text.split('{currency}').join($filter('currency')($rootScope.profile.currency_name));
        }
        return $sce.trustAsHtml(text);
    }

    /**
     * @ngdoc method
     * @name initPaymentConfig
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Payment config initialization
     * @param {String} type deposit or withdraw
     */
    function initPaymentConfig(type) {
        if (!$scope.userDetails && (Config.main.paymentsGetUserDetails || !($rootScope.profile && $rootScope.profile.country_code))) {
            getUserPromise = getUserPromise || Zergling.get({}, 'get_user');
            getUserPromise.then(function (data) {
                data.sur_name = data.last_name || data.sur_name;
                $scope.userDetails = data;
                initPaymentConfig(type);
            });
            return;
        }
        if (!Config.payments  || Config.payments && !Config.payments.length) {
            return;
        }
        if (Config.main.showAllAvailablePaymentSystems) {
            $scope.paymentConfig = Config.payments;
        } else {
            var filteredPayments = Config.payments;
            if ((!Config.payments[0]['paymentID'] && Config.payments[0][type + 'Currencies'] === undefined) || Config.main.forceApplyAllowedFilter) {
                filteredPayments = $filter('allowedPayments')(filteredPayments, type);
            }
            if (Config.payments[0]['paymentID'] || Config.payments[0][type + 'Currencies'] !== undefined) {
                filteredPayments = $filter('filter')(filteredPayments, function(payment) {
                    return payment[type + 'Currencies'] && (payment[type + 'Currencies'].indexOf($rootScope.profile.currency_name) !== -1 || payment[type + 'Currencies'].indexOf($rootScope.profile.currency_id) !== -1);
                });
            }
            $scope.paymentConfig = filteredPayments;
        }

        $scope.paymentConfig = filterPaymentsByCountryLanguageProduct($scope.paymentConfig, type);
        //payment description text may contain html, mark it as safe to show
        angular.forEach($scope.paymentConfig, function (pSystem) {
            if (pSystem.depositIframe && pSystem.depositIframe.length) {
                pSystem.depositIframe = $sce.trustAsResourceUrl(pSystem.depositIframe);
            }
            if (pSystem.withdrawIframe && pSystem.withdrawIframe.length) {
                pSystem.withdrawIframe = $sce.trustAsResourceUrl(pSystem.withdrawIframe);
            }
            if (pSystem.depositInfoText) {
                pSystem.depositText = generateInfoText(pSystem.depositInfoText[Config.env.lang] || pSystem.depositInfoText['eng'] || pSystem.depositInfoText || '');
            } else if (pSystem.depositInfoTextKey && Translator.translationExists(pSystem.depositInfoTextKey)) {
                pSystem.depositText = generateInfoText(pSystem.depositInfoTextKey);
            } else {
                pSystem.depositText = '';
            }

            if (pSystem.depositConfirmText && pSystem.depositConfirmText[Config.env.lang] && pSystem.depositConfirmText[Config.env.lang].length && typeof pSystem.depositConfirmText[Config.env.lang] === 'string') {
                pSystem.depositConfirmText = $sce.trustAsHtml(pSystem.depositConfirmText[Config.env.lang]);
            } else if (typeof pSystem.depositConfirmText === 'string') {
                console.log(Translator.get(pSystem.depositConfirmText));
                pSystem.depositConfirmText = $sce.trustAsHtml(Translator.get(pSystem.depositConfirmText));
            }

            if (pSystem.withdrawInfoText) {
                pSystem.withdrawText = generateInfoText(pSystem.withdrawInfoText[Config.env.lang] || pSystem.withdrawInfoText['eng'] || pSystem.withdrawInfoText);
            } else if (pSystem.withdrawInfoTextKey && Translator.translationExists(pSystem.withdrawInfoTextKey)) {
                pSystem.withdrawText = generateInfoText(pSystem.withdrawInfoTextKey);
            } else {
                pSystem.withdrawText = '';
            }
            if (pSystem.companyInfoText) {
                pSystem.companyText = generateInfoText(pSystem.companyInfoText[Config.env.lang] || pSystem.companyInfoText);
            }
            if (pSystem.agreeTermsInfoText) {
                pSystem.agreeTermsText = generateInfoText(pSystem.agreeTermsInfoText[Config.env.sliderContent][Config.env.lang] || pSystem.agreeTermsInfoText[Config.env.sliderContent]['default'] || pSystem.agreeTermsInfoText[Config.env.sliderContent]['eng']);
            }
            if (pSystem.stayInSameTabOnDeposit === true || pSystem.stayInSameTabOnDeposit === false) {
                pSystem.stayInSameTabOnDeposit = pSystem.stayInSameTabOnDeposit ? '_self' : '_blank';
            } else if (Config.main.stayInSameTabOnDeposit !== undefined) {
                pSystem.stayInSameTabOnDeposit = Config.main.stayInSameTabOnDeposit ? '_self' : '_blank';
            }else if (!angular.isString(pSystem.stayInSameTabOnDeposit)) {
                pSystem.stayInSameTabOnDeposit = '_self';
            }
        });
    }

    /**
     * @ngdoc method
     * @name getFieldValue
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Get field value by field name
     * @param {Array} fields array
     * @param {String} name the name
     * Returns {String} field value
     */
    function getFieldValue(fields, name) {
        var i;
        for (i = 0;i < fields.length; i++) {
            if (fields[i].name === name) {
                return fields[i].value || '';
            }
        }
        return '';
    }

    /**
     * @ngdoc method
     * @name currencyConvertor
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Convert currency based on backend currency rates if posible
     * @param {Number} amount the input amount
     * @param (Boolean) backwards true if conversion must be done
     * Returns {Number} Converted value false if conversion was not posible
     */
    function currencyConvertor(amount, backwards) {
        if ($scope.selectedPaymentSystem && $scope.selectedPaymentSystem.customCurrency && $rootScope.profile && $rootScope.profile.currency_name) {
            var rates = currencyRates,
                custom = $scope.selectedPaymentSystem.customCurrency,
                currency = $rootScope.profile.currency_name;

            if (rates[custom] && currency !== custom) {
                if (backwards) {
                    return amount / rates[custom];
                } else {
                    return amount * rates[custom];
                }
            }
        }
        return false;
    }

    /**
     * @ngdoc method
     * @name convertCustomCurrency
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Process custom payment currency conversion
     */
    function convertCustomCurrency () {
        if ($scope.selectedPaymentSystem && $scope.selectedPaymentSystem.customCurrency && $rootScope.profile && $rootScope.profile.currency_name) {
            $scope.paymentAmount.availableWithdrawAmount = currencyConvertor($scope.paymentAmount.availableWithdrawAmount);
            if ($scope.paymentAmount.availableWithdrawAmount === false) {
                $scope.paymentAmount.availableWithdrawAmount = Infinity;
            }
        }
        console.log('Fixed custom currency', $scope.paymentAmount.availableWithdrawAmount);
    }

    /**
     * @ngdoc method
     * @name previewCurrencyConversion
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Used in template to preview currency conversion while typing
     * @param {Number} amount the imput amount
     * Returns {Number} Output string translated and formatted
     */
    $scope.previewCurrencyConversion = function previewCurrencyConversion(amount) {
        var converted = currencyConvertor(amount, true);
        if (converted) {
            return $filter('number')(amount, Config.main.balanceFractionSize) + $filter('currency')($scope.selectedPaymentSystem.customCurrency) + ' ≈ ' + $filter('number')(converted, Config.main.balanceFractionSize) + $filter('currency')($rootScope.profile.currency_name);
        }
        return '';
    };

    /**
     * @ngdoc method
     * @name startWatchingWithdrawAmount
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Sets availableWithdrawAmount and restarts watchers if called again.
     */
    function startWatchingWithdrawAmount() {
        if ($scope.paymentsType === 'withdraw') {
            console.log('Refresh withdraw amount');

            if (amountWatcher) {
                console.log('Stop amount watcher');
                amountWatcher();
            }

            if ($rootScope.profile.casino_balance === null || $rootScope.currentPage.isInSports) {
                amountWatcher = $scope.$watch('profile.balance', function () {
                    $scope.paymentAmount.availableWithdrawAmount = $scope.profile.calculatedBalance;
                    convertCustomCurrency();
                });
            } else {
                amountWatcher = $scope.$watch('profile.casino_balance', function () {
                    $scope.paymentAmount.availableWithdrawAmount = $rootScope.profile.casino_balance;
                    convertCustomCurrency();
                });
            }
        }
    }

    /**
     * @ngdoc method
     * @name getPaymentSystemFromUrl
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Select payment system from URL
     */
    function getPaymentSystemFromUrl () {
        var i, system = Number($location.search().system);
        if(typeof $scope.paymentConfig !== 'undefined' && system) {
            $location.search('system', undefined);
            for (i = 0; i < $scope.paymentConfig.length; i++) {
                if ($scope.paymentConfig[i].paymentID === system) {
                    if ($scope.paymentConfig[i]['can' + ($scope.env.sliderContent === 'withdraw' ? 'Withdraw' : 'Deposit')]) {
                        return $scope.paymentConfig[i];
                    }
                }
            }
        }
    }

    /**
     * @ngdoc method
     * @name isProfilePartial
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Checks if profile is completed
     * Returns {Boolean} true or false if profile is not completed yet and prevents deposit and withdrawal
     */
    function isProfilePartial() {
        var i, length;
        if (Config.main.registration.type === 'partial') {
            var leftCol = (RegConfig.step2 && RegConfig.step2.leftCol) || [],
                rightCol = (RegConfig.step2 && RegConfig.step2.rightCol) || [],
                secondStep = leftCol.concat(rightCol);
            length = secondStep.length;
            for (i = 0; i < length; i += 1) {
                var key = secondStep[i].name === 'birth_day' || secondStep[i].name === 'birth_month' || secondStep[i].name === 'birth_year' ? 'birth_date' : secondStep[i].name;
                if (secondStep[i].name && secondStep[i].required && (!$rootScope.profile[key] || $rootScope.profile[key] === '')) {
                    return true;
                }
            }
        } else if (Config.main.personalDetails.requiredFieldsForPayments) {
            length = Config.main.personalDetails.requiredFieldsForPayments.length;
            for (i = 0; i < length; i += 1) {
                if (!$rootScope.profile[Config.main.personalDetails.requiredFieldsForPayments[i]] || $rootScope.profile[Config.main.personalDetails.requiredFieldsForPayments[i]] === '') {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @ngdoc method
     * @name reorderCitiesAndBetshops
     * @methodOf vbet5.controller:paymentsCtrl
     * @param cities {Array} list of cities with betshops
     * @param topBetshops {Array} list of betshops ids that should be brought to top
     * @description reorders cities and betshops so that topBetshops are brought to top
     */
    function reorderCitiesAndBetshops(cities, topBetshops) {
        var i, j, k, m;
        var reorderedBetshops = [];
        var topCities = [];

        //loop through cities
        for (i = cities.length - 1; i >= 0; i--) {
           // for each city loop through betshops and find top betshops
            for (j = 0; j < topBetshops.length; j++) {
                for (k = 0; k < cities[i].betshops.length; k++) {
                    if (cities[i].betshops[k].id === topBetshops[j].id) {
                        cities[i].betshops[k].type = topBetshops[j].type || "";
                        reorderedBetshops.push(cities[i].betshops[k]);
                        cities[i].betshops.splice(k, 1);
                        break;
                    }
                }
            }
            if (reorderedBetshops.length) {
                cities[i].betshops = reorderedBetshops.concat(cities[i].betshops);
                topCities.push(cities[i]);
                cities.splice(i, 1);
                reorderedBetshops = [];
            }
        }
        for (m = 0; m < topCities.length; m++) {
            cities.splice(0, 0, topCities[m]);
        }
    }

    /**
     * @ngdoc method
     * @name loadBetShops
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  loads bet shops from swarm
     */
    $scope.loadBetShops = function loadBetShops() {
        Zergling.get({}, 'get_bet_shops').then(function (data) {
            $scope.selectedPaymentSystem.betShops = data.result;

            var cities = $scope.selectedPaymentSystem.betShops.cities;
            cities.sort(function (a, b) {
                return (a.name || '').trim().localeCompare((b.name || '').trim());
            });
            if (cities && cities.length) {
                var k;
                for (k = 0; k < cities.length; k++) {
                    if(cities[k].betshops && cities[k].betshops.length) {
                        if (cities[k].betshops[0].hasOwnProperty('order')) {
                            cities[k].betshops.sort(Utils.orderSorting);
                        } else {
                            cities[k].betshops.sort(function (a, b) {
                                return (a.address || '').trim().localeCompare((b.address || '').trim());
                            });
                        }
                    }
                }
            }

            // make default selection
            if (cities &&
                cities.length &&
                cities[0].betshops &&
                cities[0].betshops.length &&
                $scope.selectedPaymentSystem.topBetshops
            ) {

                reorderCitiesAndBetshops(cities, $scope.selectedPaymentSystem.topBetshops);


                if (cities.length === 1 && cities[0].betshops.length === 1 && cities[0].betshops[0].address == '') {
                    $scope.withdrawFormData.office_id  = cities[0].betshops[0].id;
                } else if ($scope.selectedPaymentSystem.defaultBetShop) {
                    concludes:
                    for (var i = 0, citiesLength = cities.length; i < citiesLength; i += 1) {
                        for (var j = 0, betshopsLength = cities[i].betshops.length; j < betshopsLength; j += 1) {
                            if (cities[i].betshops[j].id === $scope.selectedPaymentSystem.defaultBetShop) {
                                $scope.withdrawFormData.office_id  = cities[i].betshops[j].id;
                                break concludes;
                            }
                        }
                    }
                }
            }
        });
    };

    /**
     * @ngdoc method
     * @name closePopup
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Close payments slider
     */
    $scope.closePopup = function closePopup() {
        $scope.popupInfo = null;
        if ($scope.closeSliderOnPopupClose) {
            $scope.closeSliderOnPopupClose = false;
            $scope.$emit('slider.close');
        }
    };

    var knownErrors = {
        '-20099': Translator.get('Unknown error'),
        '-20001': Translator.get('Unsupported service'),
        '-20002': Translator.get('Currency unsupported'),
        '-20003': Translator.get('Amount is less than minimum allowed'),
        '-20004': Translator.get('Amount is greater than maximum allowed'),
        '-20005': Translator.get('Entered payee information is not correct.'),
        '-20006': Translator.get('Entered payer information is not correct.'),
        '-20007': Translator.get('Internal service fault'),
        '-20008': Translator.get('Withdraw request blocked.'),
        '21': Translator.get('User link blocked, please contact support.'),
        '22': Translator.get('Day limit reached. Please try later.'),
        '-2403': Translator.get('Withdraw request is already in progress'),
        '-1131': Translator.get("You have an Active Bonus therefore it's not possible to make a Withdrawal"),
        '-2538': Translator.get("WithdrawalNotAllowedUnplayedAmount"),
        '-2043': Translator.get("Withdraw amount is less than minimum allowed")
    };

    /**
     * @ngdoc method
     * @name getLinkedInfo
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  loads poker info from swarm
     */
    $scope.getLinkedInfo = function getLinkedInfo() {

        $scope.selectedPaymentSystem.linkedInfo = {firstTime: false};
        $scope.selectedPaymentSystem.linkedInfoLoaded = false;
        var message = null;
        Zergling.get({service: $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name}, 'get_linked_user').then(function (data) {
            $scope.selectedPaymentSystem.linkedInfoLoaded = true;
            $scope.selectedPaymentSystem.linkedInfo = data;
            console.log('linked Info:', data);
        })['catch'](
            function (reason) {
                console.log('Error:', reason);
                if (reason.code !== undefined && knownErrors[reason.code] !== undefined) {
                    message = knownErrors[reason.code];
                } else {
                    message = Translator.get("Please try later or contact support.");
                }
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: message
                });
            }
        );
    };
    /**
     * @ngdoc method
     * @name currentLocationWithParam
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  returns current page location with additional parameter(if specified)
     * @param {Array} [params] parameter names
     * @returns {String} location
     */
    function currentLocationWithParam(params) {
        var location = $location.absUrl().replace(/([^:]\/)\/+/g, "$1"); // remove double slashes if exist
        if (!params.length) {
            return location;
        }
        var prefix =  location.substr(location.length - 1) === '/' ? '?' : '&';

        location += prefix + params[0].key + "=" + encodeURIComponent(params[0].value);
        var length = params.length;
        if (length > 1) {
            for (var i = 1; i < length; i++) {
                location += "&" + params[i].key + "=" + encodeURIComponent(params[i].value);
            }
        }

        return location;
    }

    /**
     * @ngdoc method
     * @name depositConfirmationAsDialog
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Displays deposit or withdraw amount transfer confirmatiuon dialog
     */
    function depositConfirmationAsDialog(action) {
        var content = Translator.get('Please confirm money transfer');
        if ($scope.paymentAmount || $scope.paymentAmount[action]) {
            content += ': ' + ($scope.paymentAmount[action]) + ' ' + ($scope.selectedPaymentSystem.customCurrency || $rootScope.profile.currency_name);
        }
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: 'info',
            title: 'Confirm',
            yesno: true,
            content: content,
            hideCloseButton: true,
            yesButton: 'withdraw.userConfirmedDeposit'
        });
        userConfirmedDepositListener && userConfirmedDepositListener();
        userConfirmedDepositListener = $scope.$on('withdraw.userConfirmedDeposit', function () {
            $window.document.getElementById("custum-payment-fields").submit();
            userConfirmedDepositListener();
        });
    }
    /**
     * @ngdoc method
     * @name submitCustomPaymentFieldsForm
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Submit Custom Payment Fields Form
     */
    function submitCustomPaymentFieldsForm() {
        var interval = setInterval(function () {
            if($window.document.getElementById("custum-payment-fields")){
                $window.document.getElementById("custum-payment-fields").submit();
                clearInterval(interval);
            }
        },200);
    }

    /**
     * @ngdoc method
     * @name drawPaymentFormResponse
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  selects payment system
     *
     * @param {Object} paymentSystem payment system
     * @param {String} type payment type: withdraw or deposit
     * @param {Boolean} isAmountFieldAvailable if true, then the amount field is available
     *
     */
    function drawPaymentFormResponse(paymentSystem, type, isAmountFieldAvailable) {
        var fields = [];
        var r, item, itemKey;

        if ($scope.selectedPaymentSystem) {
            for (itemKey in $scope.selectedPaymentSystem) {
                if ($scope.selectedPaymentSystem[itemKey] !== undefined && !paymentSystem[itemKey]) {
                    paymentSystem[itemKey] = $scope.selectedPaymentSystem[itemKey];
                }
            }
        }

        for (r = 0; r < paymentSystem.fields.length; r++) {
            item = paymentSystem.fields[r];

            if (item.value) {
                for (itemKey in item.value) {
                    if (item.value[itemKey]) {
                        item[itemKey] = item.value[itemKey];
                    }
                }
            }

            fields.push(item);
        }

        if (type === 'deposit') {
            paymentSystem.depositFormFields = fields;
        }

        if (type === 'withdraw') {
            paymentSystem.withdrawFormFields = fields;
        }

        if (!isAmountFieldAvailable) {
            paymentSystem.hideDepositAmmount = true;
            $scope.hideWithdrawAmount = true;

            paymentSystem.depositButtonCaption = 'Next';
            paymentSystem.withdrawButtonCaption = 'Next';
        }
        $scope.selectedPaymentSystem = paymentSystem;
        $scope.preparePaymentForm(paymentSystem);
    }

    /**
     * @ngdoc method
     * @name doDepositRequest
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Do deposit command to Zergling, getting the response and iterate with $scope
     * @param {Object} request request object
     * @param {String} message message
     * @returns {String} location
     */
    function doDepositRequest(request, message) {
         Zergling.get(request, 'deposit').then(
            function (data) {
                if (data && data.result === 0 && (!data.details || !data.details.error || data.details.error === 0)) {
                    //on success
                    if (data.details.method && (data.details.method.toLowerCase() === 'post' || data.details.method.toLowerCase() === 'get')) {
                        $scope.externalFormParams = data.details;
                        if (Config.main.enableMixedView) {
                            if($scope.selectedPaymentSystem.disableConfirmPopUp){
                                submitCustomPaymentFieldsForm();
                            }else{
                                depositConfirmationAsDialog('deposit');
                            }
                        } else {
                            $scope.showConfirmation = true;
                            $scope.depositExternalForm = true;
                        }
                    } else if (data.details.method && data.details.method.toLowerCase() === 'form') {
                        $scope.showGetStatusForm = true;
                        $scope.depositStatus = 'pending';
                        $scope.depositInProgress = true;
                        $scope.externalFormParams = data.details;
                    } else if (data.details.method && data.details.method.toLowerCase() === 'formdraw') {
                        drawPaymentFormResponse(data.details, 'deposit', false);
                    } else if (data.details.method && data.details.method.toLowerCase() === 'popup') {
                        $scope.iframeUrl = data.details.action;
                        $scope.selectPaymentSystem($scope.selectedPaymentSystem, 'mixedIframe');
                    } else if (data.details.method && data.details.method.toLowerCase() === 'confirmation') {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'info',
                            title: 'Info',
                            yesno: true,
                            yesButton: ['deposit.yes', {request: request, message: message}],
                            content: Translator.get($scope.selectedPaymentSystem.depositConfirmationText || 'Tax deduction: {1} Do you want to continue?', [getFieldValue(data.details.fields, 'fee') + ' ' + getFieldValue(data.details.fields, 'currency')])
                        });
                    } else if (data.details.method && data.details.method.toLowerCase() === 'iframe') {
                        $rootScope.$broadcast('slider.openCustomContent', {url: data.details.action});
                    } else {  //payment is done already
                        $scope.paymentIsDone = true;
                        $scope.paymentStatusMessage = data.details.message;

                        analytics.gaSend('send', 'event', 'slider', 'deposit',  {'page': $location.path(), 'eventLabel': 'Success -' + request.service, 'tr': request.amount + ' ' + $rootScope.profile.currency_name});
                        Tracking.event('deposit_completed', {'currency': $rootScope.profile.currency_name, 'amount': request.amount, 'translation_id': $scope.profile.unique_id}, true);

                        $rootScope.$broadcast('payment.success',{type: 'deposit', 'payment_system': $scope.selectedPaymentSystem.name,'payment_amount': request.amount , 'payment_currency': $rootScope.profile.currency_name, 'isFirstDeposit': isFirstDeposit}); //todo  SDC-37579
                        isFirstDeposit = false;
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'success',
                            title: 'Success',
                            content: data.details.message ? data.details.message : 'Deposit was successful.'
                        });

                        $scope.confirmDeposit();
                    }
                } else if (data && data.result !== undefined && knownErrors[data.result.toString()] !== undefined) {
                    message += knownErrors[data.result.toString()];
                    //$scope.popupInfo = message;
                    //$scope.messageType = 'error';
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: message
                    });
                    analytics.gaSend('send', 'event', 'slider', 'deposit',  {'page': $location.path(), 'eventLabel': 'Error -' + request.service + ' ' + message});
                } else if (data.details && (data.details.error_code || data.details.error)) {
                    message += (Translator.get(data.details.message) || '') + ' ' + Translator.get(data.details.error, null, null, data.details.error_code);
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: message
                    });
                    //$scope.popupInfo = message;
                    //$scope.messageType = 'error';
                    analytics.gaSend('send', 'event', 'slider', 'deposit',  {'page': $location.path(), 'eventLabel': 'Error -' + request.service + ' ' + message});
                } else {
                    message += Translator.get("Unknown error");
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'error',
                        title: 'Error',
                        content: message
                    });
                    //$scope.popupInfo = message;
                    //$scope.messageType = 'error';
                    analytics.gaSend('send', 'event', 'slider', 'deposit',  {'page': $location.path(), 'eventLabel': 'Error -' + request.service + ' ' + message});
                }
            },
            function (data) {
                console.warn('deposit error', data);
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: message
                });

                analytics.gaSend('send', 'event', 'slider', 'deposit',  {'page': $location.path(), 'eventLabel': 'Error -' + request.service + ' ' + message});
            }
        )['finally'](function () {
            $scope.busy = false;
        });
    }

    function doWithdrawRequest(request) {
        $scope.busy = true;

        Zergling.get(request, 'withdraw').then(function (data) {
            if (data) {
                var message = Translator.get("There was an error processing your request.");

                if (data.details && data.details.method && (data.details.method.toLowerCase() === 'post' || data.details.method.toLowerCase() === 'get')) {
                    $scope.externalFormParams = data.details;
                    $scope.messageType = undefined;

                    if (Config.main.enableMixedView) {
                        if($scope.selectedPaymentSystem.disableConfirmPopUp) {
                            submitCustomPaymentFieldsForm();
                        }else{
                            depositConfirmationAsDialog('withdraw');
                        }
                    } else {
                        $scope.showConfirmation = true;
                        $scope.withdrawExternalForm = true;
                    }

                } else if (data.details && data.details.method && data.details.method.toLowerCase() === 'formdraw') {
                    drawPaymentFormResponse(data.details, 'withdraw', false);
                    return;
                } else if (data.details && data.details.method && data.details.method.toLowerCase() === 'confirmation') {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        title: 'Info',
                        yesno: true,
                        yesButton: ['withdraw.yes', {request: request, message: message}],
                        content: Translator.get($scope.selectedPaymentSystem.withdrawConfirmationText || 'Tax deduction: {1} Do you want to continue?', [getFieldValue(data.details.fields, 'fee') + ' ' + getFieldValue(data.details.fields, 'currency')])
                    });
                    return;
                } else if (data.details && data.details.method && data.details.method.toLowerCase() === 'iframe') {
                    $rootScope.$broadcast('slider.openCustomContent', {url: data.details.action});
                    return;
                }
                else if (data.result === 0) {
                    message = Translator.get((data.details && data.details.status_message) || 'Withdrawal was successful');
                    $scope.messageType = 'success';
                } else if (data.details &&  {"InvalidVerificationCode":1, "CodeExpired":1}[data.details.error_code]) {
                    Utils.getSMSCode(13, $rootScope.profile.username, request.payee.confirmation_code, data.details.error_code).then(function(code) {
                        request.payee.confirmation_code = code;
                        doWithdrawRequest(request);
                    });
                    return;

                }else if (data.details && (data.details.error_code || data.details.error)) {
                    message = Translator.get(data.details.error, null, null, data.details.error_code);
                    $scope.messageType = 'error';
                } else if (knownErrors[data.result.toString()] !== undefined) {
                    message = "\n" + knownErrors[data.result.toString()];
                    $scope.messageType = 'error';
                }  else {
                    message += Translator.get("Please try later or contact support.");
                    $scope.messageType = 'error';
                }

                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'error' === $scope.messageType ? 'Information' : 'Success',
                    content: message
                });

                analytics.gaSend('send', 'event', 'slider', 'withdraw',  {'page': $location.path(), 'eventLabel': $scope.messageType === 'error' ? 'Information' : 'Success'+' -' + request.service, 'tr': request.amount + ' ' + $rootScope.profile.currency_name});
                if ($scope.messageType !== 'error'){
                    $rootScope.$broadcast('payment.success',{'type': 'withdraw', 'payment_system': $scope.selectedPaymentSystem.name,'payment_amount': request.amount , 'payment_currency': $rootScope.profile.currency_name}); //todo  SDC-37579
                }
            }
        }, function (failResponse) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title:  'Error',
                content: Translator.get("Error") + '<br/>' + Translator.get(failResponse.msg) + "<br/>" + Translator.get(failResponse.data)
            });
        })['finally'](function () {
            $scope.busy = false;
        });
    }

    /**
     * @ngdoc method
     * @name withdraw
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  sends withdraw request to swarm
     */
    $scope.withdraw = function withdraw(paymentFormData, withdrawAmount) {
        $scope.paymentAmount.withdraw = withdrawAmount || $scope.paymentAmount.withdraw;
        $rootScope.$broadcast("paymentButton.clicked", "withdraw");

        if (!Utils.isObjectEmpty(paymentFormData)) {
            $scope.withdrawFormData = paymentFormData || $scope.withdrawFormData;
        }

        var forProduct = $rootScope.currentPage.isInSports ? "sport" : "casino";

        var request = {
            amount: null,
            service: $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name,
            payee: {
                forProduct: forProduct
            }
        };

        if ($scope.selectedPaymentSystem.withdrawPrefilledAmount !== undefined) {
            request.amount = $scope.selectedPaymentSystem.withdrawPrefilledAmount;
        } else if ($scope.paymentAmount.withdraw !== null) {
            request.amount = parseFloat($scope.paymentAmount.withdraw);
            var customAmount = currencyConvertor(request.amount, true);
            customAmount && (request.payee.custom_amount = customAmount);
        }

        if ($scope.selectedPaymentSystem.hasBetShops || $scope.selectedPaymentSystem.isTransferToLinkedService || ($scope.withdrawFormData && $scope.withdrawFormData.hasOwnProperty('confirmed')) || ($scope.selectedPaymentSystem.withdrawFormFields && $scope.selectedPaymentSystem.withdrawFormFields.length)) {
            angular.forEach($scope.selectedPaymentSystem.withdrawFormFields, function (field) {
                if ($scope.withdrawFormData[field.name] === undefined || field.dontSend) {
                    $scope.withdrawFormData[field.name] = null;
                }
            });
            Utils.MergeRecursive(request.payee, $scope.withdrawFormData);
        }
        request.payee.office_id = request.payee.office_id && parseInt(request.payee.office_id, 10);
        delete $scope.withdrawFormData.confirmed;

        if ($rootScope.partnerConfig.smsVerification.withdrawal) {
            Utils.getSMSCode(13, $rootScope.profile.username).then(function(code) {
                request.payee.confirmation_code = code;
                doWithdrawRequest(request);
            });
        } else {
            doWithdrawRequest(request);
        }

    };

    /**
     * @ngdoc method
     * @name selectPaymentSystem
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  selects payment system
     *
     * @param {Object} paymentSystem payment system
     * @param {String} customTemplate payment's custom template
     * @param {boolean} forceSelect force select payment
     */
    $scope.selectPaymentSystem = function selectPaymentSystem(paymentSystem, customTemplate, forceSelect) {
        if ($scope.gettingFieldsInProgress && !forceSelect) {
            return;
        }

        if (paymentSystem && paymentSystem[$rootScope.env.sliderContent + 'Iframe']) {
            customTemplate = 'mixedIframe';
            $scope.iframeUrl = paymentSystem[$rootScope.env.sliderContent + 'Iframe'].toString();
        }

        if (customTemplate) {
            $scope.selectedPaymentSystem = {
                name: (paymentSystem && paymentSystem.name) || customTemplate,
                showPromotions: Config.main.buddyTransfer.version === 1,
                customDepositTemplate: 'templates/livebox/' + customTemplate + '.html',
                customWithdrawTemplate: 'templates/livebox/' + customTemplate + '.html'
            };
            checkAndSetWithdrawOptions();

            return;
        }

        if (!userConfirmed && paymentSystem.requireUserConfirmation) {
            userConfirmationConfig.paymentSystemCache = paymentSystem;

            if (paymentSystem.depositInfoText) {
                userConfirmationConfig.depositText = generateInfoText(paymentSystem.depositInfoText[Config.env.lang] || paymentSystem.depositInfoText['eng'] || paymentSystem.depositInfoText);
            }

            if (paymentSystem.withdrawInfoText) {
                userConfirmationConfig.withdrawText = generateInfoText(paymentSystem.withdrawInfoText[Config.env.lang] || paymentSystem.withdrawInfoText['eng'] || paymentSystem.withdrawInfoText);
            }

            paymentSystem = userConfirmationConfig;
        }

        if ($rootScope.profile && $rootScope.profile.currency_name) {
            var buttonsDefaultValues = Config.buttonsDefaultValues && Config.buttonsDefaultValues[$rootScope.profile.currency_name] || {};
            $scope.withdrawCustomAmounts = (paymentSystem.info && paymentSystem.info[$rootScope.profile.currency_name] && paymentSystem.info[$rootScope.profile.currency_name].default && paymentSystem.info[$rootScope.profile.currency_name].default.withdraw) || paymentSystem.withdrawCustomAmounts || buttonsDefaultValues.withdraw || null;
            $scope.depositCustomAmounts = (paymentSystem.info && paymentSystem.info[$rootScope.profile.currency_name] && paymentSystem.info[$rootScope.profile.currency_name].default && paymentSystem.info[$rootScope.profile.currency_name].default.deposit) || paymentSystem.depositCustomAmounts || buttonsDefaultValues.deposit || null;
        }

        $scope.selectedPaymentSystem = paymentSystem;
        checkAndSetWithdrawOptions();

        if ($scope.selectedPaymentSystem.twoStepWithdraw && $scope.env.sliderContent === 'withdraw') {
            Zergling
                .get({'service': $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name}, 'get_withdraw_status')
                .then(function (response) {
                    console.log('withdraw status  response', response);
                    if (response.withdraw_id) {
                        $scope.selectedPaymentSystem.withdrawFormFields = $scope.selectedPaymentSystem.withdraw2FormFields;
                        $scope.paymentAmount.withdraw = null;
                        $scope.hideWithdrawAmount = true;
                        $scope.closeSliderOnPopupClose = true;
                    }

                    $scope.withdrawReady = true;

                });
        } else {
            $scope.closeSliderOnPopupClose = !!$scope.selectedPaymentSystem.twoStepWithdraw;
            $scope.withdrawReady = true;
            $scope.hideWithdrawAmount = false;
        }

        $scope.preparePaymentForm(paymentSystem);
        getCurrencyRate($scope.selectedPaymentSystem.customCurrency);
        $scope.dropdownOpened = {};
        if (paymentSystem.isSavable) {
            $scope.gettingFieldsInProgress = true;

            var payerKey = $scope.paymentsType === 'withdraw' ? 'payee' : 'payer';

            var request = {
                service: $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name,
                amount: 10
            };
            request[payerKey] = {
                getWallets: 1,
                forProduct: $rootScope.currentPage.isInSports ? "sport" : "casino"
            };
            var paymentsType = $scope.paymentsType;
            Zergling.get(request, $scope.paymentsType).then(function(response) {
                if (paymentsType !== $scope.paymentsType) {
                    return;
                }
                if (response.details && response.details.method && response.details.method.toLowerCase() === 'formdraw') {
                    drawPaymentFormResponse(response.details, $scope.paymentsType, true);
                }
            })['finally'](function() {
                $scope.gettingFieldsInProgress = false;
            });
        }

    };

    /**
     * @ngdoc method
     * @name preparePaymentForm
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  selects payment system
     *
     * @param {Object} paymentSystem payment system
     */
    $scope.preparePaymentForm = function preparePaymentForm(paymentSystem) {
        $scope.withdrawFormData = {};
        $scope.depositFormData = {};
        $scope.paymentFormData = {};

            // pre-fill deposit fields from profile if needed
        var i, field, length = paymentSystem.depositFormFields && paymentSystem.depositFormFields.length - 1;

        if (length >= 0) {
            for (i = length; i >= 0; i -= 1) {
                field = paymentSystem.depositFormFields[i];

                if (!field.type) {
                    field.type = 'text';
                }

                if (field.setValue) {
                    $scope.depositFormData[field.name] = field.setValue;
                    $scope.paymentFormData[field.name] = field.setValue;
                }

                if(field.type === 'html') {
                    field.html = $sce.trustAsHtml(field.value);
                }

                if($scope.paymentsType === 'deposit' && field.type === 'select' && $scope.depositFormData[field.name] === undefined){
                    $scope.depositFormData[field.name] = field.options[0].value;
                    $scope.paymentFormData[field.name] = field.options[0].value;
                    field.selectedText = field.options[0].text;
                }

                if (field.prefillFromProfile) {
                    if ($rootScope.profile[field.prefillFromProfile]) {
                        $scope.depositFormData[field.name] = $rootScope.profile[field.prefillFromProfile];
                        $scope.paymentFormData[field.name] = $rootScope.profile[field.prefillFromProfile];
                    } else if (field.disabled) {
                        paymentSystem.depositFormFields.splice(i, 1);
                    }
                }
            }
        }

        // pre-fill withdraw fields from profile if needed
        length = paymentSystem.withdrawFormFields && paymentSystem.withdrawFormFields.length - 1;

        if (length >= 0) {
            for (i = length; i >= 0; i -= 1) {
                field = paymentSystem.withdrawFormFields[i];

                if (!field.type) {
                    field.type = 'text';
                }

                if (field.setValue) {
                    $scope.withdrawFormData[field.name] = field.setValue;
                    $scope.paymentFormData[field.name] = field.setValue;
                }

                if(field.type === 'html') {
                    field.html = $sce.trustAsHtml(field.value);
                }

                if($scope.paymentsType === 'withdraw' && field.type === 'select' && $scope.withdrawFormData[field.name] === undefined){
                    $scope.withdrawFormData[field.name] = field.options[0].value;
                    $scope.paymentFormData[field.name] = field.options[0].value;
                }

                if (field.prefillFromProfile) {
                    if ($rootScope.profile[field.prefillFromProfile]) {
                        $scope.withdrawFormData[field.name] = $rootScope.profile[field.prefillFromProfile];
                        $scope.paymentFormData[field.name] = $rootScope.profile[field.prefillFromProfile];
                    } else if (field.disabled) {
                        paymentSystem.withdrawFormFields.splice(i, 1);
                    }
                }
            }
        }

        //external scripts part
        var scriptKey = $scope.env.sliderContent + 'PageScripts';
        if (paymentSystem[scriptKey] && paymentSystem[scriptKey].length) {
            TimeoutWrapper(function() {
                angular.forEach(paymentSystem[scriptKey], function (url) { Script(url + '?' + Date.now());});
            });
        }

        $scope.showConfirmation = false;
        $scope.showGetStatusForm = false;
        $scope.depositInProgress = false;
        $scope.paymentIsDone = false;
    };

    /**
     * @ngdoc method
     * @name checkClientForDeposit
     * @methodOf vbet5.controller:paymentsCtrl
     * @description ckecked client for deposit
     * @returns {Object} promise
     */
    function checkClientForDeposit() {
        var checked = $q.defer();
        var result = checked.promise;
        if (!Config.main.enableCheckingClientForDeposit) {
            checked.resolve(null);
        } else {
            Zergling
                .get({}, 'check_client_for_deposit')
                .then(function (data) {
                    if (data && data.details) {
                        checked.resolve(data.details);
                    } else {
                        checked.resolve(null);
                    }
                })['catch'](function() {
                checked.resolve(null);
            });
        }

        return result;
    }


    function depositIni(paymentFormData, depositAmount) {
        checkClientForDeposit().then(function (response) {
            if (response) {
                var activeStep = ActiveStep.getActiveStep('deposit', response.StepId, response.State);
                if (activeStep) {
                    $rootScope.$broadcast('globalDialogs.addDialog', activeStep.dialog);
                    return false;
                }
            }

            if (!Utils.isObjectEmpty(paymentFormData)){
                $scope.depositFormData = paymentFormData || $scope.depositFormData;
            }
            $scope.paymentAmount.deposit = depositAmount || $scope.paymentAmount.deposit;
            $scope.busy = true;
            var successParams = [
                {
                    key: 'message',
                    value: Translator.get('Deposit was successful.')
                },
                {
                    key: 'amount',
                    value: depositAmount
                },
                {
                    key: 'currency',
                    value: $rootScope.profile.currency
                }
            ];


            var forProduct = $rootScope.currentPage.isInSports ? "sport" : "casino";
            var request = {
                amount: parseFloat($scope.depositFormData.amount ||  $scope.selectedPaymentSystem.depositPrefilledAmount || $scope.paymentAmount.deposit),
                service: $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name,
                payer: {
                    status_urls: {
                        success:(Config.main.redirectAfterDeposit ? Config.main.redirectAfterDeposit : currentLocationWithParam(successParams)),
                        cancel: currentLocationWithParam([]),
                        fail: currentLocationWithParam(depositFailParams)
                    },
                    forProduct: forProduct
                }
            };

            $scope.busy = true;

            if (($scope.selectedPaymentSystem.depositFormFields && $scope.selectedPaymentSystem.depositFormFields.length) || ($scope.depositFormData && $scope.depositFormData.hasOwnProperty('confirmed'))) {
                angular.forEach($scope.selectedPaymentSystem.depositFormFields, function (field) {
                    if ($scope.depositFormData[field.name] === undefined || field.dontSend) {
                        $scope.depositFormData[field.name] = null;
                    }
                });
                Utils.MergeRecursive(request.payer, $scope.depositFormData);
            }
            if ($scope.selectedPaymentSystem.predefinedFields) {
                Utils.MergeRecursive(request.payer, $scope.selectedPaymentSystem.predefinedFields);
            }
            var message = Translator.get("There was an error processing your request.");
            $scope.messageType = 'error';

            /* Server To Server Passing Track Id */
            if (Storage.get('trackId') && Config.serverToServerTracking) {
                request.payer.track_id = Storage.get('trackId');
                Storage.set('trackId', '');
            }

            delete $scope.depositFormData.confirmed;

            doDepositRequest(request, message);
        });
    }

    /**
     * @ngdoc method
     * @name deposit
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  sends deposit request to swarm, gets result, displays "external" form
     */
    $scope.deposit = function deposit(paymentFormData, depositAmount) {
        $rootScope.$broadcast("paymentButton.clicked", "deposit");
        if ($rootScope.profile.exclude_type === TIMEOUT_EXCLUDE_TYPE) {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: 'warning',
                title: 'Warning',
                content: "You can't make a deposit as the timeout option is enabled."
            });
            return;
        }
        if (Config.main.promotionalBonuses.enable && Config.main.promotionalBonuses.showClaimableInfoBeforeDeposit) {
            $scope.busy = true;
            Zergling.get({}, "get_client_claimable_deposit_bonuses")
                .then(function(response) {
                    $scope.busy = false;
                    if(response.details && response.details.length) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "info",
                            title: "Info",
                            content: 'Are you sure to continue without deposit bonus?',
                            buttons: [
                                {
                                    title: 'Yes', callback: function () {
                                        depositIni(paymentFormData, depositAmount);
                                    }
                                },
                                {title: 'Claim bonus', callback: function () {
                                        $rootScope.env.sliderContent = 'promotionalBonuses';
                                    }}
                            ]
                        });
                    } else {
                        depositIni(paymentFormData, depositAmount);
                    }
                });
        } else {
            depositIni(paymentFormData, depositAmount);
        }


    };

    /**
     * @ngdoc method
     * @name confirmDeposit
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  called when "Confirm" button is clicked on deposit page. Just closes the slider.
     * @param {Function} formSubmitFunc a callback function provided by externalForm directive, will call this to submit the form
     */
    $scope.confirmDeposit = function confirmDeposit(formSubmitFunc) {
        if (angular.isFunction(formSubmitFunc)) {
            formSubmitFunc();
        }
        TimeoutWrapper(function () { //required for Firefox, otherwise form will not be submitted
            $scope.showConfirmation = false;
            $scope.paymentIsDone = false;
            $rootScope.env.sliderContent = '';
            $rootScope.env.showSlider = false;
        }, 1);
    };

    /**
     * @ngdoc method
     * @name getDepositStatus
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  called when " " button is clicked on deposit page. Just closes the slider.
     */
    $scope.getDepositStatus = function getDepositStatus() {
        $scope.getDepositStatusInProgress = true;
        var transId = Utils.getArrayObjectElementHavingFieldValue($scope.externalFormParams.fields, 'name', 'transaction_id').value;
        Zergling.get({service: $scope.selectedPaymentSystem.paymentID || $scope.selectedPaymentSystem.name, "transaction_id": transId}, 'get_deposit_status').then(function (data) {
            $scope.depositStatus = data.status;
            $scope.depositedAmount = data.amount;
        })['finally'](function (response) {
            console.log('get_deposit_status response', response);
            $scope.getDepositStatusInProgress = false;
        });
    };

    //---------------------------  Renew  ------------------------------------------

    /**
     * @ngdoc method
     * @name renewInit
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Payments renew initialization
     */
    var renewClockPromise;
    $scope.renewInit = function renewInit() {
        function clock() {
            if (!$rootScope.profile) {
                return;
            }
            $scope.timer = Moment.get().unix() < $rootScope.profile.credit_renew_time ? Moment.get().preciseDiff($rootScope.profile.credit_renew_time * 1000) : null;
        }
        if (Config.main.enableFreeRenew) {
            clock();
            renewClockPromise = $interval(clock, 1000);
        }
    };

    /**
     * @ngdoc method
     * @name renew
     * @methodOf vbet5.controller:paymentsCtrl
     * @description Payments do the renew
     */
    $scope.renew = function renew() {
        $scope.renewInProgress = true;
        $scope.renewDone = $scope.renewFailed = false;//reset state
        Zergling.get({}, 'renew_user_credits').then(function (response) {
            console.log('renew_user_credits repsponse', response);
            if (response.result === 0) {
                $rootScope.profile.credit_renew_time =  response.details.next_re_new_time;  //@TODO:
                $scope.renewDone = true;
            } else {
                $scope.renewFailed = true;
            }
        })['finally'](function () {
            $scope.renewInProgress = false;
        });
    };

    $scope.$on('deposit.yes', function (event, data) {
        $scope.depositFormData.confirmed = true;
        doDepositRequest(data.request, data.message);
    });

    $scope.$on('withdraw.yes', function (event, data) {
        $scope.withdrawFormData.confirmed = true;
        $scope.withdraw();
    });
    //--------------------------- ! Renew  ------------------------------------------

    /**
     * @ngdoc method
     * @name buyVC
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Buy virtual credit throught paypal
     * @param {Object}  point contains the price and amount of selected point
     */
    $scope.buyVC = function (point) {
        $scope.selectedPoint = point;

        var credit = parseFloat(point.vc),
        successParams = [
            {
                key: 'message',
                value: Translator.get('Deposit was successful.')
            },
            {
                key: 'amount',
                value: credit
            },
            {
                key: 'currency',
                value: $rootScope.profile.currency
            }
        ],request = {
                amount: credit,
                service: 'paypal',
                payer: {
                    status_urls: {
                        success: currentLocationWithParam(successParams),
                        cancel: currentLocationWithParam([]),
                        fail: currentLocationWithParam(depositFailParams)
                    }
                }
            },

            message = Translator.get("There was an error processing your request.");

        $scope.messageType = 'error';
        doDepositRequest(request, message);
    };

    /**
     * @ngdoc method
     * @name openVerifyAccountPage
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Opens settings slider tab "verify account" page by sending broadcast message to mainheader controller
     */
    $scope.openVerifyAccountPage = function openVerifyAccountPage() {
        $location.search('settingspage', 'verifyaccount');
        $rootScope.$broadcast('toggleSliderTab', 'settings');
    };

 	/**
	 * @ngdoc method
	 * @name loadWithdrawStatus
	 * @methodOf vbet5.controller:paymentsCtrl
	 * @description  Loads withdraw statuses
	 */
	$scope.loadWithdrawStatuses = function loadWithdrawStatuses (statusName) {
        $scope.paymentHistory = [];
		Zergling.get({}, 'get_' + statusName).then(function (response) {
            if (response && response.result_status === "OK") {
                if(statusName === 'withdrawals') {
                    statusName = 'withdrawal';
                }
                if (response && response[statusName + '_requests'] && response[statusName + '_requests'].request) {
                    $scope.paymentHistory = response[statusName + '_requests'].request.reverse();

                    $scope.hasPaymentInfo = $scope.paymentHistory.some(function (history) {
                        return history.payment_info;
                    });
                }
            }
		}, function (failResponse) {
            console.log('Error', failResponse);
        })['finally'](function () {
            $scope.withdrawListLoaded = true;
            $scope.cancelButton.disabled = false;
        });
    };

	$scope.getWithdrawRejectedReason = function getWithdrawRejectedReason(id, status) {
	    if (status !== -2) { // get data only for rejected withdraws
	        return;
        }

        $scope.rejectedInfo = $scope.rejectedInfo || {};

        if (!$scope.rejectedInfo[id]) {
            Zergling.get({request_id: id}, "get_request_reject_reason").then(function (response) {
                if (response.result === 0) {
                    $scope.rejectedInfo[id] = response.details.RejectReason;
                }
            });
        }
    };

	/**
	 * @ngdoc method
	 * @name loadWithdrawStatus
	 * @methodOf vbet5.controller:paymentsCtrl
	 * @description  Cancels pending withdraw request
	 */
	$scope.cancelWithdrawRequest = function cancelWithdrawRequest (id) {
        $scope.cancelButton.disabled = true;

        Zergling.get({'id': id}, 'withdraw_cancel').then(function (response) {
            if (Number(response.result) === 2070) {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'This type of Withdrawal Requests cannot be Cancelled'
                });
                return;
            }
            $scope.loadWithdrawStatuses($rootScope.env.sliderContent === 'deposit' ? 'deposits' : 'withdrawals');
        },function (failResponse) {
            console.log('Error', failResponse);
            $scope.cancelButton.disabled = false;
        });
	};

    /**
     * @ngdoc method
     * @name setInfo
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Change payment info text based on dropdown value
     */
    $scope.setInfo = function setInfo(field, value, target) {
        var fieldValue;
        angular.forEach(field.options, function (option) {
            if (option.value === value) {

                field.selectedText = option.text;
                $scope.paymentFormData[field.name] = option.value;

                if (option.info) {
                    $scope.selectedPaymentSystem[target] = option.info;
                }
                if (option.depositData) {
                    angular.forEach(option.depositData, function (value, name) {
                        $scope.depositFormData[name] = value;
                    });
                }
                if (option.withdrawData) {
                    angular.forEach(option.withdrawData, function (value, name) {
                        $scope.withdrawFormData[name] = value;
                    });
                }
                if (option.withdrawCustomAmounts) {
                    $scope.withdrawCustomAmounts = option.withdrawCustomAmounts;
                }
                if (option.depositCustomAmounts) {
                    $scope.depositCustomAmounts = option.depositCustomAmounts;
                }
                if (option.withdrawFieldTypes) {
                    angular.forEach($scope.selectedPaymentSystem.withdrawFormFields, function(field){
                        fieldValue = option.withdrawFieldTypes[field.name];
                        if (fieldValue) {
                            field.type = fieldValue;
                            field.hideLabel = fieldValue === 'hidden';
                            field.dontSend = fieldValue === 'hidden';
                        }
                    });
                }
                if (option.depositFieldTypes) {
                    angular.forEach($scope.selectedPaymentSystem.depositFormFields, function(field){
                        fieldValue = option.depositFieldTypes[field.name];
                        if (fieldValue) {
                            field.type = fieldValue;
                            field.hideLabel = fieldValue === 'hidden';
                            field.dontSend = fieldValue === 'hidden';
                        }
                    });
                }
                if (option.customCurrency) {
                    $scope.selectedPaymentSystem.customCurrency = option.customCurrency;
                    getCurrencyRate(option.customCurrency);
                }
            }
        });
    };

    /**
     * @ngdoc method
     * @name openDatePicker
     * @methodOf vbet5.controller:paymentsCtrl
     * @description hide 'date to' picker and show or hide 'date from' picker
     */
    $scope.datePickers = {};

    $scope.openDatePicker = function openDatePicker(name, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.datePickers[name] = !$scope.datePickers[name];
    };

    /**
     * @ngdoc method
     * @name confirmUser
     * @methodOf vbet5.controller:paymentsCtrl
     * @description check user`s password
     */
    $scope.confirmUser = function confirmUser(password) {
        if (!password) {
            return;
        }

        $scope.depositFormData.user_confirmation_password = '';
        $scope.withdrawFormData.user_confirmation_password = '';

        Zergling.get({password: password}, 'check_password')
            .then(
                function (response) {
                    if (parseInt(response.result, 10) === 0) {
                        if (userConfirmationConfig.paymentSystemCache) {
                            userConfirmed = true;
                            $scope.selectPaymentSystem(userConfirmationConfig.paymentSystemCache, '');
                        }
                    } else {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "error",
                            title: "Error",
                            content: 'Wrong Password'
                        });
                    }
                },
                function (failResponse) {
                    console.log('failed user confirmation', failResponse);
                }
            );
    };

    /**
     * @ngdoc method
     * @name dateMaskFix
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Validate date
     */
    $scope.dateMaskFix = function dateMaskFix(d) {

        if(!/^\d{8}$/.test(d)) {
            return '';
        }

        var day = parseInt(d.substr(0,2), 10);
        var month = parseInt(d.substr(2,2), 10);
        var year = parseInt(d.substr(4,4), 10);

        // Check the ranges of month and year
        if(year < 1000 || year > 3000 || month === 0 || month > 12)
            return '';

        var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        // Adjust for leap years
        if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
            monthLength[1] = 29;

        // Check the range of the day
        return (day > 0 && day <= monthLength[month - 1]? d : '');
    };

    $scope.renderInfoText = function renderInfoText(text) {
        return generateInfoText(text);
    };

    /**
     * @ngdoc method
     * @name adjustPaymentDate
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  Datepicker model fix and match to the mask
     * @param {String} fieldId id
     * @param {String} model the model name
     */
    $scope.adjustPaymentDate = function adjustPaymentDate(fieldId, model) {
        TimeoutWrapper(function () {
            $scope.paymentFormData[model] = document.getElementById(fieldId).value;
        }, 0);
    };

    /**
     * @ngdoc method
     * @name openDepositAttentionPopUp
     * @methodOf vbet5.controller:paymentsCtrl
     * @description  open pop up with terms and conditions link when clicking on deposit
     */
    function openDepositAttentionPopUp () {
        if (Config.main.popUpBeforeDeposit && Config.main.popUpBeforeDeposit.enable && $rootScope.env.sliderContent === 'deposit') {
            var termsAndCond = "#/?help=general-terms-and-conditions&lang=" + Config.env.lang;
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'text',
                title: 'Attention',
                content: 'I confirm that I have read and agree to {1}.',
                hideCloseButton: true,
                buttons: [ {title: 'Confirm'} ],
                contentPlaceholders: ['<a href="' + termsAndCond + '"' + ' target="_blank">' + Translator.get("Terms &amp; Conditions") + '</a>']
            });
        }
    }

    $scope.customButtonHandler = function customButtonHandler() {
        var payment = $scope.selectedPaymentSystem, opener;
        var customButton = payment[$rootScope.env.sliderContent + "CustomButton"];
        if (customButton.type === 'redirect') {
            opener = window.open('', '_blank');
        }
        if (customButton.type === 'event' && customButton.event) {
            $rootScope.broadcast(customButton.event);
            return;
        }
        var amount = payment[$rootScope.env.sliderContent + 'PrefilledAmount'] !== undefined ? payment[$rootScope.env.sliderContent + 'PrefilledAmount'] : $scope.paymentAmount[$rootScope.env.sliderContent];
        var payer = {
            action: customButton.action,
            user_agent: navigator.userAgent,
            auth_data: $scope.authData.auth_token
        };
        var request = {
            amount: parseFloat(amount || 0),
            service: payment.paymentID || payment.name
        };
        if ($rootScope.env.sliderContent === 'deposit') {
            request.payer = payer;
        } else {
            request.payee = payer;
        }
        Zergling.get(request, $rootScope.env.sliderContent).then(function (response) {
            if (response && response.details) {
                switch (customButton.type) {
                    case 'redirect':
                        if (response.details.action) {
                            opener.location.href = response.details.action;
                        }
                        break;
                    case 'popup':
                        if (response.details.fields) {
                            var fields = response.details.fields, content='';
                            for (var i = 0; i < fields.length; i++) {
                                content += Translator.get(fields[i].name) + ': ' + fields[i].value + '</br>';
                            }
                            $rootScope.$broadcast("globalDialogs.addDialog", {
                                type: 'info',
                                title: 'Info',
                                content: content
                            });
                        }
                        break;
                }
            }
        });
    };

    openDepositAttentionPopUp();

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:paymentsCtrl
     * @description selects the first available payment system initially
     * @param {String} type deposit or withdraw
     */
    $scope.init = function init(type) {
        if (!$rootScope.profile) {
            profileWatcherPromise = $scope.$watch('profile', function (newValue) {
                if (newValue) {
                    profileWatcherPromise();
                    $scope.init(type);
                }
            });
            return;
        }

        function doInit() {
            if (!$scope.paymentConfig || !$rootScope.profile.paymentSystems) {
                TimeoutWrapper(doInit, 500);
                initPaymentConfig(type);
                return;
            }

            if ($rootScope.profile.paymentSystems.status) {
                return;
            }

            if ($rootScope.profile.paymentSystems.redirect) {
                $window.location = $rootScope.profile.paymentSystems.redirect;
                $rootScope.env.sliderContent = '';
                $rootScope.env.showSlider = false;
                return;
            }

            startWatchingWithdrawAmount();
            initPaymentConfig(type);

            var payemntFromUrl = getPaymentSystemFromUrl();
            if (payemntFromUrl) {
                $scope.selectPaymentSystem(payemntFromUrl, '', true);
            } else {
                var i;
                var defaultPaymentIndex = NaN;

                for (i = 0; i < $scope.paymentConfig.length; i++) {
                    if ($scope.paymentConfig[i]['can' + ($scope.env.sliderContent === 'withdraw' ? 'Withdraw' : 'Deposit')]) {
                        if ($scope.env.selectedPayment ===  $scope.paymentConfig[i].name) {
                            $scope.selectPaymentSystem($scope.paymentConfig[i], '', true);
                            defaultPaymentIndex = NaN;
                            $location.search('system', undefined);
                            break;
                        }
                        if (isNaN(defaultPaymentIndex) && (($scope.env.sliderContent !== 'withdraw' || (!$rootScope.currentPage.isInCasino || $scope.paymentConfig[i].canWithdrawFromCasino === undefined || $scope.paymentConfig[i].canWithdrawFromCasino)))) {
                            defaultPaymentIndex = i;
                        }
                    }
                }

                if (!isNaN(defaultPaymentIndex)) {
                    $scope.selectPaymentSystem($scope.paymentConfig[defaultPaymentIndex], '', true); //by default select the first one
                }
            }

            $scope.selectedPaymentSystem = $scope.selectedPaymentSystem || null;
        }

        $scope.paymentsType = type;
        $scope.selectedPaymentSystem = undefined;

        if (Config.main.registration && (Config.main.registration.type === 'partial' || (Config.main.personalDetails.requiredFieldsForPayments && (!Config.main.personalDetails.requiredFieldsFor || (Config.main.personalDetails.requiredFieldsFor.deposit && $rootScope.env.sliderContent === 'deposit') || (Config.main.personalDetails.requiredFieldsFor.withdraw && $rootScope.env.sliderContent === 'withdraw'))))) {
            $scope.isProfilePartial = isProfilePartial();
        } else {
            $scope.isProfilePartial = false;
        }
        doInit();
    };

    $scope.$on('$destroy', function () {
        $interval.cancel(renewClockPromise);
        $scope.renewDone = $scope.renewFailed = false;//reset state
        if (amountWatcher) {
            amountWatcher();
        }
        if (profileWatcherPromise) {
            profileWatcherPromise();
        }
    });

    /**
     * @ngdoc method
     * @name openDropdown
     * @methodOf vbet5.controller:paymentsCtrl
     * @description toggle dropdown and if other dropdown is open close it
     * @param {String} name dropdown field name
     */
    $scope.openDropdown = function openDropdown(name) {
        if (currentOpenDropdown && currentOpenDropdown !== name) {
            $scope.dropdownOpened[currentOpenDropdown] = false;
        }
        $scope.dropdownOpened[name] = !$scope.dropdownOpened[name];
        currentOpenDropdown = name;
    };

    function checkAndSetWithdrawOptions() {
        if ($scope.selectedPaymentSystem && $scope.env.sliderContent === 'withdraw' && withDrawDetailsData) {
            $scope.withdrawLimit = withDrawDetailsData.Limit;
            $scope.unplayedAmount = withDrawDetailsData.UnplayedAmount;
            $scope.unplayedFee = withDrawDetailsData.UnplayedFee;
            $scope.feePercentage = withDrawDetailsData.FeePercentage;
        } else {
            $scope.withdrawLimit = null;
            $scope.unplayedAmount = null;
            $scope.unplayedFee = null;
            $scope.feePercentage = null;
        }
    }

    function getWithdrawabelBonus() {
        Zergling.get({product: $rootScope.currentPage.isInSports ? "Sport" : "Casino"}, "get_client_withdrawable_balance").then(function (response) {
            if (response.details) {
                withDrawDetailsData = response.details;
                checkAndSetWithdrawOptions();

            }
        });
    }

    $scope.$watch('env.sliderContent', function (newValue) {
        if (newValue === 'withdraw') {
            getWithdrawabelBonus();

        } else if ($rootScope.profile) {
            PaymentPreCalculation.getData().then(function (res) {
                isFirstDeposit = res.DepositCount < 1;
            });
            checkAndSetWithdrawOptions();
        }
    });
}]);
