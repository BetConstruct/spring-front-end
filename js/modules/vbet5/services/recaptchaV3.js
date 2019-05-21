/* global VBET5, grecaptcha */
/* jshint -W024 */
VBET5.factory('RecaptchaV3', ['$rootScope', '$q', '$timeout', 'Zergling', 'Storage', 'Config', function recaptchaV3($rootScope, $q, $timeout, Zergling, Storage, Config) {
    'use strict';

    var Recaptcha = {};

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    var _initialized = false;
    var _key = {
        value: Storage.get('recaptcha_sitekey'),
        expiration: 3600000 // 3600000 ms = 1 hour
    };
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    ////////////////////////////////////////////////////////////////////////////////
    function debounce(callbackFn) {
        var debounced, defaultDelay = 3000;

        /*
            {Object} opts - Options
            {Boolean} opts.cancelLastExecution - if true cancels last execution and exits the function
            {Boolean} opts.debounce - if false calls the function immediately w/out timeout
            {Number} opts.delay - debounce delay
         */
        return function(arg, opts) {
            opts = opts || {};

            if (debounced) {
                $timeout.cancel(debounced);
                if (opts.cancelLastExecution) { return; }
            }

            if (opts.debounce === false) {
                callbackFn(arg);
            } else {
                debounced = $timeout(function() {
                    callbackFn(arg);
                }, opts.delay || defaultDelay);
            }
        };
    }


    function getRecaptchaKey() {
        var deferred = $q.defer();
        if (_key.value) {
            deferred.resolve(_key.value);
        } else {
            Zergling.get({}, 'recaptcha_sitekey').then(function recaptchaSuccess(data) {
                _key.value = data.result;
                if (window.location.hostname !== 'localhost') {
                    Storage.set('recaptcha_sitekey', _key.value, _key.expiration);
                }
                deferred.resolve(_key.value);
            }).catch(deferred.reject);
        }

        return deferred.promise;
    }


    function validateWithSwarm(actionName, grecaptchaResponse) {
        Zergling.get({ g_recaptcha_response: grecaptchaResponse, action: actionName }, 'validate_recaptcha');
    }


    function execute(actionName) {
        if (!_initialized) { return; }

        grecaptcha.execute(_key.value, {action: actionName}).then(function executeSuccess(token) {
            validateWithSwarm(actionName, token);
        });
    }
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////////////////////////////////////
    Recaptcha.init = function init() {
        if (!Config.main.recaptchaV3) { return; }

        getRecaptchaKey().then(function attachScript(key) {
            var script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=' + key;
            script.onload = function onloadCallback() {
                grecaptcha.ready(function() {
                    _initialized = true;
                    execute('session_opened');
                });
            };

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        });
    };


    Recaptcha.execute = debounce(execute);
    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS - END
    ////////////////////////////////////////////////////////////////////////////////

    return Recaptcha;

}]);
