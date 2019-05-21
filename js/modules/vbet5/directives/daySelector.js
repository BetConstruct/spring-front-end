/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:daySelector
 * @description
 *          Fills html SELECT with days of month(padded with 0),
 *          taking into account selected month and year
 *          (number of days in month and year's "leapness")
 *
 *
 * example:
 *
 *
 * &lt;select ng-model="registrationData.birth_day" day-selector month-model="registrationData.birth_month" year-model="registrationData.birth_year" options="days" ng-options="d for d in days"&gt;&lt;/select&gt;
 *
 * @param {String} month-model name of model(variable) with selected month value
 * @param {String} options name of model(array) for all possible options (days)
 * @param {String} [year-model] optional. name of model(variable) with selected year value.  if not specified February will always have 29 days.
 */
VBET5.directive('daySelector', function () {
    'use strict';
    return {
        restrict: 'A',
        scope: {
            ngModel: '=',
            options: '=',
            monthModel: '=',
            yearModel: '=',
            tmpDay: "="
        },
        require: 'ngModel',
        link: function (scope) {

            var i, daysInMonth = {'01': 31, '02': 29, '03': 31, '04': 30, '05': 31, '06': 30, '07': 31, '08': 31, '09': 30, '10': 31, '11': 30, '12': 31};

            // initial
            scope.options = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15',  '16', '17', '18', '19', '20', '21', '22', '23', '24',  '25', '26', '27', '28', '29', '30', '31'];

            var isYearLeap = function isYearLeap(year) { return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0); };

            var updateDaysOptions = function () {
                if (!scope.monthModel) {
                    return;
                }

                scope.options = [];
                var includeFeb29 = scope.yearModel === undefined || (scope.yearModel !== undefined && isYearLeap(scope.yearModel));
                for (i = 1; i <= daysInMonth[scope.monthModel]; i++) {
                    if (!includeFeb29 && i === 29 && parseInt(scope.monthModel, 10) === 2) {
                        continue;
                    }
                    i = i.toString();
                    scope.options.push(i.length < 2 ? '0' + i : i);
                }
                if (scope.options.indexOf(scope.ngModel) === -1) {
                    scope.ngModel = undefined;
                } else if (scope.tmpDay) {
                    scope.ngModel = scope.tmpDay;
                }
            };
            scope.$watch('monthModel', function(value) {
                if (value) {
                    updateDaysOptions();
                }
            });
            scope.$watch('yearModel', function(value) {
                if (value) {
                    updateDaysOptions();
                }
            });
        }
    };
});