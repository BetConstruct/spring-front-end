/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:menuVisibleItems
 * @description Changes item visibility depending on menu wrapper width.
 */

VBET5.directive("subMenuCreator", ['DomHelper', "$timeout", "$window", "$rootScope", function (DomHelper, $timeout, $window, $rootScope) {
    'use strict';
    return {
        link: function (scope, element, attrs, ctrl) {
            var watcherPromise, oldWidth = 0;

            var updateSubMenu = function (newVal, oldVal) {
                var menuItems = element[0].children;
                switch (attrs.subMenuCreator) {
                    case 'main':
                    case 'veryTopMenu':
                        scope.subMenuItemCount = 0;
                        break;
                    case 'casino':
                        scope.subMenuItemShowBtn = false;
                        break;
                }

                for (var i = 0; i < menuItems.length; i++) {
                    menuItems[i].className = menuItems[i].className.replace(' sub-menu-item', '');
                }

                if (menuItems[1]) {
                    var index, j;
                    if (attrs.subMenuCreator === 'veryTopMenu') {
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
                            }
                        }
                    }
                    if (attrs.subMenuCreator === 'veryTopMenu') {
                        if (scope.subMenuItemCount > 0) {
                            element.parent().parent().addClass('toggled');
                        } else {
                            element.parent().parent().removeClass('toggled');
                        }
                    }
                }
            };

            scope.$on('$routeChangeSuccess',function(){
                $timeout(updateSubMenu, 10);
            });
            $timeout(function () {  // initial call
                if (element[0].children.length) {
                    updateSubMenu();
                } else {
                    watcherPromise = scope.$watch(function () {
                        return element[0].children.length;
                    }, function() {
                        if (element[0].children.length) {
                            updateSubMenu();
                            watcherPromise();
                        }
                    });
                }
            }, 1000);



            angular.element($window).bind('resize', function () {
                var curerntWidth = element[0].clientWidth;
                if (oldWidth !== curerntWidth) {
                    updateSubMenu();
                }
                oldWidth = curerntWidth;
            });
        }
    }
}]);