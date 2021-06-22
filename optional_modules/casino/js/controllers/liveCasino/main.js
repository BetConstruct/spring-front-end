/**
 * @ngdoc controller
 * @name CASINO.controller:liveCasinoMainCtrl
 * @description
 * casino page controller
 */

CASINO.controller('liveCasinoMainCtrl', ['$rootScope', '$scope', '$sce', '$location', '$interval', '$window', 'Storage', 'CConfig', 'casinoData', 'Utils', 'casinoManager', 'Translator', 'Zergling', 'WPConfig', 'content', 'analytics', 'smoothScroll', 'Geoip','casinoMultiviewValues', function ($rootScope, $scope, $sce, $location, $interval, $window, Storage, CConfig, casinoData, Utils, casinoManager, Translator, Zergling, WPConfig, content, analytics, smoothScroll, Geoip, casinoMultiviewValues) {
    'use strict';

    $scope.games = [];
    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    $scope.errorStatus = 0;
    $scope.confData = CConfig;
    $scope.selectedGameId = '';

    $scope.$on('widescreen.on', function () { $scope.wideMode = true; });
    $scope.$on('widescreen.off', function () { $scope.wideMode = false; });
    $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
    $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });

    casinoMultiviewValues.init($scope);

    var countryCode = '';
    /**
     * @ngdoc method
     * @name loadGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads live dealer games list using {@link CASINO.service:casinoData casinoData} service's **getCategory** method
     * and assigns to scope's 'games' variable
     */
    function loadGames() {
        casinoData.getGames({category:CConfig.liveCasino.categoryId, country: countryCode, offset:0, limit: 999}).then(function (response) {
            if (response && response.data && response.data.status !== -1) {
                prepareGames(response.data.games);
                showProviderMessage('onOpen');
            } else {
                $scope.errorStatus = 1;
            }
        })['catch'](function () {
            $scope.errorStatus = 1;
        });
    }

    function getBonusPopUpOptions() {
        var searchParams = $location.search();
        if (!searchParams.game) {
            var wasShownPopUp = Storage.get('lcBonusPopUp');
            if (!wasShownPopUp) {
                Storage.set('lcBonusPopUp', true, CConfig.main.storedbonusPopUpLifetime);
                $rootScope.$broadcast('youtube.videourl', CConfig.bonusPopUpUrl);
            }
        }
    }

    function prepareGames(games) {
        var isInKeno = $location.path() === '/keno/' || $location.path() === '/keno';
        if (!isInKeno) {
            $scope.games = games;

            if ($scope.confData.liveCasino.view3DEnabled || $scope.confData.liveCasino.viewStyle === '3DView') {
                prepareView3DDisplay();
                load3DViewTopBanners();
            } else if ($scope.confData.liveCasino.viewStyle === 'SliderView' || $scope.confData.liveCasino.viewStyle === 'LeftMenuView') {
                $scope.liveGamesData = casinoManager.initProvidersData(games);
            }
        } else {
            var kenoGames = [], length = games.length;
            for (var i = 0; i < length; i += 1) {
                if (games[i].id === $scope.confData.liveCasino.games.keno.id || games[i].id === $scope.confData.liveCasino.games.draw.id) {
                    kenoGames.push(games[i]);
                }
            }
            $scope.games = kenoGames;
            $scope.firstView = false;
            $scope.confData.liveCasino.allViewsEnabled = false;
            $scope.confData.liveCasino.view3DEnabled = true;
        }

        var searchParams = $location.search();
        $scope.selectLiveDealerProvider(searchParams.provider ? searchParams.provider : $scope.liveGamesData.selectedProvider);

        findAndOpenGame(searchParams);
    }

    /**
     * @ngdoc method
     * @name selectLiveDealerProvider
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Select provider
     * @param {string} provider: Name of the provider
     */
    $scope.selectLiveDealerProvider = function selectLiveDealerProvider(provider) {
        $scope.liveGamesData.selectedProvider = provider;
        $location.search('provider', provider);
    };

    /**
     * @ngdoc function
     * @name findAndOpenGame
     * @description Find and open game. This part of the logic implemented as on casino.js
     */
    function findAndOpenGame(searchParams) {
        if (searchParams.game !== undefined) {
            var game = casinoManager.getGameById($scope.games, searchParams.game);
            var studio = searchParams.studio;
            if (game) {
                $scope.openGame(game, null, studio);
            }
        }
    }

    /**
     * @ngdoc method
     * @name openGameInNewWindow
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  calculates the possible sizes of the popup window and opens casino game in there
     *
     * @param {string} id game id
     */
    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoManager.openPopUpWindow($scope, id);
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {Object} game game object
     * @param {String} gameType gameType string
     * @param {String} studio studio string
     * @param {String} urlSuffix the url's suffix
     * @param {Number} multiViewWindowIndex - passed when the window in multiview is refreshed
     * @description  opens login form if it needed, or generates casino game url and opens it
     */
    $scope.openGame = function openGame(game, gameType, studio, urlSuffix, multiViewWindowIndex) {
        if ($scope.gamesInfo.length < 2) {
            if (studio) {
                $location.search('studio', studio);
            }
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
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description  close opened game
     */
    $scope.closeGame = function confirmCloseGame(id, targetAction) {
        casinoManager.closeGame($scope, id, targetAction);
    };


    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     * @param {Object} game Object
     */
    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
    };

    $scope.$on('casinoGamesList.toggleSaveToMyCasinoGames', function (e, game) {
        $scope.toggleSaveToMyCasinoGames(game);
    });


    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoManager.togglePlayMode($scope, gameInfo);
    };

    function openLiveDealerGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            if ($scope.games.length) {
                $scope.openGame(game, gameType, $scope.liveGamesData.devidedGames[$scope.liveGamesData.selectedProvider].defaultStudio);
            } else {
                var gamesWatcherPromise = $scope.$watch('games', function() {
                    if ($scope.games.length) {
                        $scope.openGame(game, gameType, $scope.liveGamesData.devidedGames[$scope.liveGamesData.selectedProvider].defaultStudio);
                        gamesWatcherPromise();
                    }
                });
            }
        } else {
            //games that are not resizable
            if (game.ratio == "0") {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
                    content: 'Sorry, this game cannot be opened in multi-view mode'
                });
            } else {
                var i, count = $scope.gamesInfo.length;
                for (i = 0; i < count; i += 1) {
                    if ($scope.gamesInfo[i].gameUrl === '') {
                        $scope.gamesInfo[i].toAdd = true;
                        if (game.categories.indexOf(CConfig.liveCasino.categoryId)!== -1) {
                            $scope.openGame(game, null, $scope.liveGamesData.devidedGames[$scope.liveGamesData.selectedProvider].defaultStudio);
                        } else {
                            $scope.openGame(game, gameType);
                        }
                        break;
                    }
                }
                if (i === count) {
                    $rootScope.$broadcast("globalDialogs.addDialog", {
                        type: "warning",
                        title: "Warning",
                        content: 'Please close one of the games for adding new one'
                    });
                }
            }
        }
    }

    $scope.$on("livedealer.openGame", openLiveDealerGame);

    $scope.$on('casino.action', function(event, data) {
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

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue === oldValue) {
            return;
        }
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoManager.refreshOpenedGames($scope);
        }
    });

    /**
     * @ngdoc method
     * @name openDealerGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description find the dealers game and open it
     * @param {Object} dealerInfo the object that contain infomration for current dealer
     */
    $scope.openDealerGame = function openDealerGame(dealerInfo) {
        if ($scope.games && $scope.games.length) {
            var game, i, length = $scope.games.length;
            for (i = 0; i < length; i += 1) {
                if ($scope.games[i].server_game_id == dealerInfo.game_id) {
                    game = $scope.games[i];
                    break;
                }
            }

            if (game) {
                $scope.selectDealerPage($scope.dealerPages[0]);
                $scope.openGame(game);
            }
        }
    };

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
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description enable current view for add new game and show container of all games
     * @param {String} id gameInfo id
     */
    $scope.enableToAddGame = function enableToAddGame(id) {
        for (var i = 0; i < $scope.gamesInfo.length; i += 1) {
            $scope.gamesInfo[i].toAdd = id === $scope.gamesInfo[i].id;
        }
        $scope.$broadcast('casinoMultiview.showGames', CConfig.liveCasino.categoryId); // show multiview popup  with live casino games
    };

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {Int} id the games id
     */
    $scope.refreshGame = function refreshGame(id) {
        casinoManager.refreshCasinoGame($scope, id);
    };

    /**
     * @ngdoc method
     * @name loadDealerPages
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads poker pages from cms and selects first one
     */
    function loadDealerPages() {
        $scope.dealerPagesLoaded = false;

        if (Utils.isObjectEmpty($scope.dealerPages)) {
            content.getPage('live-dealer-' + $rootScope.env.lang, true).then(function (data) {
                $scope.dealerPagesLoaded = true;
                $scope.dealerPages = [];
                if (data.data.page && data.data.page.children) {
                    $scope.dealerPages = data.data.page.children;
                    var i, j, k;
                    for (i = 0; i < $scope.dealerPages.length; i++) {
                        $scope.dealerPages[i].title = $sce.trustAsHtml($scope.dealerPages[i].title);
                        $scope.dealerPages[i].content = $sce.trustAsHtml($scope.dealerPages[i].content);
                        for (j = 0; j < $scope.dealerPages[i].children.length; j++) {
                            $scope.dealerPages[i].children[j].title = $sce.trustAsHtml($scope.dealerPages[i].children[j].title);
                            $scope.dealerPages[i].children[j].content = $sce.trustAsHtml($scope.dealerPages[i].children[j].content);
                            for (k = 0; k < $scope.dealerPages[i].children[j].children.length; k++) {
                                $scope.dealerPages[i].children[j].children[k].title = $sce.trustAsHtml($scope.dealerPages[i].children[j].children[k].title);
                                $scope.dealerPages[i].children[j].children[k].content = $sce.trustAsHtml($scope.dealerPages[i].children[j].children[k].content);
                            }
                        }
                    }
                    var page = checkForDealerPageDeepLink() || $scope.dealerPages[0];
                    if(page){
                        $scope.selectDealerPage(page);
                    }
                }
            }, function (reason) {
                $scope.dealerPages = [];
                $scope.dealerPagesLoaded = true;
            });
        }
    }

    function checkForDealerPageDeepLink(){
        if ($location.search().page) {
            var i, slug = $location.search().page;
            for (i = 0; i < $scope.dealerPages.length; i += 1) {
                if ($scope.dealerPages[i].slug === slug) {
                    return $scope.dealerPages[i];
                }
            }
        }

        return null;
    }

    /**
     * @ngdoc method
     * @name selectDealerPage
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description selects given poker page
     *
     * @param {Object} page page to select
     */
    $scope.selectDealerPage = function selectDealerPage(page) {
        if (!$scope.selectedDealerPage || $scope.selectedDealerPage.slug !== page.slug) {
            $scope.selectedDealerPage = page;
            if (page.slug === 'tournaments') {
                $location.url('/tournaments/');
            } else {
                $location.search('page', page.slug);

                if (page.slug === "meet-our-dealers") {
                    $scope.ourDealers = getVisibleGames($scope.selectedDealerPage.children);
                    //get dealerInfo
                    getDealerInfo($scope.ourDealers[2].custom_fields.dealer_id[0]);
                }

                if (page.slug === 'how-to-play' && !$scope.howToPlayPage) {
                    prepareHowToPlay();
                }
            }
        }
    };

    function prepareHowToPlay() {
        var i, length = $scope.selectedDealerPage.children.length;
        $scope.howToPlayPage = {
            sliderIndex: 0 // for products slider
        };

        for (i = 0; i < length; i += 1) {
            switch ($scope.selectedDealerPage.children[i].slug) {
                case 'products':
                    $scope.howToPlayPage.products = Utils.groupToGroups($scope.selectedDealerPage.children[i].children, 4);
                    break;
                case 'game-rules':
                    $scope.howToPlayPage.rules = $scope.selectedDealerPage.children[i];
                    break;
                case 'learn-to-win':
                    $scope.howToPlayPage.learnToWin = $scope.selectedDealerPage.children[i];
                    break;
            }
        }
    }

    /**
     * @ngdoc method
     * @name showProviderMessage
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Displays custom provider message
     *
     * @param {String} provider
     */
    function showProviderMessage (provider) {
        if (CConfig.liveCasino && CConfig.liveCasino.providerMessage && CConfig.liveCasino.providerMessage[provider]) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "info",
                title: "Info",
                content: CConfig.liveCasino.providerMessage[provider]
            });
        }
    }

    /**
     * @ngdoc method
     * @name slideHowToPlayProducts
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Slides visible how to play's products left or right
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slideHowToPlayProducts = function slideHowToPlayProducts(direction) {
        if (direction === 'left') {
            $scope.howToPlayPage.sliderIndex = $scope.howToPlayPage.sliderIndex > 0 ? 0 : $scope.howToPlayPage.products.length - 1;
        } else if (direction === 'right') {
            $scope.howToPlayPage.sliderIndex = $scope.howToPlayPage.sliderIndex < $scope.howToPlayPage.products.length - 1 ? $scope.howToPlayPage.sliderIndex + 1 : 0;
        }
    };

    /**
     * @ngdoc method
     * @name scrollToSelectedItem
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description scroll to element that has itemId
     *
     * @param {String} itemId id of item
     * @param {String} provider name (optional)
     */
    $scope.scrollToSelectedItem = function scrollToSelectedItem(itemId, provider){
        showProviderMessage(provider);
        smoothScroll(itemId);
    };

    /**
     * @ngdoc method
     * @name slide
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description Slides visible games left or right
     *
     * @param {String} direction direction, 'left' or 'right'
     */
    $scope.slide = function slide(direction) {
        $scope.slideDirection = direction;
        var dealers = $scope.selectedDealerPage.children;

        if (direction === 'left') {
            dealers.unshift(dealers.pop());
        } else if (direction === 'right') {
            dealers.push(dealers.shift());
        }
        $scope.ourDealers = getVisibleGames(dealers);
        //get dealerInfo
        getDealerInfo($scope.ourDealers[2].custom_fields.dealer_id[0]);
    };

    function getVisibleGames(games) {
        return games.slice(0, 5);
    }

    /*
     * get dealer info according to dealerId
     */
    function getDealerInfo(dealerId) {
        $scope.dealerInfo = null;
        Zergling.get({'dealer_id': dealerId}, 'casino_live_dealer_info').then(function (response) {
            $scope.dealerInfo = response;
            if ($scope.dealerInfo.is_online) {
                $scope.dealerInfo.gameName = 'livecasino_' + $scope.dealerInfo.game_id +
                    ($scope.dealerInfo.game_id == '101' ? '_' + $scope.dealerInfo.table_id : '');
            }
        }, function (failResponse) {
            $scope.dealerInfo = {is_online: false};
        });
    }

    /**
     * 3D view functionality
     */

    var rotatePromise;

    $scope.initSlidingView = function initSlidingView() {
        loadSlidingViewTopBanners();
    };

    /**
     * @ngdoc method
     * @name table3DClickHandler
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {String} gameId id of selected game
     * @description  opens current tables or shows error message if the selected game is undefined
     */
    $scope.table3DClickHandler = function table3DClickHandler(gameId) {
        var game = casinoManager.getGameById($scope.games, gameId);
        if (game) {
            $scope.openGame(game);
        } else {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: 'The game is not available'
            });
        }
    };

    /**
     * @ngdoc method
     * @name view3DChangeArrowClick
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     *
     * @description  change current view
     */
    $scope.view3DChangeArrowClick = function view3DChangeArrowClick() {
        $scope.firstView = !$scope.firstView;
    };

    /**
     * @ngdoc method
     * @name load3DViewTopBanners
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description loads poker 3d view top banners from cms
     */
    function load3DViewTopBanners() {
        if (Utils.isObjectEmpty($scope.top3DBanners)) {
            $scope.top3DBanners = {
                l1: {index: 0, rotationPaused: false, list: []},
                l2: {index: 0, rotationPaused: false, list: []},
                r1: {index: 0, rotationPaused: false, list: []},
                r2: {index: 0, rotationPaused: false, list: []}
            };
            content.getWidget('bannerSlugs.livecasino').then(function (response) {
                if (response.data && response.data.widgets && response.data.widgets[0]) {
                    var i, length = response.data.widgets.length;
                    for (i = 0; i < length; i += 1) {
                        var instance = response.data.widgets[i].instance;
                        switch (instance.align) {
                            case 'l1':
                                $scope.top3DBanners.l1.list.push(instance);
                                break;
                            case 'l2':
                                $scope.top3DBanners.l2.list.push(instance);
                                break;
                            case 'r1':
                                $scope.top3DBanners.r1.list.push(instance);
                                break;
                            case 'r2':
                                $scope.top3DBanners.r2.list.push(instance);
                                break;
                            default:
                                //$scope.top3DBanners.l1.list.push(instance);
                                break;
                        }
                    }
                }

                if ($scope.top3DBanners.l1.list.length > 1 || $scope.top3DBanners.l2.list.length > 1 || $scope.top3DBanners.r1.list.length > 1 || $scope.top3DBanners.r2.list.length > 1) {
                    rotatePromise = $interval(change3DBanners, CConfig.liveCasino.view3DBannersRotationPeriod);
                }
            });
        }
    }

    function loadSlidingViewTopBanners () {
        content.getPage('live-casino.mainPageSlugs', true).then(function (data) {
            $scope.productSlides = (data.data.page && data.data.page.children[0] && data.data.page.children[0].children) || [];
        });
    }

    /**
     * @ngdoc method
     * @name top3DBannerClickHandler
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @description   check link and opens corresponding data
     *
     * @param {string} [link] optional
     */
    $scope.top3DBannerClickHandler = function top3DBannerClickHandler(link) {
        //analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'livecasino 3d view top banner click'});
        if (link === undefined || link === '') {
            return;
        }
        var unregisterlocationChangeSuccess = $scope.$on('$locationChangeSuccess', function () {
            unregisterlocationChangeSuccess();

            var searchParams = $location.search();
            if (searchParams.game !== undefined) {
                var gameID = parseInt(searchParams.game, 10);
                $scope.table3DClickHandler(gameID);
            } else if (searchParams.help !== undefined) {
                $rootScope.$broadcast('openHelpPage', {slug: searchParams.help, from: 'footer'}); //need to open helps sliders
            }
        });
    };

    /**
     * @ngdoc method
     * @name t3DBRotationControl
     * @methodOf CASINO.controller:liveCasinoMainCtrl
     * @param {String} currentBanner reference to current banner
     * @param {String} mouseEvent 'over' or 'out'
     *
     * @description  pause or play current banner by changing current rotationPaused attribute
     */
    $scope.t3DBRotationControl = function t3DBRotationControl(currentBanner, mouseEvent) {
        $scope.top3DBanners[currentBanner].rotationPaused = mouseEvent === 'over';
    };


    function change3DBanners() {
        if ($scope.firstView) {
            // rotate l1 banner
            if (!$scope.top3DBanners.l1.rotationPaused) {
                if ($scope.top3DBanners.l1.index < $scope.top3DBanners.l1.list.length - 1) {
                    $scope.top3DBanners.l1.index += 1;
                } else {
                    $scope.top3DBanners.l1.index = 0;
                }
            }
            // rotate r1 banner
            if (!$scope.top3DBanners.r1.rotationPaused) {
                if ($scope.top3DBanners.r1.index < $scope.top3DBanners.r1.list.length - 1) {
                    $scope.top3DBanners.r1.index += 1;
                } else {
                    $scope.top3DBanners.r1.index = 0;
                }
            }

        } else {
            // rotate l2 banner
            if (!$scope.top3DBanners.l2.rotationPaused) {
                if ($scope.top3DBanners.l2.index < $scope.top3DBanners.l2.list.length - 1) {
                    $scope.top3DBanners.l2.index += 1;
                } else {
                    $scope.top3DBanners.l2.index = 0;
                }
            }
            // rotate r2 banner
            if (!$scope.top3DBanners.r2.rotationPaused) {
                if ($scope.top3DBanners.r2.index < $scope.top3DBanners.r2.list.length - 1) {
                    $scope.top3DBanners.r2.index += 1;
                } else {
                    $scope.top3DBanners.r2.index = 0;
                }
            }
        }
    }

    function prepareView3DDisplay() {
        var FPGamesLength = 0, SPGamesLength = 0;
        var i, length = $scope.games.length;
        for (i = 0; i < length; i += 1) {
            switch ($scope.games[i].id) {
                case $scope.confData.liveCasino.games.roulette.id:
                case $scope.confData.liveCasino.games.blackjack.id:
                case $scope.confData.liveCasino.games.baccarat.id:
                case $scope.confData.liveCasino.games.betOnPoker.id:
                    FPGamesLength += 1;
                    break;
                case $scope.confData.liveCasino.games.keno.id:
                case $scope.confData.liveCasino.games.draw.id:
                    SPGamesLength += 1;
                    break;
            }
        }

        $scope.confData.liveCasino.allViewsEnabled = FPGamesLength > 0 && SPGamesLength > 0;
        $scope.firstView = FPGamesLength > 0;
    }


    $scope.$on('casinoGamesList.openGame', function(e, data) {
        if (!data.game && data.gameId) {
            var game = casinoManager.getGameById($scope.games, data.gameId);
            if (game) {
                $scope.openGame(game, data.playMode, data.studio);
            } else {
                casinoData.getGames({country: countryCode, id:[data.gameId]}).then(function(response) {
                    if(response && response.data) {
                        $scope.openGame(response.data.games[0]);
                    }
                });
            }
        } else {
            $scope.openGame(data.game, data.playMode, data.studio);
        }

        if (data.provider) {
            $scope.selectLiveDealerProvider(data.provider);
        }
    });

    $scope.openCasinoGameDetails = function openCasinoGameDetails (game_skin_id) {
        casinoManager.openGameDetailsPopUp(game_skin_id);
    };


    (function init() {
        loadDealerPages();
        casinoData.getPageOptions($scope, true);
        Geoip.getGeoData(false).then(function (data) {
            data && data.countryCode && (countryCode = data.countryCode);
        })['finally'](function () {
            loadGames();
        });

        //check and show bonus popUp if it need
        if (CConfig.bonusPopUpUrl) {
            getBonusPopUpOptions();
        }
    })();

    $scope.$on('$destroy', function () {
        if (rotatePromise) {
            $interval.cancel(rotatePromise);
        }
        casinoManager.clearAllPromises();
        showProviderMessage('onLeave');
    });
}]);
