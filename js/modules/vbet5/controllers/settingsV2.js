/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:userDataInputCtrl
 * @description
 * settings version 2 controller
 */
VBET5.controller('settingsV2Ctrl', ['$rootScope', '$scope', 'Zergling', 'RegConfig', 'Config', 'Translator', function ($rootScope, $scope, Zergling, RegConfig, Config, Translator) {
    'use strict';

    $scope.userInputFields = [];
    $scope.registrationData = {};
    $scope.regFields = {};
    $scope.showFieldsValidation = true;

    var REG_FORM_BIRTH_YEAR_LOWEST = new Date().getFullYear() - 110;
    var minimumAllowedAge = Config.main.registration.minimumAllowedAge;

    /**
     * @ngdoc method
     * @name getFieldByName
     * @methodOf vbet5.controller:settingsV2Ctrl
     * @description Get fields info copy
     * @param {String} Field name
     */
    function getFieldByName (field) {
        if ($scope.regFields[field]) {
            return angular.copy($scope.regFields[field]);
        }
        return;
    }

    /**
     * @ngdoc method
     * @name updateRegistrationDataYears
     * @methodOf vbet5.controller:settingsV2Ctrl
     * @description Update data years
     */
    function updateRegistrationDataYears(){
        $scope.registrationData.years = [];
        var i, length = new Date().getFullYear() - minimumAllowedAge;
        $scope.registrationData.years = [];
        for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
            $scope.registrationData.years.push(i.toString());
        }
    }

    /**
     * @ngdoc method
     * @name initUserInput
     * @methodOf vbet5.controller:settingsV2Ctrl
     * @description Initialization. Get registration data for settings page
     */
    function initUserInput () {
        angular.forEach(RegConfig, function (regSide) {
            angular.forEach(regSide, function (regItem) {
                $scope.regFields[regItem.name] = regItem;
            });
        });

        if ($rootScope.profile && $rootScope.profile.incorrect_fields) {
            angular.forEach($rootScope.profile.incorrect_fields, function (value, field) {

                switch (field) {
                    case 'birth_date':
                        updateRegistrationDataYears();

                        $scope.userInputFields.push(getFieldByName('birth_day'));
                        $scope.userInputFields.push(getFieldByName('birth_month'));
                        $scope.userInputFields.push(getFieldByName('birth_year'));
                        break;
                    default:
                        $scope.userInputFields.push(getFieldByName(field));
                        $scope.registrationData[field] = value;
                }
            });

            $scope.userInputFields.push(getFieldByName('password'));
        }
    }

    /**
     * @ngdoc method
     * @name saveUserData
     * @methodOf vbet5.controller:settingsV2Ctrl
     * @description Send user data to backend
     */
    $scope.saveUserData = function saveUserData () {

        if ($scope.registerform.$invalid) {
            return;
        }

        var saveData = {};

        angular.forEach($scope.userInputFields, function (field) {
            switch (field.name) {
                case 'birth_day':
                case 'birth_month':
                case 'birth_year':
                    saveData['birth_date'] = $scope.registrationData['birth_day'] + '-' + $scope.registrationData['birth_month'] + '-' + $scope.registrationData['birth_year'];
                    break;
                default:
                    saveData[field.name] = $scope.registrationData[field.name];
            }
        });

        var request = {
            user_info: saveData
        };

        Zergling.get(request, 'update_user').then(function (response) {
            $scope.working = false;
            if (response.result === 0) {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'success',
                    title: 'Success',
                    content: 'Personal information updated.'
                });
                $rootScope.env.showSlider = false;
                $rootScope.env.sliderContent = '';

            } else if (response.result === '-1002' || response.result === '-1003') {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'Wrong Password' // No need to translate since its translated on the dialog side already
                });
            } else if (response.result === '-1119') {
                $scope.detailsForm.email.$invalid = $scope.detailsForm.email.$error.dublicate = true;
            } else if (response.result === '-1123') {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'Passport Number is already registered for another account' // No need to translate since its translated on the dialog side already
                });
            }
            console.log(response);
        })['catch'](function (response) {
            $scope.working = false;
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: Translator.get('Error occured') + ' : ' + response.data
            });
            console.log(response);
        });
    };

    initUserInput();
}]);
