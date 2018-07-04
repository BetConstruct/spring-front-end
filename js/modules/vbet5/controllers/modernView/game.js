/**
 * @ngdoc controller
 * @name vbet5.controller:gameCtrl
 * @description
 * Open Games controller
 */
angular.module('vbet5.betting').controller('gameCtrl', ['$rootScope', '$scope', '$location', '$filter', '$window', 'Config', 'Utils', 'GameInfo', 'StreamService', 'analytics',  function ($rootScope, $scope, $location, $filter, $window, Config, Utils, GameInfo, StreamService, analytics ) {
    'use strict';

    /**
     * @ngdoc object
     * @name availableSportTemplates
     * @propertyOf vbet5.controller:gameCtrl
     * @description mapping of sport aliases to available templates (in templates/game/open/<name>.html)
     */
    var availableSportTemplates = ['soccer', 'tennis', 'basketball', 'volleyball', 'snooker', 'icehockey', 'netball', 'tabletennis', 'badminton', 'horseracing', 'handball', 'baseball', 'beachvolleyball', 'australianfootball']; //,'cricket','darts'

    var streamService = new StreamService($scope);

    $scope.isVideoDetached = false;
    $scope.eventsInBetSlip = {};

    var audio = document.createElement('audio');
    $scope.isMp3Supported = !!(audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/, ''));

    $scope.getVideoData = GameInfo.getVideoData;
    $scope.changeVolume = GameInfo.changeVolume;
    $scope.setSound = GameInfo.setSound;
    $scope.animationSoundsMap = GameInfo.animationSoundsMap;
    var firstMarketName = "P1XP2";

    /**
     * @ngdoc method
     * @name getDividedToRows
     * @methodOf vbet5.controller:gameCtrl
     * @description Returns events divided to rows according to number of columns specified
     *
     * @param {object} events object containing events
     * @param {number} cols number of columns in each row. If not specified or 0, default value is 2.
     * Maximum number of columns is 4, so if greater than 4 it will be changed to 4
     * @returns {Array} array of rows, cols columns in each
     */
    $scope.getDividedToRows = function getDividedToRows(events, cols) {
        if (!cols) {
            cols = 2;
        }

        if (cols > 5) {
            cols = 5;
        }

        angular.forEach(events, function (event) {
            event.isEventInBetSlip = $scope.isEventInBetSlip(event);
        });

        var results = [];
        var eventsArr = Utils.objectToArray(events);
        eventsArr.sort(Utils.orderSorting);

        while (eventsArr.length) {
            results.push(eventsArr.splice(0, cols));
        }

        return results;
    };

    /**
     * @description Update price of curent range pair
     * @param newVal
     * @param oldVal
     */
    function updateRangeSelection(newVal, oldVal) {
        if (angular.equals(newVal, oldVal)) {
            return;
        }
        if (newVal.firstScore === null || !newVal.secondScore === null) {
            return;
        }
        var i, currentPair = [newVal.firstScore, newVal.secondScore],
            length = $scope.corectScoreMode.dividedGames.pairs.length;
        for (i = 0; i < length; i++) {
            if (Utils.arrayEquals($scope.corectScoreMode.dividedGames.pairs[i], currentPair)) {
                $scope.corectScoreMode.dividedGames.currentPairPrice = $filter('oddConvert')($scope.corectScoreMode.dividedGames.eventsArr[i].price);
                $scope.corectScoreMode.dividedGames.currentEvent = $scope.corectScoreMode.dividedGames.eventsArr[i];

                $scope.corectScoreMode.dividedGames.currentEvent.isEventInBetSlip = $scope.isEventInBetSlip($scope.corectScoreMode.dividedGames.currentEvent);
                break;
            } else {
                $scope.corectScoreMode.dividedGames.currentPairPrice = null;
                $scope.corectScoreMode.dividedGames.currentEvent = null;
            }
        }
    }

    /**
     * @description Object to save divided games and other data for working in correct score mode
     * @type {{Object}}
     */
    $scope.corectScoreMode = {
        isEnabled: false
    };
    /**
     * Object for saving range slider values
     * @type {{firstScore: null, secondScore: null}}
     */
    $scope.selectedRanges = {
        firstScore: null,
        secondScore: null
    };
    /**
     * @description Watch range slider, and update current price
     */
    $scope.$watchCollection('selectedRanges', updateRangeSelection);


    var scoreDividerRegex = /^[^\d]*(\d+).+?(\d+)$/;

    /**
     * @ngdoc method
     * @name getDividedByGames
     * @methodOf vbet5.controller:gameCtrl
     * @description Prepare dividedGames object for working in correct score mode
     * @param {object} events object containing events
     */
    $scope.getDividedByGames = function getDividedByGames(events) {
        var dividedGames = {}, i, parsedScore,
            eventsArr = Utils.objectToArray(events);
        dividedGames.firstGameList = [];
        dividedGames.secondGameList = [];
        dividedGames.pairs = [];
        dividedGames.eventsArr = eventsArr;

        for (i = 0; i < eventsArr.length; i++) {
            parsedScore = eventsArr[i].name.match(scoreDividerRegex);
            if (parsedScore && parsedScore.length > 0) {
                parsedScore[1] = parseInt(parsedScore[1], 10);
                parsedScore[2] = parseInt(parsedScore[2], 10);
                dividedGames.pairs.push([parsedScore[1], parsedScore[2]]);
                if (Utils.isInArray(dividedGames.firstGameList, parsedScore[1]) === -1) {
                    dividedGames.firstGameList.push(parsedScore[1]);
                }
                if (Utils.isInArray(dividedGames.secondGameList, parsedScore[2]) === -1) {
                    dividedGames.secondGameList.push(parsedScore[2]);
                }

            }
        }
        function sortNumerical(a, b) {
            return a > b;
        }

        dividedGames.firstGameList.sort(sortNumerical);
        dividedGames.secondGameList.sort(sortNumerical);

        dividedGames.firstGameSteps = {
            from: dividedGames.firstGameList[0],
            to: dividedGames.firstGameList[dividedGames.firstGameList.length - 1]
        };
        dividedGames.secondGameSteps = {
            from: dividedGames.secondGameList[0],
            to: dividedGames.secondGameList[dividedGames.secondGameList.length - 1]
        };

        $scope.corectScoreMode.dividedGames = dividedGames;
        updateRangeSelection($scope.selectedRanges);

    };


    /**
     * @ngdoc method
     * @name isSetWinner
     * @methodOf vbet5.controller:gameCtrl
     * @description detects which team wins current set
     * @param {object} currentSetScore set score object containing the two teams scores
     * @param {number} team which team it is
     *
     */
    $scope.isSetWinner = function isSetWinner(currentSetScore, team) {
        if (!currentSetScore) {
            return;
        }

        if (team === 1) { return parseInt(currentSetScore.team1_value, 10) > parseInt(currentSetScore.team2_value, 10); }
        if (team === 2) { return parseInt(currentSetScore.team1_value, 10) < parseInt(currentSetScore.team2_value, 10); }
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.controller:gameCtrl
     * @description Checks if current game is deeplinked (game=<game id>  exists in url) and opens it if it is
     *
     */
    $scope.init = function init() {
        var searchParams = $location.search();

        if (parseInt(searchParams.game, 10) === $scope.game.id || $scope.$parent.openGames[$scope.game.type][$scope.game.id] !== undefined) {
            $scope.toggleGame();
        } else {
            $scope.checkForSavedOpenGame();
        }

        if ($scope.$parent.pinnedGames[$scope.game.id] !== undefined) {
            $scope.isVideoDetached = true;
        }

        // this check is here to avoid duplicate calls of processGameData()
        // during scope initialization.
        // Both $scope.toggleGame() and $scope.checkForSavedOpenGame() are potential callers of processGameData().
        if (!$scope.processGameDataIsCalled) {
            processGameData();
        }
    };


    /**
     * @ngdoc method
     * @name detachVideo
     * @methodOf vbet5.controller:gameCtrl
     * @description called when video is detached. Sends game object to parent scope to show game video there
     *
     */
    $scope.detachVideo = function detachVideo() {
        $scope.isVideoDetached = true;
        $scope.game.video_data = null;
        GameInfo.getVideoData($scope.game);
        $scope.$emit('game.detachVideo', $scope.game);
    };


    /**
     * @ngdoc method
     * @name toggleSaveToMyGames
     * @methodOf vbet5.controller:gameCtrl
     * @description  adds or removes(depending on if it's already there) game from 'my games' by emitting an event
     *
     * @param {Object} game game object
     */
    $scope.toggleSaveToMyGames = function toggleSaveToMyGames(game, competition) {
        if (!$rootScope.myGames || $rootScope.myGames.indexOf(game.id) === -1) {
            $scope.$emit('game.addToMyGames', game);
        } else {
            $scope.$emit('game.removeGameFromMyGames', game);
            $scope.$emit('game.removeGameFromMyCompetition', competition);
        }
    };


     /**
     * @ngdoc method
     * @name attachVideo
     * @methodOf vbet5.controller:gameCtrl
     * @description called when we get message from parent scope that detached video is reattached.
     * All single game scopes get this message so we have to look at check received game object id to check if
     * it is for current game
     *
     */
    $scope.$on('game.attachVideo', function attachVideo(event, game) {
        console.log('attach', game);
        if (game && game.id === $scope.game.id) {
            $scope.game.video_data = undefined;
            if (Config.main.video.autoPlay) {
                GameInfo.getVideoData($scope.game);
            }
            $scope.isVideoDetached = false;
            $scope.game.activeFieldType = 'video'; //   <--- this doesn't work for some reason  :(
        }

    });

    /**
     * @ngdoc method
     * @name toggleGame
     * @methodOf vbet5.controller:gameCtrl
     * @description
     *
     * Opens/closes the game.
     *
     * When opening, requests additional information and subscribes.
     * When closing, unsubscribes
     *
     * (un)subscription is done in parent scope ({@link vbet5.controller:gamesCtrl gamesCtrl} controller)
     * as this controller's scope is destroyed on game list updates
     * because it's inside ng-repeat
     * @param {Boolean} dontClose if true, will not close game if it's open
     */
    $scope.toggleGame = function toggleGame(dontClose) {
        console.log('toggle game', $scope.game.open, dontClose);

        if (!$scope.game.open) {
            analytics.gaSend('send', 'event', 'explorer', 'show game markets',  {'page': $location.path(), 'eventLabel': ($scope.env.live ? 'Live' : 'Prematch')});
            $scope.game.loading = true;
            $scope.$parent.subscribeToGame($scope.game, $scope.checkForSavedOpenGame);
            $location.search('game', $scope.game.id);
            $location.search('competition', $scope.$parent.competition.id);
        } else if (!dontClose) {
            var gameCompetition = Utils.getItemBySubItemProperty($rootScope.selectedCompetitions, 'id', [$scope.game.competition.id]);
            var params = $location.search();
            if (params.game !== undefined) { //remove game id from hash
                delete params.game;
                $location.search(params);
            }
            if (gameCompetition && gameCompetition[$scope.game.competition.id] && gameCompetition[$scope.game.competition.id].game && gameCompetition[$scope.game.competition.id].game[$scope.game.id]) {
                $scope.game = gameCompetition[$scope.game.competition.id].game[$scope.game.id];
                processGameData();
            }
            $scope.$parent.unsubscribeFromGame($scope.game);
            $scope.game.open = false;
            $scope.game.loading = false;
            if ($scope.$parent.openGames[$scope.game.type][$scope.game.id] !== undefined) {
                delete $scope.$parent.openGames[$scope.game.type][$scope.game.id];
            }

        }

    };

    $scope.$on("$destroy", function () { $scope.$parent.unsubscribeFromGame($scope.game); });

    $scope.$on('openGame', function (event, id) {
        if (id === $scope.game.id) {
            $scope.toggleGame(true);
        }
    });


    $scope.game.isAnimationMute = false;
    /**
    * @ngdoc method
    * @name toggleAnimationSound
    * @methodOf vbet5.controller:gameCtrl
    * @description
    * mutes unmutes animation sound effects
    */
    $scope.toggleAnimationSound = function toggleAnimationSound() {
        $scope.game.isAnimationMute = !$scope.game.isAnimationMute;
        Config.env.sound = $scope.game.isAnimationMute ? 0 : 0.75;

    };

    $scope.eachWayPlace = GameInfo.eachWayPlace;
    $scope.isExtraTime = GameInfo.isExtraTime;
    $scope.getCurrentTime = GameInfo.getCurrentTime;
    $scope.framesCount = GameInfo.framesCount;

    // curried  'improveName'filter

    /**
     * @ngdoc method
     * @name improveNameForThisGame
     * @methodOf vbet5.controller:gameCtrl
     * @description Use improveName filter
     * @param {String} name name
     * @param {Object} game object
     */
    var improveNameForThisGame = function improveNameForThisGame(name, game) {
        return $filter('improveName')(name, game);
    };

    /**
     * @ngdoc method
     * @name processGameData
     * @methodOf vbet5.controller:gameCtrl
     * @description
     * Game data needs to be transformed a little bit for using in templates, we do that transformation on every change
     */
    var processGameData = function processGameData() {
        if (!$scope.game) {
            return;
        }

        angular.forEach($scope.game.stats, function (stat) {
            stat.isTeam1SetWinner = $scope.isSetWinner(stat, 1);
            stat.isTeam2SetWinner = $scope.isSetWinner(stat, 2);
        });

        if ($scope.game.sport.alias === "Soccer" && $scope.game.info) {
            $scope.game.info.isExtraTime = $scope.isExtraTime($scope.game.info);
        }

//         var markets = Utils.getItemBySubItemProperty($scope.game.market, 'type', ['P1XP2', 'P1P2']);
        var markets = Utils.getItemBySubItemProperty($scope.game.market, 'type', {'P1XP2': true, 'P1P2': true}); //this one is faster

        if (markets) {
            $scope.game.headerMarket = markets[firstMarketName] !== undefined ? markets[firstMarketName]: markets[Object.keys(markets)[0]];
            var event = $scope.game.headerMarket.event; //event that is displayed in game block header
            if (event) {
                $scope.events = Utils.createMapFromObjItems(event, 'type');

                angular.forEach($scope.events, function (event) {
                    event.isEventInBetSlip = $scope.isEventInBetSlip(event);
                });
            }
        } else {
            Utils.emptyObject($scope.events);
        }

        // process data that is visible only inside open game
        if ($scope.game.open) {
            if ($scope.game.type === 0 || $scope.game.type === 2) {
                //we have market groups for pre-match games only
                $scope.marketGroups = Utils.groupByItemProperty($scope.game.market, 'group_id', 'none');
            } else {
                //for live we have no groups
                // but template expects markets in groups so we create a "fake group" by putting markets  into array
                $scope.marketGroups = [Utils.objectToArray($scope.game.market)];
            }

            //group by name and sort
            angular.forEach($scope.marketGroups, function (marketGroup, id) {
                if (!$scope.marketGroups[id] || !$scope.marketGroups[id].length) {
                    return;
                }

                $scope.marketGroups[id] = Utils.objectToArray(Utils.groupByItemProperties($scope.marketGroups[id], ['type', 'name']));

                $scope.marketGroups[id].sort(function (a, b) {
                    return a[0].order - b[0].order;
                });

                angular.forEach($scope.marketGroups[id], function (markets) {
                    // sort markets by base
                    markets.sort(function (market1, market2) {
                        return market1.base - market2.base;
                    });

                    //and make replacements in market and event names
                    markets.map(function (m) {
                        m.name = improveNameForThisGame(m.name, $scope.game);
                        angular.forEach(m.event, function (e) {
                            e.name = $filter('removeParts')(e.name, [m.name]);
                            e.name = improveNameForThisGame(e.name, $scope.game);
                        });
                    });

                });
            });
        }

        // if teams shirt colors equal we change them to default colors
        if ($scope.game.info && $scope.game.info.shirt1_color === $scope.game.info.shirt2_color) {
            $scope.game.info.shirt1_color = "ccc";
            $scope.game.info.shirt2_color = "f00";
        }

        if($scope.game.type === 1 && $scope.game.open && $scope.game.sport.alias){
            GameInfo.updateGameStatistics($scope.game);
            GameInfo.extendLiveGame($scope.game);

            if($scope.game.sport.alias === "Soccer" || $scope.game.sport.alias === "CyberFootball"){
                GameInfo.generateTimeLineEvents($scope.game, $scope);
            }
        }

        if ($scope.game.open && $scope.game.sport.alias === "HorseRacing") {
            GameInfo.getHorseRaceInfo($scope.game.info, $scope.game.market, "Winner");
        }

        if ($scope.game.live_events) { //need this for sorting
            if ($scope.game.sport.alias === "Tennis") {
                $scope.game.live_events.map(function (event) {
                    event.game_order = parseInt(event.game, 10);
                });
            } else {
                $scope.game.live_events.map(function (event) {
                    event.add_info_order = parseInt(event.add_info, 10);
                });
            }
        }

        streamService.monitoring($scope, 'game', 'null', 'null');

        // is used only in init() to avid duplicate calls of this function during initialization.
        $scope.processGameDataIsCalled = true;
    };

    /**
     * @ngdoc method
     * @name bet
     * @methodOf vbet5.controller:gameCtrl
     * @param {Object} event event object
     * @param {Object} market market object
     * @param {Object} game game object
     * @param {String} [oddType] odd type (odd or sp)
     * @description
     * Adds bet to betslip by broadcasting **bet** event from root scope
     */
    $scope.bet = function bet(event, market, game, oddType) {
        if (!event) return;

        addRemoveEventFromBetSlip(event, false);

        oddType = oddType || 'odd';
        if (Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type == 1) {
            return;
        }
        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: oddType});
    };

    /**
     * @ngdoc method
     * @name checkForSavedOpenGame
     * @methodOf vbet5.controller:gameCtrl
     * @description
     *
     * As open games are stored in parent scope(gamesCtrl) (see reasons in {@link vbet5.controller:gameCtrl#toggleGame toggleGame}),
     * this function is needed to retrieve game from there and assign to current scope
     *
     */
    $scope.checkForSavedOpenGame = function checkForSavedOpenGame() {
        if ($scope.$parent.openGames[$scope.game.type][$scope.game.id] === undefined) {
            return;
        }

        $scope.game = $scope.$parent.openGames[$scope.game.type][$scope.game.id];
        processGameData();
    };

    /**
     * @ngdoc method
     * @name getTemplateNameBySportAlias
     * @methodOf vbet5.controller:gameCtrl
     * @description
     * Returns template name which corresponds to **alias**.
     *
     * sport alias to template name mappings are in  **availableSportTemplates**
     *
     * If not found, returns 'generic'
     * @param {string} alias sport alias
     * @returns {string} template name
     */
    $scope.getTemplateNameBySportAlias = function getTemplateNameBySportAlias(alias) {
        if (availableSportTemplates.indexOf(alias.toLowerCase()) !== -1) {
            return alias.toLowerCase();
        }
        return 'generic';
    };


    /**
     * @ngdoc method
     * @name openStatistics
     * @methodOf vbet5.controller:gameCtrl
     * @description
     * Opens statistics in popup window
     *
     * @param {Object} game game object
     */
    $scope.openStatistics = function openStatistics(game) {
        $window.open(GameInfo.getStatsLink(game), game.id, "width=940,height=600,resizable=yes,scrollbars=yes");
    };

    /**
     * @ngdoc method
     * @name addRemoveEventFromBetSlip
     * @methodOf vbet5.controller:gameCtrl
     * @description Add /Remove events in betslip
     * @param {Object} event data
     * @param {Boolean} force state (Instead of toggle)
     */
    function addRemoveEventFromBetSlip (event, forceState) {
        var isEventInBetSlip = (forceState === undefined ? event.isEventInBetSlip : forceState);

        if (isEventInBetSlip === undefined) {
            return;
        }

        if (isEventInBetSlip) {
            delete $scope.eventsInBetSlip[event.id];
        } else {
            $scope.eventsInBetSlip[event.id] = event;
        }
    }

    /**
     * @ngdoc method
     * @name isEventInBetSlip
     * @methodOf vbet5.controller:gameCtrl
     * @description Check if event already exists in betslip
     */
    $scope.isEventInBetSlip = function isEventInBetSlip () {
        if (!arguments[0]) return false;
        var isInBetSlip = GameInfo.isEventInBetSlip.apply(this, arguments);
        var event = arguments[0];

        addRemoveEventFromBetSlip(event);

        return isInBetSlip;
    };

    /**
     * this message is coming from flashplayer directive meaning that player is destroyed
     */
    $scope.$on('flashplayer.playerRemoved', function (event) {
        $scope.playerRemoved = true;
        event.stopPropagation();
    });

    /**
     * @ngdoc method
     * @name openLoginForm
     * @methodOf vbet5.controller:gameCtrl
     * @description broadcasts a message to open slider with login form
     * @param {Object} $event click event
     */
    $scope.openLoginForm = function openLoginForm($event) {
        $rootScope.$broadcast("openLoginForm");
        $event.stopPropagation();
    };

    //initial values for ordering of horse_cards
    $scope.raceCardsPredicate = 'cloth';
    $scope.raceCardsReverce = false;

    /**
     * @ngdoc method
     * @name raceCardsColumnClick
     * @methodOf vbet5.controller:gameCtrl
     * @description changes data that  used for ordering raceCards elements
     *
     * @param {String} orderItem orderItem string: value of predicate
     */
    $scope.raceCardsColumnClick = function raceCardsColumnClick(orderItem, game) {
        if (orderItem === 'price' && !game.info.race.horseStats[0].event.price) {
            return;
        }
        if ($scope.raceCardsPredicate === orderItem) {
            $scope.raceCardsReverce = !$scope.raceCardsReverce;
        } else {
            $scope.raceCardsReverce = false;
            $scope.raceCardsPredicate = orderItem;
        }
    };

    /**
     * @ngdoc method
     * @name raceCardsOrder
     * @methodOf vbet5.controller:gameCtrl
     * @description to be used by the comparator to determine the order of  raceCards elements
     *
     * @param {Object} horseStat horseStat object
     */
    $scope.raceCardsOrder = function raceCardsOrder(horseStat) {
        switch ($scope.raceCardsPredicate) {
            case 'cloth':
                return parseInt(horseStat.cloth);
            case 'price':
                return horseStat.event.price;
        }

        return -1;
    };

    $scope.$on('betslip.isEmpty', function () {
        angular.forEach($scope.eventsInBetSlip, function (event) {
            event.isEventInBetSlip = false;
            addRemoveEventFromBetSlip(event, true);
        });
    });

    $scope.$on('betslip.removeBet', function (e, removedBet) {
        angular.forEach($scope.eventsInBetSlip, function (event) {
            if (removedBet.eventId == event.id) {
                event.isEventInBetSlip = false;
                addRemoveEventFromBetSlip(event, true);
                return;
            }
        });
    });

    /**
     * @ngdoc method
     * @name getFirstMarket
     * @methodOf vbet5.controller:gameCtrl
     * @description Get first market from markets object / array
     * @param {Object} markets array
     */
    $scope.getFirstMarket = Utils.getFirstMarket;
}]);