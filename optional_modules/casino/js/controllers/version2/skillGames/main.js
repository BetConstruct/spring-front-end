/**
 * @ngdoc controller
 * @name CASINO.controller:skillGamesMainCtrl
 * @description
 * skillGamesMainCtrl page controller
 */

CASINO.controller('skillGamesVersion2MainCtrl', ['$rootScope', '$scope', '$location', 'Config', 'CConfig', 'casinoData', 'Utils', 'casinoManager', 'casinoCache', 'Translator', 'analytics', 'content', 'TimeoutWrapper', function ($rootScope, $scope, $location, Config, CConfig, casinoData, Utils, casinoManager, casinoCache, Translator, analytics, content, TimeoutWrapper) {
    'use strict';

    $scope.gamesInfo = [];
    $scope.viewCount = 1;
    TimeoutWrapper = TimeoutWrapper($scope);

    $scope.cConf = {
        iconsUrl: CConfig.cUrlPrefix + CConfig.iconsUrl,
        backGroundUrl: CConfig.cUrlPrefix + CConfig.backGroundUrl,
        enableGameInfoButton: CConfig.main.enableGameInfoButton,
        downloadEnabled: CConfig.main.downloadEnabled,
        realModeEnabled: CConfig.main.realModeEnabled,
        belote: CConfig.belote,
        backgammon: CConfig.backgammon,
        deberc: CConfig.deberc,
        poker: CConfig.poker,
        chinesePoker: CConfig.chinesePoker,
        ogwil: CConfig.ogwil,
        newCasinoDesignEnabled: CConfig.main.newCasinoDesign.enabled,
        multiViewEnabled: CConfig.main.multiViewEnabled
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
    function loadGames() {
        $scope.loadingProcess = true;
        casinoData.getGames(CConfig.skillGames.categoryId, 'all').then(function (response) {
            if (response && response.data && response.data.status !== -1) {
                var games = response.data.games;

                if ($rootScope.conf.enableNewSkillGame && $rootScope.conf.pokerEnabled && !$rootScope.conf.hidePokerInSkillGames) { // poker game
                    var pokerGame = $scope.cConf.poker;
                    pokerGame.instantPlayLink = Config.poker.instantPlayLink;
                    pokerGame.instantPlayTarget = Config.poker.instantPlayTarget;
                    pokerGame.downloads = $rootScope.poker.downloadLink;
                    pokerGame.betaDownloads = $rootScope.poker.betaDownloadLink;

                    games.unshift(pokerGame);
                }

                prepareSkillGames(games);
            }
        })['finally'](function () {
            $scope.loadingProcess = false;
        });
    }

    function prepareSkillGames(games) {
        if ($rootScope.conf.enableNewSkillGame) {
            createTopMenu(games);
        }
        $scope.games = games;

        var searchParams = $location.search();
        if (searchParams.game !== undefined) {
            var game = casinoManager.getGameById($scope.games, searchParams.game);
            if (game) {
                TimeoutWrapper(function () {
                    $scope.openGame(game);
                }, 100);
            }
        }
    }

    /**
     * @ngdoc method
     * @name openGameInNewWindow
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description  calculates the possible sizes of the popup window and opens casino game in there
     */
    $scope.openGameInNewWindow = function openGameInNewWindow(id) {
        casinoManager.openPopUpWindow($scope, id);
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

        casinoManager.openCasinoGame($scope, game, gameType, studio);
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description  close opened game
     */
    $scope.closeGame = function closeGame(id) {
        casinoManager.closeGame($scope, id);
    };

    $scope.$watch('env.authorized', function () {
        if ($scope.gamesInfo && $scope.gamesInfo.length) {
            casinoManager.refreshOpenedGames($scope);
        }
    });

    $scope.$on('game.closeCasinoGame', function (ev, gameId) {
        casinoManager.findAndCloseGame($scope, gameId);
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
        casinoManager.toggleSaveToMyCasinoGames($rootScope, game);
    };

    $scope.togglePlayForReal = function togglePlayForReal (gameInfo) {
        casinoManager.togglePlayMode($scope, gameInfo);
    };

    function openSkillGame(event, game, gameType) {
        if ($scope.viewCount === 1) {
            if ($scope.gamesInfo && $scope.gamesInfo.length === 1) {
                $scope.closeGame();
            }
            if ($scope.games && $scope.games.length) {
                $scope.openGame(casinoManager.getGameById($scope.games, game.id), gameType);
            } else {
                var gamesWatcherPromise = $scope.$watch('games', function () {
                    if ($scope.games && $scope.games.length) {
                        $scope.openGame(casinoManager.getGameById($scope.games, game.id), gameType);
                        gamesWatcherPromise();
                    }
                });
            }
        } else {
            //games that are not resizable
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
    }

    $scope.$on("games.openGame", openSkillGame);

    /**
     * @description change view for applying functionality of multiple view in casino
     */

    $scope.$on('casinoMultiview.viewChange', function (event, view) {
        casinoManager.changeView($scope, view);
    });

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
        $scope.$broadcast('casinoMultiview.showGames', CConfig.skillGames.categoryId); // show multiview popup  with all games
    };

    /**
     * @ngdoc method
     * @name refreshGame
     * @methodOf CASINO.controller:skillGamesMainCtrl
     * @description find game by id in opened games and relaod it
     *
     * @param {Int} id the games id
     */
    $scope.refreshGame = function refreshGame(id) {
        casinoManager.refreshCasinoGame($scope, id);
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

    function createTopMenu(games) {
        var pageId = $location.search().pageid;
        $scope.gamePages = [
            {name: 'Home', id: '-1'}
        ];
        var i, pageToSelect, length = games.length;
        for (i = 0; i < length; i += 1) {
            var item = {
                name: games[i].name,
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

    $scope.openCasinoGameDetails = function openCasinoGameDetails (game_skin_id) {
        casinoManager.openGameDetailsPopUp(game_skin_id);
    };

    loadGames();

    $scope.$on('$destroy', function () {
        casinoManager.clearAllPromises();
    });
}]);