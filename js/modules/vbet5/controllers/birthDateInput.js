/**
 * @ngdoc controller
 * @name vbet5.controller:birthDateInputCtrl
 */
VBET5.controller('birthDateInputCtrl', ['$scope', 'Config', function ($scope, Config) {
    'use strict';

    var REG_FORM_BIRTH_YEAR_LOWEST = new Date().getFullYear() - 110;
    var minimumAllowedAge = Config.main.registration.minimumAllowedAge;

    $scope.dateData = {
        birth_day: '01',
        birth_month: Config.main.monthNames[0]
    };

    /**
     * @ngdoc method
     * @name dateInputInit
     * @methodOf vbet5.controller:birthDateInputCtrl
     * @description init function.
     */
    function dateInputInit(){
        var i, length = new Date().getFullYear() - minimumAllowedAge;
        $scope.dateData.years = [];
        for (i = length; i >= REG_FORM_BIRTH_YEAR_LOWEST; i -= 1) {
            $scope.dateData.years.push(i.toString());
        }
        $scope.dateData.birth_year = $scope.dateData.years[0];
    }

    $scope.getBirthDate = function getBirthDate() {
        return $scope.dateData.birth_year + '-' + $scope.dateData.birth_month.val + '-' + $scope.dateData.birth_day;
    };

    dateInputInit();

}]);
