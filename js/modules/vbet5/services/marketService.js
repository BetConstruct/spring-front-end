/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:MarketService
 * @description
 *
 * process sportsBook game markets and markets groups
 *
 */
VBET5.service('MarketService', ["$rootScope", "$filter",  "$location", "Utils", "Config", "BetService", "Storage", "analytics", function ($rootScope, $filter, $location,  Utils, Config, BetService, Storage, analytics) {
    "use strict";

    var MarketService = {

        MARKET_GROUP_ALL: {
                id: -2,
                name: 'All'
            },
        MARKET_GROUP_OTHER: {
                id: -1,
                name: 'Other'
            },
        MARKET_GROUP_FAVOURITE: {
                id: -3,
                name: 'Favorite',
                count: 0
            },
        marketDivided: Storage.get('markets_in_one_column') !== undefined ? !!Storage.get('markets_in_one_column') : !!Config.main.marketsInOneColumn
    };

    var CORRECT_SCORE = "CORRECT SCORE";

    var LEFT_COL_KEY = "left";
    var MIDDLE_COL_KEY = "middle";
    var RIGHT_COL_KEY = "right";

    function sortMarketEvents(sportAlias, displayKey, marketType, marketEvents, colCount) {
        if ((displayKey === CORRECT_SCORE || BetService.constants.customCorrectScoreMarkets[marketType]) && BetService.constants.customCorrectScoreLogic[sportAlias]) {
            return customSort(marketEvents, colCount);
        }

        if (BetService.constants.marketsPreDividedByColumns[marketType]) {
            return preDividedSort(marketEvents, colCount);
        }

        return Utils.twoParamsSorting(marketEvents, ["marketOrder", "order"]);
    }

    function customSort(marketEvents, colCount) {
        var leftColumn = [],
            middleColumn = [],
            rightColumn = [];

        for (var i = 0; i < marketEvents.length; i++) {
            var event = marketEvents[i];
            if (event.home_value > event.away_value) {
                leftColumn.push(event);
            } else if (event.home_value < event.away_value) {
                rightColumn.push(event);
            } else {
                middleColumn.push(event);
            }
        }

        return mergeColumns(
            [
                Utils.twoParamsSorting(leftColumn, ["home_value", "away_value"]),
                Utils.orderByField(middleColumn, "home_value"),
                Utils.twoParamsSorting(rightColumn, ["away_value", "home_value"])
            ],
            colCount
        );
    }

    function preDividedSort(marketEvents, colCount) {
        var leftColumn = [],
            middleColumn = [],
            rightColumn = [],
            length = marketEvents.length,
            event,
            i;

        if (colCount === 2) {
            for (i = 0; i < length; i++) {
                event = marketEvents[i];
                if (event.display_column === 1) {
                    leftColumn.push(event);
                } else {
                    rightColumn.push(event);
                }
            }
        } else {
            for (i = 0; i < length; i++) {
                event = marketEvents[i];
                switch (event.display_column) {
                    case 1:
                        leftColumn.push(event);
                        break;
                    case 2:
                        middleColumn.push(event);
                        break;
                    case 3:
                        rightColumn.push(event);
                        break;
                }
            }
        }

        return mergeColumns([
            Utils.orderByField(leftColumn, "order"),
            Utils.orderByField(middleColumn, "order"),
            Utils.orderByField(rightColumn, "order")
        ], colCount);
    }

    function mergeColumns(dividedMarketEvents, colCount) {
        var leftColumn = dividedMarketEvents[0],
            middleColumn = dividedMarketEvents[1],
            rightColumn = dividedMarketEvents[2];

        var length,
            events = [],
            index = -1;

        if (colCount === 3) {
            length = Math.max(leftColumn.length, middleColumn.length, rightColumn.length);
            while (++index < length) {
                events.push(
                    leftColumn[index] || generateEmptyEvent(LEFT_COL_KEY + index),
                    middleColumn[index] || generateEmptyEvent(MIDDLE_COL_KEY + index),
                    rightColumn[index] || generateEmptyEvent(RIGHT_COL_KEY + index)
                );
            }
        } else {
            rightColumn.push.apply(rightColumn, middleColumn);
            length = Math.max(leftColumn.length, rightColumn.length);
            while (++index < length) {
                events.push(
                    leftColumn[index] || generateEmptyEvent(LEFT_COL_KEY + index),
                    rightColumn[index] || generateEmptyEvent(RIGHT_COL_KEY + index)
                );
            }
        }

        return events;
    }

    function generateUniqueId (str) {
        var hash = 0;

        for (var i = 0, l = str.length; i < l; i++) {
            hash -= str.charCodeAt(i) * (i + 1);
        }

        return hash;
    }

    function generateEmptyEvent (key) {
        return {
            id: generateUniqueId(key),
            is_empty: true
        };
    }


    function getEventName(eventName, marketType,  marketName, gameInfo) {
        var calculatedName = $filter('removeParts')(eventName, [marketName]);

        if (Config.main.dontReplaceP1P2WithTeamNamesForEvents) {
            if (!Config.main.dontReplaceP1P2WithTeamNamesForEvents[marketType]) {
                return $filter('improveName')(calculatedName, gameInfo);
            }
        } else if (Config.main.replaceP1P2WithTeamNames) {
             return $filter('improveName')(calculatedName, gameInfo);
        }

        return calculatedName;
    }

    function oddEvenDivision(list) {
        var even = [],
            odd = [];

        for (var i = 0, length = list.length; i < length; i++) {
            if (i % 2 === 0) {
                even.push(list[i]);
            } else {
                odd.push(list[i]);
            }
        }

        if (!odd.length) {
            return [even];
        }

        return [even, odd];
    }

    function fromHalfDivision(list) {
        var halfLength = Math.ceil(list.length / 2);
        var firstPack = [], secondPack = [], length = list.length;

        for (var i = 0; i < length; i++) {
            if (i < halfLength) {
                firstPack.push(list[i]);
            } else {
                secondPack.push(list[i]);
            }
        }
        if (!secondPack.length) {
            return [firstPack];
        }

        return [firstPack, secondPack];
    }

    MarketService.getEventName = getEventName;


    /**
     * @ngdoc function
     * @name getMarketsAndGroups
     * @methodOf vbet5.service:MarketService
     * @description calculate  markets and its group
     * @returns {Object}  markets and its group
     *
     * @param {number} gameId
     * @param {Object} market
     * @param {string} team1Name
     * @param {string} team2Name
     * @param {string} sportAlias
     * @param {boolean} statisticsAvailable
     * @param {number} type
     */
    MarketService.getMarketsAndGroups = function getMarketsAndGroups(gameId, market, team1Name, team2Name, sportAlias, statisticsAvailable, type) {
        var marketsGroupedByType = {};
        var marketGroupsMap  = {};

        Object.keys(market).map(function(key) {
            var marketData = market[key];
            if (!marketData.group_id) {
                marketData.group_id = MarketService.MARKET_GROUP_OTHER.id;
                marketData.group_name = MarketService.MARKET_GROUP_OTHER.name;
            }
            var groupId = marketData.group_id;

            if (!marketGroupsMap[groupId]) {
                marketGroupsMap[groupId] = {
                    id: groupId,
                    name: marketData.group_name,
                    count: 0,
                    order: marketData.group_order
                };
            }
            marketGroupsMap[groupId].count++;

            var groupKey = marketData.type + "_" + marketData.name_template + "_" + marketData.sequence + "_" + marketData.point_sequence;
            var gameInfo = {id: gameId, team1_name: team1Name, team2_name: team2Name};

            if (!marketsGroupedByType[groupKey]) {
                marketsGroupedByType[groupKey] = {
                    id: marketData.id,
                    col_count: marketData.col_count,
                    type: marketData.type,
                    fullType: groupKey,
                    name_template: marketData.name_template,
                    sequence: marketData.sequence,
                    point_sequence: marketData.point_sequence,
                    express_id: Utils.calculateExpressId(marketData, type),
                    cashout: marketData.cashout && !!($rootScope.env.live ? $rootScope.partnerConfig.is_cashout_live : $rootScope.partnerConfig.is_cashout_prematch),
                    display_key: marketData.display_key,
                    display_sub_key: marketData.display_sub_key,
                    name: $filter('improveName')(marketData.name, gameInfo),
                    group_name: marketData.group_name,
                    group_id: groupId,
                    groupKey: groupKey,
                    group_order: marketData.group_order,
                    extra_info: marketData.extra_info,
                    order: marketData.order,
                    events: [],
                    eachWayTerms: BetService.getEachWayTerms(marketData),
                    showStatsIcon: Config.main.enableH2HStat && statisticsAvailable && Config.main.marketStats[marketData.type],
                    home_score: marketData.home_score,
                    away_score: marketData.away_score
                };

            }

            Object.keys(marketData.event || {}).map(function(eventKey) {
                var event = marketData.event[eventKey];
                marketsGroupedByType[groupKey].events.push({
                    order: event.order,
                    id: event.id,
                    type_1: event.type_1,
                    type: event.type,
                    type_id: event.type_id,
                    original_order: event.original_order,
                    price: event.price,
                    price_change: event.price_change,
                    nonrunner: event.nonrunner,
                    ew_allowed: event.ew_allowed,
                    sp_enabled: event.sp_enabled,
                    extra_info: event.extra_info,
                    base: event.base,
                    home_value: event.home_value,
                    away_value: event.away_value,
                    display_column: event.display_column,
                    name: getEventName(event.name, marketData.type, marketData.name, gameInfo),
                    marketId: marketData.id,
                    marketOrder: marketData.order
                });
            });
        });
        Object.keys(marketsGroupedByType).map(function (marketGroupKey) {
            var marketGroup = marketsGroupedByType[marketGroupKey];
            marketGroup.events = sortMarketEvents(
                sportAlias,
                marketGroup.display_key,
                marketGroup.type,
                marketGroup.events,
                marketGroup.col_count,
                statisticsAvailable
            );
        });

        var groupedMarkets = Object.keys(marketGroupsMap).map(function(k) {
            return marketGroupsMap[k];
        });

        var markets = Object.keys(marketsGroupedByType).map(function(k) {
            return marketsGroupedByType[k];

        });

        return {
            marketGroups: (groupedMarkets.length > 1 ? [MarketService.MARKET_GROUP_FAVOURITE, MarketService.MARKET_GROUP_ALL].concat(Utils.orderByField(groupedMarkets, "order")) : [MarketService.MARKET_GROUP_FAVOURITE, MarketService.MARKET_GROUP_ALL]),
            markets: (sportAlias === "SISGreyhound") ? Utils.orderByField(markets, "type") : Utils.twoParamsSorting(markets, ["order", "point_sequence"])
        };
    };

    /**
     * @ngdoc method
     * @name initFavouriteMarkets
     * @methodOf vbet5.service:MarketService
     * @description Separates favorite markets types and puts them in game's object
     *
     * @param {Object} game object
     */
    MarketService.initFavouriteMarkets = function initFavouriteMarkets(game) {
        var store = Storage.get('favouriteMarketsTypes');
        game.sport.favouriteMarketsTypes = store && store[game.type] && store[game.type][game.sport.id] ? store[game.type][game.sport.id] : {};
        var favoriteCount = 0;
        if (game.markets) {
            angular.forEach(game.markets, function (market) {
                if (game.sport.favouriteMarketsTypes[market.fullType]) {
                    favoriteCount++;
                }
            });
        }
        game.availableMarketGroups[0].count = favoriteCount;
    };

    /**
     * @ngdoc method
     * @name toggleFavouriteMarket
     * @methodOf vbet5.service:MarketService
     * @description Add/remove market to/from favorites list for sport
     * @param {Object} game the game object
     * @param {Object} market array of market(s) of same type
     * @param {function} callBackFunction calls when selected group is favorite and favourite markets changed
     */
    MarketService.toggleFavouriteMarket = function toggleFavouriteMarket(game, market, callBackFunction) {
        var analyticsText;

        if (!game.sport.favouriteMarketsTypes[market.fullType]) {
            analyticsText = "addToFavouriteMarkets";
            game.sport.favouriteMarketsTypes[market.fullType] = 1;
            game.availableMarketGroups[0].count += 1;
        } else {
            analyticsText = "removeFromFavouriteMarkets";
            delete game.sport.favouriteMarketsTypes[market.fullType];
            game.availableMarketGroups[0].count -= 1;

            if (game.selectedMarketGroupId === MarketService.MARKET_GROUP_FAVOURITE.id) {
                if (game.availableMarketGroups[0].count === 0) {
                    game.selectedMarketGroupId = MarketService.MARKET_GROUP_ALL.id;
                }

                callBackFunction();
            }

        }

        var store =  Storage.get('favouriteMarketsTypes') || {'0': {}, '1': {}, '2': {}};
        store[game.type] = store[game.type] || {}; // Should be deleted after some time: type 2 was added after implementing this functionality, so people who has favourite markets, will receive an error when adding market  with type=2
        store[game.type][game.sport.id] = game.sport.favouriteMarketsTypes;
        Storage.set('favouriteMarketsTypes', store);
        analytics.gaSend('send', 'event', 'explorer', analyticsText + (Config.main.sportsLayout),  {'page': $location.path(), 'eventLabel': analyticsText});
    };

    /**
     * @ngdoc method
     * @name divideMarkets
     * @methodOf vbet5.service:MarketService
     * @description divide markets into 2 columns
     *
     * @param {Array} markets array
     * @param {number} groupId id of selected group
     * @param {Object} favouriteMarketsTypes favorites market types
     */
    MarketService.divideMarkets = function divideMarkets(markets, groupId, favouriteMarketsTypes) {
        var filteredMarkets;
        switch (groupId) {
            case  MarketService.MARKET_GROUP_ALL.id:
                filteredMarkets = markets;
                break;
            case MarketService.MARKET_GROUP_FAVOURITE.id:
                filteredMarkets = markets.filter(function(market) {
                    return favouriteMarketsTypes[market.fullType] === 1;
                });
                break;
            default:
                filteredMarkets = markets.filter(function (market) {
                    return groupId === market.group_id;
                });

        }

        return Config.main.classicMarkets2ColSorting ? oddEvenDivision(filteredMarkets) : fromHalfDivision(filteredMarkets);
    };

    /**
     * @ngdoc method
     * @name toggleMarketDivision
     * @methodOf vbet5.service:MarketService
     * @description divide markets into 2 columns
     *
     * @param {boolean} divide toggle division
     */
    MarketService.toggleMarketDivision = function toggleMarketDivision(divide) {
        if (MarketService.marketDivided !== divide) {
            MarketService.marketDivided = divide;
            Storage.set('markets_in_one_column', divide);
        }
    };

    return MarketService;
}]);
