/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:allowedPayments
 * @description match to profile allowed currencies
 *
 */
VBET5.filter('allowedPayments', ['$rootScope', function ($rootScope) {
    'use strict';
    var TYPES = [
        'deposit',
        'withdraw'
    ];

    return function (paymentSystems, type) {
        var payments = $rootScope.profile.paymentSystems,
            output;
        if (!payments) {
            return [];
        }
        if (!TYPES.indexOf || TYPES.indexOf(type) === -1) {
            return;
        }
        function filterPayment(element) {
            if (!payments[type] || !payments[type].indexOf) {
                return;
            }
            if (payments[type].indexOf(element.name) > -1 || payments[type].indexOf(element.displayName) > -1) {
                return element;
            }
        }

        output = paymentSystems.filter(filterPayment);
        return output;

    };
}]);

