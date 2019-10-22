/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.controller:recaptchaCtrl
 * @description
 *
 * recapcha controller
 *
 */
VBET5.controller('recaptchaCtrl', ['$rootScope', '$scope', 'Zergling', 'LanguageCodes', function ($rootScope, $scope, Zergling, LanguageCodes) {
    'use strict';
    $scope.recaptcha = {};

    var recaptchaProps = {};
    $rootScope.$broadcast('recaptcha.response', '');

    /**
     * @ngdoc method
     * @name loadScript
     * @methodOf vbet5.controller:recaptchaCtrl
     * @description load recaptcha script
     */
    function loadScript () {
        recaptchaProps.script = document.createElement('script');
        recaptchaProps.script.type = 'text/javascript';
        recaptchaProps.script.src = 'https://www.recaptcha.net/recaptcha/api.js?hl=' + (LanguageCodes[$rootScope.env.lang] || 'en');
        recaptchaProps.recaptchaDomScript = document.body.appendChild(recaptchaProps.script);

    }

    /**
     * @ngdoc method
     * @name loadScript
     * @methodOf vbet5.controller:recaptchaCtrl
     * @description initialization
     */
    function init() {
        window.recaptchaUpdateCallback = function recaptchaUpdateCallback(response) {
            $rootScope.$broadcast('recaptcha.response', response);
        };

        recaptchaProps.key = '';
        $scope.recaptcha.loading = true;
        Zergling.get({}, 'recaptcha_sitekey').then(function (data) {
            console.log('recaptcha key', data);
            $scope.recaptcha.key = data.result;
            if (!$scope.recaptcha.key) {
                showRecaptchaError();
                return;
            }
            loadScript();
        }, function (failResponse) {
            console.log('recaptcha error', failResponse);
            showRecaptchaError();
        })['finally'](function () {
            $scope.recaptcha.loading = false;
        });
    }

    /**
     * @ngdoc method
     * @name showRecaptchaError
     * @methodOf vbet5.controller:recaptchaCtrl
     * @description Show recaptcha loading error and closes registration form
     */
    function showRecaptchaError () {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "error",
            title: "Error",
            content: "Unable to load recaptcha. Please try again or contact support if the issue persists.",
            hideCloseButton: true,
            buttons: [
                {
                    title: 'Close',
                    callback: function () {
                        $rootScope.env.sliderContent = '';
                        $rootScope.env.showSlider = false;
                    }
                }
            ]
        });
    }

    $scope.$on('recaptcha.reload',function() {
        window.Recaptcha && window.Recaptcha.reload && window.Recaptcha.reload();
        window.grecaptcha && window.grecaptcha.reset && window.grecaptcha.reset();
    });

    $scope.$on('$destroy',function() {
        if (recaptchaProps.recaptchaDomScript) {
            document.body.removeChild(recaptchaProps.recaptchaDomScript);
        }
        delete window.recaptchaUpdateCallback;
    });
    init();
}]);
