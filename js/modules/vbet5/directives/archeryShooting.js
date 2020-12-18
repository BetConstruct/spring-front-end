/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:archeryShooting
 *
 * @description Archery Shooting
 *
 */
VBET5.directive('archeryShooting', ['$window', '$filter', 'Config','GameInfo', function ($window, $filter, Config, GameInfo) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: function templateUrl(el, attrs) {
            var templateUrl = '';
            switch (attrs.gameType) {
                case 'h2h' : {
                    templateUrl = 'templates/directive/archery-shooting-h2h.html';
                    break;
                }
                default: {
                    templateUrl = 'templates/directive/archery-shooting.html';
                    break;
                }
            }
            return $filter('fixPath')(templateUrl);
        },
        scope: {
            openGame: '='
        },
        link: function (scope, elem, attrs) {
            var element = elem[0];
            var scrollDirection = Config.main.availableLanguages[Config.env.lang].rtl ? 'right' : 'left';
            var setWidth = 60;
            var marginLeft = 8;
            var gameType = attrs.gameType;
            var setExpandedWith = gameType === 'h2h' ? 250 : 234;

            scope.init = function () {
                scope.selectedSet = {};
                var loop = 0;
                var timeout;
                var slider = element.getElementsByClassName('game-score-archery-set')[0];
                var scrollParams = {top: 0, behavior: 'smooth'};
                scrollParams[scrollDirection] = 0;

                scope.$watchCollection('[openGame.stats.score_set1, openGame.stats.score_set2, openGame.stats.score_set3, openGame.stats.score_set4, openGame.stats.score_set5, openGame.stats.score_set6]', function (stats) {
                    scope.framesCount = GameInfo.framesCount(scope.openGame.stats);
                    scope.currentSetNumber = scope.framesCount.length;
                    if (scope.currentSetNumber) {
                        scope.selectedSet.value = scope.currentSetNumber;
                        scope.scrollToSet(scope.currentSetNumber, 300);
                    }
                });

                scope.scrollToSet = function (set, delay) {
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        var elem = element.getElementsByClassName('archery-set-' + set)[0];

                        if (elem && slider.offsetWidth !== slider.scrollWidth) {
                            loop = 0;
                            scrollParams[scrollDirection] = set * (setWidth + marginLeft) + setExpandedWith - slider.offsetWidth;

                            if (gameType === 'h2h' && set === 6) {
                                scrollParams.left = 0;
                            }

                            slider.scrollTo(scrollParams);
                        } else if (!elem && loop < 5) {
                            loop++;
                            scope.scrollToSet(set, delay);
                        }
                    }, delay);
                };

                var isDown = false;
                var startX;
                var scrollLeft;
                var walk = 0;
                var mouseDownEvent;

                function mouseMove(e) {
                    if (!isDown) return;
                    e.preventDefault();
                    var x = e.pageX - slider.offsetLeft;
                    walk = (x - startX); //scroll-fast
                    slider.scrollLeft = scrollLeft - walk;
                    slider.classList.add('grabbing');
                    // console.log("**********", "mouseMove");
                }

                function mouseUp(e) {
                    isDown = false;

                    if (gameType !== 'h2h') {
                        var set = e.target.dataset.setNum;

                        if (Math.abs(walk) < 10 && set) {
                            scope.$apply(function () {
                                scope.selectedSet.value = parseInt(mouseDownEvent.target.dataset.setNum);
                                scope.scrollToSet(scope.selectedSet.value);
                            });
                        }
                    }

                    walk = 0;
                    slider.classList.remove('grabbing');
                    $window.document.body.removeEventListener('mousemove', mouseMove);
                    $window.document.body.removeEventListener('mouseup', mouseUp);
                    // console.log("**********", "mouseUp");
                }

                function mouseDown(e) {
                    isDown = true;
                    startX = e.pageX - slider.offsetLeft;
                    scrollLeft = slider.scrollLeft;
                    mouseDownEvent = e;
                    if (slider.offsetWidth !== slider.scrollWidth) {
                        $window.document.body.addEventListener('mousemove', mouseMove);
                    }
                    $window.document.body.addEventListener('mouseup', mouseUp);
                    // console.log("**********", "mouseDown");
                }

                function removeAllEvents() {
                    // console.log("**********", "removeAllEvents");
                    slider.removeEventListener('mousedown', mouseDown);
                    $window.document.body.removeEventListener('mousemove', mouseMove);
                    $window.document.body.removeEventListener('mouseup', mouseUp);
                }

                removeAllEvents();
                slider.addEventListener('mousedown', mouseDown);

                scope.$on('$destroy', function () {
                    removeAllEvents();
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = undefined;
                    }
                });
                // console.log("**********", "addDragEvents");
            };
        }
    };
}]);
