/* global CMS */
/**
 * @ngdoc controller
 * @name CMS.controller:cmsSportNewsCtrl
 * @description
 * Sport news controller
 */
CMS.controller('cmsSportNewsCtrl', ['$rootScope', '$scope', '$sce', '$location', '$window', '$q',  '$anchorScroll', 'WPConfig', 'content', 'Config', 'Utils', 'DomHelper', 'Zergling', 'analytics', 'Translator', 'TimeoutWrapper', function ($rootScope, $scope, $sce, $location, $window, $q, $anchorScroll, WPConfig, content, Config, Utils, DomHelper, Zergling, analytics, Translator, TimeoutWrapper) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.sports = null;
    $scope.cmsTimeZone = WPConfig.cmsTimeZone;
    $scope.selectedNewsSport = {id: undefined};
    $scope.selectedNews = null;
    $scope.numberOfRecentNews = WPConfig.news.numberOfRecentNews;
    $scope.showSportNewsSidebar = Utils.isObjectEmpty($rootScope.betEvents);
    $scope.goToTop = DomHelper.goToTop;

    var increaseBy;
    var currentNewsIndex = 0;
    var scrolledOffset = 0;
    var timer;

    /**
     * @ngdoc method
     * @name createSportsMoreDropdown
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description Create more sports dropdown
     */
    function createSportsMoreDropdown() {
        $scope.sportsMore = Utils.getPartToShowInColumns($scope.sports, $scope.maxVisibleSports, WPConfig.news.sportsColumnsNumber, 'title');
    }

    /**
     * @ngdoc method
     * @name configureForWideScreen
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description the "responsiveness" stuff
     */
    var configureForWideScreen = function () {
        $scope.maxVisibleSports = WPConfig.news.maxVisibleSportsWide;
        $scope.newsPerGroup = WPConfig.news.newsPerGroupWide;
        increaseBy = WPConfig.news.increaseByWide;
        if ($scope.recentNews) {
            $scope.recentNewsInGroups = Utils.groupToGroups($scope.recentNews, $scope.newsPerGroup, 'news');
        }
        createSportsMoreDropdown();
    };

    /**
     * @ngdoc method
     * @name configureForSmallScreen
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description the "responsiveness" stuff
     */
    var configureForSmallScreen = function (isNewsPage) {
        $scope.maxVisibleSports = isNewsPage ? WPConfig.news.maxVisibleSports : WPConfig.news.maxVisibleSportsHomePage;
        $scope.newsPerGroup = WPConfig.news.newsPerGroup;
        increaseBy = WPConfig.news.increaseBy;
        if ($scope.recentNews) {
            $scope.recentNewsInGroups = Utils.groupToGroups($scope.recentNews, $scope.newsPerGroup, 'news');
        }
        createSportsMoreDropdown();
    };

    /**
     * @ngdoc method
     * @name getPermaLink
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description get permalink for news
     * @param {Object} news object
     */
    function getPermaLink(news) {
        var link, origin = $window.location.protocol + "//" + $window.location.hostname + ($window.location.port ? ':' + $window.location.port : '');
        if (WPConfig.seoFilesGenerationActive) {
            link = origin + $window.document.location.pathname + 'news/' + decodeURIComponent(news.slug) + '-id' + news.id + '.html';
        } else {
            link = origin + $window.document.location.pathname + '%23' + $location.path() + '%3Fnews=' + news.id + '%23lnews-' + news.id;
        }
        return link;
    }

    /**
     * @ngdoc method
     * @name ckeckIfLinkedGameExists
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  checks if game exists by making request to swarm and sets provided news object's
     * **gameExists** property to true if it's available
     *
     * @param {Object} news news object
     */
    function ckeckIfLinkedGameExists(news) {
        if (news.custom_fields.type.length && news.custom_fields.sport.length && news.custom_fields.competition.length && news.custom_fields.region.length && news.custom_fields.game.length) {
            var type = parseInt(news.custom_fields.type[0], 10),
                sport = parseInt(news.custom_fields.sport[0], 10),
                competition = parseInt(news.custom_fields.competition[0], 10),
                region = parseInt(news.custom_fields.region[0], 10),
                gameId = parseInt(news.custom_fields.game[0], 10);

            var request = {
                'source': 'betting',
                'where': {
                    'sport': {'id': parseInt(sport, 10)},
                    'region' : {'id': region}
                }
            };
            if (gameId) {
                request.what = {'game': ['id']};
                request.where.game = {id: gameId};
                request.where.game.type = type;
            } else if (competition) {
                request.what = {'competition': ['id']};
                request.where.competition = {'id': competition};
            } else {
                request.what = {'region': ['id']};
            }
            Zergling.get(request).then(function (data) {
                if (data.data) {
                    if (gameId) {
                        news.gameExists = data.data.game[gameId] && data.data.game[gameId].id && data.data.game[gameId].id === gameId;
                    } else if (competition) {
                        news.gameExists = competition && data.data.competition[competition] && data.data.competition[competition].id && data.data.competition[competition].id === competition;
                    } else {
                        news.gameExists = region && data.data.region[region] && data.data.region[region].id && data.data.region[region].id === region;
                    }
                }
            });
        }
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description checks if there's a deep linked news and opens it
     */
    $scope.init = function init(isNewsPage) {
        var searchparams = $location.search();
        if (searchparams.news) {
            $scope.articleLoader = true;
            content.getNewsById(searchparams.news, searchparams.secret).then(function (data) {
                if (data.data.status === 'ok') {
                    $scope.landingNews = data.data.post;
                    $scope.landingNews.title = $sce.trustAsHtml($scope.landingNews.title);
                    $scope.landingNews.content = $sce.trustAsHtml($scope.landingNews.content);
                    $scope.landingNews.permalink = getPermaLink($scope.landingNews);
                    ckeckIfLinkedGameExists($scope.landingNews);
                    TimeoutWrapper($anchorScroll, 500);
                }
            })['finally'](function () {
                $scope.articleLoader = false;
            });
        }

        if (isNewsPage) {
            $scope.$on('widescreen.on', function () {
                configureForWideScreen();
            });

            $scope.$on('widescreen.off', function () {
                configureForSmallScreen(true);
            });
        } else {
            configureForSmallScreen(false);
        }
    };

    /**
     * @ngdoc method
     * @name showPermaLink
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description shows a prompt with link to copy
     * @param {String} link link
     */
    $scope.showPermaLink = function showPermaLink(link) {
        $window.prompt(Translator.get('Press Ctrl + C to copy link address to clipboard'), decodeURIComponent(link));
    };

    /**
     * @ngdoc method
     * @name loadSports
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description loads sports list using {@link CMS.service:content content} service's **getSports** method
     * and assigns to scope's 'sports' variable
     */
    $scope.loadSports = function loadSports() {
        content.getSports().then(function (response) {
            if (response.data && response.data.categories) {
                if (WPConfig.hiddenNewsCategoryIds.length && response.data.categories.length) {
                    angular.forEach(WPConfig.hiddenNewsCategoryIds, function (id) {
                        Utils.removeElementFromArray(response.data.categories, Utils.getArrayObjectElementHavingFieldValue(response.data.categories, 'id', id.toString()));
                    });
                }
                $scope.sports = response.data.categories;
                createSportsMoreDropdown();
                //$scope.setTitle('News');
                console.log('news sports', $scope.sports);
            }

        });
    };

    /**
     * @ngdoc method
     * @name loadRecentNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description loads recent news using {@link CMS.service:content content} service's **getRecentNews** method
     * and assigns to scope's 'recentNews' variable.
     * Checks if there are more news to load and if no, sets scope's **noMoreNews** variable to true
     */
    $scope.loadRecentNews = function loadRecentNews(count, sportId, startLooping) {
        count = count || 10;
        $scope.newsAreLoading = true;
        content.getRecentNews(count, sportId).then(function (response) {
            $scope.newsAreLoading = false;
            if (response.data && response.data.posts) {
                $scope.recentNews = response.data.posts;
                var i;
                for (i = 0; i < $scope.recentNews.length; i++) {
                    $scope.recentNews[i].titleRaw = angular.element('<div/>').html($scope.recentNews[i].title).text(); //decode html entities
                    $scope.recentNews[i].title = $sce.trustAsHtml($scope.recentNews[i].title);
                    $scope.recentNews[i].content = $sce.trustAsHtml($scope.recentNews[i].content);
                    $scope.recentNews[i].permalink = getPermaLink($scope.recentNews[i]);
                }
                if ($scope.newsPerGroup) {
                    $scope.recentNewsInGroups = Utils.groupToGroups($scope.recentNews, $scope.newsPerGroup, 'news');
                }

                $scope.noMoreNews = response.data.count_total <= $scope.numberOfRecentNews;

                if (!Config.main.oldHomepage || Config.main.betterHomepage) {
                    if (timer) {
                        TimeoutWrapper.cancel(timer);
                    }
                    currentNewsIndex = 0;
                    scrolledOffset = 0;
                    //$scope.selectedNews = $scope.recentNews[currentNewsIndex];
                    DomHelper.scrollTop('newsBlockID', 0);
                    if (startLooping && ($location.path() !== '/news/')) {
                        $scope.loopThroughNews();
                    }
                }
            }
        });
    };

    /**
     * @description stops news looping when one leaves the page
     */
    /*$scope.$on('$locationChangeStart', function (event) {
        if (timer) {
            TimeoutWrapper.cancel(timer);
        }
    });*/

    /**
     * @ngdoc method
     * @name loopThroughNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description loops through the news
     *
     * @param {Boolean} scrolled detects if user was scrolling through
     */
    $scope.loopThroughNews = function loopThroughNews(scrolled) {
        if($scope.recentNews === undefined){
            return;
        }
        $scope.selectedNews = $scope.recentNews[currentNewsIndex];
        scrolledOffset = DomHelper.scrollVisible('newsBlockID', $scope.selectedNews.id, scrolled, 65, 259, scrolledOffset);
        currentNewsIndex++;
        currentNewsIndex = currentNewsIndex >= $scope.recentNews.length ? 0 : currentNewsIndex;
        timer = TimeoutWrapper(function () {loopThroughNews(); }, 3000);
    };

    /**
     * @ngdoc method
     * @name showHightlightedNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  stop looping through the news and keep selected news highlighted
     *
     * @param {object} news news object
     */
    $scope.showHightlightedNews = function showHightlightedNews(news) {
        $scope.selectedNews = news;
        currentNewsIndex = $scope.recentNews.indexOf(news);
        TimeoutWrapper.cancel(timer);
    };

    /**
     * @ngdoc method
     * @name showNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  Sets selected news
     *
     * @param {object} news news object
     */
    $scope.showNews = function showNews(news, groupId) {
        $scope.landingNews = null; // hide deeplinked news if exists
        $location.hash('');

        if ($scope.selectedNews === news) {
            $scope.closeNews();
            return;
        }
        analytics.gaSend('send', 'event', 'news', 'show homepage news',  {'page': $location.path(), 'eventLabel': news.categories[0].title});
        analytics.gaSend('send', 'event', 'news', 'homepage news by ID',  {'page': $location.path(), 'eventLabel': news.id});
        $scope.selectedNews = news;
        $scope.selectedNewsGroupId = groupId;
        if (typeof $scope.selectedNews.content === 'string') { //not to do it twice
            $scope.selectedNews.content = $sce.trustAsHtml($scope.selectedNews.content);
        }
        if (typeof $scope.selectedNews.title === 'string') { //not to do it twice
            $scope.selectedNews.title = $sce.trustAsHtml($scope.selectedNews.title);
        }

        ckeckIfLinkedGameExists($scope.selectedNews);
        TimeoutWrapper(function () {
            DomHelper.scrollIntoView('news' + $scope.selectedNews.id);
        }, 50);

        if (Config.main.sportNewsBlockNewWindow) {
            $rootScope.preventDefault();
        }
    };

    /**
     * @ngdoc method
     * @name selectNewsSport
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  Sets sport to show news for
     *
     * @param {object} sport sport object (must have id)
     */
    $scope.selectNewsSport = function selectNewsSport(sport) {
        if($scope.selectedNewsSport.id === sport.id) {
            return;
        }
        $scope.hideSportListDropdown = null;
        $scope.selectedNewsSport = sport;
        $scope.numberOfRecentNews = WPConfig.news.numberOfRecentNews; //reset (in case it was increased by clicking 'load more'
        $scope.loadRecentNews($scope.numberOfRecentNews, sport.id, true);
        $scope.selectedNews = null;
        var index = $scope.sports.indexOf(sport);
        if (index >= $scope.maxVisibleSports) {
            $scope.sports.splice(index, 1);
            $scope.sports.unshift($scope.selectedNewsSport);
        }
        createSportsMoreDropdown();
        Utils.setJustForMoment($scope, 'hideSportListDropdown', true, 500);
    };

    /**
     * @ngdoc method
     * @name loadMoreNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  Increases number of recent news to show by 3 and loads them
     * (loading all news again is not optimal, but specifying offset and appending additional news
     * to already loaded ones seems tricky, maybe this will be done later)
     */
    $scope.loadMoreNews = function loadMoreNews() {
        if ($scope.newsAreLoading) {
            return;
        }
        $scope.newsAmountIncreased = true;
        $scope.numberOfRecentNews += increaseBy;
        if (!$scope.noMoreNews) {
            $scope.loadRecentNews($scope.numberOfRecentNews, $scope.selectedNewsSport.id);
        }
    };

    /**
     * @ngdoc method
     * @name getPromotedGames
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  retrieves promoted games(competitions) from swarm
     *
     * @param {Boolean} [gamesOfCompetition] optional. if true, will retrieve games of promoted competitions, if false or omitted, promoted games
     *
     * @returns {Promise} promise that will be resolved with game data
     */
    function getPromotedGames(gamesOfCompetition) {
        var promotedObject = gamesOfCompetition ? 'competition' : 'game';
        var competitionGames = $q.defer();
        var result = competitionGames.promise;
        var request = {
            'source': 'betting',
            'what': { game: ['team1_name', 'team2_name', 'id', 'type'], 'event': [], market: ['id'], sport: ['id'], competition: ['id', 'name'], region: ['id']},
            'where': {event: {type: {'@in': ['P1', 'X', 'P2']}}}
        };
        request.where.game = {};
        request.where[promotedObject] = {'promoted': true};
        Zergling.get(request).then(function (response) {
            var games = [];
            angular.forEach(response.data.sport, function (sport) {
                angular.forEach(sport.region, function (region) {
                    angular.forEach(region.competition, function (competition) {
                        angular.forEach(competition.game, function (game) {
                            angular.forEach(game.market, function (market) {
                                game.events = Utils.createMapFromObjItems(market.event, 'type');
                                game.sport = {id: sport.id};
                                game.region = {id: region.id};
                                game.competition = {id: competition.id, name: competition.name};
                                game.market = {id: market.id};
                                games.push(game);
                            });
                        });
                    });
                });
            });
            competitionGames.resolve(games);
        })['catch'](function (response) {
            competitionGames.reject(response);
        });
        return result;
    }

    $scope.bet = function bet(event, market, game) {
        $rootScope.$broadcast('bet', {event: event, market: market, game: game});
    };

    /**
     * @ngdoc method
     * @name gotoGame
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description  Navigates to provided game
     *
     * @param {Object} game game object
     */
    $scope.gotoGame = function gotoGame(game) {
        $location.path('/sport');
        $location.search({
            'game' : game.id,
            'sport': game.sport.id,
            'competition': game.competition.id,
            'type': game.type,
            'region': game.region.id
        });
    };

    var activeBannerIndex = 0;
    /**
     * @ngdoc method
     * @name rotateBanners
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   rotates banners by setting "active" property
     *
     * @param {Array} banners banners array
     * @param {Number} period rotation period in milliseconds
     */
    function rotateBanners(banners, period) {
        if (!banners) {
            return;
        }
        banners.map(function (banner, index) {banner.active = (activeBannerIndex === index); });
        // if banner is video
        if (banners[activeBannerIndex] && banners[activeBannerIndex].videolink) {
            $scope.startPlayVideoBanner = true;
            period = $scope.bannerVideoDuration;
        } else {
            $scope.startPlayVideoBanner = false;
            period = Config.main.underBetslipBannersRotationPeriod;
        }
        activeBannerIndex++;
        activeBannerIndex = activeBannerIndex >= banners.length ? 0 : activeBannerIndex;
        TimeoutWrapper(function () { rotateBanners(banners, period); }, period);
    }

    /**
     * @description Set video banner duration
     * @param duration (Number)
     */
    $scope.setBannerVideoDuration = function (duration) {
        $scope.bannerVideoDuration = duration;
    };

    /**
     * @ngdoc method
     * @name getBanners
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   populates $scope's **banner** variable with banner information got from cms
     *
     * @param {string} [containerId] optional. id of container to get banner for
     */
    $scope.getBanners = function getBanners(containerId) {
        var promises = {};
        $scope.banners = [];
        if (containerId) {
            promises.banners = content.getWidget(containerId);
        } else {
            promises.commonBanners = content.getWidget('sidebar-1'); //banners for all langs
            promises.banners = content.getWidget('under-betslip-banners-' + $rootScope.env.lang);
        }

        if (Config.main.showPromotedGames && Config.main.showPromotedGames.betslipBanners) {
            if (Config.main.showPromotedGames.betslipBanners.game > 0) {
                promises.games  = getPromotedGames();
            }
            if (Config.main.showPromotedGames.betslipBanners.competition > 0) {
                promises.competitionGames = getPromotedGames('competition');
            }
        }
        $q.all(promises).then(function (resolveObj) {
            console.log('banners promise resolved with', resolveObj);
            var bannersResponse = resolveObj.banners, commonBannersResponse = resolveObj.commonBanners, i, j;
            if (commonBannersResponse && commonBannersResponse.data && commonBannersResponse.data.widgets && commonBannersResponse.data.widgets.length) {
                angular.forEach(commonBannersResponse.data.widgets, function (widget) {
                    $scope.banners.push(widget.instance);
                });
            }
            if (bannersResponse && bannersResponse.data && bannersResponse.data.widgets && bannersResponse.data.widgets.length) {
                angular.forEach(bannersResponse.data.widgets, function (widget) {
                    $scope.banners.push(widget.instance);
                });
            }
            if (resolveObj.games) {
                for (i = 0, j = 0; i < resolveObj.games.length && i < Config.main.showPromotedGames.betslipBanners.game && j < $scope.banners.length; i++, j++) {
                    $scope.banners[j].game = resolveObj.games[i];
                }
            }
            if (resolveObj.competitionGames) {
                for (i = 0; i < resolveObj.competitionGames.length && j < $scope.banners.length; i++, j++) {
                    $scope.banners[j].game = resolveObj.competitionGames[i];
                }
            }
            if (Config.main.underBetslipBannersRotationPeriod) {
                rotateBanners($scope.banners, Config.main.underBetslipBannersRotationPeriod);
            } else {
                $scope.banners.map(function (banner) {banner.active = true; });
            }
            console.log('banners:', $scope.banners);
        });
    };

    $scope.$on('betslip.isEmpty', function () {$scope.hideRightBanner = false; });
    $scope.$on('betslip.hasEvents', function () {$scope.hideRightBanner = true; });

    /**
     * @ngdoc method
     * @name closeNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   closes open news
     */
    $scope.closeNews = function closeNews() {
        $scope.selectedNews = null;
        $scope.landingNews = null;
        $location.search({});
    };

    $scope.$on('betslip.isEmpty', function () {$scope.showSportNewsSidebar = true; });
    $scope.$on('betslip.hasEvents', function () {$scope.showSportNewsSidebar = false; });


    /**
     * @ngdoc method
     * @name getHomepageBanners
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   populates $scope's **banner** variable with banner information got from cms
     *
     * @param {string} [containerId] optional. id of container to get banner for
     */
    $scope.getHomepageBanners = function getHomepageBanners(containerId) {
        $scope.homepageBannersLoading = true;
        containerId = containerId || content.getSlug('bannerSlugs.homepageBanners');
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.homepageBanners = [];
                angular.forEach(response.data.widgets, function (widget) {
                    widget.instance.description = $sce.trustAsHtml(Translator.get(widget.instance.description));
                    widget.instance.title = $sce.trustAsHtml(widget.instance.title);
                    $scope.homepageBanners.push(widget.instance);
                });
            }
        })['finally'](function () {
            $scope.homepageBannersLoading = false;
        });
    };

    $scope.rotationPaused = false; // is set to true when hovering image, to pause rotation

    /**
     * @ngdoc method
     * @name rotateFeaturedGames
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description rotates (changes selected index) featured games periodically
     */
    function rotateFeaturedGames() {
        TimeoutWrapper(rotateFeaturedGames, Config.main.featuredGames.rotationPeriod);
        if ($scope.rotationPaused || !$scope.selectedHomepageGames) {
            return;
        }
        if ($scope.selectedGameIndex < $scope.selectedHomepageGames.length - 1) {
            $scope.selectedGameIndex++;
        } else {
            $scope.selectedGameIndex = 0;
        }
    }


    /**
     * @description slides banners
     * @param direction sliding direction
     */
    $scope.slideBanners = function slideBanners(direction) {
        switch (direction) {
            case 'left':
                if ($scope.selectedGameIndex > 0) {
                    $scope.selectedGameIndex--;
                }
                break;
            case 'right':
                if ($scope.selectedGameIndex < $scope.selectedHomepageGames.length - 1) {
                    $scope.selectedGameIndex++;
                }
                break;
        }
    }

    /**
     * @ngdoc method
     * @name getSelectedHomepageGames
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   populates $scope's **selectedHomepageGames** variable with featured games and selects random one
     */
    $scope.getSelectedHomepageGames = function getSelectedHomepageGames() {
        var getPageFn = WPConfig.bannerSlugs.homepageRotatingBanners.isWidget ? 'getWidget' : 'getPage';
        content[getPageFn](content.getSlug('bannerSlugs.homepageRotatingBanners'), true).then(function (data) {
            if (data.data.status === 'ok') {
                var rootPage = data.data.page;
                $scope.selectedHomepageGames = [];
                if (rootPage && rootPage.children && rootPage.children.length > 0) {
                    var i, regexp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
                    for (i = 0; i < rootPage.children.length; i++) {
//                if (new Date() - Date.parse(page.children[i].modified)  < Config.main.homepageSelectedGameLifetime) {
                        if (rootPage.children[i].status === 'future') {
                            rootPage.children[i].content = $sce.trustAsHtml(rootPage.children[i].content);
                            if (rootPage.children[i].custom_fields.link && rootPage.children[i].custom_fields.link[0] && rootPage.children[i].custom_fields.link[0].length > 1) {
                                rootPage.children[i].link = rootPage.children[i].custom_fields.link[0];
                                rootPage.children[i].isExternal = true;
                                if (rootPage.children[i].link.match(regexp)) {
                                    rootPage.children[i].isYouTubeVideo = true;
                                }
                                rootPage.children[i].target = rootPage.children[i].custom_fields.new_window[0] === '1' ? "_blank" : "_self";
                            } else {
                                rootPage.children[i].link = "#/sport/?type=" + rootPage.children[i].custom_fields.type[0] + "&sport=" + rootPage.children[i].custom_fields.sport[0] + "&game=" + rootPage.children[i].custom_fields.game[0]  + "&competition=" + rootPage.children[i].custom_fields.competition[0]  + "&region=" + rootPage.children[i].custom_fields.region[0];
                                rootPage.children[i].target = "_self";
                            }
                            if (rootPage.children[i].custom_fields.flash_banner_url) {
                                rootPage.children[i].flash_banner_url = $sce.trustAsResourceUrl(rootPage.children[i].custom_fields.flash_banner_url + "");
                            }
                            $scope.selectedHomepageGames.push(rootPage.children[i]);
                        }
                    }
                }
                $scope.selectedGameIndex = $scope.selectedHomepageGames.length < 6 ? -1 : Math.floor(Math.random() * $scope.selectedHomepageGames.length);
            }
            rotateFeaturedGames();
        });
    };

    /**
     * @ngdoc method
     * @name openHelpPage
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description sends a message to cmsPagesCtrl to open help page specified by **slug**
     *
     * @param pageSlug
     */
    $scope.openHelpPage = function openHelpPage(pageSlug) {
        $rootScope.$broadcast('openHelpPage', {slug: pageSlug, from: 'footer'});
    };

    /**
     * @ngdoc method
     * @name bannerClick
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description sends ga message and checks whether the banner contains url of youtube video,if yes sends message to open it in popup
     *
     * @param {Object} [banner]  current object of slider
     */
    $scope.bannerClick = function bannerClick(banner) {
        analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'homepage big banner click: ' + (banner.title_plain || banner.title)});

        if (banner.link === 'openRules') {
            $rootScope.$broadcast('freeWinners.showPopupRules');
        } else if (banner.isYouTubeVideo) {
            $rootScope.$broadcast('youtube.videourl', banner.link);
        }
    };

    $rootScope.$on(
        '$locationChangeSuccess', function () {
        if ($location.search() && $location.search().action) {
            switch ($location.search().action) {
                case 'register':
                    if (!Config.main.registration.enable) {
                        return;
                    }
                    $scope.env.showSlider = true;
                    $scope.env.sliderContent = 'registrationForm';
                    return;
                case 'login':
                    if (!Config.main.registration.enableSignIn) {
                        return;
                    }
                    $scope.env.showSlider = true;
                    $scope.env.sliderContent = 'signInForm';
                    return;
            }
        }
    });

    $scope.gotoSelectedNews = function gotoSelectedNews(news) {
        news = news || {};
        $window.parent.postMessage(
            {
                action: 'open_news',
                data: {
                    'id': news.id
                }
            },
            '*'
        );
    };
    $scope.dropdownOpen=false; // dropdown default close

}]);