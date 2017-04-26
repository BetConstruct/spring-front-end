/**
 * @ngdoc controller
 * @name CASINO.controller:casinoCtrl
 * @description
 * casino page controller
 */

CASINO.controller('casinoVersion2Ctrl', ['$rootScope', '$scope', '$sce', '$location', 'TimeoutWrapper', '$filter', 'CConfig', 'Zergling', 'casinoData', 'Utils', 'casinoManager', 'Translator', 'casinoCache', 'analytics', 'content', '$window', function ($rootScope, $scope, $sce, $location, TimeoutWrapper, $filter, CConfig, Zergling, casinoData,  Utils, casinoManager, Translator, casinoCache, analytics, content, $window) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.mainCategories = null;
    $scope.moreCategories = null;
    $scope.selectedCategoryGames = [];
    $scope.slideIndex = 0;
    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    $rootScope.footerMovable = true;
    $scope.providerMenuDefaultOffset =  CConfig.main.hideCasinoJackpotSlider ? 366 :666;
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
        enableGameInfoButton: CConfig.main.enableGameInfoButton,
        fourGameViewEnable: CConfig.main.fourGameViewEnable,
        hideCasinoJackpotSlider: CConfig.main.hideCasinoJackpotSlider,
        multiViewEnabled: CConfig.main.multiViewEnabled,
        jackpotSubstituteCategory: CConfig.main.jackpotSubstituteCategory,
        hideCasinoProvidersRow: CConfig.main.hideCasinoProvidersRow,
        funModeEnabled: CConfig.main.funModeEnabled,
        topBanners: CConfig.main.topBanners,
        providersMenuPermanentlyExpanded: CConfig.main.providersMenuPermanentlyExpanded
    };
    $scope.providersMenuState = {
        isClosed: !CConfig.main.providersMenuPermanentlyExpanded// true
    };

    $scope.selections = {
        categoryId: null,
        providerName: null
    };

    var FAVOURITE_CATEGORY = {
        id: -1,
        name: 'favouriteGames',
        title: 'Favourite Games'
    };
    var ALL_GAMES_CATEGORY = {
        id: 'all',
        name: 'allGames',
        title: 'All Games'
    };
    var HOME_CATEGORY = {
        id: '-2',
        name: 'home',
        title: 'Home'
    };
    var ALL_PRIVIDERS = {
        name: 'all',
        title: 'All Providers'
    };

    var favouriteGamesWatcherPromise;

    function init(){
        getOptions();
        if (CConfig.main.newCasinoDesign.enabled) {
            getJackPotData();
        }
    }

    function getOptions() {
        $scope.loadingProcess = true;
        //get categories and providers lists
        casinoData.getOptions().then(function (response) {
            if(response && response.data && response.data.status !== -1) {
                $scope.categories = response.data.categories;
                if (CConfig.main.showAllGamesOnHomepage) {
                    $scope.categories.unshift(ALL_GAMES_CATEGORY);
                }
                if (CConfig.main.favourtieGamesCategoryEnabled) {
                    $scope.categories.unshift(FAVOURITE_CATEGORY);
                }
                if (!CConfig.main.showAllGamesOnHomepage && (!CConfig.main.newCasinoDesign || !CConfig.main.newCasinoDesign.enabled)) {
                    addHomeCategory();
                }
                if (CConfig.main.filterByProviderEnabled) {
                    $scope.providers = response.data.providers;
                    $scope.providers.unshift(ALL_PRIVIDERS);

                    if (!CConfig.main.newCasinoDesign.enabled) {
                        createCategoriesMoreDropdown();
                    }
                }
                $scope.loadingProcess = false;
                handlefirstSelection();
            }
        });
    }

    function handlefirstSelection() {
        var category, searchParams = $location.search();
        if (searchParams.category !== undefined) {
            for (var i = 0, length = $scope.categories.length; i < length; i += 1) {
                if ($scope.categories[i].id === searchParams.category) {
                    $scope.selections.category = $scope.categories[i];
                    break;
                }
            }
        }
        if (!$scope.selections.category) {
            $scope.selections.category = $scope.categories[0].id !== FAVOURITE_CATEGORY.id || ($rootScope.myCasinoGames && $rootScope.myCasinoGames.length !== 0) ? $scope.categories[0] : $scope.categories[1];
            $location.search('category', $scope.selections.category.id);
        }
        if ($scope.providers) {
            $scope.selections.providerName = searchParams.provider || $scope.providers[0].name;
            $location.search('provider', $scope.selections.providerName);
        } else {
            $scope.selections.providerName = 'all';
        }
        resetGamesOptions();
        $scope.getGames();

        findAndOpenGame(searchParams);
    }

    $scope.getGames = function getGames() {
        favouriteGamesWatcherPromise && favouriteGamesWatcherPromise();
        if ($scope.selections.category.id === FAVOURITE_CATEGORY.id) { // favourite category state
            favouriteGamesWatcherPromise = $scope.$watch('myCasinoGames.length', function () {
                if ($rootScope.myCasinoGames.length === 0) {
                    $scope.selectCategory($scope.categories[1]);
                } else {
                    $scope.games = getAppropriateFavoriteGames();
                }
            });
            $scope.games = getAppropriateFavoriteGames();
            return;
        }

        var categoryToLoad = $scope.selections.category.id;
        if ($scope.selections.category.id === HOME_CATEGORY.id) {
            loadPopularGames();
            categoryToLoad = CConfig.topSlots.categoryId;
        }

        $scope.loadingProcess = true;
        casinoData.getGames(categoryToLoad, $scope.selections.providerName, $scope.limits.from, $scope.limits.to).then(function (response) {
            if (response && response.data && response.data.status !== -1) {
                Array.prototype.push.apply($scope.games, response.data.games);
                $scope.limits.max = parseInt(response.data.total_count);
            }
        })['finally'](function () {
            $scope.loadingProcess = false;
        })
    };

    $scope.selectCategory = function selectCategory(category) {
        if ($scope.selections.category.id === category.id) {
            return;
        }

        $scope.selections.category = category;
        $location.search('category', category.id);
        resetGamesOptions();
        $scope.getGames();
    };

    $scope.selectProvider = function selectProvider(provider) {
        if ($scope.selections.providerName === provider.name) {
            return;
        }

        if (!isProviderPermitted(provider)) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: "Please note, the games of this provider is not available for residents in Your area."
            });
        }

        $scope.selections.providerName = provider.name;
        $location.search('provider', $scope.selections.providerName);
        resetGamesOptions();
        $scope.getGames();
    };

    function isProviderPermitted (provider) {
        var countries = CConfig.main.restrictProvidersInCountries;
        if (countries && countries[provider.name] && $rootScope.geoCountryInfo && $rootScope.geoCountryInfo.countryCode && $rootScope.profile) {
            if (countries[provider.name].indexOf($rootScope.geoCountryInfo.countryCode) !== -1 || countries[provider.name].indexOf($rootScope.geoCountryInfo.countryCode + '-' + $rootScope.profile.currency_name) !== -1) {
                return false;
            }
        }
        return true;
    }

    function resetGamesOptions () {
        $scope.games = [];
        $scope.limits = {
            from: 0,
            to: $scope.wideMode ? CConfig.main.increaseByWide : CConfig.main.increaseBy,
            max: 0
        }
    }

    function addHomeCategory () {
        var i, count = 0, length = $scope.categories.length;
        for (i = 0; i < length; i += 1 ) {
            if ($scope.categories[i].id == CConfig.topSlots.categoryId || $scope.categories[i].id == CConfig.popularGames.categoryId) {
                count++;
            }
        }
        if (count === 2) {
            $scope.categories.unshift(HOME_CATEGORY);
        }
    }

    function loadPopularGames () {
        $scope.popularsPerGroups = [];
        casinoData.getGames(CConfig.popularGames.categoryId, $scope.selections.providerName).then(function (response) {
            if (response && response.data && response.data.status !== -1) {
                $scope.popularGames = response.data.games;
                createPopularsPerGroups();
            }
        });
    }

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
            $scope.mainCategories = $scope.categories.length > $scope.numberOfMainCategories ? $scope.categories.slice(0, $scope.numberOfMainCategories) : $scope.categories;
            $scope.moreCategories = Utils.getPartToShowInColumns($scope.categories, $scope.numberOfMainCategories, CConfig.main.moreColumnNumber, 'name');
        }
    }

    function createPopularsPerGroups() {
        if ($scope.popularGames && $scope.popularGames.length) {
            var numberOfGroups = $scope.wideMode ? 7: 4;
            $scope.popularsPerGroups = groupPopularsToGroups($scope.popularGames, numberOfGroups);
            $scope.slideIndex = 0;
        }
    }

    $scope.$on('widescreen.on', function () {
        $scope.wideMode = true;
        if (!CConfig.main.newCasinoDesign.enabled) {
            $scope.numberOfMainCategories = CConfig.main.maxVisibleCategoriesWide;
            createCategoriesMoreDropdown();
            createPopularsPerGroups();
        }
    });

    $scope.$on('widescreen.off', function () {
        $scope.wideMode = false;
        if (!CConfig.main.newCasinoDesign.enabled) {
            $scope.numberOfMainCategories = CConfig.main.maxVisibleCategories;
            createCategoriesMoreDropdown();
            createPopularsPerGroups();
        }
    });

    $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
    $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });

    /**
    * @name findAndOpenGame
    * @param games games array
    * @description get gameId from $location, find game in games and open it
    */
    function findAndOpenGame(searchParams) {
        if (searchParams.game !== undefined) {
            var game;
            casinoData.getGames(null, null, null, null, null, null, [searchParams.game]).then(function (response) {
                game = response && response.data && response.data.games[0];
                if (game !== undefined) {
                    var gameType, initialType = searchParams.type || ($rootScope.env.authorized ? 'real' : 'fun');
                    switch (initialType) {
                        case "demo":
                        case "fun":
                            gameType = $rootScope.env.authorized && game.types.viewMode ? "real" : "fun";
                            $scope.openGame(game, gameType);
                            break;
                        case "real":
                            if ($rootScope.env.authorized) {
                                $scope.openGame(game, "real");
                            } else {
                                if (!$rootScope.loginInProgress) {
                                    $rootScope.$broadcast('openLoginForm');
                                } else {
                                    var gameInfo = {};
                                    gameInfo.gameID = game.front_game_id;
                                    gameInfo.game = game;
                                    gameInfo.loadingUserData = true;
                                    $rootScope.casinoGameOpened = 1;
                                    $scope.gamesInfo.push(gameInfo);

                                    var loginProccesWatcher = $scope.$watch('loginInProgress', function () {
                                        if (!$rootScope.loginInProgress) {
                                            loginProccesWatcher();
                                            if (!$rootScope.env.authorized) {
                                                $scope.closeGame();
                                                $rootScope.$broadcast("openLoginForm");
                                            } else {
                                                $scope.openGame(game, "real");
                                            }
                                        }
                                    })
                                }
                            }
                            break;
                        default:
                            $scope.openGame(game, gameType);
                    }
                }
            });
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

    function getJackPotData() {
        (CConfig.main.jackpotSubstituteCategory ? casinoData.getGames(CConfig.main.jackpotSubstituteCategory.id) : casinoData.getJackpotGames()).then(function (response) {
            if (response && response.data && response.data.status !== -1) {

                if (response.data.games && response.data.games.length) {
                    $scope.jackpotGames = response.data.games;
                    $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
                } else {
                    $scope.providerMenuDefaultOffset = CConfig.main.providerMenuDefaultOffset ? CConfig.main.providerMenuDefaultOffset : 366;
                    $scope.categoryMenuDefaultOffset = 370;
                }

            }
        });
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
     * @description  Increases number of recent games to show
     */
    $scope.loadMoreGames = function loadMoreGames() {
        if ($scope.limits && $scope.limits.to < $scope.limits.max) {
            $scope.limits.from = $scope.limits.to;
            $scope.limits.to += $scope.wideMode ? CConfig.main.increaseByWide : CConfig.main.increaseBy;

            $scope.getGames();
        }
    };

    /**
     * @description broadcasts event to fixElementOnScroll directive to force element stay fixed
     * @param targetId the id of dom element
     */
    $scope.setTargetElementFixed = function setTargetElementFixed(targetId){
        $rootScope.$broadcast('forceElementFix', {id: targetId});
    };

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
        casinoManager.openPopUpWindow($scope, id);
    };

    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoManager.togglePlayMode($scope, gameInfo);
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:casinoCtrl
     * @param {Object} game game object
     * @param {String} gameType gameType string
     * @param {String} studio studio string
     * @description  opens login form if it needed, or generates casino game url and opens it
     */
    $scope.openGame = function openGame(game, gameType, studio) {
        casinoManager.openCasinoGame($scope, game, gameType, studio);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description  close opened game
     */
    $scope.closeGame = function closeGame(id) {
        casinoManager.closeGame($scope, id);
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
        casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
    };

    function openCasinoGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            if ($scope.gamesInfo.length === 1) {
                $scope.closeGame();
            }
            $scope.openGame(game, gameType);
        } else {
            //games that are not resizable
            if (game.ratio == "0") {
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

    function getAppropriateFavoriteGames() {
        var favGames = [];
        for (var i = 0, length = $rootScope.myCasinoGames.length; i < length; i += 1) {
            if ($rootScope.myCasinoGames[i].categories.indexOf(CConfig.liveCasino.categoryId) === -1 && $rootScope.myCasinoGames[i].categories.indexOf(CConfig.skillGames.categoryId) === -1 && ($scope.selections.providerName === ALL_PRIVIDERS.name || $rootScope.myCasinoGames[i].show_as_provider === $scope.selections.providerName)) {
                favGames.push($rootScope.myCasinoGames[i]);
            }
        }
        return favGames;
    }

    $scope.$on("casino.openGame", openCasinoGame);

    /**
     *  get categoryID from $location, find category in categories and select it
     */
    $scope.$on('openCasinoBannerLink', function () {
        var searchParams = $location.search();

        if (searchParams.provider !== undefined) {
            if (CConfig.main.filterByProviderEnabled) {
                $scope.selections.providerName = searchParams.provider === 'all' ? '' : searchParams.provider;
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

    $scope.$on('game.closeCasinoGame', function (ev, gameId) {
        casinoManager.findAndCloseGame($scope, gameId);
    });

    $scope.$watch('env.authorized', function () {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoManager.refreshOpenedGames($scope);
        }
    });

    $scope.$on('casino.selectCategory', function (event, category) {
        $scope.selectCategory(category);
    });

    /**
     * @description change view for applying functionality of multiple view in casino
     */

    $scope.$on('casinoMultiview.viewChange', function (event, view) {
        casinoManager.changeView($scope, view);
    });


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
        $scope.$broadcast('casinoMultiview.showGames', 'all'); // show multiview popup  with all games
    };

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {Int} id the games id
     */
    $scope.refreshGame = function refreshGame(id) {
        casinoManager.refreshCasinoGame($scope, id);
    };

    $scope.toggleProvidersMenu = function toggleProvidersMenu() {
        $scope.providersMenuState.isClosed = ! $scope.providersMenuState.isClosed;
    };

    $scope.loadBannerInsteadWinners = function loadBannerInsteadWinners(slug) {
        content.getPage(slug).then(function (response) {
            if (response.data && response.data.widgets) {
                $scope.newLastTopBanner = response.data.widgets[0].instance;
            }
        });
    };

    // casino games list directive events
    $scope.$on('casinoGamesList.openGame', function(e, data) {
        if (!data.game && data.gameId) {
            casinoData.getGames(null, null, null, null, null, null, [data.gameId]).then(function(response) {
                if(response && response.data) {
                    $scope.openGame(response.data.games[0]);
                }
            });
        } else {
            $scope.openGame(data.game, data.playMode);
        }
    });

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function(e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    });

    $scope.openCasinoGameDetails = function openCasinoGameDetails (game_skin_id) {
        casinoManager.openGameDetailsPopUp(game_skin_id);
    };

    init();

    $scope.$on('$destroy', function () {
        casinoManager.clearAllPromises();
    });
}]);