VBET5.directive('homepageSearchWidget',['CConfig', function (CConfig) {
    'use strict';

    return {
        restrict: "E",
        templateUrl: "templates/homepage/search.html",
        scope: {
            casino: '=',
            sport: '='
        },

        link: function ($scope) {
            $scope.confData = CConfig;
            $scope.selectTab = function selectTab(tab) {
              $scope.selectedTab = tab;
           };
        }
    };

}])