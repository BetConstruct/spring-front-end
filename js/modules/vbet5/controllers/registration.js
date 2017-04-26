/**
 * @ngdoc controller
 * @name vbet5.controller:RegistrationController
 * @description
 * registration controller
 */
angular.module('vbet5').controller('RegistrationController', ['$scope', '$rootScope', '$location', '$window', 'Script', 'Moment', 'Config', 'Zergling', 'Storage', 'Translator', 'Geoip', 'UserAgent', 'Utils', 'content', 'analytics', 'CountryCodes', 'LanguageCodes', 'RegConfig', 'TimeoutWrapper',
    function ($scope, $rootScope,  $location, $window, Script, Moment, Config, Zergling, Storage, Translator, Geoip,  UserAgent, Utils, content, analytics, CountryCodes, LanguageCodes, RegConfig, TimeoutWrapper) {
        'use strict';

        TimeoutWrapper = TimeoutWrapper($scope);
        var REG_FORM_BIRTH_YEAR_LOWEST = new Date().getFullYear() - 110;
        var minimumAllowedAge = Config.main.registration.minimumAllowedAge;
        var step1Fields = [];
        var registrationDefaultCurrency = Storage.get('defaultRegistrationCurrency') || $location.search().currency || Config.main.registration.defaultCurrency;

        $scope.RegConfig = RegConfig;
        $scope.resetError = {};
        $scope.countryCodes = Utils.objectToArray(Utils.getAvailableCountries(CountryCodes), 'key');
        if (Config.main.registration.sortCountry) {
            $scope.countryCodes = $scope.countryCodes.sort(Utils.alphabeticalSorting);
        }

        $scope.registration = {
            step: 1,
            complete: false,
            failed: false,
            byEmail: false,
            busy: false
        };

        /**
         * @ngdoc object
         * @name showFieldsValidation
         * @propertyOf vbet5.controller:RegistrationController
         * @description indicates whether to show validation messages or not (this is IE browser fix, as IE doesn't properly render $dirty state of input field)
         */
        $scope.showFieldsValidation = !UserAgent.IEVersion() || (UserAgent.IEVersion() && UserAgent.IEVersion() >= 10);

        $scope.monthNames = Config.main.monthNames;
        $scope.genders = [{val: 'M', name: 'Male'}, {val: 'F', name: 'Female'}];

        /**
         * RegistratioinData model for registration form
         * @type {{gender: *, username: string, email: string, address: string, city: string, currency_name: *, country_id: string, password: string, password2: string, promo_code: string, doc_number: string, years: {}, language: (Config.env.lang|*), secQuest: String, birth_day: string, birth_month: string, birth_year: string, phone_code: string, phone_number: string, agree: boolean}}
         */
        $scope.registrationData = {
            first_name: '',
            years: [],
            gender: $scope.genders[0].val,
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
            if(!$scope.registrationData.birth_year || !$scope.registrationData.birth_month || !$scope.registrationData.birth_day){
                return;
            }

            var d1 = Moment.get({year: $scope.registrationData.birth_year, month: ($scope.registrationData.birth_month - 1), day: $scope.registrationData.birth_day});
            var d2 = Moment.get();
            $scope.userAge = d2.diff(Moment.get(d1), 'year');
        };
        /**
         * @description Automatically set currency if it enabled and defined in config
         * @param {String} newVal
         * @param {String} oldVal
         */
        function autoSetCurrency(newVal, oldVal) {
            if (Config.main.registration.autoSetCurrency.availableList[newVal]) {
                $scope.registrationData.currency_name = Config.main.registration.autoSetCurrency.availableList[newVal];
                if (Config.main.registration.autoSetCurrency.disableChangeAfterSelect) {
                    $scope.currencyDisabled = true;
                }
            } else {
                $scope.currencyDisabled = false;
            }
        }

        /**
         * @description Automatically set promo code if it enabled and defined in config
         * @param {String} newVal
         * @param {String} oldVal
         */
        function autoSetPromoCode(newVal, oldVal) {
            if (Config.main.registration.autoSetPromoCode.dontOverwrite && $scope.registrationData.promo_code) {
                return;
            }
            $scope.registrationData.promo_code = Config.main.registration.autoSetPromoCode.availableList[newVal && newVal.key] || '';
            if (Config.main.registration.autoSetPromoCode.disableChangeAfterSelect) {
                $scope.promoCodeDisabled = true;
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
         * @name regFormInit
         * @methodOf vbet5.controller:RegistrationController
         * @description initializes registration form. Generates years range for select box
         */
        $scope.regFormInit = function regFormInit() {
            if (Config.main.registration.phoneNumberPattern === "string") {
                Config.main.registration.phoneNumberPattern = new RegExp(Config.main.registration.phoneNumberPattern);
            }
            var i, length = new Date().getFullYear() - minimumAllowedAge;
            for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
                $scope.registrationData.years.push(i.toString());
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

            function processRegItem(regItem) {
                //console.log(regItem.name, regItem.type);
                if (regItem.type === 'captcha') {
                    Config.main.registration.hasCaptcha = true;
                    $scope.loadCaptchaImage(regItem);
                }
                if (regItem.defaultValue !== undefined) {
                    $scope.registrationData[regItem.name] = regItem.defaultValue;
                }

                if ((Config.main.registration.hideLabels && regItem.hideLabel === undefined) || regItem.hideLabel) {
                    if (!regItem.labelHidden && regItem.type !== 'select' && regItem.type !== 'captcha') {
                        regItem.placeholder = regItem.title;
                        regItem.title = '';
                        regItem.required = false;
                        regItem.labelHidden = true;
                    }
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
        };

        /**
         * @ngdoc method
         * @name step1DataIsValid
         * @methodOf vbet5.controller:RegistrationController
         * @description Checks if registration step 1 is valid
         */
        $scope.step1DataIsValid = function step1DataIsValid() {
            return step1Fields.reduce(function (prevResult, fieldName) {
                if(fieldName === 'province' || fieldName === 'state'){
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
                .get({phone: $scope.registrationPhoneNumber, currency_name: $scope.registrationData.currency_name}, 'registration_by_phone')
                .then(function (data) {
                    console.log(data);
                    if (data.result === 'OK') {
                        $scope.registrationByPhoneSuccessFul = true;
                        analytics.gaSend('send', 'event', 'slider', 'registration', {'page': $location.path(), 'eventLabel': 'Success'});
                    } else {
                        analytics.gaSend('send', 'event', 'slider', 'registration', {'page': $location.path(), 'eventLabel': 'Failed (' + data.result + ')'});
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
                    analytics.gaSend('send', 'event', 'slider', 'registration', {'page': $location.path(), 'eventLabel': 'Failed (' + failResponse.result + ')'});
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

        $scope.$watch('registrationData.country_id', function (newVal, oldVal) {
            newVal = newVal || oldVal;

            if (!newVal) {
                return;
            }

            setCountryCode(newVal.key);

            if (Config.main.registration.autoSetCurrency && Config.main.registration.autoSetCurrency.enabled) {
                autoSetCurrency(newVal, oldVal);
            }
            if (Config.main.registration.autoSetPromoCode && Config.main.registration.autoSetPromoCode.enabled) {
                autoSetPromoCode(newVal, oldVal);
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
         */
        $scope.preFillRegionalData = function preFillRegionalData(predefinedCountryId) {
            var countryCodeItem;
            if(predefinedCountryId && $scope.countryCodes[predefinedCountryId]) {
                //timeout is not good solution, but this way setting predefined country works
                TimeoutWrapper(function () {
                    countryCodeItem = $scope.countryCodes[predefinedCountryId];
                    countryCodeItem.key = predefinedCountryId;
                    $scope.registrationData.country_id = countryCodeItem;
                    setCountryCode(predefinedCountryId);
                }, 1000);
            } else {
                var city, disabled = false;
                Geoip.getGeoData().then(function (data) {
                    if ($scope.RegConfig.preventChangingCountry && $scope.RegConfig.preventChangingCountry.length && $scope.RegConfig.preventChangingCountry.indexOf(data.countryCode) !== -1) {
                        disabled = true;
                        TimeoutWrapper(function () {
                            $scope.registerform.country_id.disabled = true;
                        }, 1000);
                    } else if (!$scope.registrationData.country_id && data.countryCode && (!Config.main.personalDetails.availableCountriesList || Config.main.personalDetails.availableCountriesList.indexOf(data.countryCode) !== -1)) {
                        countryCodeItem = CountryCodes[data.countryCode];
                        countryCodeItem.key = data.countryCode;
                        city = data.cityName;
                    }
                })['catch'](function (reason) {
                    console.log(reason);
                })['finally'](function () {
                    if (!disabled && !$scope.registrationData.country_id) {
                        if (!countryCodeItem && Config.main.registration.defaultCountryCode) {
                            countryCodeItem = CountryCodes[Config.main.registration.defaultCountryCode];
                            countryCodeItem.key = Config.main.registration.defaultCountryCode;
                            city = CountryCodes[Config.main.registration.defaultCountryCode].city;
                        }
                        $scope.registrationData.country_id = countryCodeItem || $scope.countryCodes[0];

                        $scope.checkIfCountryIsRestricted();

                        $scope.registrationData.city  = $scope.registrationData.city || city || '';

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
             if (Config.main.registration.noWarningForCountries && !(Config.main.registration.noWarningForCountries[$scope.registrationData.country_id && $scope.registrationData.country_id.key] !== undefined)) {
                 $scope.countryIsRestricted = true;
                 $scope.altUrl4RestrictedCountry = Config.main.registration.noWarningForCountries[$scope.registrationData.country_id];
             } else {
                 $scope.countryIsRestricted = false;
             }

             if ($scope.registerform.city != undefined && !$scope.registerform.city.$dirty) {
                 $scope.registrationData.city = $scope.virginRegistrationData.city;
                 $scope.registerform.city.$setPristine();
             }
        };

        /**
         * @ngdoc method
         * @name setDefaultPromoCode
         * @methodOf vbet5.controller:RegistrationController
         * @description Set default promocode it its not been defined before
         */
        function setDefaultPromoCode() {
            var promoCode = $scope.registrationData.promo_code;
            if (!promoCode) {
                if (Config.main.registration.deaultPromocodePerDomain &&
                        Config.main.registration.deaultPromocodePerDomain[$window.location.hostname] !== undefined &&
                        Config.main.registration.deaultPromocodePerDomain[$window.location.hostname].code !== undefined
                        ) {
                    promoCode = Config.main.registration.deaultPromocodePerDomain[$window.location.hostname].code;
                } else if (Config.main.registration.defaultPromoCode && Config.main.registration.defaultPromoCode.length > 0) {
                    promoCode = Config.main.registration.defaultPromoCode;
                }
            }
            if (Config.main.registration.deaultPromocodePerDomain &&
                    Config.main.registration.deaultPromocodePerDomain[$window.location.hostname] &&
                    Config.main.registration.deaultPromocodePerDomain[$window.location.hostname].suffix) {
                promoCode = promoCode + Config.main.registration.deaultPromocodePerDomain[$window.location.hostname].suffix;
            }
            return promoCode;
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
                    phone_number: function () {
                        regInfo.phone = ($scope.registrationData.phone_code && $scope.registrationData.phone_number) ? $scope.registrationData.phone_code + $scope.registrationData.phone_number : '';
                    },
                    promo_code: function () {
                        var promoCode = setDefaultPromoCode();
                        if(promoCode !== "" && promoCode !== undefined){
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
                    }
                };
            customDataType.birth_month = customDataType.birth_day;
            customDataType.birth_year = customDataType.birth_day;

            regInfo.site_id = Config.main.site_id;
            if (Config.main.GmsPlatform) {
                regInfo.language = Utils.getLanguageCode(Config.env.lang);
                regInfo.lang_code = LanguageCodes[regInfo.language];
            } else {
                regInfo.language = Config.env.lang;
                regInfo.lang_code = Config.main.availableLanguages[Config.env.lang]['short'];
            }

            regInfo.ignore_username = (Config.main.registration.simplified && Config.main.registration.type !== 'partial' || Config.main.registration.ignoreUsername) ? "1" : undefined;

            if(Config.main.registration.langCodeAsLanguage) {
                regInfo.lang_code = Config.main.availableLanguages[$scope.registrationData.language]['short'];
            }

            var emailRequired = true;
            function processField(regItem) {
                var fieldName = regItem.name;
                if(fieldName === 'email') {
                    emailRequired = regItem.required;
                }
                if (fieldName in customDataType) {
                    regInfo[fieldName] = customDataType[fieldName].call();
                } else if ($scope.registrationData[fieldName]) {
                    if (fieldName !== 'state' && fieldName !== 'province') {
                        regInfo[fieldName] = $scope.registrationData[fieldName];
                    } else if ($scope.registerform[fieldName]) {
                        regInfo['province'] = $scope.registrationData[fieldName];
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

            if((!regInfo.email || !emailRequired) && !regInfo.username) {
                regInfo.username = regInfo.phone;
                regInfo.ignore_username = undefined;
            }

            regInfo.currency_name = (Config.main.GmsPlatform && Config.main.registration.springCurrencyMap && Config.main.registration.springCurrencyMap[regInfo.currency_name]) || regInfo.currency_name || registrationDefaultCurrency;

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
         * @name register
         * @methodOf vbet5.controller:RegistrationController
         * @description registers the user
         */
        $scope.register = function register() {
            $scope.registration.busy = true;

            if ($scope.registerform.$invalid || ($scope.userAge !== undefined && $scope.userAge < minimumAllowedAge)) {
                $scope.registration.busy = false;
                return;
            }

            if ($scope.countryIsRestricted) {

                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Info',
                    content: 'Registration on this site is not permitted in selected country.'
                });

                $scope.registration.busy = false;
                return;
            }

            Zergling
                .get({user_info: getRegistrationInfo()}, 'register_user')
                .then(
                    function (data) {
                        console.log('registration response:', data);
                        if (data.result === 'OK') {
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
                                    user: $scope.registrationData.username || $scope.registrationData.email || ($scope.registrationData.phone_code + $scope.registrationData.phone_number),
                                    password: $scope.registrationData.password,
                                    action: 'registration_completed'
                                });
                            }
                            if (Config.main.registration.closeSliderAfterRegistration) {
                                $rootScope.$broadcast('slider.close');
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
                            $scope.registerform.$dirty = true;
                            analytics.gaSend('send', 'event', 'slider', 'registration', {
                                'page': $location.path(),
                                'eventLabel': 'Failed (' + data.result + ')'
                            });
                            switch (data.result) {
                            case '-1013': // password is too short
                                $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.tooShort = true;
                                break;
                            case '-1012': // Incorrect phone number
                                $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.invalid = true;
                                break;
                            case '-1134': // Incorrect phone number
                                $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.exist = true;
                                break;
                            case '-1135': // Duplicate BankInfo
                                $scope.registerform.bank_name.$dirty = $scope.registerform.bank_name.$invalid = $scope.registerform.bank_name.$error.exist = true;
                                break;
                            case 1127:
                            case -1127:
                            case '1127':
                            case '-1127': // Duplicate phone number
                                $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.duplicate = true;
                                resetFormFieldErrorOnChange('phone_number', 'duplicate');
                                break;
                            case '-1014': // Failed to send sms
                                $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.failedsms = true;
                                break;
                            case '-1118': // user exists
                                if($scope.registerform.username) {
                                    $scope.registerform.username.$dirty = $scope.registerform.username.$invalid = $scope.registerform.username.$error.exists = true;
                                    resetFormFieldErrorOnChange('username', 'exists');
                                } else if(!$scope.registerform.username && $scope.registerform.email) {
                                    $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                    resetFormFieldErrorOnChange('email', 'exists');
                                } else if(Config.main.registration.simplified && Config.main.registration.type == 'partial') {
                                    $scope.registerform.phone_number.$dirty = $scope.registerform.phone_number.$invalid = $scope.registerform.phone_number.$error.duplicate = true;
                                    resetFormFieldErrorOnChange('phone_number', 'duplicate');
                                } else if(Config.main.registration.simplified) {
                                    $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                    resetFormFieldErrorOnChange('email', 'exists');
                                }
                                break;
                            case '-1119': // email exists
                                $scope.registerform.email.$dirty = $scope.registerform.email.$invalid = $scope.registerform.email.$error.exists = true;
                                resetFormFieldErrorOnChange('email', 'exists');
                                break;
                            case '-1010': // password same as login
                                $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.sameAsLogin = true;
                                break;
                            case '-1123': // dublicate docnum
                                $scope.registerform.doc_number.$dirty = $scope.registerform.doc_number.$invalid = $scope.registerform.doc_number.$error.exists = true;
                                resetFormFieldErrorOnChange('doc_number', 'exists');
                                break;
                            case 21:
                            case '21':
                                $scope.registerform.captcha_text.$dirty = $scope.registerform.captcha_text.$invalid = $scope.registerform.captcha_text.$error.notmatching = true;
                                resetFormFieldErrorOnChange('captcha_text', 'notmatching');
                                break;
                            case -1122:
                            case '-1122':
                                $scope.registerform.personal_id_6.$dirty = $scope.registerform.personal_id_6.$invalid = $scope.registerform.personal_id_6.$error.duplicate = true;
                                resetFormFieldErrorOnChange('personal_id_6', 'duplicate');
                                break;
                            case -2074:
                            case '-2074':
                                if (Config.main.GmsPlatform){
                                    $scope.registerform.password.$dirty = $scope.registerform.password.$invalid = $scope.registerform.password.$error.sameAsLogin = true;
                                }
                            break;
                            default:
                                $scope.registration.failed = Translator.get('Unknown error');
                                break;
                            }
                            var thereAreinvalidStepOneFields = step1Fields.reduce(function (prev, field) { return $scope.registerform[field].$invalid || prev; }, false);
                            if (thereAreinvalidStepOneFields) {
                                $scope.registration.step = 1;
                            }
                        }
                    },
                    function (response) {
                        console.log('registration failed:', response);
                        $scope.registration.failed = response.data;
                    }
                )['finally'](function () {
                    $scope.registration.busy = false;
                });
        };

        /**
         * @ngdoc method
         * @name registrationDone
         * @methodOf vbet5.controller:RegistrationController
         * @description closes the "registration done" message and slider
         */
        $scope.closeRegistrationResult = function closeRegistrationResult() {
            if ($rootScope.env.authorized && Config.main.registration.sliderPageAfterRegistration) {
                if (['deposit', 'withdraw', 'renew', 'cashier', 'casinoBalanceHistory', 'balanceHistory'].indexOf(Config.main.registration.sliderPageAfterRegistration) !== -1) {
                    $location.search({});
                    $rootScope.env.sliderContent = Config.main.registration.sliderPageAfterRegistration;
                    $rootScope.env.showSlider = true;
                } else {
                    $rootScope.env.sliderContent = Config.main.registration.sliderPageAfterRegistration;
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


        //$scope.closeRegistrationResult = function closeRegistrationResult() {
        //    if (!$rootScope.env.authorized) {
        //        $rootScope.env.sliderContent = 'signInForm';
        //    } else if (Config.main.registration.sliderPageAfterRegistration) {
        //        if (['deposit', 'withdraw', 'renew', 'cashier', 'casinohistory', 'history'].indexOf(Config.main.registration.sliderPageAfterRegistration) !== -1) {
        //            $location.path('/balance/' + Config.main.registration.sliderPageAfterRegistration);
        //           $rootScope.env.sliderContent = '';
        //            $rootScope.env.showSlider = false;
        //        } else {
        //            $rootScope.env.sliderContent = Config.main.registration.sliderPageAfterRegistration;
        //        }

        //    } else {
        //        $rootScope.env.sliderContent = '';
        //       $rootScope.env.showSlider = false;
        //    }
        //    $scope.registration.complete = false;
        //    $scope.registration.failed = false;
        //};


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
        $scope.resendEmail  = function resendEmail() {
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
        $scope.keyPress = function keyPress(event){
            if (event.which == 13 || event.keyCode == 13) {
                if((Config.main.registration.type != 'partial') && $scope.registration.step == 1 && $scope.step1DataIsValid()){
                    $scope.registration.step = 2;
                }else if((Config.main.registration.type == 'partial') && $scope.registration.step == 1 ||  $scope.registration.step == 2){
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
        $scope.changeMinimumAge = function(minimumAge){
            if(minimumAllowedAge !== minimumAge){
                minimumAllowedAge = minimumAge;
                updateRegistrationDataYears();
            }
        };

        /**
         * @ngdoc method
         * @name updateRegistrationDataYears
         * @methodOf vbet5.controller:RegistrationController
         * @description Change years dropdown
         */
        function updateRegistrationDataYears(){
            var i, length = new Date().getFullYear() - minimumAllowedAge;
            $scope.registrationData.years = [];
            for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
                $scope.registrationData.years.push(i.toString());
            }
        }
        
        if(Config.main.showCapsLockHint) {
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
        $scope.passwordKeyPress = function passwordKeyPress(event, fieldName){
            if(Config.main.showCapsLockHint){
                var character = String.fromCharCode(event.which);
                if (character.toUpperCase() === character && character.toLowerCase() !== character && !event.shiftKey ) {
                    $scope.capsLockStateHolder[fieldName] = true;
                }else{
                    $scope.capsLockStateHolder[fieldName] = false;
                }
            }
        };

        /**
         * @ngdoc method
         * @name resetFieldError
         * @methodOf vbet5.controller:RegistrationController
         * @description Resets field error
         * @param {String} field name
         */
        $scope.resetFieldError = function resetFieldError(fieldName){
            if(!Config.main.enableResetError) {
                return;
            }
            $scope.registrationData[fieldName] = '';
            $scope.resetError[fieldName] = true;
            $scope.registerform[fieldName].blur = false;
        };

        /**
         * @ngdoc method
         * @name initIovation
         * @methodOf vbet5.controller:RegistrationController
         * @description starts iovation call
         */
        $scope.initIovation = function initIovation() {
            if (Config.main.iovationLoginScripts) {
                angular.forEach(Config.main.iovationLoginScripts, function(iovationScript) {
                    Script(iovationScript + '?registration&' + Date.now());
                });
            }
        };

        /**
         * @ngdoc method
         * @name selectCountryForChangeCurrency
         * @methodOf vbet5.controller:RegistrationController
         * @description select countri for change currency
         */

        Geoip.getGeoData().then(function (data) {
            var country = data.countryCode.toUpperCase();
            var currency = CountryCodes[country] &&  CountryCodes[country].currency;
            if (currency && Config.main.availableCurrencies.indexOf(currency) !== -1) {
                $scope.registrationData.currency_name =  currency;
            }
            setCountryCode(country);
        });
}]);
