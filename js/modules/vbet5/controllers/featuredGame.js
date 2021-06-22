/**
 * @ngdoc controller
 * @name vbet5.controller:featuredgameCtrl
 * @description
 * Open Games controller
 */
angular.module('vbet5.betting').controller('featuredgameCtrl', ['$rootScope', '$scope', '$interval', '$window', '$location', 'Zergling', 'Utils', 'Config', 'content', 'GameInfo', function ($rootScope, $scope, $interval, $window, $location, Zergling, Utils, Config, content, GameInfo) {
    'use strict';

    var multiSlideInterval, featuredGamesObj = {}, gameImages = {};
    var featuredGamesSubId, featuredGameSubId;

    $scope.isEventInBetSlip = GameInfo.isEventInBetSlip;
    $scope.backgroundsCompetitionsMaps = Config.main.featuredGames.backgroundsCompetitionsMaps;
    var slideItemsCount = $location.path() === '/dashboard/'?  2: 3;
    $scope.goToUrl = Utils.goToUrl;
    /**
     * @ngdoc method
     * @name updateFeaturedGames
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description  Updates featured games
     * @param {Object} data game data
     */
    function updateFeaturedGames (data) {
        if (!data || !data.sport) {
            return;
        }
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        game.sport = {id: sport.id, alias: sport.alias};
                        game.region = {id: region.id};
                        game.competition = {id: competition.id, name: competition.name};
                        game.team1_id = game.team1_external_id || game.team1_id;
                        game.team2_id = game.team2_external_id || game.team2_id;
                        game.import_id = game.import_id || game.competition.id;
                        angular.forEach(game.market, function (market) {
                            if ((market.type === 'P1XP2' || market.type === 'P1P2') && (!game.events || !game.events.X)){
                                game.events = Utils.createMapFromObjItems(market.event, 'type');
                            }
                        });
                        featuredGamesObj[game.id] = game;
                    });
                });
            });
        });
        $scope.featuredGamesLoading = false;

        var featuredGames = Utils.objectToArray(featuredGamesObj);
        $scope.featuredGames = featuredGames[0] && featuredGames[0].favorite_order !== null ? Utils.orderByField(featuredGames, 'favorite_order') : featuredGames;

       if ($scope.featuredGames.length > 0) {
            prepareMultiSlideFeaturedGames();
        }
    }



    /**
     * @ngdoc method
     * @name getOnlyTime
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description parses the game.info.current_game_time object in order to remove all unnecessary info, that comes with this object, and returns only the time
     * @param {string} timeObj contains current time object
     * @returns {string} current time
     */
    function getOnlyTime(timeObj) {
        return timeObj && (timeObj.indexOf(':') > 0) ? timeObj.substr((timeObj.indexOf(':') - 2), 5) : ' ';
    }

    /**
     * @ngdoc method
     * @name addBgImageIfExists
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description loads game image from cms based on game id and adds it to game object
     *
     * @param {object} game game object
     */
    function addBgImageIfExists(game) {
        if (game.id && gameImages[game.id]) {
            game.image = gameImages[game.id];
        } else if (game.id) {
            content.getPage('featured-game-images', true).then(function (response) {
                if (response.data && response.data.page && response.data.page.children) {
                    angular.forEach(response.data.page.children, function (page) {
                        gameImages[page.slug.replace("game", "")] = page.thumbnail || (page.thumbnail_images && page.thumbnail_images.full);
                    });
                }

                gameImages[game.id] = gameImages[game.id] || true; //not to request it again if it wasn't found
                game.image = gameImages[game.id];
            });
        }
    }


    /**
     * @ngdoc method
     * @name updateFeaturedGame
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description selects most popular game and saves in  **$scope.mostPopularLiveGame**
     *
     * @param {object} data object containing games data
     */
    function updateFeaturedGame(data) {
        if (data.sport === null) {
            return; //keep the game there is subscription update is empty
        }
        var mostPopularGame = null, maxEventsCount = 0, markets = null;
        angular.forEach(data.sport, function (sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        if (game.markets_count > maxEventsCount) {
                            mostPopularGame = game;
                            mostPopularGame.sport = sport;
                            mostPopularGame.competition = competition;
                            mostPopularGame.region = region;
                            mostPopularGame.choosenMarket = null;
                            mostPopularGame.game_bg = getImageFromAlias(sport.alias);
                            markets = Utils.groupByItemProperty(game.market, 'type');
                            maxEventsCount = game.markets_count;
                            if(markets) {
                                if (markets.P1XP2) {
                                    mostPopularGame.choosenMarket = markets.P1XP2[0];
                                } else if (markets.P1P2) {
                                    mostPopularGame.choosenMarket = markets.P1P2[0];
                                }
                            }
                            if (mostPopularGame.choosenMarket && mostPopularGame.choosenMarket.event) {
                                game.event = [];
                                angular.forEach(mostPopularGame.choosenMarket.event, function (event) {
                                    event.choosenMarket = mostPopularGame.choosenMarket;
                                    game.event.push(event);
                                });
                            }
                        }
                    });
                });
            });
        });

        if (mostPopularGame) {
            mostPopularGame.event = Utils.getItemBySubItemProperty(mostPopularGame.event, 'type', ['P1', 'P2', 'X']);

            if (mostPopularGame.info !== undefined && mostPopularGame.info.current_game_time > 0) {
                mostPopularGame.info.current_game_time = getOnlyTime(mostPopularGame.info.current_game_time);
            }
            addBgImageIfExists(mostPopularGame);

            mostPopularGame.bg_style = mostPopularGame.game_bg || '';
        } else {
            $scope.getOneLiveGame();
        }

        $scope.mostPopularLiveGame = mostPopularGame;
    }


    /**
     * @ngdoc method
     * @name getOneLiveGame
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description loads a live game having large event count,
     *
     * @param {Number} [minEventsCount] optional. minimal amount of events that game should have
     * @param {Boolean} [minEventsCount] optional. minimal events count that game may have
     * @param {number} showGameId
     */
    $scope.getOneLiveGame = function getOneLiveGame(minEventsCount, showGameId) {
        var getPreMatch = (minEventsCount === 0);
        minEventsCount = minEventsCount || 45; // default value

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'alias', 'name'],
                'competition' : ['id', 'name'],
                'region' : ['id', 'name'],
                'event': ['id', 'price', 'type', 'name'],
                'market': ['id', 'type', 'express_id', 'name', 'home_score', 'away_score'],
                'game': ['id', 'start_ts', 'team1_name', 'team2_name', 'info', 'markets_count', 'type', 'team1_id', 'team2_id', 'team1_external_id', 'team2_external_id', 'is_live']
            },
            'where': {game: {}}
        };


        if (Config.main.showPromotedGamesOnHomepage.enabled) {
            $scope.promotedGameIsPresent = true;
            request.where[Config.main.showPromotedGamesOnHomepage.level] = {};
            request.where[Config.main.showPromotedGamesOnHomepage.level][Config.main.showPromotedGamesOnHomepage.type] = true;
        } else {
            request.where.game = {
                'type': getPreMatch ? 0 : 1,
                '@limit': 10
            };
            request.where.game.markets_count =  {'@gt': getPreMatch ? 1 : minEventsCount };
        }

        if (showGameId) {
            request.where = {
                'game': {
                    'id': showGameId
                }
            };
        }

        featuredGameSubId && Zergling.unsubscribe(featuredGameSubId);
        Zergling.subscribe(request, updateFeaturedGame)
            .then(function (result) {
                featuredGameSubId = result.subid;

                if (Utils.isObjectEmpty(result.data.sport)) {
                    // too many weird conditions, I know. these have to be refactored later
                    if (Config.main.showPromotedGamesOnHomepage.level === 'game') {
                        Config.main.showPromotedGamesOnHomepage.level = 'competition';
                    } else {
                        Config.main.showPromotedGamesOnHomepage.enabled = false;
                        $scope.promotedGameIsPresent = false;
                    }
                    if (!getPreMatch || Config.main.showPromotedGamesOnHomepage.enabled) {
                        $scope.getOneLiveGame(parseInt(minEventsCount / 2, 10));
                    } else {
                        $interval(function () {getOneLiveGame(); }, 10000, 1);
                    }
                    Zergling.unsubscribe(featuredGameSubId) && (featuredGameSubId = undefined);
                    return;
                }
                updateFeaturedGame(result.data);

            })['catch'](function (reason) {
            console.log('Error:', reason);
        });
    };



    /**
     * @ngdoc method
     * @name loadFeaturedGames
     * @methodOf vbet5.controller:featuredgameCtrl
     *
     *  @description loads all promoted games
     *
     */
    $scope.loadFeaturedGames = function loadFeaturedGames() {
        $scope.featuredGamesLoading = true;
        var request = {
            'source': 'betting',
            'what': {
                sport: ['id', 'alias', 'name'],
                competition: ['id', 'name'],
                region: ['id'],
                game: ['id', 'start_ts', 'team1_name', 'team2_name', 'type', 'team1_id', 'team2_id', 'team1_external_id', 'team2_external_id', 'is_live'],
                market: ['type'],
                event: ['price', 'type']
            },
            'where': {
                market: {type: {'@in': ['P1XP2', 'P1P2']}},
                sport: {type: 2} // only classic sports ie excludes virtual and electronic sports
            }
        };
        request.what.game.push('favorite_order');
        request.where.game = {'promoted': true};
        request.where.game['@limit'] = Config.main.featuredGames.limitation;

        Zergling.subscribe(request, updateFeaturedGames).then(function (response) {
            featuredGamesSubId = response.subid;
            updateFeaturedGames(response.data);
        })['catch'](function (reason) {
            console.log('loadFeaturedGames failed', reason);
        });
    };



    /**
     * @ngdoc method
     * @name multiSlideFeaturedGames
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description selects next or current featured games depending on index
     * @param {number} index
     */
    $scope.multiSlideFeaturedGames = function multiSlideFeaturedGames(index) {
        if (index !== undefined) {
            $scope.multiSlideIndex = index;
        } else {
            if ($scope.multiSlideIndex === $scope.featuredGamesGroups.length - 1) {
                $scope.multiSlideIndex = 0;
            } else {
                $scope.multiSlideIndex++;
            }
        }
    };

    function prepareMultiSlideFeaturedGames() {

        $scope.featuredGamesGroups = Utils.groupToGroups($scope.featuredGames, slideItemsCount, 'games');
        if ($scope.multiSlideIndex === undefined) {
            $scope.multiSlideIndex = 0;
            $scope.multiSlideRotationPaused = false;
            multiSlideInterval = $interval(function () {
                if (!$scope.multiSlideRotationPaused) {
                    $scope.multiSlideFeaturedGames();
                }
            }, Config.main.featuredGames.rotationPeriod || 5000);
        }
    }

    $scope.bet = function bet(event, game) {
        var oddType = 'odd';
        if (!game || !event || Config.main.phoneOnlyMarkets && Config.main.phoneOnlyMarkets.enable && game.type === 1) {
            return;
        }

        var keys = Object.keys(game.market);
        var setBetMarket = game.market[keys[0]];

        angular.forEach(game.market, function (gameMarket) {
            angular.forEach(gameMarket.event, function (gameEvent) {
                if (event.type === gameEvent.type && gameMarket.type === event.choosenMarket.type) {
                    setBetMarket = gameMarket;
                }
            });

        });

        $rootScope.$broadcast('bet', {event: event, market: setBetMarket, game: game, oddType: oddType});

        console.log('--------------------------------------');
        console.log(game);

        if($location.path() === '/'){
            $location.path('/sport');
            $location.search('game', Number(game.id));
            $location.search('region', game.region.id);
            $location.search('competition', competition.id);
            $location.search('sport', game.sport.id);
            $location.search('type', Number(game.type));
        }
    };

    $scope.$on('$destroy', function () {
        featuredGameSubId && Zergling.unsubscribe(featuredGameSubId);
        featuredGamesSubId && Zergling.unsubscribe(featuredGamesSubId);

        if (multiSlideInterval) {
            $interval.cancel(multiSlideInterval);
        }
    });


    /**
     * from here: this part must be remove after removing tempfeaturedgames.html
     */
    $scope.index = 0;
    $scope.slideTempBanner = function slideTempBanner(direction) {
        if (direction === 'left') {
            if ($scope.index === 0) {
                $scope.index = 2;
            } else {
                $scope.index--;
            }
        } else {
            if ($scope.index === 2) {
                $scope.index = 0;
            } else {
                $scope.index++;
            }
        }
    };

    function getImageFromAlias(alias) {
        if (alias && Config.main.dashboard.sportsBanners[alias]) {
            return Config.main.dashboard.sportsBanners[alias];
        }
        return '';
    }

    /**
     * @ngdoc method
     * @name gotoSelectedGame
     * @methodOf vbet5.controller:featuredgameCtrl
     * @description sends a post message to parent to open corresponding game (used in widget)
     * @param {Object} game object
     */
    $scope.gotoSelectedGame = function gotoSelectedGame(game) {
        $window.parent.postMessage(
            {
                action: 'open_game',
                data: {
                    gameId: game.game,
                    competitionId: game.competition,
                    regionId: game.region,
                    sportId: game.sport,
                    type: game.type === 1? 1: 0
                }
            },
            '*'
        );
    };
}]);
