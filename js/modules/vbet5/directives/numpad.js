/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:numpad
 * @description displays numpad next to element on click
 *
 */
VBET5.directive('numpad', ['$compile', 'Config', function ($compile, Config) {
    'use strict';

    var numpads = [];
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {},
        link: function link(scope, element, attrs, ctrl) {

            if (attrs.numpadForce !== undefined) {
                if (!Config.main.forceNumpadAttr) {
                    return;
                }
            } else {
                if (Config.betting.disableNumpad) {
                    return;
                }
            }

            numpads.push(attrs.id);
            scope.elemId = attrs.id;
            scope.isShow = false;
            scope.setKeyValue = function setKeyValue(keyValue) {
                if (keyValue === -1) {
                    if (ctrl.$viewValue.length > 0 && ctrl.$viewValue !== undefined && !isNaN(ctrl.$viewValue)) {
                        ctrl.$setViewValue(ctrl.$viewValue.slice(0, -1));
                        if (ctrl.$viewValue.length === 0) {
                            ctrl.$setViewValue(0);
                        }
                    }
                } else if (ctrl.$viewValue === undefined || isNaN(ctrl.$viewValue)) {
                    ctrl.$setViewValue(keyValue.toString());
                } else {
                    ctrl.$setViewValue(ctrl.$viewValue + keyValue.toString());
                }
                ctrl.$render();
            };
            element.on('click', function (event) {
                angular.element(document.getElementById('numped-wrapper-' + scope.elemId)).removeClass('ng-hide');
                angular.forEach(numpads, function (num) {
                    if (num !== scope.elemId) {
                        angular.element(document.getElementById('numped-wrapper-' + num)).addClass('ng-hide');
                    }
                });
                scope.isShow = true;
                event.stopPropagation();

            });
            element.after($compile(
                '<div id="numped-wrapper-{{elemId}}" class="numpad-box" hide-on-click except="{{elemId}}" ng-show="isShow" dont-hide="block-slider-container">' +
                    '  <ul>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(7)"><p>7</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(8)"><p>8</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(9)"><p>9</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(4)"><p>4</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(5)"><p>5</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(6)"><p>6</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(1)"><p>1</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(2)"><p>2</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(3)"><p>3</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(\'.\')"><p>.</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(0)"><p>0</p></li>' +
                    '      <li ng-click="$event.stopPropagation(); setKeyValue(-1)"><p>|&#8592;</p></li>' +
                    '  </ul>' +
                    '  <div class="calc-ok-b"><button ng-click="$event.stopPropagation();  isShow = false">↲</button></div>' +
                    '</div>'
            )(scope));
        }
    };

}]);