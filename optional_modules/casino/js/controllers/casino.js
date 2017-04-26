/**
 * @ngdoc controller
 * @name CASINO.controller:casinoCtrl
 * @description
 * casino page controller
 */

CASINO.controller('casinoCtrl', ['$rootScope', '$scope', '$sce', '$location', '$route', 'TimeoutWrapper', '$filter', 'CConfig', 'Zergling', 'casinoData', 'Utils', 'casinoUtils', 'Translator', 'casinoCache', 'analytics', 'content', function ($rootScope, $scope, $sce, $location, $route, TimeoutWrapper, $filter, CConfig, Zergling, casinoData,  Utils, casinoUtils, Translator, casinoCache, analytics, content) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.mainCategories = null;
    $scope.moreCategories = null;
    $scope.selectedCategoryGames = [];
    $scope.slideIndex = 0;
    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    $rootScope.footerMovable = true;
    $scope.providerMenuDefaultOffset = CConfig.main.hideCasinoJackpotSlider ? 366 :666;
    $scope.categoryMenuDefaultOffset = 710;
    $scope.jackpotSlideIndex = 0;
    //new casino design
    $scope.jackpotSliderVisibleGamesCount = 4;
    $scope.selectedProvider = {
        name: ''
    };
    $scope.cConf = {
        iconsUrl: CConfig.cUrlPrefix + CConfig.iconsUrl,
        backGroundUrl: CConfig.cUrlPrefix + CConfig.backGroundUrl,
        downloadEnabled: CConfig.main.downloadEnabled,
        realModeEnabled: CConfig.main.realModeEnabled,
        newCasinoDesignEnabled: CConfig.main.newCasinoDesign.enabled,
        fourGameViewEnable: CConfig.main.fourGameViewEnable,
        hideCasinoRightBanners: CConfig.main.hideCasinoRightBanners,
        hideCasinoJackpotSlider: CConfig.main.hideCasinoJackpotSlider,
        providerMenuDefaultOffset: CConfig.main.providerMenuDefaultOffset,
        funModeEnabled: CConfig.main.funModeEnabled,
        showBannerInsteadOfBiggestWinners: CConfig.main.biggestWinners.showBannerInsteadOfBiggestWinners
    };
    $scope.providersMenuState = {
        isClosed: true
    };

    function groupPopularsToGroups(popularGames, popularsPerGroup) {
        var i, g, j, groups = [];
        for (i = 0, g = 0, j = popularGames.length; i < j; i += 1) {
            if (groups[g] === undefined) {
                groups[g] = [];
            }
            groups[g].push(popularGames[i]);
            if (groups[g].length === popularsPerGroup) {
                g++;
            }
        }
        return groups;
    }

    function createCategoriesMoreDropdown() {
        if ($scope.categories && $scope.categories.length) {
            $scope.mainCategories = $scope.categories.length > $scope.numberOfMainCategories && !$scope.cConf.newCasinoDesignEnabled ? $scope.categories.slice(0, $scope.numberOfMainCategories) : $scope.categories;
            $scope.moreCategories = Utils.getPartToShowInColumns($scope.categories, $scope.numberOfMainCategories, CConfig.main.moreColumnNumber, 'categoryName');
            //$scope.moreCategories = Utils.getAdditionalItems($scope.categories, $scope.numberOfMainCategories, 'categoryName', 'category');
        }
    }

    function createPopularsPerGroups() {
        if ($scope.popularGames && $scope.popularGames.length) {
            var numberOfGroups = $scope.wideMode ? 7: 4;
            $scope.popularsPerGroups = groupPopularsToGroups($filter('filter')($scope.popularGames, {'providerFilter': $scope.selectedProvider.name}), numberOfGroups);
            $scope.slideIndex = 0;
        }
    }

    //Watch categories list and (re)generate the "more" dropdown block as they change
    $scope.$watch('categories', createCategoriesMoreDropdown);

    //Watch popularGames list and (re)generate the  popularsPerGroups as the change
    $scope.$watch('popularGames', createPopularsPerGroups);

    $scope.$on('widescreen.on', function () {
        $scope.numberOfMainCategories = CConfig.main.maxVisibleCategoriesWide;
        $scope.numberOfRecentGames = CConfig.main.numberOfRecentGamesWide;
        $scope.wideMode = true;
        createCategoriesMoreDropdown();
        createPopularsPerGroups();
    });

    $scope.$on('widescreen.off', function () {
        $scope.numberOfMainCategories = CConfig.main.maxVisibleCategories;
        $scope.numberOfRecentGames = CConfig.main.numberOfRecentGames;
        $scope.wideMode = false;
        createCategoriesMoreDropdown();
        createPopularsPerGroups();
        //checkViewDetails();
    });

    $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
    $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });

    /**
     * @ngdoc method
     * @name loadAllGames
     * @methodOf CASINO.controller:casinoCtrl
     * @description loads populars and top slot games lists using {@link CASINO.service:casinoData casinoData} service's **getCategory** method
     */
    function loadHomePageGames() {
        $scope.loadingProcess = true;
        if ($scope.selectedCategory.category === 'AllGames') {
            casinoData.getFilterOptions().then(function (response) {
                if (response.data) {
                    var allHPGames = casinoUtils.filterByGameProvider(Utils.objectToArray(response.data.games), CConfig.main.filterByProvider);
                    var actualCasinoGames = removeNonCasinoGames(allHPGames);

                    var preparedGames = casinoUtils.setGamesFunMode(actualCasinoGames).sort(function (a, b) {
                        return b.ordering - a.ordering;
                    });

                    //casinoCache.put('AllGames' + CConfig.main.partnerID, preparedGames);
                    prepareFeaturedGames(preparedGames);
                }
            });
        } else {
            var popularGamesData = casinoCache.get(CConfig.main.popularGamesID + CConfig.main.partnerID);
            if (popularGamesData !== undefined) {
                preparePopularGames(popularGamesData);
            } else {
                casinoData.getCategory(CConfig.main.popularGamesID, CConfig.main.partnerID).then(function (response) {
                    var populars = casinoUtils.filterByGameProvider(response.data, CConfig.main.filterByProvider);
                    var preparedPopulars = casinoUtils.setGamesFunMode(populars);
                    casinoCache.put(CConfig.main.popularGamesID + CConfig.main.partnerID, preparedPopulars);
                    preparePopularGames(preparedPopulars);
                });
            }

            var topSlotsData = casinoCache.get(CConfig.main.topSlotsID + CConfig.main.partnerID);
            if (topSlotsData !== undefined) {
                prepareFeaturedGames(topSlotsData);
            } else {
                casinoData.getCategory(CConfig.main.topSlotsID, CConfig.main.partnerID).then(function (response) {
                    var topSlots = casinoUtils.filterByGameProvider(response.data, CConfig.main.filterByProvider);
                    var preparedTopSlots = casinoUtils.setGamesFunMode(topSlots);
                    casinoCache.put(CConfig.main.topSlotsID + CConfig.main.partnerID, preparedTopSlots);
                    prepareFeaturedGames(preparedTopSlots);
                });
            }
        }
    }

    function removeNonCasinoGames(games) {
        var i, j = games.length;
        for (i = 0; i < j; i += 1) {
            if (games[i].gameCategory === CConfig.skillGames.categoryName || games[i].gameCategory === CConfig.liveCasino.categoryName || games[i].isMobile === 'Y') {
                games.splice(i--, 1);
                j--;
            }
        }
        return games;
    }

    function preparePopularGames(games) {
        if (!$rootScope.conf.ogwilEnabled) {  // remove ogwil game if it's in popular games and it's disabled from config
            for (var i = 0, length = games.length; i < length; i += 1) {
                if (games[i].id === '1314') {
                    games.splice(i, 1);
                    break;
                }
            }
        }

        $scope.popularGames = games;
        findAndOpenGame(games);
    }

    /**
    * @name findAndOpenGame
    * @param games games array
    * @description get gameId from $location, find game in games and open it
    */
    function findAndOpenGame(games) {
        var searchParams = $location.search();

        if (searchParams.game !== undefined) {
            var game, gameID = parseInt(searchParams.game, 10);

            for (var i = 0, count = games.length; i < count; i += 1) {
                if (games[i].id == gameID) {
                    game = games[i];
                    break;
                }
            }

            if (game !== undefined) {
                var gameType;
                if (searchParams.type !== undefined) {
                    var typeOfGame = searchParams.type;
                    switch (typeOfGame) {
                        case "demo":
                        case "fun":
                            gameType = $rootScope.env.authorized && $scope.selectedCategory.id == '35' ? "real" : "fun";
                            $scope.openGame(game, gameType);
                            break;
                        case "real":
                            if ($rootScope.env.authorized) {
                                $scope.openGame(game, "real");
                            } else {
                                var gameInfo = {};
                                gameInfo.gameID = game.gameID;
                                if (game.gameType && typeof  game.gameType == 'string') {
                                    game.gameType = JSON.parse(game.gameType);
                                }
                                gameInfo.game = game;
                                $rootScope.casinoGameOpened = 1;
                                $scope.gamesInfo.push(gameInfo);
                                var casinoLoginTimer;
                                var casinoLoggedIn = $scope.$on('login.loggedIn', function () {
                                    casinoLoggedIn();

                                    TimeoutWrapper.cancel(casinoLoginTimer);
                                    if (gameInfo && gameInfo.gameID == game.gameID) {
                                        $scope.openGame(game, "real");
                                    }
                                });
                                casinoLoginTimer = TimeoutWrapper(function() {
                                    casinoLoggedIn();
                                    if (gameInfo && gameInfo.gameID == game.gameID) {
                                        if (!$rootScope.env.authorized) {
                                            $scope.closeGame();
                                            $rootScope.$broadcast("openLoginForm");
                                        } else {
                                            $scope.openGame(game, "real");
                                        }
                                    }
                                }, 4000);
                            }
                            break;
                        default:
                            gameType = $rootScope.env.authorized ? 'real' : 'fun';
                            $scope.openGame(game, gameType);
                    }
                } else {
                    gameType = $rootScope.env.authorized ? 'real' : 'fun';
                    $scope.openGame(game, gameType);
                }
            }
        }
    }

    $scope.slideJackpotGames = function slideJackpotGames(direction) {
        if(direction == 'prev') {
            $scope.jackpotSlideIndex--;

        } else {
            $scope.jackpotSlideIndex++;
        }
        $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
    };

    function loadJackpotSliderData() {
        casinoData.getAction('jackpot', CConfig.main.partnerID).then(function (response) {
            $scope.jackpotGames = [];
            if (response.data) {
                $scope.jackpotGames = casinoUtils.setGamesFunMode(response.data);
                casinoCache.put('jachpotGames_' + CConfig.main.partnerID, $scope.jackpotGames);
                $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
                if(!$scope.jackpotSliderGames.length) {
                    $scope.providerMenuDefaultOffset = CConfig.main.providerMenuDefaultOffset ? CConfig.main.providerMenuDefaultOffset : 366;
                    $scope.categoryMenuDefaultOffset = 370;
                }
            }
        }, function(reason) {
            $scope.jackpotGames = [];
            checkIfPageLoaded();
        });
    }

    /**
     * @ngdoc method
     * @name loadCategories
     * @methodOf CASINO.controller:casinoCtrl
     * @description loads categories list using {@link CASINO.service:casinoData casinoData} service's **getAction** method
     */
    $scope.loadCategories = function loadCategories() {
        $scope.loadingProcess = true;
        loadJackpotSliderData();
        if(CConfig.main.multiViewEnabled || CConfig.main.filterByProviderEnabled) {
            loadAllGamesAndFilterOptions();
        }
        var data = casinoCache.get('categories' + CConfig.main.partnerID);
        if (data !== undefined) {
            prepareCategories(data);
            return;
        }

        casinoData.getAction('getCategories', CConfig.main.partnerID).then(function (response) {
            if (response.data) {
                var result = response.data;
                var i, j, cLength = result.length;
                var fLength = CConfig.main.filterByCategory.length;
                for (i = 0; i < fLength; i += 1) {
                    for (j = 0; j < cLength; j += 1) {
                        if (result[j].id === CConfig.main.filterByCategory[i]) {
                            result.splice(j--, 1);
                            cLength--;
                        }
                    }
                }

                if (CConfig.main.favourtieGamesCategoryEnabled) {
                    result.unshift({id: -1, categoryName: Translator.get('Favourite Games')});
                }

                var categories = sortCategories(result);
                var numberOfHPCategories = 0;
                // maybe it's not a good idea, but it's needed for translate categoryNames
                for (i = 0, j = categories.length; i < j; i += 1) {
                    categories[i].categoryName = Translator.get(categories[i].categoryName);
                    if (categories[i].category == CConfig.main.topSlotsID || categories[i].category == CConfig.main.popularGamesID) {
                        numberOfHPCategories++;
                    }
                }
                if (CConfig.main.showAllGamesOnHomepage) {
                    categories.unshift({
                        id: undefined,
                        category: 'AllGames',
                        categoryName: Translator.get('All games')
                    });
                } else if (numberOfHPCategories === 2) {
                    categories.unshift({id: undefined, categoryName: Translator.get('Home')});
                }

                casinoCache.put('categories' + CConfig.main.partnerID, categories);
                prepareCategories(categories);
            }
        });
    };

    function prepareCategories(categories) {
        $scope.categories = categories;
        var category, i, j, categoryID;
        var searchParams = $location.search();

        if (searchParams.category !== undefined) {
            categoryID = parseInt(searchParams.category, 10);
            for (i = 0, j = categories.length; i < j; i += 1) {
                if (categories[i].id == categoryID) {
                    category = categories[i];
                }
            }
        }
        category = category || categories[0];
        if (searchParams.provider !== undefined) {
            if (CConfig.main.filterByProviderEnabled) {
                $scope.selectedProvider.name = searchParams.provider === 'all' ? '' : searchParams.provider;
            } else {
                $location.search('provider', undefined);
            }
        }

        $scope.selectCategory(category);
    }

    function sortCategories(categories) {
        var result = [];
        var sorting = CConfig.main.categories;
        var i, catCount = categories.length;
        var j, sortCount = sorting.length;

        for (i = 0; i < sortCount; i++) {
            for (j = 0; j < catCount; j++) {
                if (sorting[i] == categories[j].id) {
                    result.push(categories.splice(j,1)[0]);
                    catCount--;
                    break;
                }
            }
        }

        result = result.concat(categories);

        return result;
    }

    function prepareFilterOptions(filtersObject) {
        var filterOptions = [];

        for (var k in filtersObject){
            if (!CConfig.main.filterByProvider || CConfig.main.filterByProvider.indexOf(k) === -1) {
                filterOptions.push({ key: k, value: filtersObject[k] });
            }
        }
        if (filterOptions.length > 1) {
            if (CConfig.main.orderingProvider) {
                var orderedProviders = [];
                var ordering = CConfig.main.orderingProvider;
                var i, orderCount = ordering.length;
                var j, providerCount = filterOptions.length;

                for (i = 0; i < orderCount; i++) {
                    for (j = 0; j < providerCount; j++) {
                        if (ordering[i] == filterOptions[j].key) {
                            orderedProviders.push(filterOptions.splice(j,1)[0]);
                            providerCount--;
                            break;
                        }
                    }
                }
                orderedProviders = orderedProviders.concat(filterOptions);
                $scope.filterOptions = orderedProviders.length ? orderedProviders : null;
            } else {
                $scope.filterOptions = filterOptions;
            }
        }

        casinoCache.put('filterOptions' + CConfig.main.partnerID, $scope.filterOptions);
    }


    /**
     * @ngdoc method
     * @name loadAllGamesAndFilterOptions
     * @methodOf CASINO.controller:casinoCtrl
     * @description  loads all games and filter options list using {@link CASINO.service:casinoData casinoData} service's **getFilterOptions** method
     */
    function loadAllGamesAndFilterOptions() {
        $scope.agSelectedCategory = 'CasinoGames';
        $scope.popUpSearchInput = '';
        var isDataSaved = true;
        if (CConfig.main.filterByProviderEnabled) {
            var filterData = casinoCache.get('filterOptions' + CConfig.main.partnerID);
            if (filterData !== undefined) {
                $scope.filterOptions = filterData;
            } else {
                isDataSaved = false;
            }
        }
        if (CConfig.main.multiViewEnabled) {
            var gamesData = casinoCache.get('allGames' + CConfig.main.partnerID);
            if (gamesData !== undefined) {
                $scope.allGames = casinoCache.get('allGames' + CConfig.main.partnerID);
            } else {
                isDataSaved = false;
            }
        }
        if (!isDataSaved) {
            casinoData.getFilterOptions().then(function (response) {
                if (response.data) {
                    if (CConfig.main.filterByProviderEnabled) {
                        prepareFilterOptions(response.data.providers);
                    }
                    if (CConfig.main.multiViewEnabled) {
                        var multiViewGames = casinoUtils.getMultiviewGames(Utils.objectToArray(response.data.games));
                        var filteredMultiViewGames = casinoUtils.filterByGameProvider(multiViewGames, CConfig.main.filterByProvider);
                        $scope.allGames = casinoUtils.setGamesFunMode(filteredMultiViewGames);
                        casinoCache.put('allGames' + CConfig.main.partnerID, $scope.allGames);
                    }
                }
            });
        }
    }
    var watchForFavouriteGames;
    /**
     * @ngdoc method
     * @name selectCategory
     * @methodOf CASINO.controller:casinoCtrl
     * @description  select category to show category games
     */
    $scope.selectCategory = function selectCategory(category) {
        // if ($scope.selectedCategory && $scope.selectedCategory.id == category.id) {
        //     return;
        // }
        $scope.loadingProcess = true;
        $scope.selectedCategoryAllGames = [];
        $scope.selectedCategoryGames = [];
        $scope.numberOfRecentGames = $scope.wideMode ? CConfig.main.numberOfRecentGamesWide : CConfig.main.numberOfRecentGames;
        $scope.selectedCategory = category;

        $location.search('category', category.id);
        watchForFavouriteGames && watchForFavouriteGames();

        if (category.id === undefined) {
            loadHomePageGames();
        } else if(category.id === -1) {
            prepareFeaturedGames($rootScope.myCasinoGames);
            watchForFavouriteGames = $scope.$watch(function () {
                return $rootScope.myCasinoGames && $rootScope.myCasinoGames.length;
            }, function () {
                if ($rootScope.myCasinoGames.length === 0) {
                    $scope.selectCategory($scope.categories[0]);
                } else {
                    prepareFeaturedGames($rootScope.myCasinoGames);
                }
            });

        } else {
            var data = casinoCache.get(category.category + CConfig.main.partnerID);
            if(data !== undefined) {
                prepareFeaturedGames(data);
            } else {
                casinoData.getCategory(category.category, CConfig.main.partnerID).then(function (response) {
                    var responsedGames = casinoUtils.filterByGameProvider(response.data, CConfig.main.filterByProvider);
                    var preparedGames = casinoUtils.setGamesFunMode(responsedGames);
                    if (category.category === CConfig.skillGames.categoryName) {
                        preparedGames = casinoUtils.prepareSkillGames(preparedGames);
                    }
                    casinoCache.put(category.category + CConfig.main.partnerID, preparedGames);
                    prepareFeaturedGames(preparedGames);
                });
            }
        }
    };

    function prepareFeaturedGames(games) {
        $scope.selectedCategoryAllGames = games;
        findAndOpenGame(games);
        fiterFeaturedGames();
    }

    function fiterFeaturedGames() {
        $scope.loadingProcess = false;
        if ($scope.selectedCategoryAllGames) {
            var currentProvider = $scope.selectedProvider.name == '' ? 'all' : $scope.selectedProvider.name;
            $location.search('provider', currentProvider);
            $scope.selectedCategoryGames = $filter('filter')($scope.selectedCategoryAllGames, {'providerFilter': $scope.selectedProvider.name});
        }
    }

    /**
     * @ngdoc method
     * @name setJustForMoment
     * @methodOf CASINO.controller:casinoCtrl
     * @description exposes {@link vbet5.service:Utils#setJustForMoment Utils.setJustForMoment} method to casinoCtrl's $scope
     *
     * @param {string} name scope variable name
     * @param {mixed} value value to set
     * @param {number} [time] optional. time in milliseconds
     */
    $scope.setJustForMoment = function setJustForMoment(name, value, time) {
        Utils.setJustForMoment($scope, name, value, time);
    };

    /**
     * @ngdoc method
     * @name loadMoreGames
     * @methodOf CASINO.controller:casinoCtrl
     * @description  Increases number of recent games to show by 8 and loads them
     */
    $scope.loadMoreGames = function loadMoreGames() {
        $scope.numberOfRecentGames += $scope.wideMode ? CConfig.main.increaseByWide : CConfig.main.increaseBy;
    };

    /**
     * @description broadcasts event to fixElementOnScroll directive to force element stay fixed
     * @param targetId the id of dom element
     */
    $scope.setTargetElementFixed = function setTargetElementFixed(targetId){
        $rootScope.$broadcast('forceElementFix', {id: targetId});
    }

    /**
     * @ngdoc method
     * @name slideToLeft
     * @methodOf CASINO.controller:casinoCtrl
     * @description  Decreases index of popular games slider to show previous 4 games
     */
    $scope.slideToLeft = function slideToLeft() {
        $scope.slideIndex--;
    };

    /**
     * @ngdoc method
     * @name slideToRight
     * @methodOf CASINO.controller:casinoCtrl
     * @description  Increases index of popular games slider to show next 4 games
     */
    $scope.slideToRight = function slideToRight() {
        $scope.slideIndex++;
    };

    /**
     * @ngdoc method
     * @name openGameInNewWindow
     * @methodOf CASINO.controller:casinoCtrl
     * @description  calculates the possible sizes of the popup window and opens casino game in there
     *
     * @param {string} id game id
     */
    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoUtils.openPopUpWindow($scope, id);
    };

    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoUtils.togglePlayMode($scope, gameInfo);
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:casinoCtrl
     * @param {Object} game game object
     * @param {String} gameType gameType string
     * @param {String} studio studio string
     * @param {String} limit limit string
     * @description  opens login form if it needed, or generates casino game url and opens it
     */
    $scope.openGame = function openGame(game, gameType, tableId, studio, limit) {
        casinoUtils.openCasinoGame($scope, game, gameType, tableId, studio, limit);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description  close opened game
     */
    $scope.closeGame = function closeGame(id) {
        if (id === undefined) {
            $scope.gamesInfo = [];
            $scope.viewCount = 1;
            $rootScope.casinoGameOpened = 0;
        } else {
            var cauntOfGames = 0, i, count;
            for (i = 0, count = $scope.gamesInfo.length; i < count; i += 1) {
                if ($scope.gamesInfo[i].id === id) {
                    var uniqueId = Math.random().toString(36).substr(2, 9);
                    $scope.gamesInfo[i] = {gameUrl: '', id: uniqueId, toAdd: false};
                }
                if ($scope.gamesInfo[i].gameUrl !== '') {
                    cauntOfGames++;
                }
            }

            if (cauntOfGames === 0) {
                $scope.gamesInfo = [];
                $scope.viewCount = 1;
                $rootScope.casinoGameOpened = 0;
            }
        }
        $location.search('type', undefined);
        $location.search('game', undefined);

    };

    /**
     * @ngdoc method
     * @name isFromSaved
     * @methodOf CASINO.controller:casinoCtrl
     * @description  checks if game (that has gameID) is in myCasinoGames
     * @param {Number} gameId Number
     * @returns {boolean} true if current game is in myCasinoGames, false otherwise
     */
    $scope.isFromSaved = function isFromSaved(gameId) {
        var games = $rootScope.myCasinoGames || [], i, j;

        for (i = 0, j = games.length; i < j; i += 1) {
            if (games[i].id === gameId) {
                return true;
            }
        }

        return false;
    };

    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.controller:casinoCtrl
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     * @param {Object} game Object
     */
    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        casinoUtils.toggleSaveToMyCasinoGames($rootScope, game);
    };

    function openCasinoGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            if ($scope.gamesInfo.length === 1) {
                $scope.closeGame();
            }
            $scope.openGame(game, gameType);
        } else {
            //games that are not resizable
            var typeOfGame = (typeof game.gameType) == 'string' ? JSON.parse(game.gameType) : game.gameType;
            if (typeOfGame.ratio == "0") {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'warning',
                    title: 'Warning',
                    content: Translator.get('Sorry, this game cannot be opened in multi-view mode')
                });
            } else {
                var i, count = $scope.gamesInfo.length;
                for (i = 0; i < count; i += 1) {
                    if ($scope.gamesInfo[i].gameUrl === '') {
                        $scope.gamesInfo[i].toAdd = true;
                        $scope.openGame(game, gameType);
                        break;
                    }
                }
                if (i === count) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: 'warning',
                        title: 'Warning',
                        content: Translator.get('Please close one of the games for adding new one')
                    });
                }
            }
        }
    }

    $scope.$on("casino.openGame", openCasinoGame);

    /**
     *  get categoryID from $location, find category in categories and select it
     */
    $scope.$on('openCasinoBannerLink', function () {
        var searchParams = $location.search();

        if (searchParams.provider !== undefined) {
            if (CConfig.main.filterByProviderEnabled) {
                $scope.selectedProvider.name = searchParams.provider === 'all' ? '' : searchParams.provider;
            } else {
                $location.search('provider', undefined);
            }
        }
        if (searchParams.category !== undefined) {
            var categoryID = parseInt(searchParams.category, 10);

            for (var i = 0, j = $scope.categories.length; i < j; i += 1) {
                if ($scope.categories[i].id == categoryID) {
                    $scope.selectCategory($scope.categories[i]);
                    return;
                }
            }
        }

        $scope.selectCategory({id: undefined});
    });

    $scope.$on('game.closeCasinoGame', function (ev, id) {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            if (id === undefined) {
                $scope.closeGame();
            } else {
                var i, length = $scope.gamesInfo.length;
                for (i = 0; i < length; i += 1) {
                    if ($scope.gamesInfo[i].game && $scope.gamesInfo[i].game.id == id) {
                        $scope.closeGame($scope.gamesInfo[i].id);
                    }
                }
            }
        }
    });

    $scope.$watch('env.authorized', function (authorized) {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoUtils.refreshOpenedGames($scope);
        }
    });

    $scope.$on('casino.selectVirtualBetting', function () {
        var category = {id: CConfig.virtualBetting.categoryId, category: CConfig.virtualBetting.categoryName};
        $scope.selectCategory(category);
        $scope.selectedProvider.name = '';
    });

    $scope.$watch('selectedProvider.name', function () {
        createPopularsPerGroups();
        fiterFeaturedGames();
    });

    /**
     * @ngdoc method
     * @name changeView
     * @methodOf CASINO.controller:casinoCtrl
     * @description change view for applying functionality of multiple view in casino
     * @param {Int} view the Int
     */
    $scope.changeView = function changeView(view) {
        var i, gameInfo, uniqueId;
        if(view > $scope.gamesInfo.length) {
            for (i = $scope.gamesInfo.length; i < view; i++) {
                uniqueId = Math.random().toString(36).substr(2, 9);
                gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
                $scope.gamesInfo.push(gameInfo);
            }
            $scope.viewCount = view;
        } else if (view < $scope.gamesInfo.length) {
            var actualviews = 0, actualGames = [];
            for (i = 0; i < $scope.gamesInfo.length; i += 1) {
                if ($scope.gamesInfo[i].gameUrl !== '') {
                    gameInfo = $scope.gamesInfo[i];
                    actualGames.push(gameInfo);
                    actualviews++;
                }
            }
            if (actualviews <= view) {
                if (actualviews === 1 && view === 2) {
                    uniqueId = Math.random().toString(36).substr(2, 9);
                    gameInfo = {gameUrl: '', id: uniqueId, toAdd: false};
                    if ($scope.gamesInfo[0].gameUrl !== '') {
                        actualGames.push(gameInfo);
                    } else {
                        actualGames.unshift(gameInfo);
                    }
                }
                $scope.gamesInfo = actualGames;
                $scope.viewCount = view;
            } else {
                var numberOfNeeded = actualviews - view;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'warning',
                    title: 'Warning',
                    content: Translator.get('Please close {1} game(s) to change view', [numberOfNeeded])
                });
            }
        }
        $rootScope.casinoGameOpened = $scope.gamesInfo.length;

        analytics.gaSend('send', 'event', 'multiview',  {'page': $location.path(), 'eventLabel': 'multiview changed to ' + view});
    };

    /**
     * @ngdoc method
     * @name enableToAddGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description enable current view for add new game and show container of all games
     * @param {String} id gameInfo id
     */
    $scope.enableToAddGame = function enableToAddGame(id) {
        for (var i = 0; i < $scope.gamesInfo.length; i += 1) {
            $scope.gamesInfo[i].toAdd = id === $scope.gamesInfo[i].id;
        }
        $scope.showAllGames = true;
        //we need to reinitialize filter options and selected category options
        $scope.popUpSearchInput = "";
        $scope.agSelectedCategory = 'CasinoGames';
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
    };

    $scope.$watch('agSelectedCategory', function(){
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);

        if ( $scope.agSelectedCategory === 'LiveDealer') {
            $scope.mvTablesInfo = {};
            casinoUtils.setupTableInfo($scope.mvTablesInfo);
        }
    });
    $scope.$watch('popUpSearchInput', function(){
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
    });

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {Int} id the games id
     */
    $scope.refreshGame = function refreshGame(id) {
        casinoUtils.refreshCasinoGame($scope, id);
    };

    /**
     * transfer functionality for gaminator provider. It will be removed after 2 months
     */
    $scope.gpTransferModel = {};
    /**
     * @ngdoc method
     * @name gaminatorTransfer
     * @methodOf CASINO.controller:casinoCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {String} category the category of request
     */
    $scope.gaminatorTransfer = function gaminatorTransfer(category) {
        casinoUtils.gpTransfer(category, $scope.gpTransferModel);
    };

    /**
     * for live casino in multiple view mode: listen to messages from other windows to change livedealer options when needed
     */
    $scope.$on('livedealer.redirectGame', function (event, message) {
        if (message.data && !message.data.openJackpotList) {
            casinoUtils.adjustLiveCasinoGame($scope, message);
        }
    });

    $scope.toggleProvidersMenu = function toggleProvidersMenu() {
        $scope.providersMenuState.isClosed = ! $scope.providersMenuState.isClosed;
    };




    $scope.loadPopularGameBanner = function loadPopularGameBanner(containerId) {
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.mostPopularGame = response.data.widgets[0].instance;
            }
        });
    };

    // casino games list directive events
    $scope.$on('casinoGamesList.openGame', function(e, data) {
        $scope.openGame(data.game, data.playMode);
    });

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function(e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    })

    $scope.routeReload = function routeReload() {
        TimeoutWrapper(function () { $route.reload(); }, 100);
    }

    $scope.$on('casino.openGameById', function (e, data) {
        if(data.gameId !== undefined && data.playMode !== undefined && data.category != undefined){
            casinoData.getCategory(data.category, CConfig.main.partnerID).then(function (response) {
                var games = casinoUtils.filterByGameProvider(response.data, CConfig.main.filterByProvider);
                angular.forEach(games, function (game) {
                    if(game.id === data.gameId.toString()){
                        $scope.openGame(game, data.playMode);
                    }
                });
            });
        }

    });


}]);