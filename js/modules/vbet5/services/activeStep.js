/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:ActiveStep
 * @description
 *
 * process profile active step
 *
 */
VBET5.service('ActiveStep', ['$rootScope', 'Config', function ($rootScope, Config) {
    'use strict';
    var ActiveStep = {};

    /**
     * @ngdoc function
     * @name getActiveStep
     * @methodOf vbet5.service:ActiveStep
     * @description Get active step from profile for selected type
     * @returns {String} Active step type
     */
    ActiveStep.getActiveStep = function getActiveStep (type) {

        //$rootScope.profile = $rootScope.profile || {};
        //$rootScope.profile.active_step = 3;
        //$rootScope.profile.active_step_state = 5;

        var ret = false;
        if (Config.env.authorized && $rootScope.profile && $rootScope.profile.active_step) {
            angular.forEach(Config.activeStepsConfig, function (stepConfig) {
                angular.forEach(stepConfig.steps, function (step) {
                    if (step.step && step.state ? $rootScope.profile.active_step === step.step && $rootScope.profile.active_step_state == step.state : $rootScope.profile.active_step === step.step) {
                        if (type === stepConfig.type) {
                            ret = stepConfig;
                        }
                    }
                });
            });

        }
        return ret;
    };

    /**
     * @ngdoc function
     * @name getNotificationPopup
     * @methodOf vbet5.service:ActiveStep
     * @description Get notification popup data instance for selected step type
     * @returns {String} Active step type
     */
    ActiveStep.getNotificationPopup = function (type) {
        var step = ActiveStep.getActiveStep(type), popup = undefined;
        if (step.popup) {
            popup = angular.copy(step.popup || {});
            popup.show = true;
        }
        return popup;
    };

    /**
     * @ngdoc function
     * @name resetProfileData
     * @methodOf vbet5.service:ActiveStep
     * @description Reset profile data once active step is used
     */
    ActiveStep.resetProfileData = function resetProfileData() {
        if ($rootScope.profile) {
            $rootScope.profile.active_step = undefined;
            $rootScope.profile.active_step_state = undefined;
        }
    };

    return ActiveStep;
}]);
