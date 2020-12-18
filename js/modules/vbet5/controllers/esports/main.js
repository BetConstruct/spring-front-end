VBET5.controller('eSportsMainController', ['$rootScope', '$scope', 'Config', 'Utils', 'GameInfo', 'AsianMarkets', 'StreamService', 'content','Storage', '$location', function ($rootScope, $scope, Config, Utils, GameInfo, AsianMarkets, StreamService, content, Storage, $location) {
    'use strict';

    $scope.asianMarkets = AsianMarkets;
    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    var showTypes = $scope.asianMarkets.marketsBySport.Default.HDP.concat(["OUTRIGHT"]); //will show ony HDP markets

    var ignoreMarketsMainOrder = Utils.copyObj(AsianMarkets.ignoreMainOrderFor);
    ignoreMarketsMainOrder.OUTRIGHT = true;

    var availableTimePeriods = [0].concat(Config.main.upcomingGamesPeriods);
    $scope.pinnedGames = {};
    $scope.sharedData = {
        favoriteGames: {},
        selected: { // Selected game or competition from left menu or center view
            preMatch: null, // competition
            live: null // game
        },
        filters: { // Pre match time filter (moved here in order for createSelectedObj method to work properly)
            video: false,
            region: false,
            time: {
                expanded: false,
                available: availableTimePeriods,
                selected: availableTimePeriods[Config.env.defaultUpcomingPeriodIndex + 1 || 0]
            }
        }
    };

    $scope.layout = {
        types: {
            asian: 'Asian',
            classic: 'Classic'
        },
        selected: 'asian'
    };
    $rootScope.footerMovable = true;

    /**
     * @ngdoc method
     * @name changeLayout
     * @methodOf vbet5.controller:eSportsMainController
     * @description Change view layout /asian, classic/
     * @param {string} key - selected layout key
     */
    $scope.changeLayout = function changeLayout(key) {
        $scope.layout.selected = key;
        $scope.layout.expanded = !$scope.layout.expanded;

        $location.search('layout', key);
    };

    if($location.search().layout) {
        $scope.changeLayout($location.search().layout)
    }

    $scope.repayCompetitionsFilter = function repayCompetitionsFilter(startTime, type) {
        var game = {
            '@or': [{'type': type === 'preMatch' ? {'@in': [0, 2]} : 1}]
        };
        var market = {
            '@or': []
        };
        //prepare game filter
        if (type === 'preMatch') {
            if (Config.main.enableVisibleInPrematchGames) {
                game['@or'].push({
                    'visible_in_prematch': 1
                });
            }
        }
        if (startTime) {
            game.start_ts = {'@now': {'@gte': 0, '@lt': startTime * 3600}};
        }

        //prepare market filter
        for (var i = showTypes.length; i--;) {
            var obj = {'display_key': showTypes[i]};
            if (!ignoreMarketsMainOrder[showTypes[i]]) {
                obj.main_order = 1; //only optimal market
            }

            if (obj.display_key !== 'ODD/EVEN' || Config.main.asian.showOddEvenMarketsInOverview) {
                market['@or'].push(obj);
            }
        }
        return {
            game: game,
            market: market
        };
    };

    $scope.bet = function bet(event, market, openGame, oddType) {
        oddType = oddType || 'odd';
        var game = JSON.parse(JSON.stringify(openGame));
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});

        // This click was added for closing BetSlip mode selector,
        // because some buttons have stop.propagation and HideOnClick directive don't work
        document.body.click();
    };

    $scope.handleStreaming = function handleStreaming(game) {
        if (!game) {
            return;
        }
        $scope.openGame = {
            type: game.type,
            id: game.id,
            sport: game.sport,
            team1_name: game.team1_name,
            team2_name: game.team2_name,
            video_data: undefined
        };

        if (GameInfo.hasVideo($scope.openGame)) {
            if (Storage.get('isEsportsVideoDetached')) {
                $scope.openGame.activeFieldType = 'field';
                $scope.detachVideo('fullScreen', true);
            } else {
                $scope.openGame.activeFieldType = 'video';
                GameInfo.getVideoData($scope.openGame, true);
                if ($scope.enlargedGame) {
                    $scope.enlargedGame = $scope.openGame;
                }
            }
        } else {
            $scope.enlargedGame = null;
        }
    };

    /**
     * @ngdoc method
     * @name toggleLeftMenu
     * @methodOf vbet5.controller:classicViewLeftController
     * @description  expands(or collapses if expanded) left menu
     *
     * @param {boolean} val - set defined value
     */
    $scope.toggleLeftMenu = function toggleLeftMenu(val) {
        $scope.leftMenuClosed = val !== undefined ? !val : !$scope.leftMenuClosed;
        Storage.set('esportsLeftMenuToggleState', $scope.leftMenuClosed);
    };

    $scope.leftMenuClosed = Storage.get('esportsLeftMenuToggleState') || false;


    /**
     * @ngdoc method
     * @name toggleVideoAndAnimationBox
     * @methodOf vbet5.controller:asianViewMainController
     * @description  name says it all
     */
    $scope.toggleVideoAndAnimationBox = function toggleVideoAndAnimationBox() {
        $scope.hideVideoAndAnimationBox = !$scope.hideVideoAndAnimationBox;
    };

    /**
     * @ngdoc method
     * @name detachVideo
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description called when video is detached. Sends game object to parent scope to show game video there
     *
     */
    $scope.detachVideo = function detachVideo(type, dontCloseLeftMenu) {
        $scope.pinnedGameType = type;
        $scope.isVideoDetached = true;

        if (!Config.main.defaultStreaming || !Config.main.defaultStreaming.enabled || $scope.openGame.tv_type !== Config.main.defaultStreaming.tvType) {
            $scope.openGame.video_data = null;
            GameInfo.getVideoData($scope.openGame, true);
        }

        if (type === 'dragable') {
            $scope.pinnedGames[$scope.openGame.id] = $scope.openGame;
        } else {
            if(type === 'fullScreen' && !dontCloseLeftMenu){
                $scope.leftMenuClosed = true;
            }
            $scope.enlargedGame = $scope.openGame;
            $scope.pinnedGames = {};
        }
        if (type === 'fullScreen') {
            Storage.set("isEsportsVideoDetached", true);
        }
    };

    /**
     * @ngdoc method
     * @name attachVideo
     * @methodOf vbet5.controller:classicViewMainCtrl
     * @description called when we get message from parent scope that detached video is reattached.
     * All single game scopes get this message so we have to look at check received game object id to check if
     * it is for current game
     *
     */
    $scope.attachPinnedVideo = function attachPinnedVideo(game, type, dontSaveState) {
        if (type === 'dragable') {
            delete $scope.pinnedGames[game.id];
        } else {
            $scope.enlargedGame = null;
        }

        if (game && game.id === $scope.openGame.id) {
            if (!Config.main.defaultStreaming || !Config.main.defaultStreaming.enabled || $scope.openGame.tv_type !== Config.main.defaultStreaming.tvType) {
                $scope.openGame.video_data = undefined;
                if (Config.main.video.autoPlay) {
                    GameInfo.getVideoData($scope.openGame, true);
                }
            }
            $scope.isVideoDetached = false;
            $scope.openGame.activeFieldType = 'video'; //
        }
        if (!dontSaveState) {
            Storage.set("isEsportsVideoDetached", false);
        }
    };

    var pages = [];
    $scope.page = {};
    var selectedSportAlias = '';

    setTimeout(function () {
        content.getPage('esport-games-' + Config.env.lang, true).then(function (response) {
            if (response && response.data && response.data.page && response.data.page.children && response.data.page.children.length > 0) {
                pages = response.data.page.children;
                if (selectedSportAlias) {
                    getPage(selectedSportAlias);
                }
            }
        });
    }, 3000);


    var getPage = function (alias) {
        if ($scope.page.slug !== alias && pages.length > 0) {
            for(var i = pages.length; i--;) {
                if (pages[i].slug === alias) {
                    $scope.page = pages[i];
                    break;
                }
            }
            $scope.page = $scope.page || {};
        }
        selectedSportAlias = alias;
    };


    /**
     * @ngdoc method
     * @name createSelectedObj
     * @methodOf vbet5.controller:eSportsMainController
     * @description Creates and object to be stored as the selected (game/competition/sport)
     * @param {Object} params - Selected item parameters
     */
    $scope.createSelectedObj = function createSelectedObj(params) {
        getPage(params.sport.alias);
        var selected = {
            type: params.type,
            sport: {id: params.sport.id, alias: params.sport.alias, name: params.sport.name},
            competition: {id: null, name: null},
            region: {id: null, alias: null, name: null},
            game: {id: null}
        };

        if (params.competition && params.competition.id && params.competition.name) {
            selected.competition.id = params.competition.id;
            selected.competition.name = params.competition.name;
        }
        if (params.region && params.region.id && params.region.name) {
            selected.region.id = params.region.id;
            selected.region.alias = params.region.alias;
            selected.region.name = params.region.name;
        }
        if (params.game && params.game.id) {
            selected.game.id = params.game.id;
        }
        if (params.type === 'preMatch') {
            selected.competition.start_ts = $scope.sharedData.filters.time.selected;
        }

        return selected;
    };

    $scope.openVideoGame = function openVideoGame(data) {
        $scope.$broadcast('eSports.openGameById', data) ;
    };

}]);
