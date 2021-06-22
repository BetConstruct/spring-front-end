/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:bannerSlider
 *
 * @description displaysblock with sliding banners
 * @param {String} slug slug id (key in WPConfig.bannerSlugs)
 * @param {Number} [interval] optional. Rotation interval in milliseconds (default is 10000)
 *
 */
VBET5.directive('bannerSlider', ['$rootScope','$location', '$interval', 'analytics', 'WPConfig', 'content', function ($rootScope, $location, $interval, analytics, WPConfig, content) {
    'use strict';
    return {
        restrict: 'EA',
        replace: false,
        templateUrl: 'templates/directive/bannerslider.html',
        scope: {
            //slug: '=',
            ngHide: '=?'
        },
        link: function (scope, element, attrs) {
            scope.slide = 0;
            scope.over = false;
            scope.banners = {
                true: [],
                false: []
            };
            var intervalPromise;

            function animateBanners() {
                if (scope.over) {
                    return;
                }
                if (scope.slide === scope.banners[$rootScope.env.authorized].length -1) {
                    scope.slide = 0;
                } else {
                    scope.slide++;
                }
            }
            /**
             * @ngdoc method
             * @name getBanners
             * @methodOf vbet5.directive:bannerSlider
             * @description   populates $scope's **banners** variable with banner information got from cms
             *
             * @param {string} slug  slug id (key in WPConfig.bannerSlugs)
             */
            function getBanners(slug, container) {
                scope.loadingProcess = true;
                var cmd, containerId;
                containerId = container || content.getSlug('bannerSlugs.' + slug);
                content.getWidget(containerId).then(function (response) {
                    if (response.data && response.data.widgets && response.data.widgets[0]) {
                        scope.banners = {
                            true: [],
                            false: []
                        };
                        angular.forEach(response.data.widgets, function (widget) {
                            widget.instance.linkType = 'url';
                            if (widget.instance.text) {
                                widget.instance.linkType = 'html';
                            } else if (widget.instance.link) {
                                cmd = widget.instance.link.split(':');
                                switch (cmd[0]) {
                                case 'broadcast':
                                    widget.instance.link = cmd[1];
                                    widget.instance.linkType = 'broadcast';
                                    break;
                                }
                            }
                            if (widget.instance.show_for === '1' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                                scope.banners.true.push(widget.instance);
                            }
                            if (widget.instance.show_for === '2' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                                scope.banners.false.push(widget.instance);
                            }
                        });

                        intervalPromise = $interval(animateBanners, attrs.interval || 10000);
                    } else {
                        scope.ngHide = true;
                    }
                })['finally'](function () {
                    scope.loadingProcess = false;
                });
            }

            /**
             * @ngdoc method
             * @name bannerClick
             * @methodOf vbet5.directive:bannerSlider
             * @description sends ga message
             *
             * @param {Object} [banner]  current object of slider
             */
            scope.bannerClick = function bannerClick(banner) {
                analytics.gaSend('send', 'event', 'news', {
                    'page': $location.path(),
                    'eventLabel': attrs.slug + ' banner click: ' + banner.title
                });
               $rootScope.broadcast("bannerSliderClick", {
                   slug: attrs.slug,
                   url: banner.link
               });
            };
            //@TODO need to remove this case after the end of the games in Russia in 2018
            if (attrs.categorySlug) {
                scope.loadingProcess = true;
                content.getPostsByCategorySlug(attrs.categorySlug, 'get_recent_posts', 999, false, WPConfig.wpPromoUrl, WPConfig.wpPromoCustomBaseHost).then(function (response) {
                    if (response.data && response.data.posts) {
                        var recentNews = response.data.posts;
                        var i, length = recentNews.length;
                        for (i = 0; i < length; i += 1) {
                            recentNews[i].imageurl  = recentNews[i].image;
                            recentNews[i].linkType = 'url';
                        }

                        scope.banners = recentNews;

                        intervalPromise = $interval(animateBanners, attrs.interval || 10000);

                    } else {
                        scope.ngHide = true;
                    }
                })['finally'](function () {
                    scope.loadingProcess = false;
                });
            } else {
                if(typeof attrs.container !== 'undefined') {
                    getBanners(false, attrs.container);
                } else {
                    getBanners(attrs.slug);
                }
            }



            var authorizedWatch = $rootScope.$watch('env.authorized', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                if (scope.slide > (scope.banners[newValue].length - 1)) {
                    scope.slide = 0;
                }
            });

            scope.$on('$destroy', function () {
                $interval.cancel(intervalPromise);
                intervalPromise = undefined;
                authorizedWatch();
            });


        }
    };
}]);
