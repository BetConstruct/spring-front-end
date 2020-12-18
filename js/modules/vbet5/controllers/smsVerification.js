angular.module('vbet5.betting').controller('smsVerificationCtrl', ['$rootScope', '$scope', 'Zergling', 'Config', function($rootScope, $scope, Zergling, Config) {
    "use strict";

    function resetFormFieldErrorOnChange() {
        var unWatch = $scope.$watch('state.confirmationCode', function (val, newVal) {
            if (val === newVal) {
                return;
            }
            $scope.forms.smsVerification.confirmation_code.$setValidity("invalid", true);
            $scope.state.error = "";
            unWatch();
        });
    }

    function showError() {
        $scope.forms.smsVerification.confirmation_code.$dirty = true;
        $scope.forms.smsVerification.confirmation_code.$invalid = true;
        $scope.forms.smsVerification.confirmation_code.$error.invalid = true;
        $scope.forms.smsVerification.confirmation_code.$touched = true;

        resetFormFieldErrorOnChange();
    }

    function sendSMS (state) {
        return $scope.state.type === 1 ? Zergling.get( {action_type: state.type, phone_number: state.userIdentifier}, 'send_sms_to_phone_number') :
            Zergling.get( {action_type: state.type, login: state.userIdentifier}, 'send_sms_with_username');
    }

    $scope.handleSubmit = function handleSubmit(code) {
        $scope.state.successCallBack(code);
        $rootScope.broadcast('globalDialogs.removeDialogsByTag', 'SMS_VERIFICATION_POPUP');
    };

    $scope.getCode = function getCode() {
        $scope.sendingInProgress = true;
        sendSMS($scope.state).then(function(response) {
            if (response.result === 0) {
                $scope.countdownTime = Math.round(Date.now() / 1000) + (Config.main.smsVerification.timer || 25);
            } else {
                $scope.state.error = response.result_text || "Failed to send sms";
                showError();
            }
        })['finally'](function () {
            $scope.sendingInProgress = false;
        });
    };

    $scope.countdownCompleteCallBack = function countdownCompleteCallBack() {
        $scope.countdownTime = 0;
    };

    $scope.formInit = function formInit() { //handle DOM element init to be able to access form properties
        $scope.state = $scope.activeDialog.state;

        if ($scope.state.error) {
            showError();
        }
    };
}]);
