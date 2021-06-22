/**
 * @ngdoc controller
 * @name CASINO.controller:casinoCtrl
 * @description
 * casino page controller
 */

CASINO.controller('casinoCtrl', ['$rootScope', '$scope', '$sce', '$location', 'Geoip', 'Config', 'CConfig', 'Zergling', 'casinoData', 'Utils', 'casinoManager', 'Translator', '$interval', 'TimeoutWrapper', 'analytics', 'content', 'casinoMultiviewValues','jackpotManager', 'Storage', function ($rootScope, $scope, $sce, $location, Geoip, Config, CConfig, Zergling, casinoData, Utils, casinoManager, Translator, $interval, TimeoutWrapper, analytics, content, casinoMultiviewValues, jackpotManager, Storage) {
    'use strict';

    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.mainCategories = null;
    $scope.moreCategories = null;
    $scope.selectedCategoryGames = [];
    $scope.slideIndex = 0;
    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    $scope.providerMenuDefaultOffset = CConfig.main.hideCasinoJackpotSlider ? 366 : 666;
    $scope.categoryMenuDefaultOffset = 710;
    $scope.jackpotSlideIndex = 0;
    $scope.jackpotGames = [];


    if (!CConfig.disableAutoLoadMore) {
        $rootScope.footerMovable = true;
    }
    var jackpotTotalGames = 0;
    var jackpotSliderAllGames = [];
    $scope.jackpotWidgets = {
        widgetIndex: 0
    };
    $scope.tab = {selected: 'tournaments'};

    $scope.changeJackpotSlider = function (index) {
        $scope.jackpotWidgets.widgetIndex = index < 0 ? $scope.jackpotData.length - 1 : index > $scope.jackpotData.length - 1 ? 0 : index;
    };
    casinoMultiviewValues.init($scope);

    var jackpotWinnerTimeout;
    //new casino design
    $scope.jackpotSliderVisibleGamesCount = CConfig.main.jackpotSliderVisibleGamesCount;
    $scope.selectedProvider = {
        name: ''
    };
    $scope.confData = CConfig;
    $scope.providersMenuState = {
        isClosed: !(CConfig.main.providersMenuPermanentlyExpanded || CConfig.main.providersMenuExpanded)
    };

    $scope.selections = {
        categoryId: null,
        providerName: null,
        providers: []
    };

    $scope.favouriteCategory = {
        id: '-1',
        name: 'favouriteGames',
        title: 'Favourite Games'
    };
    var isProvidersOpenedPreviously = Storage.get("casinoProvidersOpened");
    if (isProvidersOpenedPreviously !== undefined) {
        $scope.providersOpened = isProvidersOpenedPreviously;
    } else {
        $scope.providersOpened = !CConfig.main.closeProvidersByDefault;
    }

    var providersString = '';



    var RECOMMENDED_CATEGORY = {
        id: '3',
        name: 'RecommendedGames',
        title: 'Recommended Games'
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

    var favouriteGamesWatcherPromise, updateInterval, countryCode = '', allProviders, allCategories;

    var lastCategoriesStartIndex, CATEGORIES_LIMIT = CConfig.main.categoriesLimit;

    /**
     * @name findAndOpenGame
     * @param games games array
     * @description get gameId from $location, find game in games and open it
     */
    function findAndOpenGame(searchParams) {
        if (searchParams.game !== undefined) {
            var game;
            casinoData.getGames({country: countryCode, id:[searchParams.game]}).then(function (response) {
                game = response && response.data && response.data.games[0];
                if (game !== undefined) {
                    var initialType = ({'demo':1, 'fun':1, 'real': 1}[searchParams.type] && searchParams.type) || ($rootScope.env.authorized ? 'real' : 'fun');
                    $scope.openGame(game, initialType);
                }
            });
        }
    }

    function handlefirstSelection(openGame, params) {
        var searchParams = params || $location.search();

        if (searchParams.category !== undefined) {
            for (var i = 0, length = allCategories.length; i < length; i += 1) {
                if (allCategories[i].id === searchParams.category) {
                    $scope.selections.category = allCategories[i];
                    $scope.categoriesIndex = Math.floor(i / CATEGORIES_LIMIT);
                    break;
                }
            }

        }
        if (!$scope.selections.category && $scope.categories) {
            $scope.selections.category = ALL_GAMES_CATEGORY;
            $location.search('category', $scope.selections.category.id);
        }

        if ($scope.providers) {
            providersString = searchParams.provider || $scope.providers[0].name;
        } else {
            providersString = 'all';
        }

        getSelectedProvidersArray(providersString);
        $location.search('provider', providersString);

        if (CConfig.main.filterByProviderEnabled) {
            updateProvidersByCategoryId($scope.selections.category.id);
        }

        resetGamesOptions();
        $scope.getGames();

        if (openGame && !$scope.gamesInfo.length) {
            findAndOpenGame(searchParams);
        }
    }

    function getOptions(profileId , forRecommendedGames) {
        $scope.loadingProcess = true;
        //get categories and providers lists
        casinoData.getOptions(countryCode, null, null, profileId).then(function (response) {

            if (response && response.data && response.data.status !== -1) {
                $scope.categories = response.data.categories;
                allCategories = $scope.categories;
                if (CConfig.main.showAllGamesOnHomepage) {
                    $scope.categories.unshift(ALL_GAMES_CATEGORY);
                }
                if (CConfig.main.filterByProviderEnabled) {
                    $scope.providers = response.data.providers;
                    $scope.providers.unshift(ALL_PRIVIDERS);
                    allProviders = $scope.providers;
                }
                if (response.data.hasTournaments) {
                    $scope.hasTournaments = true;
                }

                $scope.loadingProcess = false;

                handlefirstSelection(!forRecommendedGames);
                $scope.moveCategories(undefined, true);
                $scope.selectCategory($scope.categories[0]);
            }
        });
    }


    function updateProvidersByCategoryId(categoryId) {
        if (categoryId === 'all') {
            $scope.providers = allProviders;
            return;
        }
        if (categoryId !== '-1') {
            casinoData.getOptions(countryCode, categoryId, null, ($rootScope.profile ? $rootScope.profile.id : null), true).then(function (response) {
                $scope.providers = response.data.providers;
                $scope.providers.unshift(ALL_PRIVIDERS);
            });
        }
    }


    $scope.getGames = function getGames() {

        if ($scope.loadingProcess) {
            return;
        }
        favouriteGamesWatcherPromise && favouriteGamesWatcherPromise();
        if ($scope.selections.category.id === $scope.favouriteCategory.id) { // favourite category state
            favouriteGamesWatcherPromise = $scope.$watch('myCasinoGames.length', function () {
                if ($rootScope.myCasinoGames.length === 0) {
                    if (CConfig.main.showAllGamesOnHomepage) {
                        $scope.selectCategory(ALL_GAMES_CATEGORY);
                    }else{
                        $scope.selectCategory($scope.categories[0]);
                    }
                     $scope.moveCategories(undefined,true);
                } else {
                    $scope.gamesBlocks = [getAppropriateFavoriteGames()];
                }
                if ($scope.gamesBlocks[0].length === 0 && providersString !== ALL_PRIVIDERS.name) {
                    $scope.loadingProcess = false;
                    $scope.setProviders();
                }
            });
            $scope.gamesBlocks = [getAppropriateFavoriteGames()];

            return;
        }

        var categoryToLoad = $scope.selections.category.id;
        if ($scope.selections.category.id === HOME_CATEGORY.id) {
            loadPopularGames();
            categoryToLoad = CConfig.topSlots.categoryId;
        }

        $scope.loadingProcess = true;

        var additionalParams;
        if (CConfig.main.recommendedGamesCategoryEnabled && categoryToLoad && categoryToLoad === RECOMMENDED_CATEGORY.id) {
            additionalParams = $rootScope.profile ? '&player_id=' + $rootScope.profile.id : '';
        }
        casinoData.getGames({
            category:categoryToLoad,
            provider:providersString,
            country: countryCode,
            offset:$scope.limits.from,
            limit: $scope.limits.to,
            additionalParams: additionalParams
        }).then(function (response){
            if (response && response.data && response.data.status !== -1) {
                $scope.gamesBlocks.push(response.data.games);
                $scope.limits.max = parseInt(response.data.total_count, 10);

                if (parseInt(response.data.total_count, 10) === 0 && providersString !== ALL_PRIVIDERS.name) {
                    $scope.loadingProcess = false;
                    $scope.setProviders();
                }
            }
        })['finally'](function () {
            $scope.loadingProcess = false;
        })

    };

    $scope.selectCategory = function selectCategory(category) {
        if ($scope.selections.category && $scope.selections.category.id === category.id || $scope.loadingProcess) {
            return;
        }

        if (category.id === $scope.favouriteCategory.id) {
            $scope.categories = allCategories;
        }

        $scope.selections.category = category;
        $location.search('category', category.id);
        if(CConfig.main.filterByProviderEnabled) {
            updateProvidersByCategoryId(category.id);
        }
        resetGamesOptions();
        $scope.getGames();
        analytics.gaSend('send', 'event', 'explorer', 'Select Casino Games Category', {'page': $location.path(), 'eventLabel': category.name});
    };

    function showPermittedMessage() {
        $rootScope.$broadcast("globalDialogs.addDialog", {
            type: "warning",
            title: "Warning",
            content: "Please note, the games of this provider is not available for residents in Your area."
        });
    }

    function getSelectedProvidersString() {
        var string = '';
        var array = $scope.selections.providers;
        if (array && array.length) {
            for (var i = 0; i < array.length; i++) {
                string += array[i];
                if (array.length - 1 !== i) {
                    string += ',';
                }
            }
        } else {
            return ALL_PRIVIDERS.name;
        }
        return string;
    }

    function getSelectedProvidersArray(providersString) {
        return $scope.selections.providers = providersString.split(',');
    }

    function onProvidersChange() {
        $scope.selections.providers = $scope.selections.providers.length ? $scope.selections.providers : [ALL_PRIVIDERS.name];

        if ($scope.loadingProcess) {
            return;
        }

        providersString = getSelectedProvidersString();
        $location.search('provider', providersString);
        resetGamesOptions();
        $scope.getGames();
    }


    $scope.toggleProvider = function toggleProvider(provider) {
        if ($scope.loadingProcess) {
            return;
        }
        if (provider === ALL_PRIVIDERS.name) {
            $scope.selections.providers = [ALL_PRIVIDERS.name];
        } else {
            var index = $scope.selections.providers.indexOf(provider);
            var allIndex = $scope.selections.providers.indexOf(ALL_PRIVIDERS.name);

            if (allIndex !== -1) {
                $scope.selections.providers.splice(allIndex, 1);
            }

            if (index === -1) {
                if (!isProviderPermitted(provider)) {
                    showPermittedMessage();
                } else {
                    $scope.selections.providers.push(provider);
                    analytics.gaSend('send', 'event', 'explorer', 'Select Casino Games Provider', {'page': $location.path(), 'eventLabel': provider});
                }
            } else {
                $scope.selections.providers.splice(index, 1);
                analytics.gaSend('send', 'event', 'explorer', 'Unselect Casino Games Provider', {'page': $location.path(), 'eventLabel': provider});
            }
        }

        onProvidersChange();

    };

    $scope.setProviders = function setProviders(providers) {
        $scope.selections.providers = providers && providers.length ? providers : [ALL_PRIVIDERS.name];
        onProvidersChange();
    };

    function isProviderPermitted(provider) {
        var countries = CConfig.main.restrictProvidersInCountries;
        if (countries && countries[provider.name] && $rootScope.geoCountryInfo && $rootScope.geoCountryInfo.countryCode && $rootScope.profile) {
            if (countries[provider.name].indexOf($rootScope.geoCountryInfo.countryCode) !== -1 || countries[provider.name].indexOf($rootScope.geoCountryInfo.countryCode + '-' + $rootScope.profile.currency_name) !== -1) {
                return false;
            }
        }
        return true;
    }

    function resetGamesOptions() {
        $scope.gamesBlocks = [];
        $scope.limits = {
            from: 0,
            to: CConfig.main.loadMoreCount,
            max: 0
        }
    }

    function loadPopularGames() {
        $scope.popularsPerGroups = [];
        casinoData.getGames({
            category:CConfig.popularGames.categoryId,
            provider: providersString,
            country: countryCode
        }).then(function (response) {
            if (response && response.data && response.data.status !== -1) {
                $scope.popularGames = response.data.games;
                createPopularsPerGroups();
            }
        });
    }

    $scope.$on('widescreen.on', function () {
        $scope.wideMode = true;
    });

    $scope.$on('widescreen.off', function () {
        $scope.wideMode = false;
    });

    $scope.$on('middlescreen.on', function () {
        $scope.middleMode = true;
    });
    $scope.$on('middlescreen.off', function () {
        $scope.middleMode = false;
    });

    function filterByField(list, field) {
        if ($rootScope.env.authorized) {
            return list;
        }
        return list.filter(function(item) {
            return !item[field];
        });
    }

    function calculateJackpotSliderGames() {
        $scope.jackpotSliderGames = jackpotSliderAllGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
    }

    $scope.slideJackpotGames = function slideJackpotGames(direction) {
        if (direction === 'prev') {
            $scope.jackpotSlideIndex--;
        } else {
            $scope.jackpotSlideIndex++;
        }

        if (CConfig.main.jackpotSubstituteCategory && jackpotTotalGames > 10 && $scope.jackpotSlideIndex === $scope.jackpotGames.length - 1 - $scope.jackpotSliderVisibleGamesCount) {
            getJackPotData();
        }

        calculateJackpotSliderGames();
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
            }, function () {
                TimeoutWrapper(getJackpotAmount, 20000);
            });
    }

    function subscribeForJackpotData() {
       jackpotManager.subscribeForJackpotData(-1, subscribeForJackpotDataCallback,null, 'casino');  // -1 all games
    }

    function subscribeForJackpotDataCallback(data) {
        var sliderIndex = false;
        data = Utils.objectToArray(data);
        angular.forEach(data, function (jackpot, index) {
            if (jackpot && jackpot.Winner && jackpot.Winner.PlayerId) {

                sliderIndex = index;

                if ($rootScope.profile && jackpot.Winner.PlayerId === $rootScope.profile.id) {

                    TimeoutWrapper.cancel(jackpotWinnerTimeout); // TimeoutWrapper checks the existence of promise by itself

                    $scope.jackpotWinnerCoinsRain = true;
                    jackpotWinnerTimeout = TimeoutWrapper(function () {
                        $scope.jackpotWinnerCoinsRain = false;
                    }, 5000);
                }
            }
        });
        $scope.jackpotData = data;

        if (sliderIndex !== false) {
            $scope.tab.selected = 'jackpots';
            $scope.changeJackpotSlider(sliderIndex);
            sliderIndex = false;
        }
    }

    var jackpotDataWatcher = $scope.$watch('jackpotData', function (data) {
        if (data && data.length > 0) {
            jackpotDataWatcher();
            $scope.tab.selected = 'jackpots';
            $scope.hasJackpots = true;
        }
    });

    function getJackPotData() {
        getJackpotAmount();
        // Requesting data every 2 minutes (120,000 ms) because Casino refreshes its feed with that frequency
        updateInterval = $interval(getJackpotAmount, 120000);

        if (CConfig.main.jackpotSubstituteCategory) {
            if (jackpotTotalGames === $scope.jackpotGames.length && jackpotTotalGames > 0) {
                return;
            }

            var bufferSize = $scope.jackpotSliderVisibleGamesCount * 3;
            var offset = $scope.jackpotGames.length;
            var limit = jackpotTotalGames ? ($scope.jackpotGames.length + bufferSize > jackpotTotalGames ? jackpotTotalGames :  $scope.jackpotGames.length + bufferSize) : bufferSize;


            casinoData.getGames({
                category: CConfig.main.jackpotSubstituteCategory.id,
                country: countryCode,
                offset: offset,
                limit: limit

            }).then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    if (response.data.games && response.data.games.length) {
                        $scope.jackpotGames = $scope.jackpotGames.concat(response.data.games);
                        jackpotTotalGames = parseInt(response.data.total_count, 10);
                        jackpotSliderAllGames = filterByField($scope.jackpotGames, 'has_age_restriction');
                        calculateJackpotSliderGames();
                    } else {
                        $scope.providerMenuDefaultOffset = CConfig.main.providerMenuDefaultOffset ? CConfig.main.providerMenuDefaultOffset : 366;
                        $scope.categoryMenuDefaultOffset = 370;
                    }

                }
            });
        } else {
            casinoData.getJackpotGames().then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    if (response.data.games && response.data.games.length) {
                        $scope.jackpotGames = response.data.games;
                        jackpotSliderAllGames = filterByField($scope.jackpotGames, 'has_age_restriction');
                        calculateJackpotSliderGames();
                    } else {
                        $scope.providerMenuDefaultOffset = CConfig.main.providerMenuDefaultOffset ? CConfig.main.providerMenuDefaultOffset : 366;
                        $scope.categoryMenuDefaultOffset = 370;
                    }
                }
            });
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
     * @description  Increases number of recent games to show
     */
    $scope.loadMoreGames = function loadMoreGames() {
        if ($scope.loadingProcess) {
            return;
        }

        if ($scope.limits && $scope.limits.to < $scope.limits.max && !$scope.gamesInfo.length) {
            $scope.limits.from = $scope.limits.to;
            $scope.limits.to += CConfig.main.loadMoreCount;

            $scope.getGames();
        }
    };

    /**
     * @description broadcasts event to fixElementOnScroll directive to force element stay fixed
     * @param targetId the id of dom element
     */
    $scope.setTargetElementFixed = function setTargetElementFixed(targetId) {
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

    $scope.togglePlayForReal = function togglePlayForReal(gameInfo) {
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
        var countries = CConfig.main.restrictProvidersInCountries;
        if (countries && countries[game.provider] && countries[game.provider].indexOf(countryCode) !== -1) {
            showPermittedMessage();

            return;
        }

        var type = gameType ? gameType : 'real';

        if((!!$rootScope.profile && type === 'real') || type === 'fun'){
            analytics.gaSend('send', 'event', 'games','Open game ' + game.name,  {'page': $location.path(), 'eventLabel': 'Game type '+ type});
        }

        casinoManager.openCasinoGame($scope, game, gameType, studio, urlSuffix, multiViewWindowIndex);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:casinoCtrl
     * @description  close opened game
     */
    $scope.closeGame = function confirmCloseGame(id, targetAction) {
        casinoManager.closeGame($scope, id, targetAction);
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
            var needToClose = $scope.gamesInfo.length === 1 && $scope.gamesInfo[0].game && $scope.gamesInfo[0].game.id !== game.id;
            if (needToClose) {
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

        var favoriteGamesProviders = [ALL_PRIVIDERS.name];

        for (var i = 0, length = $rootScope.myCasinoGames.length; i < length; i += 1) {
            var game = $rootScope.myCasinoGames[i];
            if (favoriteGamesProviders.indexOf(game.show_as_provider) === -1) {
                favoriteGamesProviders.push(game.show_as_provider);
            }

            if ($scope.selections.providers.indexOf(ALL_PRIVIDERS.name) !== -1 || $scope.selections.providers.indexOf($rootScope.myCasinoGames[i].show_as_provider) !== -1) {
                favGames.push($rootScope.myCasinoGames[i]);
            }
        }
        $scope.providers = [];
        if (favoriteGamesProviders.length > 0 && allProviders) {
            $scope.providers = allProviders.filter(function (item) {
                return favoriteGamesProviders.indexOf(item.name) !== -1;
            });
        }
        return favGames;
    }

    $scope.$on("casino.openGame", openCasinoGame);

    $scope.handleBannerClick = function (bannerHref) {
        var linkData = Utils.getAllUrlParams(bannerHref);
        analytics.gaSend('send', 'event', 'news', {'page': "/casino/", 'eventLabel': 'Casino Big banner click'});

        if (linkData.path === '/casino/' && linkData.params) {
            handlefirstSelection(true, linkData.params);
        }
    };

    $scope.$on('casino.action', function (event, data) {
        switch (data.action) {
            case 'setUrlData':
                data.url && data.frameId && casinoManager.setCurrentFrameUrlSuffix($scope.gamesInfo, data);
                break;
            case 'closeGame':
                casinoManager.findAndCloseGame($scope, data.gameId);
                break;
            case 'togglePlayMode':
                var gameInfo = Utils.getArrayObjectElementHavingFieldValue($scope.gamesInfo, "externalId", data.gameId);
                if (gameInfo) {
                    $scope.togglePlayForReal(gameInfo);
                }
                break;
        }
    });

    function createAuthorizedWatcher() {
        $scope.$watch('env.authorized', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            if ($scope.gamesInfo && $scope.gamesInfo.length) {
                casinoManager.refreshOpenedGames($scope);
            }

            if (!newValue) {
                getJackpotAmount();

                if (CConfig.main.recommendedGamesCategoryEnabled) {
                    $scope.categories = $scope.categories.filter(function (category) {
                        return category.id !== RECOMMENDED_CATEGORY.id;
                    });

                    $scope.moveCategories(undefined, true);
                    $scope.selectCategory($scope.categories[0]);
                }
            } else {
                var profileWatcherPromise = $scope.$watch('profile', function (newValue) {
                    if (newValue) {
                        profileWatcherPromise();
                        getJackpotAmount();

                        if (CConfig.main.recommendedGamesCategoryEnabled) {
                            getOptions( $rootScope.profile.id, true);
                        }
                    }
                });
            }

            if ($scope.jackpotSliderGames) {
                $scope.jackpotSlideIndex = 0;
                jackpotSliderAllGames = filterByField($scope.jackpotGames, 'has_age_restriction');
                calculateJackpotSliderGames();
            }
        });
    }

    $scope.$on('casino.selectCategory', function (event, category) {
        $scope.selectCategory(category);
    });

    /**
     * @description change view for applying functionality of multiple view in casino
     */

    $scope.$on('casinoMultiview.viewChange', function (event, view) {
        analytics.gaSend('send', 'event', 'multiview', {'page': $location.path(),'eventLabel': 'multiview changed to ' + view});
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
        $scope.providersMenuState.isClosed = !$scope.providersMenuState.isClosed;
    };

    $scope.loadBannerInsteadWinners = function loadBannerInsteadWinners(slug) {
        content.getPage(slug).then(function (response) {
            if (response.data && response.data.widgets) {
                $scope.newLastTopBanner = response.data.widgets[0].instance;
            }
        });
    };

    // casino games list directive events
    $scope.$on('casinoGamesList.openGame', function (e, data) {
        if (!data.game && data.gameId) {
            casinoData.getGames({country: countryCode, id:[data.gameId]}).then(function (response) {
                if (response && response.data && response.data.games && response.data.games.length) {
                    $scope.openGame(response.data.games[0]);
                }
            });
        } else {
            $scope.openGame(data.game, data.playMode, data.studio);
        }
    });


    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function (e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    });

    $scope.openCasinoGameDetails = function openCasinoGameDetails(game_skin_id) {
        casinoManager.openGameDetailsPopUp(game_skin_id);
    };

    var initProfileWatcher = false;

    (function init() {
        Geoip.getGeoData(false).then(function (data) {
            data && data.countryCode && (countryCode = data.countryCode);
        })['finally'](function () {
            if (CConfig.main.recommendedGamesCategoryEnabled && !$rootScope.profile && $rootScope.loginInProgress) {
                var loginProccesWatcher = $scope.$watch('loginInProgress', function (loginInProgress, oldValLoginInProgress) {
                    if (loginInProgress !== oldValLoginInProgress) {
                        loginProccesWatcher();
                        if (!loginInProgress && $rootScope.env.authorized) {
                            initProfileWatcher = $rootScope.$watch('profile', function (profile) {
                                if (profile) {
                                    initProfileWatcher();
                                    initProfileWatcher = false;
                                    getOptions(profile.id);
                                    createAuthorizedWatcher();
                                    console.log('recommended-', 'loginInProgress -true');
                                }
                            });
                        } else {
                            getOptions($rootScope.profile && CConfig.main.recommendedGamesCategoryEnabled ? $rootScope.profile.id : null);
                            createAuthorizedWatcher();
                            console.log('recommended-', 'loginInProgress -false');
                        }
                    }
                });
            } else {
                getOptions($rootScope.profile && CConfig.main.recommendedGamesCategoryEnabled ? $rootScope.profile.id : null);
                createAuthorizedWatcher();
                console.log('recommended-', 'loginInProgress -false');
            }
            getJackPotData();
            subscribeForJackpotData();
        });
    })();

    $scope.$on('$destroy', function () {
        casinoManager.clearAllPromises();
        jackpotManager.unsubscribeFromJackpotData(true);
        if (updateInterval) {
            $interval.cancel(updateInterval);
        } else { // This is an optional part. During testing this never happened

            // if for some reason (e.g. fast route change) the promise wasn't created we wait for it to be defined
            (function () {
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

    /**
     * @ngdoc method
     * @name moveCategories
     * @methodOf CASINO.controller:casinoCtrl
     * @description move categories right or left by limir size
     * @param {Boolean} isNext is  move right
     * @param {Boolean} initialize is initialize
     */
    $scope.moveCategories = function moveCategories(isNext, initialize) {
        var startIndex;
        if(initialize) {
            $scope.categoriesGroupCount = Math.ceil($scope.categories.length / CATEGORIES_LIMIT);
            if ($scope.categoriesIndex === undefined) {
                $scope.categoriesIndex = 0;
            }
        } else if (isNext) {
            $scope.categoriesIndex += 1;
        } else {
            $scope.categoriesIndex -= 1;
        }
        startIndex = CATEGORIES_LIMIT * $scope.categoriesIndex;

        $scope.availableCategories = $scope.categories.slice(startIndex, startIndex + CATEGORIES_LIMIT);

    };
    /**
     * @ngdoc method
     * @name toggleProviders
     * @methodOf CASINO.controller:casinoCtrl
     * @description toggle providers list and store user choice
     */
    $scope.toggleProviders = function toggleProviders() {
        $scope.providersOpened = !$scope.providersOpened;
        Storage.set("casinoProvidersOpened", $scope.providersOpened);
    };



}]);
