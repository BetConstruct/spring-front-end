/**
 * @ngdoc controller
 * @name CASINO.controller:casinoJackpotCtrl
 * @description
 * jackpot page controller
 */

CASINO.controller('casinoJackpotCtrl', ['$rootScope', '$scope', '$sce', '$location', 'casinoData', 'content', 'CConfig', 'Config', 'casinoCache', 'Utils', 'analytics', 'TimeoutWrapper', 'jackpotManager', function ($rootScope, $scope, $sce, $location, casinoData,  content, CConfig, Config, casinoCache, Utils, analytics, TimeoutWrapper, jackpotManager) {
    'use strict';

    //@TODO implementet for only old casino version : need to refactor
    $scope.iconsUrl = CConfig.cUrlPrefix + CConfig.iconsUrl;
    $scope.LEADERS_TO_SHOW = 10;
    $scope.offset = 0;
    $scope.jackpotPageLoaded = false;
    $scope.jackpotSlideIndex = 0;
    TimeoutWrapper = TimeoutWrapper($scope);
    var gameInfoId;
    var gameInfoExId;

    $scope.expanded = {
        pollId : '-1'
    };

    //new casino design
    $scope.jackpotSliderVisibleGamesCount = 4;

    $scope.jackpotWidgets = {
        widgetIndex: 0
    };
    $scope.changeJackpotSlider = function (index) {
        $scope.jackpotWidgets.widgetIndex = index < 0 ? $scope.iframeJackpotData.length - 1 : index > $scope.iframeJackpotData.length - 1 ? 0 : index;
    };
    $scope.iframeJackpotData = [];

    var jackpotLeaders = [];
    /**
     * @ngdoc method
     * @name loadJackpotPages
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description loads jackpot
     */
    $scope.loadJackpotPages = function loadJackpotPages() {

        //load jackpot rules
        getJackpotRules();

        //load jackpot games
        getJackpotGames();

        //load Jackpot leaders data list
        getLeadersList();
    };

    function getJackpotRules() {
        content.getPage('jackpot-' + $rootScope.env.lang, true).then(function (response) {
            $scope.jackpotRules = [];

            if (response.data && response.data.page && response.data.page.children) {
                var rules = response.data.page.children;
                for (var i = 0, children = rules.length; i < children; i += 1) {
                    rules[i].title = $sce.trustAsHtml(rules[i].title);
                    rules[i].content = $sce.trustAsHtml(rules[i].content);
                }
                $scope.jackpotRules = rules;
            }
            checkIfPageLoaded();
        }, function (reason) {
            $scope.jackpotRules = [];
            checkIfPageLoaded();
        });
    }

    /**
     * @ngdoc method
     * @name getJackpotBanners
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description   populates $scope's **getJackpotBanners** variable with banner information got from cms
     **/
    $scope.getJackpotBanners = function getJackpotBanners(containerId) {
        containerId = containerId || 'jackpot-banners-' + $rootScope.env.lang;
        content.getWidget(containerId).then(function (response) {
            $scope.jackpotBanners = [];

            if (response.data && response.data.widgets && response.data.widgets[0]) {
                var widgets = response.data.widgets;
                for (var i = 0, lenght = widgets.length; i < lenght; i += 1) {
                    $scope.jackpotBanners.push(widgets[i].instance);
                }
            }
            checkIfPageLoaded();
        }, function (reason) {
            $scope.jackpotBanners = [];
            checkIfPageLoaded();
        });
    };

    /**
     * @ngdoc method
     * @name openJBlink
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description   Track big-slider banners click
     *
     * @param {string} [link] optional. url of casino game to open game for
     */
    $scope.openJBlink = function openJBlink(link) {
        if (link === undefined || link === '') {
            return;
        }
        analytics.gaSend('send', 'event', 'news', {'page': $location.path(), 'eventLabel': 'jackpot banner click'});

    };

    function getJackpotGames() {
        var games = casinoCache.get('jachpotGames_' + Config.main.site_id);
        if (games !== undefined) {
            $scope.jackpotGames = games;
            checkIfPageLoaded();
            $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
        } else {
            casinoData.getAction('jackpot', Config.main.site_id).then(function (response) {
                $scope.jackpotGames = [];
                if (response.data) {
                    casinoCache.put('jachpotGames_' + Config.main.site_id, $scope.jackpotGames);
                    $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
                }
                checkIfPageLoaded();
            }, function (reason) {
                $scope.jackpotGames = [];
                checkIfPageLoaded();
            });
        }
    }

    function getLeadersList() {
        var savedLeaders = casinoCache.get('jachpotLeaders_' + Config.main.site_id);
        if (savedLeaders !== undefined) {
            jackpotLeaders = savedLeaders;
            $scope.leaderCount = jackpotLeaders.length;
            $scope.leaders = getVisibleLeaders(jackpotLeaders);
            checkIfPageLoaded();
        } else {
            casinoData.getJackpotLeadersList(Config.main.site_id).then(function (response) {
                $scope.leaders = [];
                if (response.data && response.data.length) {
                    var allleaders = response.data, index = 0;
                    $scope.leaderCount = allleaders.length / 4;
                    for (var i = 0; i < $scope.leaderCount; i += 1) {
                        var leader = [];
                        leader.push(i + 1);
                        for (var j = 0; j < 4; j += 1) {
                            leader.push(allleaders[index]);
                            index++;
                        }
                        jackpotLeaders.push(leader);
                    }
                    $scope.leaders = getVisibleLeaders(jackpotLeaders);
                    casinoCache.put('jachpotLeaders_' + Config.main.site_id, jackpotLeaders);
                }
                checkIfPageLoaded();
            }, function (reason) {
                $scope.leaders = [];
                checkIfPageLoaded();
            });
        }
    }

    function getVisibleLeaders(leaders) {
        return leaders.slice($scope.offset, $scope.offset + $scope.LEADERS_TO_SHOW);
    }

    /**
     * @ngdoc method
     * @name slide
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description Slides visible leaders bottom or top by changing $scope's **offset** variable
     *
     * @param {String} direction direction, 'bottom' or 'top'
     */
    $scope.slide = function slide(direction) {
        if (direction === 'top') {
            if ($scope.offset > 0) {
                $scope.offset -= $scope.LEADERS_TO_SHOW;
            }
        } else if (direction === 'bottom') {
            if ($scope.offset < jackpotLeaders.length - $scope.LEADERS_TO_SHOW) {
                $scope.offset += $scope.LEADERS_TO_SHOW;
            }
        }
        $scope.leaders = getVisibleLeaders(jackpotLeaders);
    };

    /**
     * @ngdoc method
     * @name toggleSaveToMyCasinoGames
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description send events for adds or removes(depending on if it's already there) game from 'my casino games'
     * @param {Object} game Object
     */
    $scope.toggleSaveToMyCasinoGames = function toggleSaveToMyCasinoGames(game) {
        //casinoUtils.toggleSaveToMyCasinoGames($rootScope, game);
    };


    /**
     * @ngdoc method
     * @name openJackGame
     * @methodOf CASINO.controller:casinoJackpotCtrl
     * @description  open selected game
     *
     * @param {Object} game the game object
     * @param {String} gameType string which contains the value 'fun' or  'real'
     */

    $scope.openJackpotGame = function openJackpotGame(game, gameType) {
        if (gameType === 'real' && !$rootScope.env.authorized) {
            $rootScope.$broadcast("openLoginForm");
            return;
        }

        $rootScope.$broadcast('casino.openGame', game, gameType);
    };

    function checkIfPageLoaded() {
        $scope.jackpotPageLoaded = $scope.jackpotRules !== undefined && $scope.jackpotBanners !== undefined && $scope.jackpotGames !== undefined && $scope.leaders !== undefined;
    }

    $scope.slideJackpotGames = function slideJackpotGames(direction) {
        if (direction == 'prev') {
            $scope.jackpotSlideIndex--;

        } else {
            $scope.jackpotSlideIndex++;
        }
        $scope.jackpotSliderGames = $scope.jackpotGames.slice($scope.jackpotSlideIndex, $scope.jackpotSlideIndex + $scope.jackpotSliderVisibleGamesCount);
    };

    function subscribeForJackpotData(gameinfo) {
        if (gameinfo && gameinfo.game && gameinfo.game.extearnal_game_id) {
            gameInfoId = gameinfo.id;
            gameInfoExId = gameinfo.game.extearnal_game_id;
            jackpotManager.subscribeForJackpotData(gameInfoExId, subscribeForJackpotDataCallback,null,'casino');
        }
    }

    subscribeForJackpotData($scope.gameInfo);

    var jackpotWinnerTimeout;

    $scope.jackpotWinner.cancelJackpotWinnerAnimation = function () {
        TimeoutWrapper.cancel(jackpotWinnerTimeout);
        $scope.jackpotWinner.animation = false;
        $scope.jackpotWinner.data = {};
    };

    function subscribeForJackpotDataCallback(data) {
        var sliderIndex = false;
        data = Utils.objectToArray(data);
        angular.forEach(data, function (jackpot, index) {
            if (jackpot && jackpot.Winner && jackpot.Winner.PlayerId) {

                if ($rootScope.profile && jackpot.Winner.PlayerId === $rootScope.profile.id) {
                    TimeoutWrapper.cancel(jackpotWinnerTimeout); // TimeoutWrapper checks the existence of promise by itself

                    $scope.jackpotWinner.animation = true;
                    $scope.jackpotWinner.data = jackpot;

                    jackpotWinnerTimeout = TimeoutWrapper(function () {
                        $scope.jackpotWinner.animation = false;
                        $scope.jackpotWinner.data = {};
                    }, 20000);
                }
            }
        });
        $scope.iframeJackpotData = data;

        if (sliderIndex !== false) {
            $scope.changeJackpotSlider(sliderIndex);
            sliderIndex = false;
        }
    }

    var jackpotDataWatcher = $scope.$watch('iframeJackpotData', function (data) {
        if (data && data.length > 0) {
            jackpotDataWatcher();
            if(gameInfoId && $scope.hasIframeJackpot && $scope.iframeTab){
                $scope.hasIframeJackpot[gameInfoId] = !!data.length;
                $scope.hasIframeJackpot.empty = !data.length;
            }
            $scope.hasJackpots = true;
        }
    });

    $scope.$on('$destroy', function () {
        if($scope.hasIframeJackpot && gameInfoId){
            delete  $scope.hasIframeJackpot[gameInfoId];
            if (Object.keys($scope.hasIframeJackpot).length === 1) {
                $scope.hasIframeJackpot.empty = true;
            }
        }
        jackpotManager.unsubscribeFromJackpotData(null,gameInfoExId, subscribeForJackpotDataCallback);
    });
}]);
