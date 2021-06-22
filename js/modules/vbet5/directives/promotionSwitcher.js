VBET5.directive("promoSwitcher", ['Config', function (Config) {
    return {
        restrict: "E",
        templateUrl: "templates/directive/promo-switcher.html",
        scope: {
            "category": "@?",
            "template": "@?",
            "count": "@?",
            "categoryJsonType": "@?"
        },
        link: function ($scope) {
            $scope.isNew = Config.main.promoVersion === 2;


        }
    };
}]);
