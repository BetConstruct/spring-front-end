/**
 * @ngdoc controller
 * @name CASINO.controller:casinoCtrl
 * @description
 * casino page controller
 */

CASINO.controller('casinoCtrl', ['$rootScope', '$scope', '$sce', '$location', 'Geoip', 'CConfig', 'Zergling', 'casinoData', 'Utils', 'casinoManager', 'Translator',  '$interval', 'TimeoutWrapper', 'analytics', 'content', function ($rootScope, $scope, $sce, $location, Geoip, CConfig, Zergling, casinoData,  Utils, casinoManager, Translator, $interval, TimeoutWrapper, analytics, content) {
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
    $scope.confData = CConfig;
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

    var favouriteGamesWatcherPromise, updateInterval, countryCode = '';


    function getOptions() {
        $scope.loadingProcess = true;
        //get categories and providers lists
        casinoData.getOptions(countryCode).then(function (response) {
            if(response && response.data && response.data.status !== -1) {
                $scope.categories = response.data.categories;
                if (CConfig.main.showAllGamesOnHomepage) {
                    $scope.categories.unshift(ALL_GAMES_CATEGORY);
                }
                if (CConfig.main.favourtieGamesCategoryEnabled) {
                    $scope.categories.unshift(FAVOURITE_CATEGORY);
                }
                if (CConfig.main.filterByProviderEnabled) {
                    $scope.providers = response.data.providers;
                    $scope.providers.unshift(ALL_PRIVIDERS);
                }
                if (response.data.hasTournaments) {
                    $scope.hasTournaments = true;
                }

                $scope.loadingProcess = false;
                handlefirstSelection();
            }
        });
    }

    function handlefirstSelection() {
        var searchParams = $location.search();
        if (searchParams.category !== undefined) {
            for (var i = 0, length = $scope.categories.length; i < length; i += 1) {
                if ($scope.categories[i].id === searchParams.category) {
                    $scope.selections.category = $scope.categories[i];
                    break;
                }
            }
        }
        if (!$scope.selections.category && $scope.categories) {
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
        casinoData.getGames(categoryToLoad, $scope.selections.providerName, countryCode, $scope.limits.from, $scope.limits.to).then(function (response) {
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

    function loadPopularGames () {
        $scope.popularsPerGroups = [];
        casinoData.getGames(CConfig.popularGames.categoryId, $scope.selections.providerName, countryCode).then(function (response) {
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

    $scope.$on('widescreen.on', function () {
        $scope.wideMode = true;
    });

    $scope.$on('widescreen.off', function () {
        $scope.wideMode = false;
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
            casinoData.getGames(null, null, countryCode, null, null, null, null, [searchParams.game]).then(function (response) {
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

    /**
     * @description gets jackpot amount data
     */
    function getJackpotAmount() {
        // Requesting available jackpot amount data
        Zergling.get({"game_id": 0}, "get_jackpots") // "game_id: 0" for getting all available jackpot data
            .then(function (response) {
                // Checking if we have data to show
                if (response.data && response.data.length) {
                    $scope.gamesAdditionalData = Utils.createMapFromObjItems(response.data, 'GameId');
                }
            }, function() {
                TimeoutWrapper(getJackpotAmount, 20000);
            });
    }

    // If the user authorizes/deauthorizes we need to immediately make the call for displaying correct currency (in case it changes)
    $scope.$on('login.loggedIn', function () {
        getJackpotAmount();
    });
    $scope.$on('login.loggedOut', function () {
        getJackpotAmount();
    });

    function getJackPotData() {
        getJackpotAmount();
        // Requesting data every 2 minutes (120,000 ms) because Casino refreshes its feed with that frequency
        updateInterval = $interval(getJackpotAmount, 120000);

        (CConfig.main.jackpotSubstituteCategory ? casinoData.getGames(CConfig.main.jackpotSubstituteCategory.id, null, countryCode) : casinoData.getJackpotGames()).then(function (response) {


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
     * @param {String} urlSuffix the url's suffix
     * @param {Number} multiViewWindowIndex - passed when the window in multiview is refreshed
     * @description  opens login form if it needed, or generates casino game url and opens it
     */
    $scope.openGame = function openGame(game, gameType, studio, urlSuffix, multiViewWindowIndex) {
        casinoManager.openCasinoGame($scope, game, gameType, studio, urlSuffix, multiViewWindowIndex);
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
            if ($scope.selections.providerName === ALL_PRIVIDERS.name || $rootScope.myCasinoGames[i].show_as_provider === $scope.selections.providerName) {
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

    $scope.$on('casino.action', function(event, data) {
        switch (data.action) {
            case 'setUrlData':
                data.url && data.frameId && casinoManager.setCurrentFrameUrlSuffix($scope.gamesInfo, data);
                break;
            case 'closeGame':
                casinoManager.findAndCloseGame($scope, data.gameId);
                break;
        }
    });

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
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
            casinoData.getGames(null, null, countryCode, null, null, null, null, [data.gameId]).then(function(response) {
                if(response && response.data && response.data.games && response.data.games.length) {
                    $scope.openGame(response.data.games[0]);
                }
            });
        } else {
            $scope.openGame(data.game, data.playMode, data.studio);
        }
    });

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function(e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    });

    $scope.openCasinoGameDetails = function openCasinoGameDetails (game_skin_id) {
        casinoManager.openGameDetailsPopUp(game_skin_id);
    };


    (function init() {
        Geoip.getGeoData(false).then(function (data) {
            data && data.countryCode && (countryCode = data.countryCode);
        })['finally'](function () {
            getOptions();
            getJackPotData();
        });
    })();

    $scope.$on('$destroy', function () {
        casinoManager.clearAllPromises();


        if (updateInterval) {
            $interval.cancel(updateInterval);
        } else { // This is an optional part. During testing this never happened

            // if for some reason (e.g. fast route change) the promise wasn't created we wait for it to be defined
            (function() {
                var timesCalled = 0;
                console.warn('Jackpot request promise was not created, waiting for it to be defined');
                TimeoutWrapper(function waitForPromise() {
                    // Wait until it's defined, but not more than 5 times
                    if (timesCalled <= 5) {
                        updateInterval ? $interval.cancel(updateInterval) : TimeoutWrapper(waitForPromise, 30000);
                        timesCalled++;
                    }
                }, 120000);
            })();
        }


    });
}]);