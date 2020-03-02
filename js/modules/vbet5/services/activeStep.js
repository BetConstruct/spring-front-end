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
     * @returns {Object} Active step Config
     *
     * @param {String}  type the type of step
     * @param {int} stepId the step id
     * @param {int} stateId the state id
     */
    ActiveStep.getActiveStep = function getActiveStep (type, stepId, stateId) {
        var result = false;
        if (Config.env.authorized && $rootScope.profile) {
            var activeStep = stepId || $rootScope.profile.active_step;
            var activeState = stateId || $rootScope.profile.active_step_state;
            if (activeStep) {
                angular.forEach(Config.activeStepsConfig, function (stepConfig) {
                    if (type === stepConfig.type) {
                        angular.forEach(stepConfig.steps, function (step) {
                            if (step.step && activeStep === step.step && (!step.state || activeState === step.state)) {
                                result = stepConfig;
                            }
                        });
                    }
                });
            }
        }
        return result;
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
