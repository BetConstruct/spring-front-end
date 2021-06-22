VBET5.controller("quizCtrl",['$rootScope', '$scope', 'Config', function ($rootScope, $scope, Config) {
    'use strict';
    $scope.addLoginWatcher = function addLoginWatcher(add) {
        if (add) {
            $scope.$watch("env.authorized", function (newValue) {
                if (!newValue) {
                    $rootScope.env.showSlider = true;
                    $rootScope.env.sliderContent = 'login';
                }
            });
        }

    };


}]);
