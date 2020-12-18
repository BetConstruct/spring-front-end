VBET5.directive('jackpotCounter', ['$rootScope', '$filter', function ($rootScope, $filter) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<b class="amount-animation-container"></b>',
        scope: {
            comma: '=',
            point: '=?',
            showCurrency: '=',
            maxDurationSpeed: '=',
            maxLength: '=',
            updateInterval: '=?bind'
        },
        link: function (scope, elem,attrs) {
            var element = elem[0];
            var amountDiff;
            var amountStr = '';
            var start = new Date().getTime();
            var timeDiff = 0;
            var oldVal = attrs.amount;
            var currency = attrs.currency;
            var multipliersString = false;
            var multipliersFactor = 0;
            var count = 0;
            var firstTime = true;

            function drawDom(result) {
                element.innerHTML = "";

                result.items.forEach(function (item, $index) {
                    var resLength = result.items.length;
                    if (!multipliersFactor || $index <= (resLength - scope.point - 1 - multipliersFactor)) {
                        var span = document.createElement('SPAN');

                        span.className = (scope.comma && ((resLength - $index - scope.point) > 1 && (resLength - $index - scope.point - 1) % 3 === 0) ? 'with-comma ' : '') + (scope.point && $index === (result.items.length - scope.point - 1) ? 'with-point ' : '');

                        var i = document.createElement('I');
                        i.style.animationDuration = item.speed;
                        i.className = (item.animated ? 'amount-animation ' : '') ;

                        i.innerHTML = item.values;

                        span.appendChild(i);
                        element.appendChild(span);
                        if (scope.point && $index === (resLength - scope.point - 1)) {

                            var point = document.createElement('STRONG');
                            point.innerHTML = ".";
                            span.appendChild(point);
                        }
                        if (scope.comma && ((resLength - $index - scope.point - multipliersFactor) > 1 && (resLength - $index - scope.point - 1 - multipliersFactor) % 3 === 0)) {
                            var comma = document.createElement('STRONG');
                            comma.innerHTML = ",";
                            span.appendChild(comma);
                        }
                    }
                });
                if (multipliersFactor) {
                    element.innerHTML += "<span class='jp-multipliers'>" + multipliersString + "</span>";
                }
                if (result.currency) {
                    element.innerHTML += "<sup>" + $filter('currency')(result.currency) + "</sup>";
                }
            }

            function process() {
                if (!firstTime && attrs.amount === undefined) {
                    return;
                }

                if (currency !== attrs.currency) {
                    currency = attrs.currency;
                    oldVal = attrs.amount;
                }
                var pointK = 1;
                if (scope.point !== undefined) {
                    pointK = Math.pow(10, scope.point);
                } else {
                    scope.point = 0;
                }

                timeDiff = new Date().getTime() - start;

                firstTime = false;

                function steItemParams(item) {
                  if (item.changesCount > 0) {
                        item.animated = true;
                        item.speed = timeDiff / item.changesCount * 10;
                        item.speed = Math.abs(item.speed);

                        if (scope.maxDurationSpeed && item.speed < scope.maxDurationSpeed) {
                            item.speed = scope.maxDurationSpeed;
                        }
                        item.speed = item.speed + 'ms';
                        item.values = '';

                        for (var i = 0; i < 11; i++) {
                            item.values += '<span>' + ((i + item.value) % 10) + '</span>';
                        }
                    } else {
                        item.animated = false;
                        item.values = '<span>' + item.value + '</span>';
                    }

                    return item;
                }

                if (attrs.amount) {

                    amountDiff = (attrs.amount - oldVal ) * pointK;
                    amountStr = ((oldVal || attrs.amount) * pointK).toFixed(0);
                    var result = {items: [], currency: scope.showCurrency ? attrs.currency : false};
                    count = 0;
                    var nextItemChangesCount = 0;
                    var amountLength = amountStr.length;

                    multipliersString = "";
                    multipliersFactor = 0;

                    if (scope.maxLength && amountLength > 0 && scope.maxLength < (amountLength - scope.point)) {
                        if (amountLength - scope.point - scope.maxLength > 3) {
                            multipliersString = "M";
                            multipliersFactor = 6;
                        } else {
                            multipliersString = "K";
                            multipliersFactor = 3;
                        }
                    }

                    for (var j = amountLength; j >= 0; j--) {
                        var item = {
                            changesCount: 0,
                            animated: false,
                            value: amountStr[j] * 1,
                            speed: false
                        };

                        if (!isNaN(item.value)) {
                            var g = amountDiff / Math.pow(10, count++);
                            item.changesCount = nextItemChangesCount + Math.floor(g);

                            if (item.changesCount % 10 + item.value > 9) {
                                nextItemChangesCount = 1;
                            } else {
                                nextItemChangesCount = 0;
                            }
                            item = steItemParams(item);
                            result.items.unshift(item);
                        }

                        if (j === 0 && nextItemChangesCount > 0) {
                            result.items.unshift(steItemParams({
                                changesCount: 1,
                                value: 0,
                                speed: false
                            }));
                        }
                    }
                    start = new Date().getTime();
                    drawDom(result);
                }
                oldVal = attrs.amount;
            }

            attrs.$observe('amount', process);
        }
    };
}]);
