/* global VBET5, grecaptcha */
/* jshint -W024 */
VBET5.factory('RecaptchaService', ['$rootScope', '$q', '$timeout', 'WS', function($rootScope, $q, $timeout, WS) {
    'use strict';

    var Recaptcha = {
        version: 0,
        key: ""
    };

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES
    ////////////////////////////////////////////////////////////////////////////////
    var initialized = false;
    var scriptId = "recaptcha-v3-script-id";
    var queue = [];
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE VARIABLES - END
    ////////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    ////////////////////////////////////////////////////////////////////////////////

    function enqueue(func) {
        queue.push(func);
    }

    function dequeueAll() {
        queue.forEach(function(callBack) {
            callBack();
        });
        queue = [];
    }

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
                return callbackFn(arg, opts.check);
            }

            var deferred = $q.defer();

            debounced = $timeout(function() {
                callbackFn(arg, opts.check).then(deferred.resolve);
            }, opts.delay || defaultDelay);

            return deferred.promise;
        };
    }


    function validateWithSwarm(recaptchaToken, actionName) {
        return WS.sendRequest({command: "validate_recaptcha", params:{ g_recaptcha_response: recaptchaToken, action: actionName }});
    }

    function execute(actionName, check) {
        actionName = actionName.replace(/[^A-Za-z/_]/g, ""); // may only include "A-Za-z/_"

        // We call resolve instead of reject because grecaptcha.execute is not a promise, but a 'thenable'
        if (Recaptcha.key && Recaptcha.version === 3) {
            if (initialized) {
                return grecaptcha.execute(Recaptcha.key, {action: actionName}).then(function executeSuccess(token) {
                    if (check) {
                        return token;
                    } else {
                        return validateWithSwarm(token, actionName);
                    }
                });
            } else {
                var key = Recaptcha.key;
                return $q(function(resolve, reject) {
                    enqueue(function() {
                        grecaptcha.execute(key, {action: actionName}).then(function executeSuccess(token) {
                            if (check) {
                                resolve(token);
                            } else {
                                validateWithSwarm(token, actionName).then(function (response) {
                                    resolve(response);
                                }, function (error) {
                                    reject(error);
                                });
                            }
                        });
                    });
                });
            }
        } else {
            return $q.resolve();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS - END
    ////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    ////////////////////////////////////////////////////////////////////////////////

    Recaptcha.init = function init(key, version) {
        if (Recaptcha.key) {
            if (Recaptcha.key !== key) {
                initialized = false;
                var attachedScript = document.getElementById(scriptId);
                if (attachedScript) {
                    attachedScript.remove();
                }
            } else {
                return;
            }
        }
        Recaptcha.version = version;
        Recaptcha.key = key;

        $rootScope.$broadcast("recaptcha_version", {
            version: version,
            key: key
        });

        if (version === 3) {
            var script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://www.recaptcha.net/recaptcha/api.js?render=' + Recaptcha.key;

            script.onload = function onloadCallback() {
                grecaptcha.ready(function() {
                    initialized = true;

                    dequeueAll();
                });
            };

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        }
    };

    // Returns a 'thenable' when called
    Recaptcha.execute = debounce(execute);
    ////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS - END
    ////////////////////////////////////////////////////////////////////////////////

    return Recaptcha;
}]);
