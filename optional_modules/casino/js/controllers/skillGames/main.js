/**
 * @ngdoc controller
 * @name CASINO.controller:skillGamesMainCtrl
 * @description
 * skillGamesMainCtrl page controller
 */

CASINO.controller('skillGamesMainCtrl', ['$rootScope', '$scope', '$location', 'Config', 'CConfig', 'casinoData', 'Utils', 'casinoUtils', 'casinoCache', 'Translator', 'analytics', 'content', 'TimeoutWrapper', function ($rootScope, $scope, $location, Config, CConfig, casinoData, Utils, casinoUtils, casinoCache, Translator, analytics, content, TimeoutWrapper) {
    'use strict';

    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.cConf = {
        iconsUrl: CConfig.cUrlPrefix + CConfig.iconsUrl,
        backGroundUrl: CConfig.cUrlPrefix + CConfig.backGroundUrl,
        downloadEnabled: CConfig.main.downloadEnabled,
        realModeEnabled: CConfig.main.realModeEnabled,
        belote: CConfig.belote,
        backgammon: CConfig.backgammon,
        deberc: CConfig.deberc,
        poker: CConfig.poker,
        chinesePoker: CConfig.chinesePoker,
        ogwil: CConfig.ogwil,
        newCasinoDesignEnabled: CConfig.main.newCasinoDesign.enabled
    };

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

    /**
     * @ngdoc method
     * @name loadGames
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description loads skill games list using {@link CASINO.service:casinoData casinoData} service's **getCategory** method
     * and assigns to scope's 'sports' variable
     */
    $scope.loadGames = function loadGames() {
        var skillGamesData = casinoCache.get(CConfig.skillGames.categoryName + CConfig.main.partnerID);
        if (skillGamesData !== undefined) {
            prepareSkillGames(skillGamesData);
        } else {
            casinoData.getCategory(CConfig.skillGames.categoryName, CConfig.main.partnerID).then(function (response) {
                var skillGames = casinoUtils.prepareSkillGames(response.data);

                if ($rootScope.conf.enableNewSkillGame && $rootScope.conf.pokerEnabled) { // poker game
                    var pokerGame = $scope.cConf.poker;

                    pokerGame.gameInfo = {
                        targetOpenLink: $rootScope.poker.instantPlayLink,
                        downloadLink: $rootScope.poker.downloadLink.windows,
                        downloadLinkLinux: $rootScope.poker.downloadLink.linux,
                        downloadLinkMac: $rootScope.poker.downloadLink.mac,
                        downloadLinkAndroid: $rootScope.poker.downloadLink.android,
                        betaDownloadLink: $rootScope.poker.betaDownloadLink,
                        instantPlayLink: Config.poker.instantPlayLink,
                        instantPlayTarget: Config.poker.instantPlayTarget
                    };

                    skillGames.unshift(pokerGame);
                }
                var preparedSkillGames = casinoUtils.setGamesFunMode(skillGames);
                casinoCache.put(CConfig.skillGames.categoryName + CConfig.main.partnerID, preparedSkillGames);
                prepareSkillGames(preparedSkillGames);
            }, function (reason) {
                $scope.gamesPageLoaded = true;
            });
        }

        if (CConfig.main.multiViewEnabled) {
            getAllGames();
        }
    };

    /**
     * @ngdoc method
     * @name getAllGames
     * @methodOf CASINO.controller:casinoCtrl
     * @description  loads all games and filter options list using {@link CASINO.service:casinoData casinoData} service's **getFilterOptions** method
     */
    function getAllGames() {
        $scope.agSelectedCategory = 'SkillGames';
        $scope.popUpSearchInput = '';
        var gamesData = casinoCache.get('allGames' + CConfig.main.partnerID);
        if (gamesData !== undefined) {
            $scope.allGames = casinoCache.get('allGames' + CConfig.main.partnerID);
        } else {
            casinoData.getFilterOptions().then(function (response) {
                if (response.data) {
                    var multiViewGames = casinoUtils.getMultiviewGames(Utils.objectToArray(response.data.games));
                    var filteredMultiViewGames = casinoUtils.filterByGameProvider(multiViewGames, CConfig.main.filterByProvider);
                    $scope.allGames = casinoUtils.setGamesFunMode(filteredMultiViewGames);
                    casinoCache.put('allGames' + CConfig.main.partnerID, $scope.allGames);
                }
            });
        }
    };

    function prepareSkillGames(games) {
        if ($rootScope.conf.enableNewSkillGame) {
            createTopMenu(games);
        }

        $scope.games = games;
        $scope.gamesPageLoaded = true;
        var searchParams = $location.search();
        if (searchParams.game !== undefined) {
            var gameID = parseInt(searchParams.game, 10);
            for (var i = 0, count = games.length; i < count; i += 1) {
                if (games[i].id == gameID) {
                    var gameType = $rootScope.env.authorized || !CConfig.main.funModeEnabled ? 'real' : 'demo';
                    TimeoutWrapper(function () {
                        $scope.openGame(games[i], gameType);
                    }, 100);
                    break;
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name openGameInNewWindow
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description  calculates the possible sizes of the popup window and opens casino game in there
     */
    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoUtils.openPopUpWindow($scope, id);
    };

    /**
     * @ngdoc method
     * @name openGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @param {Object} game game object
     * @description  opens login form if it needed, or generates casino game url and opens it
     *
     */
    $scope.openGame = function openGame(game, gameType, studio) {
        analytics.gaSend('send', 'event', 'games', game.gameCategory || game.gameCat, {'page': $location.path(), 'eventLabel': ('Open ' + game.gameName + ' ' + gameType)});

        casinoUtils.openCasinoGame($scope, game, gameType, studio);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
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
        $location.search('game', undefined);
        $location.search('type', undefined);
    };

    $scope.$watch('env.authorized', function () {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoUtils.refreshOpenedGames($scope);
        }
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

    /**
     * @ngdoc method
     * @name isFromSaved
     * @methodOf CASINO.controller:skillGamesMainCtrl
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
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     * @param {Object} game Object
     */
    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        casinoUtils.toggleSaveToMyCasinoGames($rootScope, game);
    };

    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoUtils.togglePlayMode($scope, gameInfo);
    };

    function getGameById(gameID) {
        for (var i = 0, count = $scope.games.length; i < count; i += 1) {
            if ($scope.games[i].id === gameID) {
                return $scope.games[i];
            }
        }
    };

    function openSkillGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            if ($scope.gamesInfo && $scope.gamesInfo.length === 1) {
                $scope.closeGame();
            }
            if ($scope.games && $scope.games.length) {
                $scope.openGame(getGameById(game.id), gameType);
            } else {
                var gamesWatcherPromise = $scope.$watch('games', function () {
                    if ($scope.games && $scope.games.length) {
                        $scope.openGame(getGameById(game.id), gameType);
                        gamesWatcherPromise();
                    }
                });
            }
        } else {
            //games that are not resizable
            game.gameType = (typeof game.gameType) == 'string' ? JSON.parse(game.gameType) : game.gameType;
            if (game.gameType.ratio == "0") {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
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
                        type: "warning",
                        title: "Warning",
                        content: Translator.get('Please close one of the games for adding new one')
                    });
                }
            }
        }
    };

    $scope.$on("games.openGame", openSkillGame);

    /**
     * @ngdoc method
     * @name changeView
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description change view for applying functionality of multiple view in casino
     * @param {Int} view the Int
     */
    $scope.changeView = function changeView(view) {
        var i, gameInfo, uniqueId;
        if (view > $scope.gamesInfo.length) {
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
                    type: "warning",
                    title: "Warning",
                    content: Translator.get('Please close {1} game(s) to change view', [numberOfNeeded])
                });
            }
        }
        $rootScope.casinoGameOpened = $scope.gamesInfo.length;

        analytics.gaSend('send', 'event', 'multiview', {'page': $location.path(), 'eventLabel': 'multiview changed to ' + view});
    };

    /**
     * @ngdoc method
     * @name enableToAddGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
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
        $scope.agSelectedCategory = 'SkillGames';
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
    };

    $scope.$watch('agSelectedCategory', function () {
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);

        if ( $scope.agSelectedCategory === 'LiveDealer') {
            $scope.mvTablesInfo = {};
            casinoUtils.setupTableInfo($scope.mvTablesInfo);
        }
    });

    $scope.$watch('popUpSearchInput', function () {
        $scope.popUpGames = casinoUtils.getCasinoPopUpGames($scope.allGames, $scope.agSelectedCategory, $scope.popUpSearchInput, $scope.gamesInfo);
    });

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
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
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {String} category the category of request
     */
    $scope.gaminatorTransfer = function gaminatorTransfer(category) {
        casinoUtils.gpTransfer(category, $scope.gpTransferModel);
    };

    /**
     * @ngdoc method
     * @name getSkillGamesBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description   populates $scope's **pokerTopBanners** variable with banner information got from cms
     **/
    $scope.getSkillGamesBanners = function getSkillGamesBanners(containerId) {
        containerId = containerId || 'skillgames-banners-' + $rootScope.env.lang;
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.skilledGamesBanners = [];
                angular.forEach(response.data.widgets, function (widget) {
                    $scope.skilledGamesBanners.push(widget.instance);
                });
            }
        }, function (reason) {
            console.log(reason);
        });
    };

    /**
     * @ngdoc method
     * @name openCBannerLink
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description   Track big-slider banners click
     *
     */
    $scope.openCBannerLink = function openCBannerLink() {
        analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'Skill Games banner click'});
    };

    /**
     * for live casino in multiple view mode: listen to messages from other windows to change livedealer options when needed
     */
    $scope.$on('livedealer.redirectGame', function (event, message) {
        if (message.data && !message.data.openJackpotList) {
            casinoUtils.adjustLiveCasinoGame($scope, message);
        }
    });

    function createTopMenu(games) {
        var pageId = $location.search().pageid;
        $scope.gamePages = [
            {name: 'Home', id: '-1'}
        ];
        var i, pageToSelect, length = games.length;
        for (i = 0; i < length; i += 1) {
            var item = {
                name: games[i].gameName,
                id: games[i].id
            };
            if (pageId === item.id) {
                pageToSelect = item;
            }
            $scope.gamePages.push(item);
        }
        $scope.selectPage(pageToSelect || $scope.gamePages[0]);
    }

    $scope.selectPage = function selectPage(page) {
        var key = page.name.toLowerCase();
        if (page.id !== '-1' && page.id !== CConfig.chinesePoker.id && (page.id === CConfig.ogwil.id || !Config[key] || Config[key].redirectOnGame)) {
            openSkillGame(null, {id : page.id});
            page = $scope.gamePages[0]; // select home page
        }

        $scope.selectedPage = page;
        $location.search('pageid', page.id);

        if (page.id === '-1') {
            $rootScope.setTitle('Games');
        }
    };

    $scope.$on('casinoGamesList.openGame', function(e, data) {
        $scope.openGame(data.game, data.playMode);
    });
}]);