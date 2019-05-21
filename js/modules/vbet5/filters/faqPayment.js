/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:faqPayment
 * @description Filter config payment systems by selected currency
 *
 */
VBET5.filter('faqPayment', ['Config', function (Config) {
    'use strict';
    var TYPES = [
        'deposit',
        'withdraw'
    ];

    var paymentsConfig = Config.payments;
    var payments = Config.paymentByCurrency || {};

    payments.deposit = payments.deposit || {};
    payments.withdraw = payments.withdraw || {};

    // restoring config from payments config because
    angular.forEach(paymentsConfig, function (payment) {
        if (payment.info) {
            angular.forEach(payment.info, function (info, currency) {

                if (payment.canDeposit && (!payment.depositCurrencies || (payment.depositCurrencies && payment.depositCurrencies.indexOf(currency) !== -1))) {
                    payments.deposit[currency] = payments.deposit[currency] || [];
                    if (payments.deposit[currency].indexOf(payment.name) === -1) {
                        payments.deposit[currency].push(payment.name);
                    }
                }

                if (payment.canWithdraw && (!payment.withdrawCurrencies || (payment.withdrawCurrencies && payment.withdrawCurrencies.indexOf(currency) !== -1))) {
                    payments.withdraw[currency] = payments.withdraw[currency] || [];
                    if (payments.withdraw[currency].indexOf(payment.name) === -1) {
                        payments.withdraw[currency].push(payment.name);
                    }
                }

            });
        }
    });

    return function (paymentSystem, TYPE, currency) {
        var output;
        // check if have given type
        if (TYPES.indexOf(TYPE) === -1) {
            return;
        }
        // check if we have given currency
        if (!payments[TYPE][currency]) {
            return;
        }
        function filterPayment(element) {
            if (payments[TYPE][currency].indexOf(element.name) > -1) {
                return element;
            }
        }

        output = paymentSystem.filter(filterPayment);
        return output;

    };
}]);

