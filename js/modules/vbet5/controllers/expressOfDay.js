/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:expressOfDayCtrl
 * @description  controller for express of day
 */

VBET5.controller('expressOfDayCtrl', ['$scope', '$location', 'Zergling', function ($scope, $location, Zergling) {

    (function init() {
        var MAX_COL_COUNT = $location.path() === '/expressofday/'?4:3;
        $scope.notVisibleContainer = {
            count: 0,
            columnsCount: {},
            map: {},
            increaseCount: function (id) {
                ++this.count;
                this.map[id] = true;
                $scope.columns.forEach(function (col, index){
                    var filteredItems = col.filter(function (item) {
                        return item.Id === id;
                    });
                    if (filteredItems.length > 0) {
                        if(!$scope.notVisibleContainer.columnsCount[index]) {
                            $scope.notVisibleContainer.columnsCount[index] = 1;
                        } else {
                            $scope.notVisibleContainer.columnsCount[index] += 1;
                        }
                        if (col.length === $scope.notVisibleContainer.columnsCount[index]) {
                            --$scope.columnsLength;
                        }
                    }
                });
            }
        };
        $scope.loading = true;
        $scope.columns = [];
        Zergling.get({}, "get_predefined_multiples").then(function (res) {

            $scope.expresses = res.result === 0? res.details.filter(function (item){
                return item.Selections.length > 0;
            }): [];

            var length = $scope.expresses.length;
            var j = 0;
            for (var i = 0; i < length; ++i) {
                if (!$scope.columns[j]) {
                    $scope.columns[j] = [];
                }
                $scope.columns[j].push($scope.expresses[i]);
                j = (j + 1) % MAX_COL_COUNT;

            }
            $scope.columnsLength = $scope.columns.length;
            $scope.maxColCount = MAX_COL_COUNT;
        })['finally'](function () {
            $scope.loading = false;
        });
    })();
}
]);
