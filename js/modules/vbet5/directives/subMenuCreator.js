/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:menuVisibleItems
 * @description Changes item visibility depending on menu wrapper width.
 */

VBET5.directive("subMenuCreator", [function() {
    'use strict';
    return {
        link: function(scope, element, attrs) {

            var CLASS_NAME = 'sub-menu-item';

            function setItemClass(menuItem) {
                menuItem.classList.add(CLASS_NAME);
            }

            function clearItemsClass(menuItems) {
                menuItems.forEach(function (item) {
                    item.classList.remove(CLASS_NAME);
                });
            }

            function calculateSubMenuItems(menuItems, firstItemIndex) {
                var firstItemTop = menuItems[firstItemIndex].offsetTop;
                for (var i = firstItemIndex + 1; i < menuItems.length; i++) {
                    if (firstItemTop < menuItems[i].offsetTop) {
                        return menuItems.slice(i);
                    }
                }
                return [];
            }

            function updateSubMenu() {
                var subMenuItems = [];

                var menuItems = Array.prototype.slice.call(element[0].children, 0);
                clearItemsClass(menuItems);

                if (menuItems.length > 1) {
                    var firstItemIndex;

                    switch (attrs.subMenuCreator) {
                        case 'main':
                            firstItemIndex = 1;

                            subMenuItems = calculateSubMenuItems(menuItems, firstItemIndex);
                            subMenuItems.forEach(setItemClass);

                            scope.subMenuItemCount = subMenuItems.length;
                            break;
                        case 'veryTopMenu':
                            firstItemIndex = 0;

                            subMenuItems = calculateSubMenuItems(menuItems, firstItemIndex);
                            subMenuItems.forEach(setItemClass);

                            scope.subMenuItemCount = subMenuItems.length;
                            if (scope.subMenuItemCount > 0) {
                                element.parent().parent().addClass('toggled');
                            } else {
                                element.parent().parent().removeClass('toggled');
                            }
                            break;
                        case 'casino':
                            firstItemIndex = 1;

                            scope.subMenuItemShowBtn = false;
                            scope.subMenuItemShowBtn = !!calculateSubMenuItems(menuItems, firstItemIndex).length; //exist element in sub menu
                            break;
                        case 'newsWidget':
                            firstItemIndex = 0;

                            var invisibleItems = calculateSubMenuItems(menuItems, firstItemIndex).length;

                            scope.$emit('update.count', menuItems.length - invisibleItems - 2);
                    }
                }
            }

            scope.$on('$routeChangeSuccess', updateSubMenu);

            scope.$watch(function () {
                var value = element[0].clientWidth + element[0].childNodes.length; // menu width  + menu items count
                if (element[0].children[1]) {
                    value += element[0].children[1].offsetWidth; //fonts late load case
                }
                return value;
            }, function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    updateSubMenu();
                }
            });
        }
    };
}]);