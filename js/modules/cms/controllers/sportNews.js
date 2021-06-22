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
    $scope.offsetOfRecentNews = 0;
    $scope.numberOfRecentNews = WPConfig.news.numberOfRecentNews;
    $scope.showSportNewsSidebar = Utils.isObjectEmpty($rootScope.betEvents);
    $scope.goToTop = DomHelper.goToTop;
    $scope.dropdownOpen = false; // dropdown default close

    var increaseBy;
    var currentNewsIndex = 0;
    var scrolledOffset = 0;
    var timer;
    var isNewsPage;
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
        if (isNewsPage) { $scope.maxVisibleSports = WPConfig.news.maxVisibleSports }
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
        return window.location.origin + encodeURIComponent(news.share_src);
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
    $scope.init = function init(fromNewsPage) {
        isNewsPage = fromNewsPage;
        var searchparams = $location.search();
        if (searchparams.news) {
            $scope.articleLoader = true;
            content.getNewsById(searchparams.news, searchparams.secret).then(function (data) {
                if (data.data.status === 'ok') {
                    $scope.landingNews = data.data.post;
                    $scope.landingNews.permalink = getPermaLink($scope.landingNews);
                    $scope.landingNews.title = $sce.trustAsHtml($scope.landingNews.title);
                    $scope.landingNews.content = $sce.trustAsHtml($scope.landingNews.content);
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
                $scope.sports.sort(Utils.orderSorting);
                if (isNewsPage) {
                    createSportsMoreDropdown();
                    var category = $location.search().category;
                    var foundResults = $scope.sports.filter(function (item) {
                        return item.name === category;
                    });
                    if (foundResults.length > 0 && category !== undefined) {
                        $scope.selectNewsSport({name: category});
                    } else {
                        $location.search("category", undefined);
                        $scope.loadRecentNews(0, $scope.numberOfRecentNews, undefined);
                    }
                }

                //$scope.setTitle('News');
                console.log('news sports', $scope.sports);
            }
        });
    };

    /**
     * @ngdoc method
     * @name processNewsValues
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description Sets trusted valued for news items
     */
    function processNewsValues (posts) {
        var i;
        for (i = 0; i < posts.length; i++) {
            posts[i].titleRaw = angular.element('<div/>').html(posts[i].title).text(); //decode html entities
            posts[i].permalink = getPermaLink(posts[i]);
            posts[i].title = $sce.trustAsHtml(posts[i].title);
            posts[i].content = $sce.trustAsHtml(posts[i].content);

        }
    }

    /**
     * @ngdoc method
     * @name loadRecentNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description loads recent news using {@link CMS.service:content content} service's **getRecentNews** method
     * and assigns to scope's 'recentNews' variable.
     * Checks if there are more news to load and if no, sets scope's **noMoreNews** variable to true
     */
    $scope.loadRecentNews = function loadRecentNews(offset, count, sportName, startLooping) {
        if ($scope.newsAreLoading || $scope.preventFastClick) {
            return;
        }

        offset = offset || 0;
        count = count || 10;
        $scope.newsAreLoading = true;
        $scope.preventFastClick = true;
        content.getRecentNews(offset, count, sportName).then(function (response) {
            $scope.preventFastClick = true;
            TimeoutWrapper(function () {
                $scope.preventFastClick = false;
            }, 400);

            $scope.newsAreLoading = false;
            if (response.data && response.data.posts) {
                var i;
                processNewsValues(response.data.posts);

                if (sportName !== $scope.oldSportName) {
                    $scope.recentNews = [];
                    $scope.oldSportName = sportName;
                } else {
                    $scope.recentNews = $scope.recentNews || [];
                }

                for (i = 0; i < response.data.posts.length; i++) {
                    $scope.recentNews[i + offset] = response.data.posts[i];
                }
                if ($scope.newsPerGroup) {
                    $scope.recentNewsInGroups = Utils.groupToGroups($scope.recentNews, $scope.newsPerGroup, 'news');
                }

                $scope.noMoreNews = response.data.count_total <= offset + $scope.numberOfRecentNews;

                TimeoutWrapper.cancel(timer);

                currentNewsIndex = 0;
                scrolledOffset = 0;
                //$scope.selectedNews = $scope.recentNews[currentNewsIndex];
                DomHelper.scrollTop('newsBlockID', 0);
                if (startLooping && ($location.path() !== '/news/')) {
                    $scope.loopThroughNews();
                }
            }
        });
    };

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
        if ($scope.selectedNews && $scope.selectedNews.id) {
            scrolledOffset = DomHelper.scrollVisible('newsBlockID', $scope.selectedNews.id, scrolled, 65, 259, scrolledOffset);
        }
        currentNewsIndex++;
        currentNewsIndex = currentNewsIndex >= $scope.recentNews.length ? 0 : currentNewsIndex;
        timer = TimeoutWrapper($scope.loopThroughNews, 3000);
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
    $scope.showNews = function showNews(news) {
        $scope.landingNews = null; // hide deeplinked news if exists
        $location.hash('');

        if ($scope.selectedNews === news) {
            $scope.closeNews();
            return;
        }
        analytics.gaSend('send', 'event', 'news', 'show homepage news',  {'page': $location.path(), 'eventLabel': news.categoryTitle});
        analytics.gaSend('send', 'event', 'news', 'homepage news by ID',  {'page': $location.path(), 'eventLabel': news.id});
        $scope.selectedNews = news;

        if (typeof $scope.selectedNews.content === 'string') { //not to do it twice
            $scope.selectedNews.content = $sce.trustAsHtml($scope.selectedNews.content);
        }
        if (typeof $scope.selectedNews.title === 'string') { //not to do it twice
            $scope.selectedNews.title = $sce.trustAsHtml($scope.selectedNews.title);
        }

        ckeckIfLinkedGameExists($scope.selectedNews);
        $location.search("news", $scope.selectedNews.id);

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
        if($scope.selectedNewsSport.name === sport.name) {
            return;
        }
        $scope.hideSportListDropdown = null;
        $scope.selectedNewsSport = sport;
        if (isNewsPage) {
            $location.search("category", sport.name);
        }
        $scope.offsetOfRecentNews = 0;
        $scope.numberOfRecentNews = WPConfig.news.numberOfRecentNews; //reset (in case it was increased by clicking 'load more'
        $scope.loadRecentNews(0, $scope.numberOfRecentNews, sport.name, true);
        $scope.selectedNews = null;
        var index = $scope.sports.indexOf(sport);
        if (index >= $scope.maxVisibleSports) {
            $scope.sports.splice(index, 1);
            $scope.sports.unshift($scope.selectedNewsSport);
        }
        isNewsPage && createSportsMoreDropdown();
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
        if ($scope.newsAreLoading || $scope.preventFastClick) {
            return;
        }
        $scope.newsAmountIncreased = true;
        $scope.offsetOfRecentNews += WPConfig.news.numberOfRecentNews;
        if (!$scope.noMoreNews) {
            $scope.loadRecentNews($scope.offsetOfRecentNews, $scope.numberOfRecentNews, $scope.selectedNewsSport.name);
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
            'what': { game: ['team1_name', 'team2_name', 'id', 'type'], 'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "base", "home_value", "away_value", "display_column"], market: ['id'], sport: ['id'], competition: ['id', 'name'], region: ['id']},
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
     * @param {Boolean} notCallTimeout is run timeout
     */
    function rotateBanners(banners, period, notCallTimeout) {
        if (!banners) {
            return;
        }
        var firstAvailableBannerIndex = null;
        var nextAvailableBannerIndex = null;
        var changeNext = null;
        var firstNext = null;
        var currentIndexIsAvailable = false;
        var calculateIndexes = function (i) {
            if (activeBannerIndex === i) {
                currentIndexIsAvailable = true;
            }
            if (firstAvailableBannerIndex === null) {
                firstAvailableBannerIndex = i;
                if (activeBannerIndex === 0) {
                    activeBannerIndex = firstAvailableBannerIndex;
                }
            }else {
                if (firstNext === null) {
                    firstNext = i;
                }
                if (i > activeBannerIndex && nextAvailableBannerIndex === null) {
                    nextAvailableBannerIndex = i;
                }else if(changeNext === null && nextAvailableBannerIndex !== null && i > nextAvailableBannerIndex){
                    changeNext = i;
                }
            }
        };
        for(var i = 0; i < banners.length; ++i) {
            var banner = banners[i];
            if ($rootScope.env.authorized) {
                if ({'0': true, '1': true}[banner.show_for]) {
                    calculateIndexes(i);
                }
            } else {
                if ({'0': true, '2': true}[banner.show_for]) {
                    calculateIndexes(i);
                }
            }
            banner.active = false;
        }

        if (!currentIndexIsAvailable){
            if (nextAvailableBannerIndex !== null) {
                activeBannerIndex = nextAvailableBannerIndex;
            } else {
                changeNext = firstNext;
                activeBannerIndex = firstAvailableBannerIndex || 0;
            }
        } else {
            changeNext = nextAvailableBannerIndex;
        }
        banners[activeBannerIndex].active = true;

        // if banner is video
        if (banners[activeBannerIndex] && banners[activeBannerIndex].videoLink) {
            $scope.startPlayVideoBanner = true;
            period = $scope.bannerVideoDuration;
        } else {
            $scope.startPlayVideoBanner = false;
            period = Config.main.underBetslipBannersRotationPeriod;
        }
        if (changeNext !== null) {
            activeBannerIndex = changeNext;
        } else {
            activeBannerIndex = firstAvailableBannerIndex || 0;
        }
        if (!notCallTimeout) {
            TimeoutWrapper(function () { rotateBanners(banners, period); }, period);

        }
    }

    /**
     * @ngdoc method
     * @name underBetSlipBannerClick
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   handles banner click
     *
     * @param {Object} banner the banner's object
     */
    $scope.underBetSlipBannerClick = function(banner) {
        analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'betslip banner click: ' + banner.link });

        if (banner.link && banner.link.indexOf($location.path()) !== -1) {
            $rootScope.$broadcast('sportsbook.handleDeepLinking');
        }
    };

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
    function getBanners(containerId) {
        var promises = {};
        $scope.banners = [];
        if (containerId) {
            promises.banners = content.getWidget(containerId);
        } else {
            promises.commonBanners = content.getWidget('sidebar-1'); //banners for all langs
            promises.banners = content.getWidget('under-betslip-banners-classic-' + $rootScope.env.lang);
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
            if (Config.main.underBetslipBannersRotationPeriod && $scope.banners.length > 1) {
                rotateBanners($scope.banners, Config.main.underBetslipBannersRotationPeriod);
            } else {
                $scope.banners.map(function (banner) {banner.active = true; });
            }
            var adPageLink = $location.search().adpage;
            if (adPageLink && $scope.banners.length) {
                $scope.banners.map(function (banner) {
                    banner.link = adPageLink;
                });
                $location.search('adpage', undefined);
            }
        });
    }

    $scope.$on('betslip.isEmpty', function () {$scope.showRightBanners = true; $scope.showSportNewsSidebar = true;});
    $scope.$on('betslip.hasEvents', function () {$scope.showRightBanners = false; $scope.showSportNewsSidebar = false;});


    $scope.getBetslipBanners = function getBetslipBanners() {
        var pathSlugMap = {
            '/sport/': 'under-betslip-banners-classic-',
            '/virtualsports/': 'under-betslip-banners-virtualsports-',
            '/insvirtualsports/': 'under-betslip-banners-virtualsports-',
            '/customsport/cyber/': 'under-betslip-banners-customsport-cyber-',
            '/esports/': 'under-betslip-banners-esports-'
        };

        getBanners((pathSlugMap[$location.path()] || pathSlugMap['/sport/']) + $scope.env.lang);
    };

    /**
     * @ngdoc method
     * @name closeNews
     * @methodOf CMS.controller:cmsSportNewsCtrl
     * @description   closes open news
     */
    $scope.closeNews = function closeNews() {
        $scope.selectedNews = null;
        $scope.landingNews = null;
        $location.search("news", undefined);
    };

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
                $scope.homepageBanners = {
                    true: [],
                    false: []
                };
                angular.forEach(response.data.widgets, function (widget) {
                    widget.instance.custom_fields.label && (widget.instance.custom_fields.label[0] = $sce.trustAsHtml(Translator.get(widget.instance.custom_fields.label[0])));
                    widget.instance.title = $sce.trustAsHtml(widget.instance.title);
                    if (widget.instance.show_for === '1' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                        $scope.homepageBanners.true.push(widget.instance);
                    }
                    if (widget.instance.show_for === '2' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                        $scope.homepageBanners.false.push(widget.instance);
                    }
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
        $scope.previousBanner = true; // SDC-27978 Can be deleted, if not needed anymore
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
    $scope.bannerClick = function bannerClick(banner, getLink) {
        if (!getLink) {
            analytics.gaSend('send', 'event', 'news', {
                'page': $location.path(),
                'eventLabel': 'homepage big banner click: ' + (banner.title_plain || banner.title)
            });
        }

        if (banner.link === 'openRules') {
            !getLink && $rootScope.$broadcast('freeWinners.showPopupRules');
        } else if (banner.isYouTubeVideo) {
            !getLink && $rootScope.$broadcast('youtube.videourl', banner.link);
        } else if((banner.link.indexOf('action=register') !== -1 || banner.link.indexOf('action=login') !== -1) && $scope.env.authorized){
            return;
        } else if (banner.target && banner.target === '_blank') {
            !getLink && $window.open(banner.link, '_blank');
        } else {
            return banner.link;
        }
    };

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

    $scope.$on('update.count', function(event, count) {
        $scope.maxVisibleSports = count;
        createSportsMoreDropdown();
    });

    if (Config.main.underBetslipBannersRotationPeriod) {
        $scope.$watch('env.authorised', function (newValue, oldValue) {
            if ($scope.banners && $scope.banners.length && newValue !== oldValue) {
                rotateBanners($scope.banners, Config.main.underBetslipBannersRotationPeriod, true);
            }
        });
    }
}]);
