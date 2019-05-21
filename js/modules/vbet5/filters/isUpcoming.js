/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:isUpcoming
 * @description
 * returns true if passed timestamp is today, false otherwise
 *
 * @param {Number} unix timestamp timestamp in seconds
 * @returns {Boolean} is timestamp today or not
 */
VBET5.filter('isUpcoming', function () {
    'use strict';
    return function (timestamp, type) {
        var dateToCheck = new Date();
        dateToCheck.setTime(timestamp * 1000);
        dateToCheck.setHours(0, 0, 0);

        switch (type) {
        case 'today':
            return Math.abs(new Date().setHours(0, 0, 0) - dateToCheck.getTime()) < 1000;
        case 'tomorrow':
            return Math.abs(new Date().setHours(0, 0, 0) + 86400000 - dateToCheck.getTime()) < 1000;
//        case 'todayOrTomorrow':
        default:
            return (Math.abs(new Date().setHours(0, 0, 0) - dateToCheck.getTime()) < 1000) ||
                   (Math.abs(new Date().setHours(0, 0, 0) + 86400000 - dateToCheck.getTime()) < 1000);
        }

    };
});