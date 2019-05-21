/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:TimeoutWrapper
 * @description TimeoutWrapper service
 * TimeoutWrapper is used instead of angular's $timeout service
 * it covers timeout canceling when scope is being destroyed
 * Usage -
 * before calling the TimeoutWrapper function TimeoutWrapper.init function should be called with passing scope to that function
 * TimeoutWrapper is used just like $timeout function with same properties and TimeoutWrapper.cancel is canceling the timeout functionality like $timeout.cancel
 */
VBET5.service('TimeoutWrapper', ['$timeout', function ($timeout) {
    'use strict';

    function getInstance() {

        var currentScope, timeoutPromises = [];
        /**
         * TimeoutWrapper()
         * @description the function take and return the same params which $timeout do
         * @param fn
         * @param delay
         * @param invokeApply
         * @returns {*}
         */
        var timeout = function (fn, delay, invokeApply) {
            var promise = $timeout(fn, delay, invokeApply);
            timeoutPromises.push(promise);
            return promise;
        };

        /**
         * TimeoutWrapper.init
         * call this function in the start of the controller
         * @param scope
         */
        timeout.init = function (scope) {
            currentScope = scope;
            currentScope.$on('$destroy', function () {
                for (var i = 0; i < timeoutPromises.length; ++i) {
                    $timeout.cancel(timeoutPromises[i]);
                }
            });
        };

        /**
         * TimeoutWrapper.cancel
         * @param promise
         * @returns {boolean}
         */
        timeout.cancel = function (promise) {
            if (promise) {
                var index = timeoutPromises.indexOf(promise);
                if (-1 !== index) {
                    timeoutPromises.splice(index, 1);
                    return $timeout.cancel(promise);
                }
            }

            return false;
        };

        return timeout;
    }

    var timeout = function ($scope) {
        var wrapper = getInstance();
        wrapper.init($scope);
        return wrapper;
    };
    return timeout;

}]);
