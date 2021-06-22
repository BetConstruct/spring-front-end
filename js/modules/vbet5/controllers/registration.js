/**
 * @ngdoc controller
 * @name vbet5.controller:RegistrationController
 * @description
 * registration controller
 */
angular.module('vbet5').controller('RegistrationController', ['$scope', '$rootScope', '$location', '$window', 'Script', 'Moment', 'Config', 'Zergling', 'RecaptchaService', 'Storage', 'Translator', 'Geoip', 'LocalIp', 'UserAgent', 'Utils', 'content', 'analytics', 'CountryCodes', 'LanguageCodes', 'RegConfig', 'TimeoutWrapper',
    function ($scope, $rootScope, $location, $window, Script, Moment, Config, Zergling, RecaptchaService, Storage, Translator, Geoip, LocalIp, UserAgent, Utils, content, analytics, CountryCodes, LanguageCodes, RegConfig, TimeoutWrapper) {
        'use strict';

        TimeoutWrapper = TimeoutWrapper($scope);
        var REG_FORM_BIRTH_YEAR_LOWEST = new Date().getFullYear() - 110;
        var step1Fields = [];
        var registrationDefaultCurrency = Storage.get('defaultRegistrationCurrency') || $location.search().currency || Config.main.registration.defaultCurrency;
        var giftCode = null;
        var emailRequired;
        var referenceCode = null;
        var notChangeCurrency = false;

        $scope.minimumAllowedAge = Config.main.registration.minimumAllowedAge;
        $scope.RegConfig = RegConfig;
        $scope.resetError = {};
        $scope.countryCodes = Utils.objectToArray(Utils.getAvailableCountries(CountryCodes), 'key');
        $scope.countryCodes = $scope.countryCodes.sort(Utils.alphabeticalSorting);

        $scope.recaptcha = {
            version: RecaptchaService.version,
            key: RecaptchaService.key
        };
        $scope.phoneCodes = [];
        $scope.registration = {
            step: Config.main.registration.zimpler ? 0 : 1,
            complete: false,
            failed: false,
            byEmail: false,
            busy: false,
            smsTimer: null
        };
        $scope.bankNamesList = [];

        var getBankNamesListFromBackend = false;

        /**
         * @ngdoc object
         * @name showFieldsValidation
         * @propertyOf vbet5.controller:RegistrationController
         * @description indicates whether to show validation messages or not (this is IE browser fix, as IE doesn't properly render $dirty state of input field)
         */
        $scope.showFieldsValidation = !UserAgent.IEVersion() || (UserAgent.IEVersion() && UserAgent.IEVersion() >= 10);

        $scope.monthNames = Config.main.monthNames;
        $scope.genders = [{val: 'M', name: 'Male'}, {val: 'F', name: 'Female'}];
        $scope.incomeSources = [
            {title: 'Salary', value: 1},
            {title: 'Self-employed', value: 2},
            {title: 'Inheritance', value: 3},
            {title: 'Savings', value: 4},
            {title: 'Investments', value: 5}
        ];
        /**
         * RegistratioinData model for registration form
         * @type {{gender: *, username: string, email: string, address: string, city: string, currency_name: *, country_id: string, password: string, password2: string, promo_code: string, doc_number: string, years: {}, language: (Config.env.lang|*), secQuest: String, birth_day: string, birth_month: string, birth_year: string, phone_code: string, phone_number: string, agree: boolean}}
         */
        $scope.registrationData = {
            first_name: '',
            years: [],
            docIssueYears: [],
            gender: '',
            currency_name: registrationDefaultCurrency,
            language: Config.env.lang,
            birth_year: '',
            birth_day: '',
            birth_month: '',
            phone_code: '',
            agree: false
        };

        angular.forEach(Config.main.registration.defaults, function (value, key) {
            $scope.registrationData[key] = value;
        });

        if ($location.search().currency) {
            Storage.set('defaultRegistrationCurrency', $location.search().currency);
        }
        $location.search('currency', undefined);

        // Accept Arguments from URL
        if (Config.main.registration.acceptArguments) {
            angular.forEach(Config.main.registration.acceptArguments, function (argument) {
                if ($location.search()[argument]) {
                    $scope.registrationData[argument] = $location.search()[argument];
                    $location.search(argument, undefined);
                }
            });
        }


        /**
         * @ngdoc method
         * @name calculateAge
         * @methodOf vbet5.controller:RegistrationController
         * @description Recalculate user age and set to userAge
         */
        $scope.calculateAge = function calculateAge() {
            if (!$scope.registrationData.birth_year || !$scope.registrationData.birth_month || !$scope.registrationData.birth_day) {
                return;
            }

            var d1 = Moment.get({
                year: $scope.registrationData.birth_year,
                month: ($scope.registrationData.birth_month - 1),
                day: $scope.registrationData.birth_day
            });
            var d2 = Moment.get();
            $scope.userAge = d2.diff(Moment.get(d1), 'year');
        };

        /**
         * @description Automatically set currency if it enabled and defined in config
         * @param {String} countryCode the code of country
         */
        function autoSetCurrency(countryCode) {
            if (Config.main.registration.autoSetCurrency.availableList[countryCode]) {
                $scope.registrationData.currency_name = Config.main.registration.autoSetCurrency.availableList[countryCode];
                if (Config.main.registration.autoSetCurrency.disableChangeAfterSelect) {
                    $scope.currencyDisabled = true;
                }
            } else {
                $scope.currencyDisabled = false;
                setCurrencyByCountryCode(countryCode);
            }
        }

        /**
         * @ngdoc method
         * @name loadCaptchaImage
         * @methodOf vbet5.controller:RegistrationController
         * @description loads captcha image url from swarm and stores it in passed regItem object's imgSrc field
         * @param {Object} regItem registration config captcha item
         */
        $scope.loadCaptchaImage = function loadCaptchaImage(regItem) {
            Zergling
                .get({}, "get_captcha_url")
                .then(function (data) {
                    console.log('captcha data', data);
                    if (data.code === 0 && data.url) {
                        regItem.imgSrc = data.url;
                    }
                })['catch'](function (response) {
                console.log("error getting captcha", response);
            });
        };

        /**
         * @ngdoc method
         * @name step1DataIsValid
         * @methodOf vbet5.controller:RegistrationController
         * @description Checks if registration step 1 is valid
         */
        $scope.step1DataIsValid = function step1DataIsValid() {
            return step1Fields.reduce(function (prevResult, fieldName) {
                if (fieldName === 'province' || fieldName === 'state' || fieldName === 'io_black_box') {
                    return prevResult;
                }

                return !!($scope.registerform[fieldName] && $scope.registerform[fieldName].$valid && prevResult);
            }, true);
        };

        $scope.registrationPhoneNumber = null;
        $scope.registerUsingPhoneNumber = function registerUsingPhoneNumber() {
            console.log('registerUsingPhoneNumber', $scope.registrationPhoneNumber, $scope.registrationData.currency_name);
            $scope.registerform.$setPristine();
            $scope.registerform.regphonenumber.invalid = $scope.registerform.regphonenumber.dublicate = false;
            Zergling
                .get({
                    phone: $scope.registrationPhoneNumber,
                    currency_name: $scope.registrationData.currency_name
                }, 'registration_by_phone')
                .then(function (data) {
                    console.log(data);
                    if (data.result === 'OK') {
                        $scope.registrationByPhoneSuccessFul = true;
                        analytics.gaSend('send', 'event', 'slider', 'registration', {
                            'page': $location.path(),
                            'eventLabel': 'Success'
                        });
                    } else {
                        analytics.gaSend('send', 'event', 'slider', 'registration', {
                            'page': $location.path(),
                            'eventLabel': 'Failed (' + data.result + ')'
                        });
                        switch (data.result) {
                            case '-1012':
                                $scope.registerform.regphonenumber.$dirty = $scope.registerform.regphonenumber.$invalid = $scope.registerform.regphonenumber.invalid = true;
                                break;
                            case '-1127':
                                $scope.registerform.regphonenumber.$dirty = $scope.registerform.regphonenumber.$invalid = $scope.registerform.regphonenumber.dublicate = true;
                                break;
                            //case '-1200': //not enabled
                            default:
                                $scope.registrationByPhoneFailed = true;
                                break;
                        }
                    }
                })['catch'](function (failResponse) {
                console.log(failResponse);
                analytics.gaSend('send', 'event', 'slider', 'registration', {
                    'page': $location.path(),
                    'eventLabel': 'Failed (' + failResponse.result + ')'
                });
                $scope.registrationByPhoneFailed = true;
            });
        };

        /**
         * @description Automatically set phone_code when it changed
         * @param id
         */
        function setCountryCode(id) {
            if (Config.main.registration.dontFixPhoneCode) {
                return;
            }
            $scope.registrationData.phone_code = (CountryCodes[id] && CountryCodes[id].code) || $scope.registrationData.phone_code;
            if ($scope.registerform.phone_code) {
                $scope.registerform.phone_code.$setValidity('countryCode', true);
            }
        }

        /**
         * @description Automatically set currency_code when country changed
         * @param country code
         */
        function setCurrencyByCountryCode(code) {
            var currency = CountryCodes[code] && CountryCodes[code].currency;
            if (currency && Config.main.availableCurrencies.indexOf(currency) !== -1) {
                $scope.registrationData.currency_name = currency;
            } else if (registrationDefaultCurrency) {
                $scope.registrationData.currency_name = registrationDefaultCurrency;
            }
        }

        $scope.$watch('registrationData.country_id', function (newVal, oldVal) {
            newVal = newVal || oldVal;

            if (!newVal) {
                return;
            }

            setCountryCode(newVal.key);

            if (getBankNamesListFromBackend) {
                $scope.getBankNamesList();
            }

            if (Config.main.registration.autoSetCurrency.enabled && !notChangeCurrency) {
                autoSetCurrency(newVal.key);
            }

            if (Config.main.registration.autoSetPromoCode && Config.main.registration.autoSetPromoCode.enabled) {
                setPromoCode(newVal, oldVal);
            }

        });

        /**
         * @ngdoc method
         * @name preFillRegionalData
         * @methodOf vbet5.controller:RegistrationController
         * @description
         * determines user location via {@link vbet5.service:Geoip Geoip} service
         * and sets country and city and country values (if not selected yet)
         * @param predefinedCountryId user prefered country id, if predefined no need to make location call
         * @param {Boolean} skipCity if true doesn't send pre filled city info to back-end
         */
        $scope.preFillRegionalData = function preFillRegionalData(predefinedCountryId, skipCity) {
            var countryCodeItem;
            if (predefinedCountryId && CountryCodes[predefinedCountryId]) {
                //timeout is not good solution, but this way setting predefined country works
                TimeoutWrapper(function () {
                    countryCodeItem = CountryCodes[predefinedCountryId];
                    countryCodeItem.key = predefinedCountryId;
                    $scope.registrationData.country_id = countryCodeItem;
                    setCountryCode(predefinedCountryId);
                });
            } else {
                var city;
                Geoip.getGeoData().then(function (data) {
                    if (!$scope.registrationData.country_id && data.countryCode && (!Config.main.personalDetails.availableCountriesList || Config.main.personalDetails.availableCountriesList.indexOf(data.countryCode) !== -1) && (!Config.main.personalDetails.restrictedCountriesList || Config.main.personalDetails.restrictedCountriesList.indexOf(data.countryCode) === -1)) {
                        countryCodeItem = CountryCodes[data.countryCode];
                        countryCodeItem.key = data.countryCode;
                        if (!skipCity) {
                            city = data.cityName || countryCodeItem.city;
                        }
                    }
                })['catch'](function (reason) {
                    console.log(reason);
                })['finally'](function () {
                    if (!$scope.registrationData.country_id) {
                        if (!countryCodeItem && Config.main.registration.defaultCountryCode) {
                            countryCodeItem = CountryCodes[Config.main.registration.defaultCountryCode];
                            countryCodeItem.key = Config.main.registration.defaultCountryCode;
                            city = CountryCodes[Config.main.registration.defaultCountryCode].city;
                        }
                        if (countryCodeItem) {
                            $scope.registrationData.country_id = countryCodeItem;
                        } else {
                            $scope.registrationData.country_id = $scope.countryCodes[0];
                            city = $scope.countryCodes[0].city;
                        }

                        $scope.checkIfCountryIsRestricted();
                        if (!skipCity) {
                            $scope.registrationData.city = $scope.registrationData.city || city || '';

                        }
                        setCountryCode($scope.registrationData.country_id);
                    }
                });
            }

            $scope.virginRegistrationData = angular.copy($scope.registrationData);
        };

        /**
         * @ngdoc method
         * @name resetRegForm
         * @methodOf vbet5.controller:RegistrationController
         * @description
         * reset registration form to its initial state
         */
        $scope.resetRegForm = function resetRegForm() {
            if ($scope.virginRegistrationData !== undefined) {
                $scope.registrationData = angular.copy($scope.virginRegistrationData);
                $scope.registerform.$setPristine();
            }
        };

        /**
         * @ngdoc method
         * @name checkIfCountryIsRestricted
         * @methodOf vbet5.controller:RegistrationController
         * @description
         *  checks if selected country is in restricted list(in config)
         *  and  sets corresponding **countryIsRestricted** scope variable value
         */
        $scope.checkIfCountryIsRestricted = function checkIfCountryIsRestricted() {
            if (Config.main.registration.warningForCountries && Config.main.registration.warningForCountries[$scope.registrationData.country_id && $scope.registrationData.country_id.key] !== undefined) {
                $scope.countryIsRestricted = true;
                $scope.altUrl4RestrictedCountry = Config.main.registration.warningForCountries[$scope.registrationData.country_id && $scope.registrationData.country_id.key];
            } else if (Config.main.registration.noWarningForCountries && !(Config.main.registration.noWarningForCountries[$scope.registrationData.country_id && $scope.registrationData.country_id.key] !== undefined)) {
                $scope.countryIsRestricted = true;
                $scope.altUrl4RestrictedCountry = Config.main.registration.noWarningForCountries[$scope.registrationData.country_id && $scope.registrationData.country_id.key];
            } else {
                $scope.countryIsRestricted = false;
            }

            if ($scope.registerform.city !== undefined && !$scope.registerform.city.$dirty) {
                $scope.registrationData.city = $scope.virginRegistrationData.city;
                $scope.registerform.city.$setPristine();
            }
        };

        /**
         * @ngdoc method
         * @name setPromoCode
         * @methodOf vbet5.controller:RegistrationController
         * @description checks PromoCode if there is no defaultPromoCode in configs
         */

        function setPromoCode(newVal, oldVal) {
            var promoCode = $scope.registrationData.promo_code;

            if (newVal !== undefined && Config.main.registration.autoSetPromoCode.availableList[newVal && newVal.key]) {
                $scope.registrationData.promo_code = Config.main.registration.autoSetPromoCode.availableList[newVal && newVal.key];
                promoCode = $scope.registrationData.promo_code;
            }

            return promoCode;
        }

        /**
         * @ngdoc function
         * @name getPhoneNumber
         * @methodOf vbet5.controller:RegistrationController
         * @description formats phone number
         */
        function getPhoneNumber() {
            var code = $scope.registrationData.phone_code,
                number = $scope.registrationData.phone_number,
                phone;

            if (Config.main.registration.enablePhoneNumberAsUsername) {
                phone = (($scope.registrationData.username.indexOf('+') === 0) ? '' : '00') + $scope.registrationData.username;
            } else if (code && number) {
                phone = '00' + code + number;
            } else {
                phone = number || '';
            }

            return phone;
        }


        /**
         * @ngdoc method
         * @name setDefaultPromoCode
         * @methodOf vbet5.controller:RegistrationController
         * @description Generated registration data
         * Returns registration object which will be send to swarm
         */
        function getRegistrationInfo() {
            var regInfo = {},
                customDataType = {
                    birth_day: function () {
                        regInfo.birth_date = $scope.registrationData.birth_year + '-' + $scope.registrationData.birth_month + '-' + $scope.registrationData.birth_day;
                    },
                    doc_issue_day: function() {
                        regInfo.doc_issue_date = $scope.registrationData.doc_issue_year + '-' + $scope.registrationData.doc_issue_month + '-' + $scope.registrationData.doc_issue_day;
                    },
                    phone_number: function () {
                        var phone = getPhoneNumber();
                        if (phone) {
                            regInfo.phone = phone;
                        }
                    },
                    promo_code: function () {
                        var promoCode = setPromoCode();
                        if (promoCode !== "" && promoCode !== undefined) {
                            return promoCode;
                        }
                    },
                    country_id: function () {
                        if ($scope.registrationData.country_id && $scope.registrationData.country_id.key) {
                            regInfo.country_code = $scope.registrationData.country_id.key;
                        } else {
                            regInfo.country_code = $scope.registrationData.country_id;
                        }
                    },
                    personal_id_5: function () {
                        regInfo.personal_id = $scope.registrationData.personal_id_6 + '-' + $scope.registrationData.personal_id_5;
                    },
                    personal_id_6: function () {
                        regInfo.personal_id = $scope.registrationData.personal_id_6 + ($scope.registrationData.personal_id_5 ? '-' + $scope.registrationData.personal_id_5 : '');
                    },
                    doc_number_1: function () {
                        regInfo.doc_number = $scope.registrationData.doc_number_1 + '-' + $scope.registrationData.doc_number_2 + '-' + $scope.registrationData.doc_number_3 + '-' + $scope.registrationData.doc_number_4;
                    },
                    doc_number_2: function () {
                        regInfo.doc_number = $scope.registrationData.doc_number_1 + '-' + $scope.registrationData.doc_number_2 + '-' + $scope.registrationData.doc_number_3 + '-' + $scope.registrationData.doc_number_4;
                    },
                    doc_number_3: function () {
                        regInfo.doc_number = $scope.registrationData.doc_number_1 + '-' + $scope.registrationData.doc_number_2 + '-' + $scope.registrationData.doc_number_3 + '-' + $scope.registrationData.doc_number_4;
                    },
                    doc_number_4: function () {
                        regInfo.doc_number = $scope.registrationData.doc_number_1 + '-' + $scope.registrationData.doc_number_2 + '-' + $scope.registrationData.doc_number_3 + '-' + $scope.registrationData.doc_number_4;
                    },
                    max_session_duration_daily: function () {
                        return  $scope.registrationData.max_session_duration_daily && $scope.registrationData.max_session_duration_daily * 60;
                    },
                    max_session_duration_monthly: function () {
                        return  $scope.registrationData.max_session_duration_monthly && $scope.registrationData.max_session_duration_monthly * 60;
                    }
                };
            customDataType.birth_month = customDataType.birth_day;
            customDataType.birth_year = customDataType.birth_day;

            regInfo.site_id = Config.main.site_id;

            var lang = Utils.getLanguageCode(Config.env.lang);
            regInfo.lang_code = LanguageCodes[lang] || lang;

            regInfo.ignore_username = (Config.main.registration.simplified && Config.main.registration.type !== 'partial' || Config.main.registration.ignoreUsername) ? "1" : undefined;

            if (Config.main.registration.langCodeAsLanguage) {
                regInfo.lang_code = Config.main.availableLanguages[$scope.registrationData.language]['short'];
            }

            if (Config.main.registration.enablePhoneNumberAsUsername) {
                regInfo.phone = getPhoneNumber();
            }

            addIovation(regInfo);

            emailRequired = true;

            function processField(regItem) {
                if (!regItem) return;
                var fieldName = regItem.name;
                if (fieldName === 'email') {
                    emailRequired = regItem.required;
                }

                if($scope.registerform[fieldName]) {
                    if (fieldName in customDataType) {
                        regInfo[fieldName] = customDataType[fieldName].call();
                    } else if ($scope.registrationData[fieldName] || $scope.registrationData[fieldName] === 0) {
                        if (fieldName !== 'state' && fieldName !== 'province') {
                            regInfo[fieldName] = $scope.registrationData[fieldName];
                        } else if ($scope.registerform[fieldName]) {
                            regInfo['province'] = $scope.registrationData[fieldName];
                        }
                    }

                }

            }

            angular.forEach($scope.RegConfig, function (item) {
                if (item instanceof Array) {
                    angular.forEach(item, processField);
                } else if (!Utils.isObjectEmpty(item)) {
                    angular.forEach(item, function (sub) {
                        angular.forEach(sub, processField);
                    });
                }
            });

            if ((!regInfo.email || !emailRequired) && !regInfo.username) {
                regInfo.username = ($scope.registrationData.phone_code || '') + ($scope.registrationData.phone_number || '');
                regInfo.ignore_username = undefined;
            }

            regInfo.currency_name = (Config.main.registration.springCurrencyMap && Config.main.registration.springCurrencyMap[regInfo.currency_name]) || regInfo.currency_name || registrationDefaultCurrency;

            // If a user has a promo code we send it regardless of the fact whether the partner has a "Promo Code" field in the registration form or not
            if ($scope.hasPromoCode && !regInfo.promo_code) {
                regInfo.promo_code = customDataType.promo_code.call();
            }

            if (Config.main.gdpr.enabled) {
                angular.forEach(Config.main.gdpr.options, function (value, key) {
                    regInfo[key] = $scope.registrationData[key] === 'true';
                });
            }

            if($scope.registrationData.g_recaptcha_response) {
                regInfo.g_recaptcha_response = $scope.registrationData.g_recaptcha_response;
            }

            if (LocalIp.ip) {
                regInfo.local_ip = LocalIp.ip;
            }

            if (Config.main.registration.zimpler) {
                regInfo.external_auth_token = $scope.registrationData.external_auth_token;
            }
            if (giftCode) {
                regInfo.bet_gift_code = giftCode;
            }

            if (referenceCode) {
              regInfo.reference_code = referenceCode;
            }

            if (regInfo.doc_issue_date) {
                delete regInfo.doc_issue_month;
                delete regInfo.doc_issue_year;
                delete regInfo.doc_issue_day;
            }

            if (!regInfo.country_code && Config.main.registration.defaultCountryCode) {
                regInfo.country_code = Config.main.registration.defaultCountryCode;
            }

            if (regInfo.salary_level) {
                regInfo.salary_min = $scope.registrationData.salary_level.min;
                regInfo.salary_max = $scope.registrationData.salary_level.max;
                delete regInfo.salary_level;
            }

            return regInfo;
        }

        /**
         * @ngdoc method
         * @name resetFormFieldErrorOnChange
         * @methodOf vbet5.controller:RegistrationController
         * @description clears field error on field change
         * @param {String} field field name
         * @param {String} errorName error id
         */
        function resetFormFieldErrorOnChange(field, errorName) {
            var unWatch = $scope.$watch('registrationData.' + field, function (val, newVal) {
                if (val === newVal) {
                    return;
                }
                $scope.registerform[field].$setValidity(errorName, true);
                unWatch();
            });
        }

        /**
         * @ngdoc method
         * @name resetFieldError
         * @methodOf vbet5.controller:RegistrationController
         * @description reset Password and Confirm Password in registration form
         */
        function resetFieldError(name2) {
            if ($scope.registerform[name2]) {
                $scope.registerform[name2].$error = {};
            }
        }

        /**
         * @ngdoc method
         * @name trackGtagEvent
         * @methodOf vbet5.controller:RegistrationController
         * @description check availability of google tag manager and track event name
         * @param {String} eventName event name to track
         */
        function trackGtagEvent(eventName) {
            if (Config.main.googleTagManagerId) {
                $rootScope.$emit('gtagEvent', {category: 'Registration', label: eventName}); // $emit for performance optimization
            }
        }

        /**
         * @ngdoc method
         * @name register
         * @methodOf vbet5.controller:RegistrationController
         * @description registers the user
         */
        $scope.register = function register() {
            trackGtagEvent('Register Button');
            $scope.resetError = {};
            $scope.resetError.gdprTouched = true;
            $scope.registration.submitted = true;

            if ($scope.registerform.$invalid || ($scope.userAge !== undefined && $scope.userAge < $scope.minimumAllowedAge)) {
                return;
            }

            if ($scope.countryIsRestricted) {

                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Info',
                    content: 'Registration on this site is not permitted in selected country.'
                });
                return;
            }

            var userInfo = getRegistrationInfo();
            if ($rootScope.partnerConfig.smsVerification && $rootScope.partnerConfig.smsVerification.registration) {
                Utils.getSMSCode(1, getPhoneNumber()).then(function(code) {
                    userInfo.confirmation_code = code;
                    doRegistrationRequest(userInfo);
                })
            } else {
                doRegistrationRequest(userInfo)
            }
        };

        /**
         * @ngdoc method
         * @name doRegistrationRequest
         * @methodOf vbet5.controller:RegistrationController
         */
        function doRegistrationRequest(userInfo) {
            $scope.registration.busy = true;
            Zergling
                .get({user_info: userInfo}, 'register_user')
                .then(
                    function (data) {
                        if (data.result === 'OK') {
                            trackGtagEvent('Complete');
                            $scope.registration.complete = true;
                            if (Config.main.registration.loadExternalScriptAfterRegistration) {
                                Script(Config.main.registration.loadExternalScriptAfterRegistration);
                            }
                            Storage.set('lastLoggedInUsername', $scope.registrationData.username);
                            if (Config.main.remindToRenewBalance.enabled) {  //not to open low balance warning right after registration
                                Storage.set('renewReminded', 0, Config.main.remindToRenewBalance.interval);
                            }
                            if (Config.main.registration.loginRightAfterRegistration) {

                                $scope.$emit('login.withUserPass', {
                                    user: userInfo.username || userInfo.email || userInfo.phone,
                                    password: $scope.registrationData.password,
                                    action: 'registration_completed'
                                });
                            }
                            $rootScope.$emit('registration_complete', {  //$rootScope.$emit provides good performance if the observer at rootcope.
                                uid: data.details.uid
                            });
                            if (Config.main.registration.closeSliderAfterRegistration) {
                                $rootScope.$broadcast('slider.close');
                                setTimeout(function () {
                                    $scope.closeRegistrationResult();
                                }, 500);
                            }
                            if (Config.main.allowCustomHtml) {
                                content.getWidget('tracking').then(function (resp) {
                                    var html = '';
                                    angular.forEach(resp.data.widgets, function (item) {
                                        html = html + item.widget;
                                    });
                                    $scope.scriptContent = html;
                                });
                            }
                            analytics.gaSend('send', 'event', 'slider', 'registration', {
                                'page': $location.path(),
                                'eventLabel': 'Success'
                            });
                            $scope.resetRegForm();
                        } else {

                            if ($scope.registrationData.g_recaptcha_response && RecaptchaService.version === 2) {
                                $scope.$broadcast('recaptcha.reload');
                                $scope.registrationData.g_recaptcha_response = '';
                            }

                            $scope.registerform.$dirty = true;
                            analytics.gaSend('send', 'event', 'slider', 'registration', {
                                'page': $location.path(),
                                'eventLabel': 'Failed (' + data.result + ')'
                            });
                            switch (Math.abs(parseInt(data.result, 10) || 0)) {
                                case 1013: // password is too short
                                    $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.tooShort = true;
                                    break;
                                case 1012: // Incorrect phone number
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.invalid = true;
                                    break;
                                case 1134: // Incorrect phone number
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.exist = true;
                                    break;
                                case 1135: // Duplicate BankInfo
                                    $scope.registerform.bank_name.$dirty = $scope.registerform.bank_name.$invalid = $scope.registerform.bank_name.$error.exist = true;
                                    break;
                                case 1127: // Duplicate phone number
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.duplicate = true;
                                    resetFormFieldErrorOnChange('phone_number', 'duplicate');
                                    break;
                                case 1014: // Failed to send sms
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.failedsms = true;
                                    break;
                                case 1118: // user exists
                                    if ($scope.registerform.username) {
                                        $scope.registerform.username.$dirty = $scope.registerform.username.$invalid = $scope.registerform.username.$error.exists = true;
                                        resetFormFieldErrorOnChange('username', 'exists');
                                    } else  if (!$scope.registerform.username && $scope.registerform.email && emailRequired) {
                                        $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                        resetFormFieldErrorOnChange('email', 'exists');
                                    } else if (Config.main.registration.simplified && Config.main.registration.type === 'partial') {
                                        $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.duplicate = true;
                                        resetFormFieldErrorOnChange('phone_number', 'duplicate');
                                    } else if (Config.main.registration.simplified) {
                                        $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                        resetFormFieldErrorOnChange('email', 'exists');
                                    }
                                    break;
                                case 1119: // email exists
                                    $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                    resetFormFieldErrorOnChange('email', 'exists');
                                    break;
                                case 1010: // password same as login
                                    $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.sameAsLogin = true;
                                    break;
                                case 1123: // dublicate docnum
                                    $scope.registerform.doc_number.$dirty = $scope.registerform.doc_number.$invalid = $scope.registerform.doc_number.$error.exists = true;
                                    resetFormFieldErrorOnChange('doc_number', 'exists');
                                    break;
                                case 21:
                                    if ($scope.registerform.captcha_text) {
                                        $scope.registerform.captcha_text.$dirty = $scope.registerform.captcha_text.$invalid = $scope.registerform.captcha_text.$error.notmatching = true;
                                        resetFormFieldErrorOnChange('captcha_text', 'notmatching');
                                    }
                                    if ($scope.registerform.g_recaptcha_response) {
                                        $scope.registerform.g_recaptcha_response.$dirty = $scope.registerform.g_recaptcha_response.$invalid = $scope.registerform.g_recaptcha_response.$error.notmatching = true;
                                        resetFormFieldErrorOnChange('g_recaptcha_response', 'notmatching');
                                    }
                                    break;
                                case 1122:
                                    var field = 'personal_id_6';
                                    if ($scope.registerform.personal_id) {
                                        field = 'personal_id';
                                    }
                                    $scope.registerform[field].$dirty = $scope.registerform[field].$invalid = $scope.registerform[field].$error.duplicate = true;
                                    resetFormFieldErrorOnChange(field, 'duplicate');
                                    break;
                                case 2074:
                                    $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.sameAsLogin = true;
                                    resetFormFieldErrorOnChange('password', 'sameAsLogin');
                                    resetFieldError('password2');
                                    break;
                                case 2442:
                                    $scope.registration.failed = 'Your details match a self-excluded customer in our database. Please contact customer support.';
                                    break;
                                case 2467:
                                    $scope.registration.failed = 'We cannot proceed with your request. Contact "Customer Support" for further information.';
                                    break;
                                case 2469:
                                    if ($scope.registerform.loyalty_code) {
                                        $scope.registerform.loyalty_code.$setValidity('invalid', false);
                                        resetFormFieldErrorOnChange('loyalty_code', 'invalid');
                                    }
                                    break;
                                case 2474: // InvalidCode
                                case 2476: // CodeExpired
                                case 2481: // CodeAlreadyUsed
                                    Utils.getSMSCode(1, getPhoneNumber(), userInfo.confirmation_code, data.details.Key).then(function(code) {
                                        userInfo.confirmation_code = code;
                                        doRegistrationRequest(userInfo);
                                    });
                                    break;
                                case 2482: // PhoneNumberOrContentAreInvalid
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.invalid = true;
                                    resetFormFieldErrorOnChange('phone_number', 'invalid');
                                    break;
                                case 2483: // PhoneNumberIsBlackListed
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.blacklisted = true;
                                    resetFormFieldErrorOnChange('phone_number', 'blacklisted');
                                    break;
                                default:
                                    $scope.registration.failed = 'Registration failed due to technical error.';
                                    break;
                            }
                            for (var i = step1Fields.length; i--;) {
                                if ($scope.registerform[step1Fields[i]].$invalid) {
                                    $scope.registration.step = 1;
                                    break;
                                }
                            }
                        }
                    },
                    function (response) {
                        if (response.code) {
                            switch (response.code) {
                                case 26:
                                    var fKey = $scope.registerform.promo_code ? 'promo_code' : 'affiliate_id'; // response code 26 is same for promo_code and affiliate_id and should separates from backend's side
                                    $scope.registerform[fKey].$dirty = $scope.registerform[fKey].$invalid = $scope.registerform[fKey].$error.invalid = true;
                                    resetFormFieldErrorOnChange(fKey, 'invalid');
                                    break;
                                case 29:
                                    return RecaptchaService.execute('register', {debounce: false}).then(function () {
                                        $scope.register();
                                    });
                            }
                        }
                        console.log('registration failed:', response);
                        $scope.registration.failed = response.data;
                    }
                )['finally'](function () {
                $scope.registration.busy = false;
            });
        }

        /**
         * @ngdoc method
         * @name registrationDone
         * @methodOf vbet5.controller:RegistrationController
         * @description closes the "registration done" message and slider
         */
        $scope.closeRegistrationResult = function closeRegistrationResult() {
            if (Config.main.registration.sliderPageAfterRegistration) {
                if ($rootScope.env.authorized) {
                    if (['deposit', 'withdraw', 'renew', 'cashier', 'myWallets', 'casinoBalanceHistory', 'balanceHistory', 'promotionalBonuses'].indexOf(Config.main.registration.sliderPageAfterRegistration) !== -1) {
                        // $location.search({});
                        $rootScope.env.sliderContent = Config.main.registration.sliderPageAfterRegistration;
                        $rootScope.env.showSlider = true;
                    } else {
                        $rootScope.env.sliderContent = Config.main.registration.sliderPageAfterRegistration;
                    }
                } else {
                    $rootScope.env.sliderContent = '';
                    $rootScope.env.showSlider = false;
                    $rootScope.loginInProgress && $location.search('action', Config.main.registration.sliderPageAfterRegistration);
                }
            } else {
                $location.path('/');
                $location.search({});
                $rootScope.env.sliderContent = '';
                $rootScope.env.showSlider = false;
            }
            $scope.registration.complete = false;
            $scope.registration.failed = false;
        };

        /**
         * @ngdoc method
         * @name openTC
         * @methodOf vbet5.controller:RegistrationController
         * @description Open Terms and Conditions
         */
        $scope.openTC = function openTC() {
            if (Config.main.registration && Config.main.registration.termsLink) {
                if (Config.main.registration.termsLink === true) {
                    $rootScope.$broadcast('openHelpPage', {slug: 'general-terms-and-conditions'});
                } else {
                    $window.open(Config.main.registration.termsLink, Config.main.skin + 'help.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
                }
            }
        };

        /**
         * @ngdoc method
         * @name resendEmail
         * @methodOf vbet5.controller:RegistrationController
         * @description Resend confirmation Email
         */
        $scope.resendEmail = function resendEmail() {
            Zergling.get({}, "send_verify_email")
                .then(function (data) {
                    console.log('response', data);
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'info',
                        title: 'Info',
                        content: 'Please check your email.'
                    });
                })['catch'](function (response) {
                console.log("error", response);
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'Error'
                });
            });
        };

        /**
         * @ngdoc method
         * @name registrationFinishDialog
         * @methodOf vbet5.controller:RegistrationController
         * @description Call the dialog and redirect to home page once the registration is completed
         * @param {String} dialog message
         * @param {String} dialog title
         * @param {String} dialog type
         */
        $scope.registrationFinishDialog = function registrationFinishDialog(msg, title, type) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: type,
                title: title,
                content: msg
            });
            $location.url(Config.main.registration.afterFinishRedirect || '/');
        };

        /**
         * @ngdoc method
         * @name keyPress
         * @methodOf vbet5.controller:RegistrationController
         * @description Handles keyboard events on registration steps
         * @param {Object} keyboard event
         */
        $scope.keyPress = function keyPress(event) {
            if (event.which == 13 || event.keyCode == 13) {
                if ((Config.main.registration.type != 'partial') && $scope.registration.step == 1 && $scope.step1DataIsValid()) {
                    $scope.goToNextStep();
                } else if ((Config.main.registration.type == 'partial') && $scope.registration.step == 1 || $scope.registration.step == 2) {
                    $scope.resetError = {};
                    $scope.register();
                }
                event.preventDefault();
            }
        };
        /**
         * @ngdoc method
         * @name changeMinimumAge
         * @methodOf vbet5.controller:RegistrationController
         * @description Change year dropdown based on minumum age
         * @param {Number} age
         */
        $scope.changeMinimumAge = function (minimumAge) {
            if ($scope.minimumAllowedAge !== minimumAge) {
                $scope.minimumAllowedAge = minimumAge;
                updateRegistrationDataYears();
            }
        };

        /**
         * @ngdoc method
         * @name updateRegistrationDataYears
         * @methodOf vbet5.controller:RegistrationController
         * @description Change years dropdown
         */
        function updateRegistrationDataYears() {
            var i, length = new Date().getFullYear() - $scope.minimumAllowedAge;
            $scope.registrationData.years = [];
            for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
                $scope.registrationData.years.push(i.toString());
            }
        }

        if (Config.main.showCapsLockHint) {
            $scope.capsLockStateHolder = {};
        }

        /**
         * @ngdoc method
         * @name passwordKeyPress
         * @methodOf vbet5.controller:RegistrationController
         * @description Handles password field keyboard events
         * @param {Object} event data
         * @param {String} field name
         */
        $scope.passwordKeyPress = function passwordKeyPress(event, fieldName) {
            if (Config.main.showCapsLockHint) {
                var character = String.fromCharCode(event.which);
                $scope.capsLockStateHolder[fieldName] = character.toUpperCase() === character && character.toLowerCase() !== character && !event.shiftKey;
            }
        };

        /**
         * @ngdoc method
         * @name resetFieldError
         * @methodOf vbet5.controller:RegistrationController
         * @description Resets field error
         * @param {String} field name
         */
        $scope.resetFieldError = function resetFieldError(fieldName) {
            $scope.registrationData[fieldName] = '';
            $scope.resetError[fieldName] = true;
            $scope.registerform[fieldName].blur = false;
        };

        /**
         * @ngdoc method
         * @name addIovation
         * @methodOf vbet5.controller:RegistrationController
         * @description starts iovation call
         */
        function addIovation(params) {
            if (Config.iovation.enabled && window.IGLOO && Config.iovation.actions.registration) {
                var ioData = window.IGLOO.getBlackbox();
                params[Config.iovation.apiKey] = ioData.blackbox;
            }
        }

        $scope.$on('recaptcha.response', function (event, response) {
            $scope.registrationData.g_recaptcha_response = response;
        });

        /**
         * @ngdoc method
         * @name selectCountryForChangeCurrency
         * @methodOf vbet5.controller:RegistrationController
         * @description select countri for change currency
         */

        Geoip.getGeoData().then(function (data) {
            var country = data.countryCode.toUpperCase();
            setCountryCode(country);
        });

        $scope.nextKeyPress = function nextKeyPress(event) {
            if (event.keyCode == 9 || event.keyCode == 13) {
                $scope.registration.step = 2;
            }
            event.preventDefault();
        };

        /**
         * @ngdoc method
         * @name checkNationalId
         * @methodOf vbet5.controller:RegistrationController
         * @description check national id
         */
        $scope.checkNationalId = function checkNationalId(isSkipValidation, fieldName) {
            fieldName = fieldName || "doc_number";
            var isRequired = $scope.registerform[fieldName].$$attr.required;
            var docNumber = $scope.registrationData[fieldName];
            $scope.registerform[fieldName].$setValidity('docinvalid', isSkipValidation || Utils.checkNationalId(docNumber, isRequired));
        };


        function getSwedishInfo() {
            if ($scope.buttonLoading || !$scope.registrationData.doc_number || $scope.registrationData.country_id.code !== '46') {
                return;
            }

            $scope.buttonLoading = true;

            var paramsMap = {
                COaddress: '',
                City: 'city',
                FirstName: 'first_name',
                LastName: 'last_name',
                StreetAddress: 'address',
                ZIP: 'zip_code'
            };

            Zergling.get(
                {id_number: $scope.registrationData.doc_number},
                'get_personal_info_from_swedish_db'
            ).then(
                function success(response) {
                    if (response.details) {
                        switch (response.result) {
                            case 0: // Success
                                var data = response.details;
                                if (data.PersonIdNo === null) {
                                    $rootScope.$broadcast('globalDialogs.addDialog', {
                                        type: 'error',
                                        title: 'Error',
                                        content: 'User not found'
                                    });
                                    break;
                                }
                                for (var key in data) {
                                    var mappedKey = paramsMap[key];
                                    if ($scope.registrationData[mappedKey] !== undefined) {
                                        $scope.registrationData[mappedKey] = data[key];
                                    }
                                }

                                $scope.registrationData.birth_year = data.PersonIdNo.substring(0, 4);
                                $scope.registrationData.birth_month = data.PersonIdNo.substring(4, 6);
                                $scope.registrationData.birth_day = data.PersonIdNo.substring(6, 8);

                                $rootScope.$broadcast('globalDialogs.addDialog', {
                                    type: 'success',
                                    title: Translator.get('Personal information successfully retrieved'),
                                    content: (
                                        'First name: ' + data.FirstName +
                                        '</br>Last name: ' + data.LastName +
                                        '</br>Birth date: ' + $scope.registrationData.birth_year + '-' + $scope.registrationData.birth_month + '-' + $scope.registrationData.birth_day +
                                        '</br>City: ' + data.City +
                                        '</br>Street address: ' + data.StreetAddress +
                                        '</br>Zip code: ' + data.ZIP
                                    ),
                                    buttons: [
                                        {
                                            title: 'Ok',
                                            callback: function () {
                                                if ($scope.step1DataIsValid()) {
                                                    $scope.registration.step = 2;
                                                }
                                            }
                                        }
                                    ]
                                });
                                break;
                            case 400: // Error
                                $rootScope.$broadcast('globalDialogs.addDialog', {
                                    type: 'error',
                                    title: 'Error',
                                    content: response.details.Message || 'The request is invalid.'
                                });
                                break;
                        }
                    }
                }
            )['finally'](function stopLoading() {
                $scope.buttonLoading = false;
            });
        }


        /**
         * @ngdoc method
         * @name regFormInit
         * @methodOf vbet5.controller:RegistrationController
         * @description initializes registration form. Generates years range for select box
         */
        $scope.regFormInit = function regFormInit() {
            if (Config.main.registration.phoneNumberPattern === "string") {
                Config.main.registration.phoneNumberPattern = new RegExp(Config.main.registration.phoneNumberPattern);
            }
            var i, length = new Date().getFullYear() - $scope.minimumAllowedAge;
            for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
                $scope.registrationData.years.push(i.toString());
            }
            var j, length1 = new Date().getFullYear() - 1;
            for (j = length1; j >= 1901; j -= 1) {
                $scope.registrationData.docIssueYears.push(j.toString());
            }

            //$scope.registrationData.birth_day = '01';
            //$scope.registrationData.birth_month = $scope.monthNames[0].val;
            //$scope.registrationData.birth_year = $scope.registrationData.years[i - 1].toString();

            var promoCode = Storage.get('promo_code') || Config.main.registration.defaultPromoCode || '';
            $scope.registrationData[Config.main.promoCodeFieldName] = promoCode;
            if (promoCode) {
                $scope.hasPromoCode = true;
            }

            $scope.calculateAge();

            if ($scope.RegConfig.step1 && $scope.RegConfig.step1.length) {
                angular.forEach($scope.RegConfig.step1, function (field) {
                    if (field.type !== 'div') {
                        step1Fields.push(field.name);
                    }
                });
            }
            if (Config.main.registration.simplified && Config.main.registration.type !== 'partial') {
                notChangeCurrency = step1Fields.indexOf('currency_name') > -1 && step1Fields.indexOf('country_id') === -1;
            }
            var containsReferenceCode = false;

              function processRegItem(regItem) {
                if (!regItem) return;
                //console.log(regItem.name, regItem.type);
                if (regItem.type === 'captcha') {
                    Config.main.registration.hasCaptcha = true;
                    $scope.loadCaptchaImage(regItem);
                }
                if (regItem.button) {
                    switch (regItem.button.broadcast) {
                        case 'getSwedishInfo':
                            $scope.$on('getSwedishInfo', getSwedishInfo);
                            break;

                    }
                }
                if (regItem.defaultValue !== undefined) {
                    $scope.registrationData[regItem.name] = regItem.defaultValue;
                }

                if (regItem.hideLabel) {
                    if (!regItem.labelHidden && regItem.type !== 'select' && regItem.type !== 'captcha' && regItem.type !== 'recaptcha') {
                        regItem.placeholder = regItem.title;
                        regItem.title = '';
                        regItem.required = false;
                        regItem.labelHidden = true;
                    }
                }

                if (regItem.name === 'swift_code' && regItem.type === "select") {
                    getBankNamesListFromBackend = true;
                }
                if (regItem.name === 'reference_code') {
                    containsReferenceCode = true;
                }
            }

            angular.forEach($scope.RegConfig, function (item) {
                if (item instanceof Array) {
                    angular.forEach(item, processRegItem);
                } else if (!Utils.isObjectEmpty(item)) {
                    angular.forEach(item, function (sub) {
                        angular.forEach(sub, processRegItem);
                    });
                }
            });

            var countryCodesLength = $scope.countryCodes.length;
            for (i = 0; i < countryCodesLength; ++i) {
                var phoneCode = $scope.countryCodes[i].code;
                if (phoneCode !== undefined && $scope.phoneCodes.indexOf(phoneCode) === -1) {
                    $scope.phoneCodes.push(phoneCode);
                }
            }

            $scope.phoneCodes.sort();
            if ($location.search().giftcode) {
                giftCode = $location.search().giftcode;
                $location.search("giftcode", undefined);
                $location.search("userexist", undefined);
            } else {
                giftCode = null;
            }
            var refCode = $location.search().reference_code;
            if (refCode) {
                if (!containsReferenceCode) {
                    referenceCode = refCode;
                } else {
                    $scope.registrationData.reference_code = refCode;
                    $scope.hasReferenceCode = true;
                }

                $location.search("reference_code", undefined);
            } else {
                referenceCode = null;
            }
            if(!$rootScope.partnerConfig || $rootScope.partnerConfig._not_loaded) {
                var partnerConfigUpdatedWatcher = $scope.$on('partnerConfig.updated',function () {
                   if (!$scope.registrationData.currency_name) {
                       registrationDefaultCurrency = $scope.registrationData.currency_name = Config.main.registration.defaultCurrency;
                   }
                    partnerConfigUpdatedWatcher();
                });
            }

            RecaptchaService.execute('register', { debounce: false });
        };

        /**
         * @ngdoc method
         * @name goToNextStep
         * @methodOf vbet5.controller:RegistrationController
         * @description go to next step
         */
        $scope.goToNextStep = function nextStep() {
            $scope.registration.step = 2;
            trackGtagEvent('Next Button');
        };

        /**
         * @ngdoc method
         * @name goToBack
         * @methodOf vbet5.controller:RegistrationController
         * @description go to first step of registration.
         */
        $scope.goToBack = function goToBack() {
            $scope.registration.step = 1;
            trackGtagEvent('Back Button');
        };

        /**
         * @ngdoc method
         * @name changeInputType
         * @methodOf vbet5.controller:RegistrationController
         * @description change input type when show password functionality is enabled
         */
        $scope.changeInputType = function changeInputType(elem, value) {
            document.getElementById(elem).setAttribute('type', value);
        };

        /**
         * @ngdoc method
         * @name getBankNamesList
         * @methodOf vbet5.controller:RegistrationController
         * @description get bank names list.
         */
        $scope.getBankNamesList = function getBankNamesList() {
            var swiftCode = $scope.registerform['swift_code'] || {};
            var countryCode = $scope.registerform['country_id'] || {};
            $scope.registrationData.swift_code = null;

            if ($scope.registrationData && $scope.registrationData.country_id && $scope.registrationData.country_id.key) {

                countryCode.loading = swiftCode.loading = true;
                $scope.bankNamesList = [];
                Zergling.get({"country_code": $scope.registrationData.country_id.key}, "get_partner_banks").then(function (response) {
                    if (response && response.details && response.details.length > 0) {
                        $scope.bankNamesList = Utils.orderByField(response.details, "Order");
                        $scope.registrationData.swift_code = $scope.bankNamesList[0] && $scope.bankNamesList[0].Id ? $scope.bankNamesList[0].Id : null;
                    }
                })['finally'](function () {
                    countryCode.loading = swiftCode.loading = false;
                });
            }
        };
    }]);
