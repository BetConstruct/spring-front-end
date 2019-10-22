/* global VBET5, grecaptcha */
/* jshint -W024 */
VBET5.factory('RecaptchaService', ['$rootScope', '$q', '$timeout', 'WS', 'Storage', function($rootScope, $q, $timeout, WS, Storage) {
    'use strict';

    var Recaptcha = {
        version: 0,
        key: ""
    };

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    var _initialized = false;
    var _scriptAttached = false;
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    ////////////////////////////////////////////////////////////////////////////////
    function debounce(callbackFn) {
        // callbackFn must return either a promise or a 'thenable'
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
                if (opts.cancelLastExecution) {
                    return $q.resolve();
                }
            }

            if (opts.debounce === false) {
                return callbackFn(arg);
            }

            var deferred = $q.defer();

            debounced = $timeout(function() {
                callbackFn(arg).then(deferred.resolve);
            }, opts.delay || defaultDelay);

            return deferred.promise;
        };
    }


    function validateWithSwarm(recaptchaToken, actionName) {
        return WS.sendRequest({command: "validate_recaptcha", params:{ g_recaptcha_response: recaptchaToken, action: actionName }});
    }


    function execute(actionName) {
        // We call resolve instead of reject because grecaptcha.execute is not a promise, but a 'thenable'
        if (!_initialized) { return $q.resolve(); }

        return grecaptcha.execute(Recaptcha.key, {action: actionName}).then(function executeSuccess(token) {
            return validateWithSwarm(token, actionName);
        });
    }

    function onInitExecution(withValidation) {
        return withValidation ? execute('session_opened') : grecaptcha.execute(Recaptcha.key, {action: 'session_opened'});
    }
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////////////////////////////////////
    Recaptcha.init = function init(key, version, withValidation) {
        var deferred = $q.defer();

        Recaptcha.version = version;
        Recaptcha.key = key;

        Storage.set('recaptcha_' + $rootScope.conf.site_id, {key: key, version: version});

        if (version !== 3) {
            deferred.resolve();
        } else if (_scriptAttached) {
            onInitExecution(withValidation).then(deferred.resolve);
        } else {
            var script = document.createElement('script');
            script.src = 'https://www.recaptcha.net/recaptcha/api.js?render=' + Recaptcha.key;

            script.onload = function onloadCallback() {
                grecaptcha.ready(function() {
                    _initialized = true;
                    onInitExecution(withValidation).then(deferred.resolve);
                });
            };

                script.onerror = deferred.resolve;

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);

            _scriptAttached = true;
        }

        return deferred.promise;
    };

    // Returns a 'thenable' when called
    Recaptcha.execute = debounce(execute);
    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS - END
    ////////////////////////////////////////////////////////////////////////////////

    return Recaptcha;
}]);
