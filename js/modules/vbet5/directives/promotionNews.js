/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:promotionNews
 * @description Renders promotion news by given slug from wordpress
 */
VBET5.directive('promotionNews',
    ['$routeParams', '$window', '$sce', '$location', '$timeout', 'Config', 'WPConfig', 'content', 'Utils', 'analytics', 'DomHelper', 'Zergling', '$rootScope',
        function ($routeParams, $window, $sce, $location, $timeout, Config, WPConfig, content, Utils, analytics, DomHelper, Zergling, $rootScope) {
            'use strict';
            var templates = {
                slider: 'templates/directive/promotions/slider.html',
                main: 'templates/directive/promotions/main.html'
            };
            return {
                restrict: 'E',
                replace: false,
                template: '<div ng-include="getTemplate()"></div>',
                scope: {
                    count: '@',
                    hideDates: '@',  //hides publish date
                    mainClass: '@',
                    template: '@',
                    path: '@',       //path of page where directive or placed (for generating sharing links)
                    sharePath: '@',   // if specified, this path will be used in sharing link generation (without deeplinking to specific promo)
                    slug: '@',
                    categorySlugKey: '@',
                    useCustomBaseHost: '@', // for new cms
                    categoryJsonType: '@',
                    newsAreLoading: '@',
                    recentNewsList: '@',
                    categoriesList: '@'
                },
                link: function ($scope, element, attrs) {
                    var recentNews = [], newsPerGroup = WPConfig.news.pokerNewsPerGroup, isSliderMode,
                        SLIDER_NEWS_COUNT = {
                            wideOn: 4,
                            wideOff: 3
                        };
                    $scope.promotionsFilter = {};
                    $scope.optInOutProcessing = {};
                    $scope.count = $scope.count || WPConfig.news.numberOfRecentNews;
                    $scope.showDates = !$scope.hideDates;

                    function initSliderMode() {
                        $scope.slideLeft = function () {
                            $scope.selectedGroupId--;
                        };
                        $scope.slideRight = function () {
                            $scope.selectedGroupId++;
                        };
                        $scope.pickFirstGroup = function (group) {
                            $scope.selectedGroupId = group.id;
                        };
                    }

                    $scope.getTemplate = function () {
                        var url;
                        if (templates[attrs.template]) {
                            url = templates[attrs.template];
                            isSliderMode = true;
                            initSliderMode();
                        } else {
                            url = templates.main;
                        }
                        return url;

                    };

                    function promotionIsVisible(news) {
                        return !$scope.promotionsFilter.name || ($scope.promotionsFilter.name==='actual' && news.actual) || ($scope.promotionsFilter.name==='finished' && !news.actual);
                    }

                    function groupNewsInGroups(count) {
                        var groupCount = count || newsPerGroup;
                        if (recentNews) {
                            if ($scope.promotionsFilter && $scope.promotionsFilter.name) {
                                var recentNewsFiltered = [];
                                angular.forEach(recentNews, function (news) {
                                    if (promotionIsVisible(news)) {
                                        recentNewsFiltered.push(news);
                                    }
                                });
                                $scope.recentNewsList = Utils.groupToGroups(recentNewsFiltered, groupCount, 'news');
                            } else {
                                $scope.recentNewsList = Utils.groupToGroups(recentNews, groupCount, 'news');
                            }
                        }
                    }

                    function findAndOpenNews() {
                        var searchParams = $location.search();

                        if (searchParams.news !== undefined) {
                            var newsID = parseInt(searchParams.news, 10);
                            var i, j;
                            for (i = 0; i < $scope.recentNewsList.length; i++) {
                                for (j = 0; j < $scope.recentNewsList[i].news.length; j++) {
                                    if ($scope.recentNewsList[i].news[j].id == newsID) {
                                        $timeout(function () {
                                            $scope.showNews($scope.recentNewsList[i].news[j], $scope.recentNewsList[i].id);
                                        }, 1000);

                                        return;
                                    }
                                }
                            }
                        }
                    }

                    function getPermaLink(news) {
                        return window.location.origin + encodeURIComponent(news.share_src);
                    }

                    /**
                     * @ngdoc method
                     * @name groupSliderNews
                     * @description  Group news depend on screen for slider mode
                     *
                     */
                    function groupSliderNews() {
                        if (DomHelper.getWindowSize().width < 1833) {
                            groupNewsInGroups(SLIDER_NEWS_COUNT.wideOff);
                        } else {
                            groupNewsInGroups(SLIDER_NEWS_COUNT.wideOn);
                        }
                    }

                    /**
                     * Retrive news from backend
                     * @param count
                     */
                    function loadNews(count) {
                        count = parseInt(count, 10) || count;
                        if ($scope.slug) {
                            $scope.newsAreLoading = true;
                            content.getPostsByCategorySlug($scope.slug, $scope.categoryJsonType, count, false, WPConfig.wpPromoUrl, $scope.useCustomBaseHost && WPConfig.wpPromoCustomBaseHost).then(function (response) {
                                $scope.newsAreLoading = false;
                                if (response.data && response.data.posts) {
                                    recentNews = response.data.posts;
                                    var i, length = recentNews.length;
                                    for (i = 0; i < length; i += 1) {
                                        recentNews[i].titleRaw = angular.element('<div/>').html(recentNews[i].title).text(); //decode html entities
                                        recentNews[i].permalink = getPermaLink(recentNews[i]);
                                        recentNews[i].title = $sce.trustAsHtml(recentNews[i].title);
                                        recentNews[i].content = $sce.trustAsHtml(recentNews[i].content);
                                    }

                                    (templates[attrs.template]) ? groupSliderNews() : groupNewsInGroups();
                                    $scope.areThereMore = $scope.count < response.data.count;
                                    findAndOpenNews();
                                }
                            });
                        }
                    }

                    $scope.setPromotionsFilter = function setPromotionsFilter(name) {
                        $scope.promotionsFilter.name = name;
                        groupNewsInGroups();
                    };


                    /**
                     * @ngdoc method
                     * @name showNews
                     * @methodOf CMS.controller:cmsPagesCtrl
                     * @description  Sets selected news
                     *
                     * @param {object} news news object
                     */
                    $scope.showNews = function showNews(news) {
                        if ($scope.selectedPromo === news) {
                            $scope.unselectPromo();
                            return;
                        }
                        $location.search('news', news.id);
                        analytics.gaSend('send', 'event', 'news', 'show poker news', {
                            'page': $location.path(),
                            'eventLabel': news.categories.length > 0 ? news.categories[0].title : ''
                        });
                        $scope.selectedPromo = news;
                        $scope.selectedPromo.src = $scope.selectedPromo.thumbnail || $scope.selectedPromo.thumbnail_images.full.url;
                        if (typeof $scope.selectedPromo.content === 'string') { //not to do it twice
                            $scope.selectedPromo.content = $sce.trustAsHtml($scope.selectedPromo.content);
                        }
                        if (typeof $scope.selectedPromo.title === 'string') { //not to do it twice
                            $scope.selectedPromo.title = $sce.trustAsHtml($scope.selectedPromo.title);
                        }
                    };

                    $scope.loadMore = function loadMore() {
                        $scope.count += newsPerGroup === WPConfig.news.newsPerGroupWide ? WPConfig.news.increaseByWide : WPConfig.news.increaseBy;
                        loadNews($scope.count);
                    };

                    $scope.$on('widescreen.on', function () {
                        newsPerGroup = WPConfig.news.pokerNewsPerGroupWide;
                        (templates[attrs.template]) ? groupNewsInGroups(SLIDER_NEWS_COUNT.wideOn) : groupNewsInGroups();
                    });

                    $scope.$on('widescreen.off', function () {
                        newsPerGroup = WPConfig.news.pokerNewsPerGroup;
                        (templates[attrs.template]) ? groupNewsInGroups(SLIDER_NEWS_COUNT.wideOff) : groupNewsInGroups();
                    });

                    /**
                     * @ngdoc method
                     * @name unselectPromo
                     * @methodOf CMS.controller:cmsPagesCtrl
                     * @description  closes open news
                     */
                    $scope.unselectPromo = function unselectPromo() {
                        $scope.selectedPromo = null;
                        $location.search('news', undefined);
                    };
                    /**
                     * @ngdoc method
                     * @name setSlug
                     * @description  set current slug from promotions menu
                     *
                     */
                    $scope.setSlug = function setSlug(slug, isInitialize) {
                        if($scope.slug !== slug || isInitialize) {
                            $scope.slug = slug;
                            $location.search("slug", slug);
                            if (!isInitialize) {
                                $scope.unselectPromo();

                            }
                            loadNews($scope.count);
                        }
                    };

                    /**
                     * @ngdoc method
                     * @name loadCategories
                     * @description  load promotion categories
                     *
                     */
                    function loadCategories() {
                        $scope.promotionCategories = [];
                        content.getPromotionCategories().then(function(data) {
                            var slug = $location.search().slug || $scope.slug;
                            if(data && data.data && data.data.status === "ok" && data.data.categories.length > 0) {
                                var categories = data.data.categories;
                                for (var i = 0, length = categories.length; i < length; ++i) {
                                    $scope.promotionCategories.push({
                                        title: categories[i].title,
                                        key: categories[i].name
                                    });
                                }
                            }
                            if ($scope.promotionCategories.length > 0 && !slug) {
                                slug = $scope.promotionCategories[0].key;
                            }

                            $scope.setSlug(slug, true);

                            $scope.$on('$routeUpdate', function () {
                                var params = $location.search();
                                if (params && params.slug) {
                                    $scope.setSlug(params.slug);
                                }
                            });
                        });
                    }

                    /**
                     * @ngdoc method
                     * @name optInOut
                     * @description  opt In Out
                     *
                     */
                    $scope.optInOut = function optInOut(id, inOut, newsId) {
                        if ($scope.optInOutProcessing[newsId]) {
                            return;
                        }

                        var result = -1;
                        $scope.optInOutProcessing[newsId] = true;
                        Zergling.get({'code': id}, inOut ? 'client_opt_in' : 'client_opt_out')
                            .then(function (response) {
                                    result = response.result;
                                }
                            )['finally'](function () {
                            if (result === 0) {
                                getPlayerOptIns(function () {
                                    $scope.optInOutProcessing[newsId] = false;
                                });
                            } else {
                                $scope.optInOutProcessing[newsId] = false;
                            }
                        });
                    };
                    /**
                     * @ngdoc method
                     * @name initPromotionsOptIn
                     * @description  init Promotions OptIn
                     *
                     */
                    var logoutWatcher, loginWatcher;
                    function initPromotionsOptIn() {
                        $scope.playerOptIns = null;

                        if ($rootScope.profile) {
                            getPlayerOptIns();
                        }

                        loginWatcher = $scope.$on('loggedIn', function () {
                            getPlayerOptIns();
                        });

                        logoutWatcher = $scope.$on('login.loggedOut', function () {
                            $scope.playerOptIns = null;
                        });
                    }


                    /**
                     * @ngdoc method
                     * @name getPlayerOptIns
                     * @description  get Player OptIn s
                     *
                     */
                    function getPlayerOptIns(callback) {
                        Zergling.get({}, 'get_player_opt_ins')
                            .then(
                                function (response) {
                                    if (response && response.result === 0 && response.details)
                                        $scope.playerOptIns = {};
                                    angular.forEach(response.details,function (optIns) {
                                        $scope.playerOptIns[optIns.Code] = true;
                                    });
                                }
                            )['finally'](function () {
                            if(typeof callback === 'function'){
                                callback();
                            }
                        });
                    }


                    // Initialize directive
                    (function init() {
                        if ($scope.categoriesList) {
                            loadCategories();
                        } else {
                            loadNews($scope.count);
                        }

                        if(Config.main.promotionsOptIn){
                            initPromotionsOptIn();
                        }
                    }());

                    $scope.$on('$destroy',function() {
                        $scope.playerOptIns = null;
                        if (logoutWatcher){
                            logoutWatcher();
                        }

                        if (loginWatcher) {
                            loginWatcher();
                        }
                    });
                }
            };
        }
    ]);
