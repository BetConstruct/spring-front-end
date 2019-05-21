VBET5.directive('jackpotCounter', ['$rootScope', '$filter', function ($rootScope, $filter) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        template: '<b class="amount-animation-container"></b>',
        scope: {
            amount: '=',
            comma: '=',
            point: '=?',
            currency: '=',
            maxDurationSpeed: '=',
            maxLength: '=',
            updateInterval: '=?bind'
        },
        link: function (scope, element) {
            element = element[0];

            var maxLength = scope.maxLength;

            var amountDiff;
            var updateInterval = scope.updateInterval ? scope.updateInterval * 1.2 /*correction*/ : 11000;
            var amountStr = '';
            //var start = new Date().getTime();
            var oldVal = scope.amount;
            var currency = scope.currency;
            var multipliersString = false;
            var multipliersFactor = 0;
            var interval = 0;
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
                    element.innerHTML += "<span>" + multipliersString + "</span>";
                }
                if (result.currency) {
                    element.innerHTML += "<sup>" + $filter('currency')(result.currency) + "</sup>";
                }
            }

            function process(timeDiff) {
                if (!firstTime && scope.amount === undefined) {
                    return;
                }

                if (currency !== scope.currency) {
                    currency = scope.currency;
                    oldVal = scope.amount;
                }
                var pointK = 1;
                if (scope.point !== undefined) {
                    pointK = Math.pow(10, scope.point);
                } else {
                    scope.point = 0;
                }

                //   timeDiff = new Date().getTime() - start; todo

                firstTime = false;

                function steItemParams(item) {
                    if (item.changesCount !== 0) {

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

                if (scope.amount) {

                    amountDiff = (scope.amount - oldVal ) * pointK;
                    amountStr = ((oldVal || scope.amount) * pointK).toFixed(0);
                    var result = {items: [], currency: scope.currency};
                    count = 0;
                    var nextItemChangesCount = 0;
                    var amountLength = amountStr.length;

                    if (maxLength && amountLength > 0 && maxLength < (amountLength - scope.point)) {
                        if (amountLength - scope.point - maxLength > 3) {
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
//                    start = new Date().getTime();
                    drawDom(result);

                }
                oldVal = scope.amount;
            }

            var amountWatcher = scope.$watch('amount', function (newVal, oldVal) {
                if (newVal) {
                    if (firstTime) {
                        process(1);
                    }
                    if (oldVal && newVal !== oldVal) {
                        process(updateInterval);
                        interval = setInterval(function () {
                            process(updateInterval);
                        }, updateInterval);
                        amountWatcher();
                    }
                }
            });

            scope.$on('$destroy', function onDestroy() {
                clearInterval(interval);
                interval = undefined;
            });
        }
    };
}]);
