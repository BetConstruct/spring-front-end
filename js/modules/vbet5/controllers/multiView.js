/**
 * @ngdoc controller
 * @name vbet5.controller:multiViewCtrl
 * @description
 * Sports live multiView controller
 */
angular.module('vbet5.betting').controller('multiViewCtrl', ['$rootScope', '$scope', '$location', 'Config', 'Zergling', 'Utils', 'Storage', 'GameInfo', 'Translator', '$window', 'analytics', function ($rootScope, $scope, $location, Config, Zergling, Utils, Storage, GameInfo, Translator, $window, analytics) {
    'use strict';
    $rootScope.footerMovable = true;
    $rootScope.multiViewLiveOpenedGames = [];
    Config.env.hideLiveStats = Storage.get('hideLiveStats') || false;
    $scope.showStatsBlock = !Config.env.hideLiveStats;
    $rootScope.multiViewLiveOpenedGamesIds = [];
    function checkAvailabilityOfPreviousGames() {
        var prevGamesList = Storage.get('multiViewLiveOpenedGamesIds');
        if (!prevGamesList) {
            return;
        }
        var request = {
            'source': 'betting',
            'what': {
                'game': ['id']
            },
            'where': {'game': {'id': {'@in': prevGamesList}}}
        };
        Utils.setCustomSportAliasesFilter(request);
        Zergling.get(request)
            .then(function (response) {
                if (response && response.data && response.data.game) {
                    $rootScope.multiViewLiveOpenedGames = Utils.objectToArray(response.data.game, "addedInMultiView");
                    $rootScope.multiViewLiveOpenedGamesIds = Utils.objectToArrayFromProperty(response.data.game, 'id');
                }

            })['catch'](function (reason) {
                console.log(reason);
            });
    }

    $scope.openStatistics = function openStatistics(game) {
        analytics.gaSend('send', 'event', 'explorer', 'H2H-on-click', {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});
        $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
    };

    /**
     * @ngdoc method
     * @name removeGameFromList
     * @methodOf vbet5.controller:multiViewCtrl
     * @description  remove game from multiview games
     */
    $scope.removeGameFromList = function removeGameFromList(gameId) {
        var idIndex = $rootScope.multiViewLiveOpenedGamesIds.indexOf(gameId);
        if (idIndex !== -1) {
            $rootScope.multiViewLiveOpenedGames = $rootScope.multiViewLiveOpenedGames.filter(function(el) {
                return el.id !== $rootScope.multiViewLiveOpenedGamesIds[idIndex];
            });
            $rootScope.multiViewLiveOpenedGamesIds.splice(idIndex, 1);
            if ($scope.openGame && $scope.openGame.id === gameId) { // selected game state
                $scope.openGame = null;
            }
        }
        $rootScope.$broadcast('multiView.gameRemoved');
    };

    /**
     * @ngdoc method
     * @name toggleVideoAndAnimationBox
     * @methodOf vbet5.controller:multiViewCtrl
     * @description  name says it all
     */
    $scope.toggleVideoAndAnimationBox = function toggleVideoAndAnimationBox() {
        $scope.hideVideoAndAnimationBox = !$scope.hideVideoAndAnimationBox;
    };

    $scope.$on('leftMenu.closed', function (event, isClosed) {
        $scope.leftMenuClosed = isClosed;
    });

    /**
     * @ngdoc method
     * @name addItemToOpenedGamesList
     * @methodOf vbet5.controller:multiViewCtrl
     * @description  Add item to opened game list
     * @param {Object} game object
     * @param (Boolean) True if you dont want to add game to $rootScope
     * Returns true id add is successful
     */
    function addItemToOpenedGamesList (game, dontAddGame) {
        if (game.type === 2 || game.type === 0) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: Translator.get("Pre-match games cannot be opened in Live Multi-View mode")
            });
            return false;
        }
        if ($rootScope.multiViewLiveOpenedGamesIds.indexOf(game.id) === -1) {
            $rootScope.multiViewLiveOpenedGamesIds.unshift(game.id);
            if (!dontAddGame) {
                $rootScope.multiViewLiveOpenedGames.unshift({
                    id: game.id,
                    addedInMultiView: true,
                    sport: {id: game.sport.id},
                    region: {id: game.region.id},
                    competition: {id: game.competition.id}
                });
            }
            return true;
        }
        return false;
    }

    $scope.$on('leftMenu.gameClicked', function (event, data) {
        addItemToOpenedGamesList(data.game);
    });

    $scope.$on('liveGame.headerClicked', function (event, game) {
        if (!$scope.openGame || $scope.openGame.id !== game.id) {
            $scope.openGame = game;
            prepareVideoAndAnimationData();
        }
    });

    $scope.$on('liveGame.gameRemoved', function (event, gameId) {
        if (gameId) {
            $scope.removeGameFromList(gameId);
        }
    });

    /**
     * @ngdoc method
     * @name dropCallback
     * @methodOf vbet5.controller:multiViewCtrl
     * @description Show corresponding dialog if game cannot be added
     * @param {Object} Event not used
     * @param {Number} Index of callback
     * @param {Object} Item object
     * Returns {Object} Added game object or null
     */
    $scope.dropCallback = function dropCallback (event, index, item) {
        if (!item.addedInMultiView && $rootScope.multiViewLiveOpenedGamesIds && $rootScope.multiViewLiveOpenedGamesIds.length === Config.main.liveMultiViewItemsAmount) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: "warning",
                title: "Warning",
                content: Translator.get("You can open no more than {1} games in Live Multi-View mode", [Config.main.liveMultiViewItemsAmount])
            });
            return;
        }

        if (item.addedInMultiView || addItemToOpenedGamesList(item, true)) {
            return {id: item.id, addedInMultiView: item.id};
        }
        return;
    };

    //switch to prematch sportsbook when prematch is selected from left menu


    $rootScope.$watch("multiViewLiveOpenedGamesIds", function (newValue) {
        Storage.set('multiViewLiveOpenedGamesIds', newValue);
    }, true);

    /**
     * @ngdoc method
     * @name prepareVideoAndAnimationData
     * @methodOf vbet5.controller:multiViewCtrl
     * @description Prepare video animation data
     */
    function prepareVideoAndAnimationData() {
        var hasVideo = GameInfo.hasVideo($scope.openGame);

        if (hasVideo) {
            $scope.openGame.video_data = null;
            GameInfo.getVideoData($scope.openGame);
        }
        if (hasVideo && (Config.env.authorized || !$scope.openGame.last_event)) {
            $scope.openGame.activeFieldType = 'video';
        } else if ($scope.openGame.activeFieldType === undefined || $scope.openGame.activeFieldType === null) {
            $scope.openGame.activeFieldType = 'field';
        }
    }

    checkAvailabilityOfPreviousGames();
}]);
