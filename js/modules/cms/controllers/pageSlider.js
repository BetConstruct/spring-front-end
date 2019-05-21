/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:cmsPageSliderCtrl
 * @description
 */
VBET5.controller('cmsPageSliderCtrl', ['$scope', '$location', '$sce', '$route', 'content', function ($scope, $location, $sce, $route, content) {
    'use strict';

    $scope.myGamesloaded = false;
    $scope.offset = 0;
    $scope.allItemsCount = 0;

    var allItems;

    $scope.$on('widescreen.on', function () { $scope.itemsToShow = 4; });
    $scope.$on('widescreen.off', function () { $scope.itemsToShow = 3; });

    /**
     * @ngdoc method
     * @name getVisibleItems
     * @methodOf vbet5.controller:cmsPageSliderCtrl
     * @description Returns array of visible items
     *
     * @param {Array} items all items
     * @returns {Array} visible items
     */
    function getVisibleItems(items) {
        return items.slice($scope.offset, $scope.offset + $scope.itemsToShow);
    }


    $scope.loadSliderContent = function loadSliderContent(slug) {
        content
            .getPage(slug, true)
            .then(function (response) {
                $scope.sliderHasContent = response.data && response.data.page && response.data.page.children && response.data.page.children.length;
                if (!$scope.sliderHasContent) {
                    return;
                }
                $scope.sliderTitle = response.data.page.content;
                allItems = response.data.page.children;
                angular.forEach(allItems, function (item) {
                    item.content = $sce.trustAsHtml(item.content);
                    item.link = item.custom_fields.link && item.custom_fields.link[0];
                    if (item.custom_fields.type[0] && item.custom_fields.sport[0] &&  item.custom_fields.region[0] &&  item.custom_fields.competition[0]) {
                        item.link = "#/sport/?type=" + item.custom_fields.type[0] + "&sport=" + item.custom_fields.sport[0] + "&game=" + item.custom_fields.game[0] + "&competition=" + item.custom_fields.competition[0] + "&region=" + item.custom_fields.region[0];
                    }
                    console.log(item);
                });
                $scope.allItemsCount = allItems.length;
                $scope.items = getVisibleItems(allItems);
            });

    };

    /**
     * @ngdoc method
     * @name slide
     * @methodOf vbet5.controller:myGamesCtrl
     * @description Slides visible games left or right by changing $scope's **offset** variable
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slide = function slide(direction) {
        if (direction === 'left') {
//            $scope.lastScrollDirection = 'left';
            if ($scope.offset > 0) {
                $scope.offset--;
            }
        } else if (direction === 'right') {
//            $scope.lastScrollDirection = 'right';
            if ($scope.offset < allItems.length - $scope.itemsToShow) {
                $scope.offset++;
            }
        }
        $scope.items = getVisibleItems(allItems);
        console.log($scope.items);
    };


    /**
     * @ngdoc method
     * @name gotoGame
     * @methodOf vbet5.controller:cmsPageSliderCtrl
     * @description  Navigates to provided game
     *
     * @param {Object} game game object
     */
    $scope.gotoGame = function gotoGame(game) {
        $location.path('/sport');
        $location.search({
            'game' : game.id,
            'sport': game.sport.id,
            'competition': game.competition.id,
            'type': game.type,
            'region': game.region.id
        });
        $route.reload();
    };

}]);
