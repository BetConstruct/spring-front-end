/* global BettingModule */
/**
 * @ngdoc controller
 * @name vbet5.controller:gamesCtrl
 * @description
 * Games controller
 */
BettingModule.controller('gamesCtrl', ['$rootScope', '$scope', '$location', '$filter', 'TimeoutWrapper', 'Zergling', 'ConnectionService', 'Utils', 'analytics', 'smoothScroll', 'GameInfo', 'DomHelper', 'partner', function ($rootScope, $scope, $location, $filter, TimeoutWrapper, Zergling, ConnectionService, Utils, analytics, smoothScroll, GameInfo, DomHelper, partner) {
    'use strict';

    $scope.framesCount = GameInfo.framesCount;
    TimeoutWrapper = TimeoutWrapper($scope);
    var connectionService = new ConnectionService($scope);
    var subscriptionInProgress;
    var subIds = {};
    /**
     * @ngdoc object
     * @name openGames
     * @propertyOf vbet5.controller:gamesCtrl
     * @description holds list of open games with data
     * @type {Object}
     */
    $scope.openGames = {0: {}, 1: {}, 2: {}};

    $scope.pinnedGames = {};

    $scope.isInArray = Utils.isInArray;
    $scope.notShowFavourites = {
        'HorseRacing': 1
    };


    function updateStreamConfig() {
        $scope.streamConfig = GameInfo.PROVIDER_AVAILABLE_EVENTS;
    }

    updateStreamConfig();
    /**
     * @ngdoc method
     * @name gamesInit
     * @methodOf vbet5.controller:gamesCtrl
     * @description  called on games view initialization
     * checks if competition is deep linked and sets it's id in scope to make sure it will be expanded
     * if game from that competition is deep linked
     *
     * also sets location hash if game id is present in search, to scroll to selected game
     */
    $scope.gamesInit = function gamesInit() {
        var searchParams = $location.search();
        if (searchParams.competition !== undefined) {
            $scope.selectedCompetitionId = parseInt(searchParams.competition, 10);
        }
        if (searchParams.game !== undefined) {
            var tries = 10, elementId = 'game' + searchParams.game;
            var scrollToGame = function () {
                console.log('finding', elementId);
                var gameElement = document.getElementById(elementId);
                if (gameElement) {
                    partner.call('selectedGameOffset', DomHelper.getOffset(gameElement)); //requested by goldenpalace.be, see WEB-180
                    smoothScroll(elementId, {easing: 'easeOutCubic', duration: 200});
                } else if (tries--) {
                    TimeoutWrapper(scrollToGame, 300);
                }

            };
            scrollToGame();
        }
    };

    /**
     * @ngdoc object
     * @name $scope.states
     * @propertyOf vbet5.controller:gamesCtrl
     * @description holds $scope.states of selected tabs in games and $scope.states of different open/closed sections
     * @type {Object}
     */
    $scope.states = {toggles: {}};

    /**
     * @ngdoc function
     * @name setInitialVisibility
     * @methodOf vbet5.controller:gamesCtrl
     * @description Set initial values for template visibility
     */
    $scope.setInitialVisibility = function setInitialVisibility() {
        var key = '', i, initialState;
        initialState = arguments[0];
        for (i = 1; i < arguments.length; i++) {
            key = key + arguments[i];
        }
        if ($scope.states[key] === undefined || !$scope.states[key].setByUser) {
            $scope.states[key] = {state: initialState, setByUser: false};
        }
        return $scope.states[key].state;
    };


    /**
     * @ngdoc function
     * @name removeAllFavorites
     * @methodOf vbet5.controller:gamesCtrl
     * @description Clean all favorites competitions/games
     */
    $scope.removeAllFavorites = function() {
        $rootScope.$broadcast('game.removeAllFavorites');
    };

    /**
     * @ngdoc function
     * @name toggleVisibility
     * @methodOf vbet5.controller:gamesCtrl
     * @description
     * Toggles visibility state for item specified by arguments (can accept any number of string arguments)
     *
     * @returns {Boolean} visibility state after change
     */
    $scope.toggleVisibility = function toggleVisibility() {

        analytics.gaSend('send', 'event', 'explorer', 'show more markets', {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});

        var key = '', i;
        for (i = 0; i < arguments.length; i++) {
            key = key + arguments[i];
        }
        if ($scope.states[key] === undefined) {
            $scope.states[key] = {state: true, setByUser: true};
        }
        $scope.states[key].state = !$scope.states[key].state;
        return $scope.states[key].state;
    };

    $scope.getDefaultSelectedMarketBase = Utils.getDefaultSelectedMarketBase;

    /**
     * @ngdoc function
     * @name marketSelectedBaseExists
     * @methodOf vbet5.controller:gamesCtrl
     * @description  Checks if current selected base for specific market type exists,
     *
     * @param {Object} game game object
     * @param {Array} markets array of markets of same type with different bases
     * @returns {boolean} true if current selected base for this market type exists, false otherwise
     */
    $scope.marketSelectedBaseExists = function marketSelectedBaseExists(game, markets) {
        var exists = false;

        if (!$scope.states[game.id].markets[markets[0].type]) {
            return exists;
        }

        var activeBase = [$scope.states[game.id].markets[markets[0].type].activeBase];
        angular.forEach(game.market, function (m) {
            if (Utils.getItemBySubItemProperty(m.event, 'base', activeBase) !== null) {
                exists = true;
            }
        });

        return exists;
    };

    /**
     *
     * Ugly function for game tab switching.
     * Have to be refactored later
     *
     */
    $scope.setActiveTab = function setActiveTab(type, game, market, activeId, dontOverwrite) {
        dontOverwrite = dontOverwrite || false;

        if ($scope.states[game.id] === undefined) {
            $scope.states[game.id] = {markets: {}, marketsGroup: null };
        }
        if (type === 'marketBase') {

            if ($scope.states[game.id].markets[market.type] === undefined) {
                $scope.states[game.id].markets[market.type] = {activeBase: null};
            }
            if (!dontOverwrite || $scope.states[game.id].markets[market.type].activeBase === null) {
                $scope.states[game.id].markets[market.type].activeBase = activeId;
            }
        } else if (type === 'marketGroup') {
            if (!game.id) {
                return;
            }
            $scope.states[game.id].marketsGroup = activeId;
            return $scope.states[game.id].marketsGroup;
        }
    };

    /**
     * @ngdoc function
     * @name getActiveTab
     * @methodOf vbet5.controller:gamesCtrl
     * @description  Returns current active(selected) tab  for (market groups or market base groups)
     *
     * @param {String} type marketBase or marketGroup
     * @param {Object} game game object
     * @param {Object} [market]  used only when type is marketBase. Market object to get market type from.
     * @returns {String} selected tab id
     */
    $scope.getActiveTab = function getActiveTab(type, game, market) {
        if (!$scope.states[game.id]) {
            return null;
        }
        if (type === 'marketBase') {
            return $scope.states[game.id].markets[market.type].activeBase;
        }
        if (type === 'marketGroup') {
            return $scope.states[game.id].marketsGroup;
        }
    };

    /**
     * @ngdoc function
     * @name updateGame
     * @methodOf vbet5.controller:gamesCtrl
     * @description Updates open game data and saves it to scope
     * to be accessible from {@link vbet5.controller:gameCtrl gameCtrl} controller
     *
     * @param {Object} data subscription data received from swarm
     */
    function updateGame(data) {
        var sport, region, competition, game;
        if (data && data.sport) {
            sport = $filter('firstElement')(data.sport);
        }

        if (sport && sport.region) {
            region = $filter('firstElement')(sport.region);
        }
        if (region && region.competition) {
            competition = $filter('firstElement')(region.competition);
        }
        if (competition && competition.game) {
            game = Utils.objectToArray(competition.game)[0];
        } else {
            return console.log('competition ended');
        }

        if (game === null) {
            return console.warn('no data received for game', data);
        }

        game.open = true;
        game.loading = false;
        game.sport = {alias: sport.alias, id: sport.id, name: sport.name};
        game.region = {id: region.id};
        game.competition = {id: competition.id};

        game.info.setNumbers = $scope.framesCount(game.stats);
        $scope.openGames[game.type][game.id] = game;

        return console.log('update game', game);
    }



    /**
     * @ngdoc function
     * @name subscribeToGame
     * @methodOf vbet5.controller:gamesCtrl
     * @description subscribes to game updates and saves subscription id
     * @param {object} game game object (only id field is used to subscribe)
     * @param {function} callback function that will be called upon successful subscription and further updates
     * @param {bool} notByUser function
     */
    $scope.subscribeToGame = function subscribeToGame(game, callback, notByUser) {
        if (subscriptionInProgress === game.id) { return; }
        var gameRequest = [["id", "show_type", "markets_count", "start_ts", "is_live", "is_blocked", "is_neutral_venue","team1_id", "team2_id", "game_number", "text_info", "is_stat_available", "type",  "info", "stats", "team1_name", "team2_name", "tv_info", "add_info_name", "game_info"]];
        if ($scope.env.live) {
            Array.prototype.push.apply(gameRequest[0], ["match_length", "scout_provider", "video_id","video_id2", "video_id3", "tv_type", "last_event", "live_events"]);
        }
        subscriptionInProgress = game.id;
        var firstTime = !notByUser;
        var request = {
            'source': 'betting',
            'what': {
                'game': gameRequest,
                'event': ["order", "id", "type_1", "type", "type_id", "original_order", "name", "price", "nonrunner", "ew_allowed", "sp_enabled", "extra_info", "base","home_value", "away_value", "display_column" ],
                'market': ["id", "col_count", "type", "sequence", "express_id", "cashout", "display_key", "display_sub_key", "group_id", "name", "group_name", "order", "extra_info" ],
                'sport': ['id', 'alias', 'name'],
                'competition': ['id', 'info'],
                'region': ['id', 'alias']
            },
            'where': {
                'game': {
                    'id': game.id
                }
            }
        };
        Utils.addPrematchExpressId(request);

        connectionService.subscribe(
            request,
            function gameUpdateCallback(data) {
                updateGame(data);
                callback(firstTime);
                firstTime = false;
            },
            {
                'thenCallback': function (result) {
                    if (result.subid) {
                        subIds[game.id] = result.subid;
                        subscriptionInProgress = false;
                    }
                },
                'failureCallback': function (reason) {
                    console.log('Error:', reason);
                    subscriptionInProgress = false;
                }
            },
            true
        );
    };

    /**
     * @ngdoc function
     * @name unsubscribeFromGame
     * @methodOf vbet5.controller:gamesCtrl
     * @description unsubscribes from game updates
     * @param {object} game game object (only id field is used to find subscription in **subIds**)
     */
    $scope.unsubscribeFromGame = function unsubscribeFromGame(game) {
        if (subIds[game.id]) {
            connectionService.unsubscribe(subIds[game.id]);
            delete subIds[game.id];
        }
    };

    /**
     * Unsubscribe on page change
     *
     */
    /*
    $rootScope.$on('$routeChangeSuccess', function () {
        connectionService.unsubscribe(subIds);
    });
     */

    /**
     * @ngdoc function
     * @name attachPinnedVideo
     * @methodOf vbet5.controller:gamesCtrl
     * @description attaches pinned video back to game container by sending 'game.attachVideo' message to children
     *
     * @param {Object} game game object
     */
    $scope.attachPinnedVideo = function attachPinnedVideo(game) {
        $scope.$broadcast('game.attachVideo', game);
        delete $scope.pinnedGames[game.id];
    };


    /**
     * @ngdoc function
     * @name showDetachedVideo
     * @methodOf vbet5.controller:gamesCtrl
     * @description called when getting 'game.detachVideo' message from child scope.
     * Assigns received game object to current scope's pinnedGame
     */
    $scope.$on('game.detachVideo', function showDetachedVideo(event, game) {
        $scope.pinnedGames[game.id] = game;
    });

    /**
     * this message is coming from flashplayer directive meaning that player is destroyed
     */
    $scope.$on('flashplayer.playerRemoved', function () {
        $scope.$broadcast('game.attachVideo', $scope.pinnedGame);
//        $scope.pinnedGame = null;
    });


    $scope.$on('stream.config.updated', function() {
        updateStreamConfig();
    });

    $scope.displayBase = GameInfo.displayBase;
}]);
