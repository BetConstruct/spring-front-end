/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:DomHelper
 * @description
 * DOM Helper functions to use in directives
 */
VBET5.service('DomHelper', ['$window', '$timeout', 'Config', function ($window, $timeout, Config) {
    'use strict';

    var MIN_HEIGHT_FOR_SCROLLING_TO_TOP = 768;

    var DomHelper = {};
    var cssGroupsList = {};

    /**
     * @ngdoc method
     * @name getOffset
     * @methodOf vbet5.service:DomHelper
     * @description returns element offset
     *
     * @param {Object} el dom element
     * @returns {Object} element offset object with **top** and **left** properties
     */
    DomHelper.getOffset = function getOffset(el) {
        var _x = 0;
        var _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            _x += el.offsetLeft - (el === $window.document.body &&  $window.document.documentElement ? $window.document.documentElement.scrollLeft : el.scrollLeft);
            _y += el.offsetTop - (el === $window.document.body &&  $window.document.documentElement ? $window.document.documentElement.scrollTop : el.scrollTop);
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    };



    /**
     * @ngdoc method
     * @name scrollVisible
     * @methodOf vbet5.service:DomHelper
     * @description  scrolls to active element inside scrolling area to keep it visible to user
     *
     * @param {string} parentId parent element's id
     * @param {string} elementId child element's id
     * @param {Boolean} wasScrolled detects if user was scrolling through
     * @param {Number} childHeight child height
     * @param {Number} parentHeight parent height
     * @param {Number} scrolledOffset scrolled position
     */
    DomHelper.scrollVisible = function scrollVisible(parentId, elementId, wasScrolled, childHeight, parentHeight, scrolledOffset) {
        parentHeight = parentHeight || 0;
        childHeight = childHeight || 0;
        scrolledOffset = scrolledOffset || 0;
        var maxHeight = parentHeight - childHeight;

        var parent = document.getElementById(parentId);
        var child =  document.getElementById(elementId);
        if (child && parent) {
            var childOffset = child.offsetTop;
            var parentOffset = parent.offsetTop;
            var actualOffset = childOffset - parentOffset;
            if (wasScrolled) {
                scrolledOffset = parent.scrollTop;
                DomHelper.scrollTop(parentId, scrolledOffset);
            }
            if (actualOffset > maxHeight && actualOffset - scrolledOffset > maxHeight) {
                scrolledOffset = actualOffset;
                DomHelper.scrollTop(parentId, scrolledOffset);
            } else if (parentOffset === childOffset) {
                scrolledOffset = 0;
                DomHelper.scrollTop(parentId, scrolledOffset);
            }
        }
        return scrolledOffset;
    };

    /**
     * @ngdoc method
     * @name scrollIntoView
     * @methodOf vbet5.service:DomHelper
     * @description calls DOM scrollIntoView method on provided element if it exists
     *
     * @param {string} id element id
     */
    DomHelper.scrollIntoView = function scrollIntoView(id) {
        var el = $window.document.getElementById(id);
        if (el) {
            el.scrollIntoView(true);
        }

    };


    /**
     * @ngdoc method
     * @name scrollTop
     * @methodOf vbet5.service:DomHelper
     * @description wrapper for document.scrollTop
     *
     * @param {string} id element id
     * @param {number} y position
     */
    DomHelper.scrollTop = function scrollTop(id, y) {
        var el = $window.document.getElementById(id);
        if (el) {
            el.scrollTop = y;
        }

    };

    /**
     * @ngdoc method
     * @name scrollBottom
     * @methodOf vbet5.service:DomHelper
     * @description scroll to selected element bottom
     *
     * @param {string} id element id
     */
    DomHelper.scrollBottom = function scrollBottom(id) {
        $timeout(function () {
            var el = $window.document.getElementById(id);
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        }, 50);
    };

    var reqAnimationFrameFn = $window.requestAnimationFrame ||
        $window.webkitRequestAnimationFrame ||
        $window.mozRequestAnimationFrame ||
        $window.oRequestAnimationFrame ||
        $window.msRequestAnimationFrame ||
        function (callback) {
            $window.setTimeout(callback, 1000 / 60);

        };

    var docHeight;
    var watchedElementsProps = {};
    var reqAnimationFrameCallsDocHeight = 0;
    var reqAnimationFrameCallsElemHeight = 0;

    /**
     * @ngdoc method
     * @name onDocumentHeightChange
     * @methodOf vbet5.service:DomHelper
     * @description Will call provided callback when document height changes
     *
     * @param {function} callback function to call onchange
     */
    DomHelper.onDocumentHeightChange = function onDocumentHeightChange(callback) {

        reqAnimationFrameFn(function () {
            if (reqAnimationFrameCallsDocHeight < 25) {
                ++reqAnimationFrameCallsDocHeight;
                return DomHelper.onDocumentHeightChange(callback);
            }
            reqAnimationFrameCallsDocHeight = 0;

            var body = $window.document.body,
                html = $window.document.documentElement,
                currentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            if (currentHeight !== docHeight) {
                docHeight = currentHeight;
                callback();
            }
            DomHelper.onDocumentHeightChange(callback);
        });
    };

    /**
     * @ngdoc method
     * @name onElementHeightChange
     * @methodOf vbet5.service:DomHelper
     * @description Will call provided callback when provided element height changes
     *
     * @param {String} id element id
     * @param {function} callback function to call onchange
     */
    DomHelper.onElementHeightChange = function onElementHeightChange(id, callback) {
        watchedElementsProps[id] = watchedElementsProps[id] || {elem: $window.document.getElementById(id)};
        reqAnimationFrameFn(function () {

            if (reqAnimationFrameCallsElemHeight < 25) {
                ++reqAnimationFrameCallsElemHeight;
                return DomHelper.onElementHeightChange(id, callback);

            }
            reqAnimationFrameCallsElemHeight = 0;
            watchedElementsProps[id].elem = watchedElementsProps[id].elem || $window.document.getElementById(id); // may not be available on first call

            if (watchedElementsProps[id].elem) {
                var currentHeight = watchedElementsProps[id].elem.offsetHeight;
                if (currentHeight !== watchedElementsProps[id].previousHeight) {
                    watchedElementsProps[id].previousHeight = currentHeight;
                    callback();
                }
            }
            DomHelper.onElementHeightChange(id, callback);
        });
    };

    /**
     * @ngdoc method
     * @name getWindowSize
     * @methodOf vbet5.service:DomHelper
     * @description returns window size
     *
     * @returns {Object} window size object with width and height properties
     */
    DomHelper.getWindowSize = function getWindowSize() {
        return {width: $window.document.documentElement.clientWidth, height: $window.document.documentElement.clientHeight};
    };

    /**
     * @ngdoc method
     * @name getScreenResolution
     * @methodOf vbet5.service:DomHelper
     * @description Returns screen resolution
     *
     * @returns {object} screen resolution object with x and y properties
     */
    DomHelper.getScreenResolution = function getScreenResolution() {
        var w = $window,
            d = $window.document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        return {x: x, y: y};
    };

    /**
     * @ngdoc method
     * @name getWindowScrollPosition
     * @methodOf vbet5.service:DomHelper
     * @description
     *
     * @returns {object} window scroll position object with x and y properties
     */
    DomHelper.getWindowScrollPosition = function getWindowScrollPosition() {
        var x, y;
        if ($window.pageXOffset !== undefined) {
            x = $window.pageXOffset;
            y = $window.pageYOffset;
        } else if ($window.scrollX !== undefined) {
            x = $window.scrollX;
            y = $window.scrollY;
        } else if ($window.document.documentElement && $window.document.documentElement.scrollLeft !== undefined) {
            x = $window.document.documentElement.scrollLeft;
            y = $window.document.documentElement.scrollTop;
        } else {
            x = $window.document.body.scrollLeft;
            y = $window.document.body.scrollTop;
        }
        return {x: x, y: y};
    };

    /**
     * @ngdoc method
     * @name goToTop
     * @methodOf vbet5.service:DomHelper
     * @description Scrolls to top of the page
     *
     * @param {Boolean} [onSmallScreensOnly] optional. if set to true will scroll only on small screens
     * (height is defined by DomHelper's MIN_HEIGHT_FOR_SCROLLING_TO_TOP constant)
     */
    DomHelper.goToTop = function goToTop(onSmallScreensOnly) {
        onSmallScreensOnly = onSmallScreensOnly || false;
        if (DomHelper.isScreenSmall() || !onSmallScreensOnly) {
            $window.scrollTo(0, 0);
        }
    };

    /**
     * @ngdoc method
     * @name isScreenSmall
     * @methodOf vbet5.service:DomHelper
     * @description returns true if screen is small(defined by MIN_HEIGHT_FOR_SCROLLING_TO_TOP constant), false otherwise
     *
     * @returns {boolean} is screen small for scrolling or not
     */
    DomHelper.isScreenSmall = function isScreenSmall() {
        return DomHelper.getScreenResolution().y < MIN_HEIGHT_FOR_SCROLLING_TO_TOP;
    };

    /**
     * @ngdoc method
     * @name onWindowResize
     * @methodOf vbet5.service:DomHelper
     * @description
     * @param {Function} callback function to call on windows resize
     * @returns {boolean} is screen small for scrolling or not
     */
    DomHelper.onWindowResize = function onWindowResize(callback) {
        angular.element($window).on("resize", callback);
    };

    /**
     * @ngdoc method
     * @name onWindowWidthResize
     * @methodOf vbet5.service:DomHelper
     * @description
     * @param {Function} callback function to call on windows height resize
     * @returns {boolean} is screen small for scrolling or not
     */
    DomHelper.onWindowWidthResize = function onWindowWidthResize(callback) {
        var windowWidth = 0;
        angular.element($window).on("resize", function (e) {
                if (windowWidth !== $window.innerWidth)
                    callback(e);
                windowWidth = $window.innerWidth;
            }
        );
    };

    /**
     * @ngdoc method
     * @name onWindowScroll
     * @methodOf vbet5.service:DomHelper
     * @description
     * @param {Function} callback function to call on windows scroll
     */
    DomHelper.onWindowScroll = function onWindowResize(callback) {
        angular.element($window).on("scroll", callback);
    };


    /**
     * @ngdoc method
     * @name onContentheightChange
     * @methodOf vbet5.service:DomHelper
     * @description
     * @param {Function} callback function to call on window contents resize
     * @param {Number} [interval] interval(in milliseconds) to check for resize. Default is 500ms
     */
    DomHelper.onContentheightChange = function onContentheightChange(callback, interval) {
        interval = interval || 500;
        var scrollHeight;
        $window.setInterval(function () {
            if ($window.document.body.scrollHeight !== scrollHeight || Config.partner.alwaysSendSize) {
                scrollHeight = $window.document.body.scrollHeight;
                callback(scrollHeight, $window.document.body.scrollWidth, $window.document.body.offsetHeight);
            }
        }, interval);

    };


    /**
     * @ngdoc method
     * @name onBodyHeightChange
     * @methodOf vbet5.service:DomHelper
     * @description
     * @param {Function} callback function to call on body resize
     * @param {Number} [interval] interval(in milliseconds) to check for resize. Default is 500ms
     */
    DomHelper.onBodyHeightChange = function onBodyHeightChange(callback, interval) {
        interval = interval || 500;
        var offsetHeight;
        $window.setInterval(function () {
            if ($window.document.body.offsetHeight !== offsetHeight || Config.partner.alwaysSendSize) {
                offsetHeight = $window.document.body.offsetHeight;
                callback(offsetHeight, $window.document.body.offsetHeight);
            }
        }, interval);

    };

    /**
     * @ngdoc method
     * @name onMessage
     * @methodOf vbet5.service:DomHelper
     * @description listens to messages sent to window with postMessage
     * @param {Function} callback function to call when message is received. message will be passed to function
     */
    DomHelper.onMessage = function onMessage(callback) {
        var eventMethod = $window.addEventListener ? "addEventListener" : "attachEvent";
        var listenerFunc = $window[eventMethod];
        var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
        listenerFunc(messageEvent, callback, false);
    };

    /**
     * @ngdoc method
     * @name getCssGroup
     * @methodOf vbet5.service:DomHelper
     * @description Returns CSS group object, create new one if doesnt exist
     * @param {String} CSS group
     * @param {Boolean} if true the group is cleared
     */
    DomHelper.getCssGroup = function getCssGroup(group, reset) {
        group = group || 'default';
        if (!cssGroupsList[group]) {
            cssGroupsList[group] = {};
        }
        if (reset) {
            delete cssGroupsList[group];
        }
        return cssGroupsList[group];
    };

    /**
     * @ngdoc method
     * @name addCss
     * @methodOf vbet5.service:DomHelper
     * @description Adds css to the DOM and stores it in the list
     * @param {String} url of the CSS file
     * @param {String} name of the CSS
     * @param {String} id of the CSS
     * @param {String} CSS group
     */
    DomHelper.addCss = function addCss(url, name, id, group) {
        var cssList = DomHelper.getCssGroup(group);
        if (id) {
            var oldCss = document.getElementById(id);
            if (oldCss) {
                oldCss.setAttribute("href", url);
                return;
            }
        }
        name = name || url;
        if (cssList[name]) {
            return;
        }
        var css, head = document.getElementsByTagName("head")[0];
        css = document.createElement("link");
        css.setAttribute("rel", "stylesheet");
        css.setAttribute("type", "text/css");
        css.setAttribute("href", url);

        if (id) { css.id = id; }

        head.appendChild(css);
        cssList[name] = css;
        return css;
    };

    /**
     * @ngdoc method
     * @name removeCss
     * @methodOf vbet5.service:DomHelper
     * @description Remove css from the DOM by name
     * @param {String} name of the CSS
     * @param {String} CSS group
     */
    DomHelper.removeCss = function removeCss(name, group) {
        var cssList = DomHelper.getCssGroup(group);
        if (cssList[name]) {
            cssList[name].parentNode.removeChild(cssList[name]);
            delete cssList[name];
        }
    };

    /**
     * @ngdoc method
     * @name clearCss
     * @methodOf vbet5.service:DomHelper
     * @description Removes all the CSS prevuosly added with the addCss
     * @param {String} CSS group
     */
    DomHelper.clearCss = function clearCss(group) {
        var cssList = DomHelper.getCssGroup(group);
        angular.forEach(cssList, function (css) {
            if (css) {
                css.parentNode.removeChild(css);
            }
        });
        DomHelper.getCssGroup(group, true);
    };

    return DomHelper;

}]);