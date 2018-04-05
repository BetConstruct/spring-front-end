/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:menuVisibleItems
 * @description Changes item visibility depending on menu wrapper width.
 */

VBET5.directive("subMenuCreator", [function () {
    'use strict';
    return {

        link: function (scope, element, attrs) {

            var updateSubMenu = function () {
                var menuItems = element[0].children;

                var setItemsClasses = function () {
                    for (var i = 0; i < menuItems.length; i++) {
                        menuItems[i].className = menuItems[i].className.replace(' sub-menu-item', '');
                    }
                };

                switch (attrs.subMenuCreator) {
                    case 'main':
                    case 'veryTopMenu':
                        scope.subMenuItemCount = 0;
                        setItemsClasses();
                        break;
                    case 'casino':
                        scope.subMenuItemShowBtn = false;
                        setItemsClasses();
                        break;
                    case 'newsWidget':
                        var invisibleItems = 0;
                        break;
                }

                if (menuItems[1]) {
                    var index, j;
                    if (attrs.subMenuCreator === 'veryTopMenu' || attrs.subMenuCreator === 'newsWidget') {
                        index = 0;
                        j = 1;
                    } else {
                        index = 1;
                        j = 2;
                    }
                    for (j; j < menuItems.length; j++) {
                        var item = menuItems[j].getBoundingClientRect(),
                            secondItem = menuItems[index].getBoundingClientRect();
                        if (secondItem.top < item.top) {
                            switch (attrs.subMenuCreator) {
                                case 'main':
                                case 'veryTopMenu':
                                    menuItems[j].className += ' sub-menu-item';
                                    scope.subMenuItemCount += 1;
                                    break;
                                case 'casino':
                                    scope.subMenuItemShowBtn = true;
                                    break;
                                case 'newsWidget':
                                    invisibleItems++;
                                    break;
                            }
                        }
                    }
                    if (attrs.subMenuCreator === 'veryTopMenu') {
                        if (scope.subMenuItemCount > 0) {
                            element.parent().parent().addClass('toggled');
                        } else {
                            element.parent().parent().removeClass('toggled');
                        }
                    } else if (attrs.subMenuCreator === 'newsWidget') {
                        scope.$emit('update.count', menuItems.length - invisibleItems - 2);
                    }
                }
            };

            scope.$on('$routeChangeSuccess',function(){
                updateSubMenu();
            });

            scope.$watch(function() {return element[0].clientWidth}, function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    updateSubMenu();
                }
            });
        }
    }
}]);