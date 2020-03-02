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
    var keyboardNumbers =
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
        '</div>';
    var keyboardLetters =
        '<div id="numped-wrapper-{{elemId}}" class="numpad-box with-keyboard" hide-on-click except="{{elemId}}" ng-show="isShow" dont-hide="block-slider-container">' +
        '  <ul ng-class="{\'numpad-uppercase\': isUpperCase}">' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(1)"><p>1</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(2)"><p>2</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(3)"><p>3</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(4)"><p>4</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(5)"><p>5</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(6)"><p>6</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(7)"><p>7</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(8)"><p>8</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(9)"><p>9</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(0)"><p>0</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'q\')"><p>q</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'w\')"><p>w</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'e\')"><p>e</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'r\')"><p>r</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'t\')"><p>t</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'y\')"><p>y</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'u\')"><p>u</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'i\')"><p>i</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'o\')"><p>o</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'p\')"><p>p</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'a\')"><p>a</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'s\')"><p>s</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'d\')"><p>d</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'f\')"><p>f</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'g\')"><p>g</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'h\')"><p>h</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'j\')"><p>j</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'k\')"><p>k</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'l\')"><p>l</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'-\')"><p>-</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'.\')"><p>.</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'z\')"><p>z</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'x\')"><p>x</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'c\')"><p>c</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'v\')"><p>v</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'b\')"><p>b</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'n\')"><p>n</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'m\')"><p>m</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(\'_\')"><p>_</p></li>' +
        '      <li ng-click="$event.stopPropagation(); setKeyValue(-1)"><p>|&#8592;</p></li>' +
        '  </ul>' +
        '<ul>' +
        '  <li ng-click="$event.stopPropagation(); setKeyValue(\'#\')"><p>#</p></li>' +
        '  <li class="calc-ok-b" ng-class="{\'calc-ok-b-active\': isUpperCase}"><p ng-click="$event.stopPropagation();  isUpperCase = !isUpperCase" ng-class="{\'calc-ok-b-div-active\': isUpperCase}">↑</p></li>' +
        '  <li class="calc-ok-b"><button ng-click="$event.stopPropagation();  isShow = false">↲</button></li>' +
        '</ul>';
    return {
        restrict: '',
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
            var addedElementIds = {};
            scope.isShow = false;
            scope.isUpperCase = false;
            scope.setKeyValue = function setKeyValue(keyValue) {
                if (keyValue === -1) {
                    if (ctrl.$viewValue.length > 0 && ctrl.$viewValue !== undefined) {
                        ctrl.$setViewValue(ctrl.$viewValue.slice(0, -1));
                        if (ctrl.$viewValue.length === 0 && !Config.main.terminalNumpadLetter) {
                            ctrl.$setViewValue("0");
                        }
                    }
                } else {
                    var stringedValue = keyValue.toString();
                    var newValue = scope.isUpperCase ? stringedValue.toUpperCase() : stringedValue;
                    if (ctrl.$viewValue !== undefined && ctrl.$viewValue.length !== 0) {
                        newValue = ctrl.$viewValue + newValue;
                    }
                    ctrl.$setViewValue(newValue);
                }
                ctrl.$render();
            };
            element.on('click', function (event) {
                angular.element(document.getElementById('numped-wrapper-' + scope.elemId)).toggleClass('ng-hide');
                angular.forEach(numpads, function (num) {
                    if (num !== scope.elemId) {
                        angular.element(document.getElementById('numped-wrapper-' + num)).addClass('ng-hide');
                    }
                });
                scope.isShow = true;
                if(!addedElementIds[scope.elemId]) {
                    addedElementIds[scope.elemId] = true;
                    element.after($compile(!Config.main.terminalNumpadLetter || attrs.numpadLetters === 'disabled' ? keyboardNumbers : keyboardLetters)(scope));
                }
                event.stopPropagation();
            });

            scope.$on('$destroy', function () {
                element.off('click');
            });
        }
    };

}]);
