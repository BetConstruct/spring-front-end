VBET5.directive("promotionNewsNew", ['$rootScope', '$http', '$location', '$window', '$sce', '$timeout', 'DomHelper', 'Utils', 'analytics', 'WPConfig', 'Config',
    function ($rootScope, $http, $location, $window, $sce, $timeout, DomHelper,  Utils, analytics, WPConfig, Config) {
        return {
            restrict: "E",
            template: '<div ng-include="getTemplate()"></div>',
            scope: {
                category: '=',
                template: "=?"
            },
            link: function ($scope) {
                var BASE_URL = "https://cmsbetconstruct.com";
                var allPromotions = [];

                var BASE_HOST = Config.main.promoBasehost?Config.main.promoBasehost: Config.main.site_id;

                var API_URL = BASE_URL + "/api/public/v1/" + $rootScope.env.lang + "/partners/" + BASE_HOST;

                var GROUP_COUNT = !$scope.template?WPConfig.news.pokerNewsPerGroup: 4;
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

                $scope.loading = true;
                $scope.promotions = [];
                /**
                 * @ngdoc method
                 * @name groupSliderNews
                 * @description  Group news depend on screen for slider mode
                 *
                 */
                function groupSliderNews() {
                    if (DomHelper.getWindowSize().width >= 1833 && $scope.template) {
                        groupPromotions(4);
                    } else {
                        groupPromotions(3);
                    }
                }

                $scope.getTemplate = function getTemplate() {
                    if ($scope.template) {
                        initSliderMode();
                        return "templates/directive/promotions/new-slider.html";

                    }
                    return "templates/directive/promotions/new.html";
                };

                function getData (url) {
                    return $http.get(url).then(function(response) {
                        if (response.status === 200) {
                            return response.data.data;
                        } else {
                            throw new Error("");
                        }
                    });
                }

                $scope.unselectPromo = function unselectPromo() {
                    $scope.selectedPromo = null;
                    $location.search('news', undefined);
                };

                $scope.selectPromo = function selectPromo(promo) {
                    if ($scope.selectedPromo && $scope.selectedPromo.id === promo.id) {
                        $scope.unselectPromo();
                    } else {
                        analytics.gaSend('send', 'event', 'news', 'show poker news', {
                            'page': $location.path(),
                            'eventLabel': $scope.selectedCategory.title
                        });
                        $location.search('news', promo.id);
                        $scope.selectedPromo = promo;

                    }
                };
                function groupPromotions(groupCount) {
                    $scope.promotionsGroups = Utils.groupToGroups(allPromotions, groupCount, 'promotions');
                    if ($scope.category) {
                        $scope.pickFirstGroup($scope.promotionsGroups[0]);
                    }
                }
                if ($scope.template) {
                    $scope.$on('widescreen.on', function () {
                        groupPromotions(4);
                    });

                    $scope.$on('widescreen.off', function () {
                        groupPromotions(3);
                    });
                }


                $scope.selectCategory = function selectCategory(category, selectedPromoId) {
                    if (!$scope.selectedCategory || $scope.selectedCategory.slug !== category.slug) {
                        $scope.unselectPromo();
                        $scope.selectedCategory = category;
                        if (!$scope.category) {
                            $location.search('slug', category.src);

                        }
                        $scope.loading = true;
                        getData(API_URL + "/promotions?category=" + category.slug).then(function(response) {
                            allPromotions = response.map(function(promo, index) {
                                return {
                                    id: promo.id,
                                    groupId: Math.floor(index / GROUP_COUNT),
                                    target: promo.target,
                                    title: $sce.trustAsHtml(promo.title),
                                    content: $sce.trustAsHtml(promo.content),
                                    src: BASE_URL + promo.src,
                                    href: promo.href
                                };
                            });
                            groupSliderNews();

                            if (selectedPromoId) { // initialCase
                                var promoToSelect = allPromotions.find(function(promo) {
                                    return promo.id === selectedPromoId;
                                });

                                if (promoToSelect) {
                                    $timeout(function () {
                                        $scope.selectPromo(promoToSelect);
                                    }, 1000);
                                }
                            }
                        })["catch"](function() {
                            $scope.promotions = [];
                        })["finally"](function() {
                            $scope.loading = false;
                        });
                    }
                };

                function init() {
                    //load categories
                    getData(API_URL + "/categories/promotion").then(function(response) {
                        $scope.categories = response;
                        if (response.length) {
                            var searchParams = $location.search();
                            var slug = $scope.category || searchParams.slug;
                            var categoryToSelect = slug && response.find(function(category) {
                                return category.src === slug;
                            });
                            if (!$scope.category && !categoryToSelect) {
                                categoryToSelect = response[0];
                            }
                            var promoIdToSelect = searchParams.news ? parseInt(searchParams.news, 10) : undefined;
                            if (categoryToSelect) {
                                $scope.selectCategory(categoryToSelect, promoIdToSelect);
                            }
                        } else {
                            $scope.loading = false;
                        }
                    })["catch"](function() {
                        $scope.loading = false;
                    });

                }

                init();
            }
        };
    }
])
