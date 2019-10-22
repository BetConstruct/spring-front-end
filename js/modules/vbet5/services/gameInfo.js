/* global Hls */
/**
 * @ngdoc service
 * @name vbet5.service:GameInfo
 * @description
 *
 */
angular.module('vbet5').service('GameInfo', ['$rootScope', '$http', '$filter', '$window', '$q', '$timeout', 'Translator', 'X2js', 'Zergling', 'Config', 'Moment', 'Utils', 'Storage', function ($rootScope, $http, $filter, $window, $q, $timeout, Translator, X2js, Zergling, Config, Moment, Utils, Storage) {
    'use strict';
    var GameInfo = {};

    GameInfo.liveGamesSoccerTemplate = ['Soccer', 'CyberFootball'];
    GameInfo.dotaGamesList = [];/*'Dota', 'Dota2','CounterStrike', 'LeagueofLegends', 'StarCraft', 'StarCraft2'  --temporary removed dota game statistics*/
    GameInfo.PROVIDER_AVAILABLE_EVENTS = null;
    GameInfo.SPORT_GROUPS = null;

    var gameIdsHavingStreaming;

    /**
     * @ngdoc method
     * @name groupRegionsIfNeeded
     * @methodOf vbet5.service:GameInfo
     * @description checks if there's region mapping specified in config and groups specified regions into one
     * @param {Array} regions array of regions
     * @partam {Number} sport id
     * @returns {Array} new array of regions with some of them merged into one
     */
    GameInfo.groupRegionsIfNeeded = function groupRegionsIfNeeded(regions, sportId) {
        console.log("groupRegionsIfNeeded", regions, sportId);
        var result = regions;
        GameInfo.groupRegions = GameInfo.groupRegions || {};
        if (Config.main.regionMapping && Config.main.regionMapping.enabled && Config.main.regionMapping[sportId]) {
            result = regions.reduce(function (acc, region) {
                var replacement = Config.main.regionMapping[sportId][region.alias];
                if (replacement) {

                    GameInfo.groupRegions[replacement.id] = GameInfo.groupRegions[replacement.id] || replacement;
                    GameInfo.groupRegions[replacement.id].children = GameInfo.groupRegions[replacement.id].children || [];
                    GameInfo.groupRegions[replacement.id].children.push(region.id);

                    var alreadyReplaced = Utils.getArrayObjectElementHavingFieldValue(acc, 'id', replacement.id);
                    if (alreadyReplaced) {
                        alreadyReplaced.game += region.game;
                        return acc;
                    }
                    region.id = replacement.id;
                    region.alias = replacement.alias;
                    region.name = Translator.get(replacement.name);
                    console.log(acc, replacement.id, alreadyReplaced);
                }
                acc.push(region);
                return acc;
            }, []);

        }
        console.log('groupRegionsIfNeeded result:', result);
        return result;
    };

    /**
     * @ngdoc method
     * @name replaceRegionFieldsIfNeeded
     * @methodOf vbet5.service:GameInfo
     * @description replaces region alias and name with values from Config.main.regionMapping config object if needed
     * @param {Object} region region object
     */
    GameInfo.replaceRegionFieldsIfNeeded = function replaceRegionFieldsIfNeeded(region) {
        if (Config.main.regionMapping && Config.main.regionMapping.enabled) {
            angular.forEach(Config.main.regionMapping, function (regions) {
                angular.forEach(regions, function (replacement, regionAlias) {
                    if (region.alias == regionAlias) {
                        region.alias = replacement.alias;
                        region.name = replacement.name;
                    }
                });
            });
        }
    };

    /**
     * @ngdoc method
     * @name getRegionChildren
     * @methodOf vbet5.service:GameInfo
     * @description returns ids of regions merged into region specified by id
     * @param {Number} id id of "parent' region
     * @returns {Array} array of children(regions merged into specified region) ids
     */
    GameInfo.getRegionChildren = function getRegionChildren(id) {
        return GameInfo.groupRegions[id] && GameInfo.groupRegions[id].children ? GameInfo.groupRegions[id].children : null;
    };
/*
    EUROSTAR_TV: 111111;
    PERFORM_GROUP: 1;
    GEORGIA_TV:int 2;
    UNAS_TV: 3;
    LIVE_STUDIO: 4;
    IMG_GAMING: 5;
    PRIVATE_TV: 6;
    FUTSAL1_TV: 7;
    FUTSAL2_TV:8;
    HOCKEY_TV: 11;
    FUTSAL3_TV: 12;
    VIRTUAL_SPORTS: 15;
    UA_TV: 16;
    URAKULAS_TV:17;
    IMG_GAMING_SECURE: 18;
    CYBER_SPORT: 19;
    BETRADAR_TV: 25;
    PRIVATE_VIVARO: 26;
    ALBA_SOLUTIONS: 28;
    FRIENDSHIP_STREAMING: 31;
    GBI_RACING: 999999*/

    /**
     * @ngdoc method
     * @name hasVideo
     * @methodOf vbet5.service:GameInfo
     * @description checks if games has video or not
     * @param {Object} game game object
     * @param {Boolean} enablePrematchCheck enables checking for prematch games
     * @returns {Boolean} if game has video or not
     */
    GameInfo.hasVideo = function hasVideo(game, enablePrematchCheck) {
        if (Config.main.video.enableOptimization) {
            if (!GameInfo.PROVIDER_AVAILABLE_EVENTS || !GameInfo.PROVIDER_AVAILABLE_EVENTS[game.id]) {
                game.video_id = undefined;
                return false;
            }
            game.tv_type = GameInfo.PROVIDER_AVAILABLE_EVENTS[game.id][0].provider_id;
            game.video_id = GameInfo.PROVIDER_AVAILABLE_EVENTS[game.id][0].video_id;

            return true;
        }
        if ([15, 29].indexOf(game.tv_type)!== -1 && game.video_id) {
            if (game.tv_type === 15 || Config.main.availableVideoProviderIds.indexOf(game.tv_type) !== -1) {
                return true;
            }
        }
        if (game.type === 1 || enablePrematchCheck) {
            if (game.video_id2 && Config.main.availableVideoProviderIds.indexOf(6) !== -1 && (!game.tv_type || (game.tv_type !== 19 && game.tv_type !== 16) )) {
                game.video_id = game.video_id2;
                game.tv_type = 6;
                return true;
            }
            if (game.video_id < 0 && Config.main.availableVideoProviderIds.indexOf(3) !== -1 && (!Config.main.getProviderAvailableEventsAndEnableFiltering || Config.main.getProviderAvailableEventsAndEnableFiltering.indexOf(3) === -1 || !GameInfo.PROVIDER_AVAILABLE_EVENTS || !GameInfo.PROVIDER_AVAILABLE_EVENTS[3] || GameInfo.PROVIDER_AVAILABLE_EVENTS[3].indexOf(game.video_id) !== -1)) {
                game.tv_type = 3;
                return true;
            }
            if (game.video_id === 999999 && Config.main.availableVideoProviderIds.indexOf(999999) !== -1) { // the horse racing case
                game.tv_type = 999999;
                return true;
            }
            if (game.video_id3 && Config.main.availableVideoProviderIds.indexOf(17) !== -1 && (!game.tv_type || game.tv_type !== 21)) {
                game.video_id = game.video_id3;
                game.tv_type = 17;
                return true;
            }
            if (Config.main.availableVideoProviderIds.indexOf(game.tv_type) !== -1) {
                if ([7, 8, 11, 12, 16, 19, 25, 26, 28].indexOf(game.tv_type) !== -1 && game.video_id) {
                    return true;
                }
                if ([1, 5, 31].indexOf(game.tv_type) !== -1 && game.video_id && (!Config.main.getProviderAvailableEventsAndEnableFiltering || Config.main.getProviderAvailableEventsAndEnableFiltering.indexOf(game.tv_type) === -1 || !GameInfo.PROVIDER_AVAILABLE_EVENTS || !GameInfo.PROVIDER_AVAILABLE_EVENTS[game.tv_type] || GameInfo.PROVIDER_AVAILABLE_EVENTS[game.tv_type].indexOf(game.video_id) !== -1)) {
                    console.log(game.tv_type);
                    return true;
                }
                if (game.video_id3 && [21, 22, 23, 30].indexOf(game.tv_type) !== -1) {
                    game.video_id = game.video_id3;
                    return true;
                }
            }

            if (game.partner_video_id && Config.main.availableVideoProviderIds.indexOf(24) !== -1) {
                game.video_id = game.partner_video_id;
                game.tv_type = 24;
                return true;
            }
            if (game.partner_video_id && Config.main.availableVideoProviderIds.indexOf(18) !== -1) {
                game.video_id = game.partner_video_id;
                game.tv_type = 18;
                return true;
            }
        }

        game.video_id = undefined;
        return false;
    };

    /**
     * @ngdoc method
     * @name processProvidersByCountryIfNeeded
     * @methodOf vbet5.service:GameInfo
     * @description returns same array if no country filter applied
     *
     * @returns {Array} condition object for swarm request
     */
    GameInfo.processProvidersByCountryIfNeeded = function processProvidersByCountryIfNeeded(inputIds) {
        var outputIds = [];
        var r, countryFilters = Config.main.availableVideoProviderCountryFilters;

        if (!Config.main.availableVideoProviderCountryFiltersActive || !countryFilters || !$rootScope.geoCountryInfo || $rootScope.geoCountryInfo === false) {
            return inputIds;
        }

        for (r = 0; r < inputIds.length; r++) {
            if (countryFilters[inputIds[r]]) {
                if (countryFilters[inputIds[r]].indexOf($rootScope.geoCountryInfo.countryCode) > -1) {
                    outputIds.push(inputIds[r]);
                }
            } else {
                outputIds.push(inputIds[r]);
            }
        }

        return outputIds;
    };

    /**
     * @ngdoc method
     * @name getVideoFilter
     * @methodOf vbet5.service:GameInfo
     * @description returns "have video" condition object for swarm request
     *
     * @returns {Array} condition object for swarm request
     */
    GameInfo.getVideoFilter = function getVideoFilter() {
        if (Config.main.video.enableOptimization) {
            gameIdsHavingStreaming = Object.keys(GameInfo.PROVIDER_AVAILABLE_EVENTS).map(
                function(id) {
                    return parseInt(id, 10);
                });
            return {
                '@in': gameIdsHavingStreaming
            };
        }

        var filterList = [], idsFilter, availableProviders = Config.main.availableVideoProviderIds;
        var videoId3Filter = {video_id3: {'@gt': 0}};

        availableProviders = GameInfo.processProvidersByCountryIfNeeded(availableProviders);

        for (var i = 0, length = availableProviders.length; i < length; i += 1) {
            switch (availableProviders[i]) {
                case 1:         // PerformGroup
                case 5:         // IMG
                case 31:        // FRIENDSHIP_STREAMING
                    idsFilter = (!Config.main.getProviderAvailableEventsAndEnableFiltering || Config.main.getProviderAvailableEventsAndEnableFiltering.indexOf(availableProviders[i]) === -1 || !GameInfo.PROVIDER_AVAILABLE_EVENTS || !GameInfo.PROVIDER_AVAILABLE_EVENTS[availableProviders[i]]) ? {'@gt': 0} : {'@in': GameInfo.PROVIDER_AVAILABLE_EVENTS[availableProviders[i]]};
                    filterList.push({tv_type: availableProviders[i], video_id: idsFilter});
                    break;
                case 3:         // Unas TV
                    idsFilter = (!Config.main.getProviderAvailableEventsAndEnableFiltering || Config.main.getProviderAvailableEventsAndEnableFiltering.indexOf(availableProviders[i]) === -1 || !GameInfo.PROVIDER_AVAILABLE_EVENTS || !GameInfo.PROVIDER_AVAILABLE_EVENTS[availableProviders[i]]) ? {'@lt': 0} : {'@in': GameInfo.PROVIDER_AVAILABLE_EVENTS[availableProviders[i]]};
                    filterList.push({video_id: idsFilter});
                    break;
                case 6:         // Private TV
                    filterList.push({video_id2: {'@gt': 0}});
                    break;
                case 7:         // Futsal1
                case 8:         // Futsal2
                case 11:        // Hockey
                case 12:        // futsal3
                case 16:        // ua_tv
                case 19:        // E-Football
                case 26:        // private vivaro
                case 29:        //
                case 30:        // youtube streaming
                    filterList.push({tv_type: availableProviders[i]});
                    break;
                case 17:        // urakulas_tv
                case 21:        // dota streaming
                case 22:        // dota streaming
                case 23:        // dota streaming
                    filterList.indexOf(videoId3Filter) === - 1 &&(filterList.push(videoId3Filter));
                    break;
                case 25:        // dota streaming
                case 28:         // Alba solution
                    filterList.push({tv_type: availableProviders[i], video_id: {'@gt': 0}});
                    break;
                case 15:         // VIRTAUL_SPORTS
                    filterList.push({tv_type: 15, video_id: {'@gt': 0}});
                    break;
                case 18: //IMG for topsport
                    filterList.push({partner_video_id: true});
                    break;
                case 999999:    // horce racing
                    filterList.push({video_id: 999999});
                    break;
                default:
                    break;
            }
        }
        return filterList;
    };

    /**
     * @ngdoc method
     * @name getVideoData
     * @methodOf vbet5.service:GameInfo
     * @description fills game object with video_data (gets it from swarm)
     * @param {Object} game game object
     * @param {Boolean} evenIfNotLoggedIn get video data even if user is not logged in
     * @param {Boolean} isAnimation get animation data
     */
    GameInfo.getVideoData = function getVideoData(game, evenIfNotLoggedIn, isAnimation) {
        if (!isAnimation && (!game || game.tv_type === undefined || game.video_id === undefined || (!evenIfNotLoggedIn && (!$rootScope.profile || (!Config.main.video.allowedWithNoneBalance[game.tv_type] && ($rootScope.profile.calculatedBalance + $rootScope.profile.calculatedBonus) === 0))))) {
            return;
        }
        var request = isAnimation ? {
            video_id: game.video_provider[2],
            provider: game.video_provider[0],
            is_animation: true
        } : {
            video_id: game.video_id,
            provider: game.tv_type,
            use_hls: game.tv_type === 1 ? false :  !!Config.main.video.providersThatSupportHls[game.tv_type]
        };

        return Zergling
            .get(request, 'video_url')
            .then(function (data) {
                game[(isAnimation ? 'animation' : 'video') + '_data'] = data;
            });
    };

    /**
     * @ngdoc method
     * @name getPerformAvailableEvents
     * @methodOf vbet5.service:GameInfo
     * @description loads video provider filter( for getPerformAvailableEvents provider)
     * @returns {Object} promise
     */
    GameInfo.getProviderAvailableEvents = function getProviderAvailableEvents() {
        var filterLoaded = $q.defer();
        var result = filterLoaded.promise;
        if (GameInfo.PROVIDER_AVAILABLE_EVENTS || !Config.main.video.enableOptimization && !Config.main.getProviderAvailableEventsAndEnableFiltering) {
            filterLoaded.resolve(null);
        } else if (!Config.main.video.enableOptimization) {
            Zergling
                .get({provider: Config.main.getProviderAvailableEventsAndEnableFiltering}, 'get_video_ids')
                .then(function (data) {
                    if (data && data.videos) {
                        GameInfo.PROVIDER_AVAILABLE_EVENTS = data.videos;
                    }
                })['finally'](function() {
                filterLoaded.resolve(null);
            });
        } else {
            var onStreamUpdate = function(response) {
                if (response.stream_configs) {
                    GameInfo.PROVIDER_AVAILABLE_EVENTS = response.stream_configs;
                    $rootScope.$broadcast('stream.config.updated');
                }
            };

            Zergling
                .subscribe({
                    "source": "notifications",
                    "what": {"partner_streams":[]}
                }, onStreamUpdate)
                .then(function (response) {
                    if (response && response.data) {
                        onStreamUpdate(response.data);
                    }
                })['finally'](function() {
                filterLoaded.resolve(null);
            });
        }

        return result;
    };

    /**
     * @ngdoc method
     * @name getSportGroups
     * @methodOf vbet5.service:GameInfo
     * @description loads sport groups data
     * @returns {Object} promise
     */
    GameInfo.getSportGroups = function getSportGroups() {
        var groupsProgress = $q.defer();
        var result = groupsProgress.promise;

        if (!Config.main.enableSportsGrouping || GameInfo.SPORT_GROUPS) {
            groupsProgress.resolve(null);
        } else {
            Zergling
                .get({}, 'get_partner_sport_group')
                .then(function (data) {
                    if (data && data.details) {
                        GameInfo.SPORT_GROUPS = data.details;
                    }
                    groupsProgress.resolve(null);
                })['catch'](function() {
                groupsProgress.resolve(null);
            });
        }

        return result;
    };

    /**
     * @ngdoc method
     * @name checkIfTimeFilterIsNeeded
     * @methodOf vbet5.service:GameInfo
     * @description checks if global time filter is needed when requesting games information
     */
    GameInfo.checkIfTimeFilterIsNeeded = function checkIfTimeFilterIsNeeded() {
        if (Config.main.enableSameDayGamesInTimezone) {
            var nextDayStart = Moment.get().utcOffset(Config.main.enableSameDayGamesInTimezone).endOf("day").unix();
            Config.env.gameTimeFilter = {'@lt': nextDayStart};
            $window.setTimeout(function () {$window.location.reload(); }, (nextDayStart - Moment.get().unix()) * 1000); //reload at end of the day
        }
    };

    /**
     * @ngdoc method
     * @name getHorseRaceInfo
     * @methodOf vbet5.service:GameInfo
     * @description access to xml which contains race extra data and add this data to $scope.info.race
     * @param {Object} game info object
     */
    GameInfo.getHorseRaceInfo = function getHorseRaceInfo(gameInfo, market, marketName) {
        if (!gameInfo) {
            return;
        }
        gameInfo.race = gameInfo.race || {};
        gameInfo.race.horseStats = gameInfo.race.horseStats || [];
        gameInfo.race.nonRunners = gameInfo.race.nonRunners || [];
        gameInfo.race.favourite = gameInfo.race.favourite || [];
        gameInfo.race.second_favourite = gameInfo.race.second_favourite || [];

        var raceXml, raceId;
        if (gameInfo.horse_xml) {
            raceId = gameInfo.horse_xml.RacingId;
            raceXml = gameInfo.horse_xml.HorceCXml && gameInfo.horse_xml.HorceCXml.split('/')[1];
        }

        var path = Config.main.horceRacingXmlUrl + raceXml;
        var raceData = {};
        //Does not work for localhost
        $http.get(path).then(function (response) {
            raceData = X2js.xml_str2json(response.data);
            if (raceData) {
                var raceDate = 's' + raceData.HorseRacingCard.Meeting._date.substring(6, 8) + raceData.HorseRacingCard.Meeting._date.substring(4, 6) + raceData.HorseRacingCard.Meeting._date.substring(2, 4);
                var currentRace = getCurrentRace(raceData.HorseRacingCard.Meeting.Race, raceId);
                if (currentRace) {
                    gameInfo.race = getRaceInfo(currentRace);

                    gameInfo.race.courceIcon = 'http://horseracing.vivaro.am/stadium/' + raceData.HorseRacingCard.Meeting._course.toLowerCase().split(' ').join('') + '.png';
                    gameInfo.race.courceName = raceData.HorseRacingCard.Meeting._course;

                    //   gameInfo.race.currentRace = currentRace;

                    if(!currentRace.Horse.length){
                        loadHorseDataFromMarket(market, gameInfo.race);
                    }else{
                        var horseList = getHorseList(currentRace, market, marketName, raceDate); //this contains horseList.Horses, horseList.NonRunners
                        gameInfo.race.horseStats = horseList.horses;
                        gameInfo.race.nonRunners = horseList.nonRunners;
                        gameInfo.race.rule4 = horseList.rule4;
                        if (market) {
                            gameInfo.race.favourite = getHorseMarket(market, marketName, 'Favourite');
                            gameInfo.race.second_favourite = getHorseMarket(market, marketName, '2nd Favourite');
                        }
                    }
                }
            }
            else{ loadHorseDataFromMarket(market, gameInfo.race);}
        })
            .catch(function(){
                loadHorseDataFromMarket(market, gameInfo.race);
            });
    };

    /**
     * @ngdoc method
     * @name loadHorseDataFromMarket
     * @methodOf vbet5.service:GameInfo
     * @description we load horse data from market when there are no horse details available
     * @param {Object} market with data
     * @param {Object} raceData where to add horse data
     **/
    var loadHorseDataFromMarket = function loadHorseDataFromMarket(market, raceData){
        raceData.horseStats = [];
        raceData.nonRunners = [];
        for(var key in market) {
            if (market.hasOwnProperty(key)) {
                var raceEvents = market[key].event;
                for (var raceEvent in raceEvents) {
                    if (raceEvents.hasOwnProperty(raceEvent)) {
                        var raceStats = {};
                        raceStats.id = raceEvents[raceEvent].id;
                        raceStats.name = raceEvents[raceEvent].type;
                        raceStats.event = raceEvents[raceEvent];
                        if (raceEvents[raceEvent].nonrunner) {
                            raceData.nonRunners.push(raceStats);
                            if(!raceData.rule4 && raceEvents[raceEvent].nonrunner === 2){

                                raceData.rule4 = true;
                            }
                        }
                        else if (raceEvents[raceEvent].type === 'Favourite') {
                            raceData.favourite = raceEvents[raceEvent];
                        }
                        else if (raceEvents[raceEvent].type === '2nd Favourite') {
                            raceData.second_favourite = raceEvents[raceEvent];
                        }
                        else {
                            raceData.horseStats.push(raceStats);
                        }
                    }
                }
                return;
            }
        }
    };
    /**
     * @ngdoc method
     * @name getHorseMarket
     * @methodOf vbet5.service:GameInfo
     * @description
     * helper function, returns
     * @param {Object} existing markets, the name of market to select, the horse name which market needed
     * @returns {Object} market event related to the horse
     */
    var getHorseMarket = function getHorseMarket(markets, marketName, horseName, horseId) {
        var raceMarket = {};
        var keepGoing = true;
        angular.forEach(markets, function (market) {
            if (market.type === marketName && keepGoing) {
                angular.forEach(market.event, function (event) {
                    if ((event.type.toLowerCase().trim() === horseName.toLowerCase().trim() || event.type === horseId) && keepGoing) {
                        raceMarket = event;

                        keepGoing = false;
                    }
                });
            }
        });
        return raceMarket;
    };


    /**
     * @description helper function
     * @param {Object} allRaces  all race data
     * @param {Number} raceId current race id
     * @returns {Object} current race data
     */
    var getCurrentRace = function getCurrentRace(allRaces, raceId) {
        if (allRaces.length > 1) {
            for (var i = 0; i < allRaces.length; i++) {
                if (allRaces[i]._id == raceId) {
                    return allRaces[i];
                }
            }
        }
        else {
            return allRaces;
        }
    };

    /**
     * @description helper function
     * @param {Object} currentRace current race full data
     * @returns {Object} race related info
     */
    var getRaceInfo = function getRaceInfo(currentRace) {
        var race = {};

        race.prize = 0;
        race.track_type = currentRace._trackType;
        if (currentRace.Prizes && currentRace.Prizes.Prize){
            for (var j = 0; j < currentRace.Prizes.Prize.length; j++) {
                if (currentRace.Prizes.Prize[j]._position === '1') {
                    race.prize = currentRace.Prizes.Prize[j]._amount;
                    break;
                }
            }
        }
        race.currency = currentRace.Prizes? currentRace.Prizes._currency:'';
        var distance = currentRace.Distance? currentRace.Distance._value: '';
        if (currentRace.Distance && currentRace.Distance._units === 'yards') {
            var miles = Math.floor(distance / 1760);
            var furlongs = Math.floor((distance - 1760 * miles) / 220);
            var yards = (distance - 1760 * miles) - 220 * furlongs;
            race.distance = (miles > 0 ? miles + 'm ' : '') + (furlongs > 0 ? furlongs + 'f ' : '') + (yards > 0 ? yards + 'y ' : '');
        } else {
            race.distance = distance + ' ' + (currentRace.Distance?currentRace.Distance._units:'');
        }
        race.race_type = currentRace._raceType;
        race.title = currentRace.Title;
        return race;
    };

    /**
     * @description helper function
     * @param {Object} raceData current race full data
     * @param {Object} market race market
     * @param {String} marketName market name
     * @param {String} raceDate race date
     * @returns {Object} merges horse info with market event and returns horses list
     */
    var getHorseList = function getHorseList(raceData, market, marketName, raceDate) {

        var statisticsArray = [];
        var nonRunnersArray = [];
        var rule4 = false;
        if (raceData.Horse){
            for (var k = 0; k < raceData.Horse.length; k++) {
                var horseStatistics = {};
                horseStatistics.id = raceData.Horse[k] ? raceData.Horse[k]._id : '';
                horseStatistics.name = raceData.Horse[k] ? raceData.Horse[k]._name : '';
                horseStatistics.age = raceData.Horse[k].Age ? raceData.Horse[k].Age._years : '';
                if( raceData.Horse[k].Jockey){
                    horseStatistics.jockey =  raceData.Horse[k].Jockey._name;
                    horseStatistics.jockey_allowance = raceData.Horse[k].Jockey.Allowance ? '(' + raceData.Horse[k].Jockey.Allowance._value + ')' : '';
                }else{
                    horseStatistics.jockey = '';
                    horseStatistics.jockey_allowance = '';
                }

                if (raceData.Horse[k].LastRunDays) {
                    if (raceData.Horse[k].LastRunDays.length) {
                        for (var m = 0; m < raceData.Horse[k].LastRunDays.length; m++) {
                            if (raceData.Horse[k].LastRunDays[m]._type === raceData._raceType) {
                                horseStatistics.last_run_days = raceData.Horse[k].LastRunDays[m]._days;
                            }
                        }
                    } else {
                        horseStatistics.last_run_days = raceData.Horse[k].LastRunDays._days;
                    }
                }
                if (raceData.Horse[k].RaceHistoryStat) {
                    horseStatistics.historyStats = getCdWon(raceData.Horse[k].RaceHistoryStat);

                }
                horseStatistics.jockey_colors = Config.main.horceRacingXmlUrl + raceDate + '/' + raceData.Horse[k].JockeyColours._filename;
                horseStatistics.trainer = raceData.Horse[k].Trainer ? raceData.Horse[k].Trainer._name : '';
                var stones = raceData.Horse[k].Weight._value ? Math.floor(raceData.Horse[k].Weight._value / 14) : '';
                var pounds = (raceData.Horse[k].Weight._value - stones * 14) > 0 ? ('-' + (raceData.Horse[k].Weight._value - stones * 14)) : '';
                horseStatistics.weight = {
                    units: raceData.Horse[k].Weight ? raceData.Horse[k].Weight._units : '',
                    value: stones + pounds
                };
                horseStatistics.cloth = raceData.Horse[k].Cloth ? raceData.Horse[k].Cloth._number : '';
                horseStatistics.drawn = raceData.Horse[k].Drawn && raceData.Horse[k].Drawn._stall ? raceData.Horse[k].Drawn._stall : '-';
                horseStatistics.form_figures = raceData.Horse[k].FormFigures ? raceData.Horse[k].FormFigures._figures : '';
                if (market) {
                    //get market price for this particular horse, will remove from this code
                    horseStatistics.event = getHorseMarket(market, marketName, horseStatistics.name, horseStatistics.id);
                }
                else {// maybe no need of this block, need to check when no markets available
                    horseStatistics.event = {};
                }
                //This is non runner check
                //if (horseStatistics.jockey === 'Non Runner') {
                if(horseStatistics.event.nonrunner ){
                    nonRunnersArray.push(horseStatistics);
                    if(horseStatistics.event.nonrunner === 2){
                        rule4 = true;
                    }
                } else {
                    statisticsArray.push(horseStatistics);
                }
            }
        }

        return {'horses': statisticsArray, 'nonRunners': nonRunnersArray, 'rule4': rule4};
    };



    /**
     * @description helper function
     * @param {Object} historyStat horse statistics history
     * @returns {Object} formatted statistics history
     */
    var getCdWon = function getCdWon(historyStat){
        var horseHistoryStat = {};
        if (historyStat.length) {
            for (var i = 0; i < historyStat.length; i++) {
                switch (historyStat[i]._type) {
                    case 'Distance':
                        horseHistoryStat.d = 'D';
                        break;
                    case 'Course':
                        horseHistoryStat.c = 'C';
                        break;
                    case 'CourseDistance':
                        horseHistoryStat.cd = 'CD';
                        break;
                    case 'BeatenFavourite':
                        horseHistoryStat.bf = 'BF';
                        break;
                }
            }
        }
        else {
            switch (historyStat._type) {
                case 'Distance':
                    horseHistoryStat.d = 'D';
                    break;
                case 'Course':
                    horseHistoryStat.c = 'C';
                    break;
                case 'CourseDistance':
                    horseHistoryStat.cd = 'CD';
                    break;
                case 'BeatenFavourite':
                    horseHistoryStat.bf = 'BF';
                    break;
            }
        }

        return horseHistoryStat;
    };

    /**
     * @ngdoc method
     * @name eachWayPlace
     * @methodOf vbet5.service:GameInfo
     * @description gets the place number and returns set of numbers from 1-st to the value of param
     * @param {Number} placeCount  the place number
     * @returns {String} set of numbers
     */
    GameInfo.eachWayPlace = function eachWayPlace(placeCount) {
        var places = '';
        for (var i = 1; i <= placeCount; i++) {
            if (i !== placeCount) {
                places += i + ', ';
            }
            else {
                places += i;
            }
        }
        return places;
    };

    /*********************   SPRING PLATFORM SUPPORT FUNCTIONS     **********************************/

    var GAME_EVENTS_MAP = {
        //    soccer
        1: 'Goal',
        2: 'RedCard',
        3: 'YellowCard',
        4: 'Corner',
        5: 'Penalty',
        6: 'Substitution',
        10: 'Period',
        20: 'BallSafe',
        21: 'DangerousAttack',
        22: 'KickOff',
        23: 'GoalKick',
        24: 'FreeKick',
        25: 'ThrowIn',
        26: 'ShotOffTarget',
        27: 'ShotOnTarget',
        28: 'Offside',
        29: 'GoalkeeperSave',
        30: 'ShotBlocked',
        100: 'NotStarted',
        101: 'FirstHalf',
        102: 'HalfTime',
        103: 'SecondHalf',
        104: 'PreExtraHalf',
        105: 'ExtraTimeFirstHalf',
        106: 'ExtraTimeHalfTime',
        107: 'ExtraTimeSecondHalf',
        108: 'Finished',
        199: 'Timeout',
        //    tennis
        200: 'FirstSet',
        201: 'SecondSet',
        202: 'ThirdSet',
        203: 'FourthSet',
        204: 'FifthSet',
        205: 'Point',
        206: 'BallInPlay',
        207: 'ServiceFault',
        208: 'DoubleFault',
        209: 'Ace',
        210: 'InjuryBreak',
        211: 'RainDelay',
        212: 'Challenge',
        213: 'FinalSet',
        214: 'Let1stServe',
        215: 'Retired',
        216: 'Walkover',
        217: 'Game',
        218: 'Set',
        //    basketball
        300: 'FirstQuarter',
        301: 'FirstQuarterEnded',
        302: 'SecondQuarter',
        303: 'SecondQuarterEnded',
        304: 'ThirdQuarter',
        305: 'ThirdQuarterEnded',
        306: 'FourthQuarter',
        307: 'FourthQuarterEnded',
        308: 'OverTime',
        309: 'OverTimeEnded',
        320: 'Foul',
        321: 'FreeThrow',
        322: 'Free1Throw',
        323: 'Free2Throws',
        324: 'Free3Throws',
        325: 'MissedFreeThrow',
        326: 'Attack',
        327: 'OnePoint',
        328: 'TwoPoints',
        329: 'ThreePoints',
        //    icehockey
        400: 'FirstPeriod',
        401: 'FirstPeriodEnded',
        402: 'SecondPeriod',
        403: 'SecondPeriodEnded',
        404: 'ThirdPeriod',
        405: 'ThirdPeriodEnded',
        410: 'TimerStatus',
        420: 'Suspension',
        421: 'SuspensionOver',
        //    handball
        500: 'Throw_In',
        501: 'Throw_Out',
        502: 'GoalKeeper_Throw',
        503: 'Free_Throw',
        504: 'SevenMeter_Throw',
        505: 'PenaltyScored',
        506: 'PenaltyMissed'
    };

    var GAME_STATISTICS = {
        soccer: ['dangerous_attack', 'shot_on_target', 'shot_off_target', 'corner', 'yellow_card', 'red_card', 'penalty'],
        cyberfootball: ['dangerous_attack', 'shot_on_target', 'shot_off_target', 'corner', 'yellow_card', 'red_card', 'penalty'],
        tennis: ['aces', 'double_fault']
    };

    var TIMELINE_EVENTS = ['goal', 'red card', 'yellow card', 'corner', 'substitution', 'yellow_card', 'red_card'];

    GameInfo.GamesWithStatsBlock = GAME_STATISTICS;


    /**
     * @ngdoc method
     * @name updateGameStatistics
     * @methodOf vbet5.service:GameInfo
     * @description updates game statistics
     * @param game {Object} the game object
     */
    GameInfo.updateGameStatistics = function updateGameStatistics(game) {
        if(GAME_STATISTICS[game.sport.alias.toLowerCase()] && game.stats) {
            var statisticsList = GAME_STATISTICS[game.sport.alias.toLowerCase()];
            var i = 0;
            var length = statisticsList.length;

            for(i = 0; i < length; i++) {
                if(game.stats[statisticsList[i]]) {
                    var team1_value = parseInt(game.stats[statisticsList[i]].team1_value, 10);
                    var team2_value = parseInt(game.stats[statisticsList[i]].team2_value, 10);
                    game.stats[statisticsList[i]].team1_width = (team1_value + team2_value) === 0 ? 50 : (team1_value * 100) / (team1_value + team2_value);
                } else{
                    // hope we'll never need else part with new backend
                    game.stats[statisticsList[i]] = {};
                    game.stats[statisticsList[i]].team1_value = game.stats[statisticsList[i]].team2_value = 0;
                    game.stats[statisticsList[i]].team1_width = 50;
                    if(game.last_event && game.last_event[statisticsList[i] + '_score']) {
                        game.stats[statisticsList[i]].team1_value = parseInt((game.last_event[statisticsList[i] + '_score']).substr(0, (game.last_event[statisticsList[i] + '_score']).indexOf(':')), 10);
                        game.stats[statisticsList[i]].team2_value = parseInt((game.last_event[statisticsList[i] + '_score']).substr((game.last_event[statisticsList[i] + '_score']).indexOf(':') + 1), 10);
                        game.stats[statisticsList[i]].team1_width = (game.stats[statisticsList[i]].team1_value +  game.stats[statisticsList[i]].team2_value) === 0 ? 50 : (game.stats[statisticsList[i]].team1_value * 100) / (game.stats[statisticsList[i]].team1_value + game.stats[statisticsList[i]].team2_value);
                    }
                }
            }
        }
    };



    /**
     * @ngdoc method
     * @name setTennisCourtSide
     * @methodOf vbet5.service:GameInfo
     * @description
     * sets ball serve side based on the game score
     *
     * @param {Object} gameEvent event object where court_side will be added
     * @param {Object} scopeGame game object
     */
    GameInfo.setTennisCourtSide = function setTennisCourtSide(gameEvent, scopeGame) {
        if(scopeGame.stats && scopeGame.stats.passes) {
            var score1 = parseInt(scopeGame.stats.passes.team1_value, 10);
            var score2 = parseInt(scopeGame.stats.passes.team2_value, 10);
            var scoreSum = score1 + score2;
            if (gameEvent.set_score === "6:6" && scoreSum !== 0) {
                scopeGame.last_event.court_side = (scoreSum % 2) === 0 ? "left" : "right";
            } else {
                if (score1 === score2 || scoreSum === 30 || scoreSum === 55) {
                    scopeGame.last_event.court_side = "right";
                } else {
                    scopeGame.last_event.court_side = "left";
                }
            }
        }
    };
    /**
     * @ngdoc method
     * @name checkITFAvailability
     * @methodOf vbet5.service:GameInfo
     * @description  removed itf data from game
     * @param game {Object} the game object
     */
    GameInfo.checkITFAvailability = function checkITFAvailability(game) {
        if (Config.main.disableITFGamesInfo && game.is_itf && game.type === 1) {
            if (game.info) {
                game.info.score1 = '-';
                game.info.score2 = '-';
                game.info.pass_team = "";
            }
            game.text_info = "";
            game.has_animation = false;
            angular.forEach(game.stats, function (stat) {
                stat.team1_value !== undefined && (stat.team1_value = '-');
                stat.team2_value !== undefined && (stat.team2_value = '-');
            });
        }
    };

    /**
     * @ngdoc method
     * @name extendLiveGame
     * @methodOf vbet5.service:GameInfo
     * @description  extend game object to support GMS (new backend) data
     * @param game {Object} the game object
     */
    GameInfo.extendLiveGame = function extendLiveGame(game) {
        if(game.last_event) {
            game.last_event.type = GAME_EVENTS_MAP[game.last_event.type_id] || '';
            //for basketball points
            if(game.last_event.type_id == '327') {
                game.last_event.type = GAME_EVENTS_MAP[parseInt(game.last_event.type_id) + game.last_event.event_value -1];
            }
            game.last_event.match_length = game.last_event.match_length || game.match_length || 0;
            if(game.sport.alias === 'Tennis') {
                GameInfo.setTennisCourtSide(game.last_event, game);
            }
            game.has_animation = !!(Config.main.sportsWithAnimations[game.sport.alias]);
        }
        if (game.video_provider && game.video_provider[2]) {
            if (Config.main.enableCustomAnimations) {
                game.has_animation = true;
            } else {
                game.video_provider[2] = null;
            }
        }
        if(game.info) {
            game.info.field = game.info.field !== undefined ? game.info.field : (game.field !== undefined ? game.field : '');
        }
        if(game.live_events && game.live_events.length > 0  ) {
            var i, length = game.live_events.length;
            for (i = 0; i < length; i++) {
                game.live_events[i].event_type = (GAME_EVENTS_MAP[game.live_events[i].type_id] || '').split(/(?=[A-Z])/).join(' ');
                game.live_events[i].event_icon = ((GAME_EVENTS_MAP[game.live_events[i].type_id] || '').split(/(?=[A-Z])/).join('_')).toLowerCase() + '-icon';
                game.live_events[i].team = game.live_events[i].side === 0 ? '' : 'team' + game.live_events[i].side;
                game.live_events[i].add_info = game.live_events[i].current_minute || 0;
            }
        }
        GameInfo.checkITFAvailability(game);
    };

    /* checks if extra time of the game is played
     * need this function for generating timeline events */
    function checkExtraTime(gameInfo) {
        return (
            gameInfo && (
                gameInfo.current_game_state === 'additional_time1' ||
                gameInfo.current_game_state === 'additional_time2' ||
                gameInfo.current_game_state === 'set3' ||
                gameInfo.current_game_state === 'set4' ||
                (gameInfo.current_game_state === 'timeout' && gameInfo.currMinute > 100)
            )
        );
    }

    /* returns current time position on timeline */
    function getTLCurrentMinutePosition(game) {
        var curentMinute;
        var currentMinutePosition = '';
        if (!game.info || !game.info.current_game_time) {
            return;
        }

        curentMinute = parseInt(game.info.current_game_time, 10);

        if(curentMinute < 0 ){
            return '0%';
        }
        if (checkExtraTime(game.info)) {
            currentMinutePosition = (curentMinute - 90) <= 30 ? ((curentMinute - 90) * 10 / 3) + '%' : '100%';
        } else if (game.last_event &&  parseInt(game.last_event.match_length, 10) < 90) {
            var matchLength = parseInt(game.last_event.match_length, 10);
            currentMinutePosition = curentMinute <= matchLength ? (curentMinute * 10 / (matchLength/ 10)) + '%' : '100%';
        } else {
            currentMinutePosition = curentMinute <= 90 ? (curentMinute * 10 / 9) + '%' : '100%';
        }

        return currentMinutePosition;
    }


    /*returns position of timeline event */
    function getTimelinePosition (timelineEvent) {
        var theMinute = parseInt(timelineEvent.minute, 10);
        var multiplier = 9;

        if (timelineEvent.extraTime) {
            return;
        }

        if (parseInt(timelineEvent.matchLength, 10) < 90) {
            multiplier = parseInt(timelineEvent.matchLength, 10)/ 10;
        }

        if (theMinute > (multiplier-5) && theMinute < multiplier*10) {
            return {  position: 'absolute', right: (102 - theMinute * 10 / multiplier) + '%'};
        }

        if (theMinute >= multiplier*10) {
            return { position: 'absolute', right: 0 +'%'};
        }

        return { position: 'absolute', left:  theMinute * 10 / multiplier + '%'};
    }


    //calculates one timeline event data and adds it to events list
    function populateTimelineEventData(tlEvent, game) {
        if (!tlEvent.event_type || TIMELINE_EVENTS.indexOf(tlEvent.event_type.toLowerCase()) === -1) {
            return;
        }
        var currentEvent = {};
        currentEvent.minute = parseInt(tlEvent.add_info, 10);
        currentEvent.type = 'tl-' + tlEvent.event_type.split(' ').join('_').toLowerCase();
        currentEvent.shirtColor = tlEvent.team === 'team1' ? game.info.shirt1_color : game.info.shirt2_color;
        currentEvent.team = tlEvent.team;
        currentEvent.matchLength = game.last_event ? game.last_event.match_length : "90";

        currentEvent.details = {};
        currentEvent.details.type = tlEvent.event_type.split('_').join(' ');
        currentEvent.details.add_info = tlEvent.add_info + " " + game[tlEvent.team + '_name'];
        var timelinePosition = getTimelinePosition(currentEvent);
        currentEvent.timeline_position = timelinePosition;
        currentEvent.extraTime = false;
        if (checkExtraTime(game.info)) {
            currentEvent.extraTime = true;
            //if extra time push only tl events after 90th minute
            if (currentEvent.minute > 90) {
                game.tlEvents.push(currentEvent);
            }
        } else {
            game.tlEvents.push(currentEvent);
        }
    }

    /**
     * @ngdoc method
     * @name generateTimeLineEvents
     * @methodOf vbet5.service:GameInfo
     * @param {object} game object contains timeline and game events
     * @description generates timeline events for soccer animation control
     */
    GameInfo.generateTimeLineEvents = function generateTimeLineEvents(game) {
        if(game.tlEvents) {
            // add only last element from live_events if it fits condition
            if (!game.live_events || game.live_events.length === game.live_events_length) {
                return; // no new event added
            }
            game.live_events_length = game.live_events.length;
            if( game.live_events_length) {
                populateTimelineEventData(game.live_events[game.live_events_length - 1], game);
            }
        } else if (game.live_events && game.live_events.length) {
            game.tlEvents = [];
            angular.forEach(game.live_events, function (tlEvent) {
                populateTimelineEventData(tlEvent, game);
            });
        }

        var currentMinuteStyle = getTLCurrentMinutePosition(game);
        game.tlCurrentMinute = {width: currentMinuteStyle };
        game.tlCurrentPosition = { left: currentMinuteStyle };
    };


    /*********************   SPRING PLATFORM SUPPORT FUNCTIONS END     **********************************/


    /**
     * @ngdoc method
     * @name slideSets
     * @methodOf vbet5.service:GameInfo
     * @description  slides to next/previous set
     */
    GameInfo.slideSets = function slideSets(direction, game, visibleSetsNumber, allSets) {
        if (direction === 'left') {
            if (game.setsOffset > 0) {
                game.setsOffset--;
            }
        } else if (direction === 'right') {
            if (game.setsOffset < allSets - visibleSetsNumber) {
                game.setsOffset++;
            }
        }
    };


    /**
     * @ngdoc method
     * @name isExtraTime
     * @methodOf vbet5.service:GameInfo
     * @description
     * detects whether the game extra time has begun
     * @param {Object} gameInfo game.info object which contains information about game state
     */
    GameInfo.isExtraTime = function isExtraTime(gameInfo) {
        return checkExtraTime(gameInfo);
    };


    /**
     * @ngdoc method
     * @name framesCount
     * @methodOf vbet5.service:GameInfo
     * @description
     * returns array of numbers which represent number of played frames
     *
     * @param {Object} stats object that contains all played frames statistics
     * @returns {Array} array of numbers of frames
     */
    GameInfo.framesCount = function framesCount(stats) {
        var frames_array = [];
        var i = 0;
        for (var key in stats) {
            if (key.indexOf('score_set') === 0) {
                i++;
                frames_array.push(i);
            }
        }
        return frames_array;
    };

    // list of games  sets which should be replaced with specific text
    var liveGameSetsAliases = {
        'Basketball5': 'OT', //basketball 5th quarter is called overtime 'OT'
        "BeachFootball4": 'OT',
        "BeachFootball5": 'PT',
        'Baseball10': 'EX'
    };

    /**
     *  @ngdoc method
     * @name showFrameAlias
     * @methodOf vbet5.service:GameInfo
     * @description replaces set number with specefic symbol if found in liveGameSetsAliases
     * @param currentFrame {Number} the number of set
     * @param sportAlias {String} sport alias
     * @returns {*}
     */
    GameInfo.showFrameAlias = function showFrameAlias (currentFrame, sportAlias) {
        return  liveGameSetsAliases[sportAlias + currentFrame] || currentFrame;
    };


    /**
     * @ngdoc method
     * @name getCurrentTime
     * @methodOf vbet5.service:GameInfo
     * @description parses param and returns only the time
     * @param {String} timeObj contains current time object
     * @returns {string} current time
     */
    GameInfo.getCurrentTime = function getTheTime(timeObj) {
        if (timeObj) {
            if (timeObj.indexOf('set') >= 0) {
                if (timeObj.indexOf(':') > 0) {
                    return timeObj.substr((timeObj.indexOf(':') - 2), 5);
                } else {
                    return '';
                }
            } else {
                return timeObj;
            }
        }


        //return timeObj && (timeObj.indexOf(':') > 0) ? timeObj.substr((timeObj.indexOf(':') - 2), 5) + "'" : timeObj;
    };



    /**
     * @ngdoc function
     * @name displayBase
     * @methodOf vbet5.service:GameInfo
     * @description returns base to display
     *
     * @param {Object} event event object
     * @param {Object} market market object
     *
     * @returns {String} base to display
     */
    GameInfo.displayBase = function displayBase(event, market) {
        if (event === undefined || event.base === null  || event.base === undefined) {
            return '';
        }
        var base, prefix = '';

        base = parseFloat(event.base);
        if (Config.main.asian.homeAwayBaseRecalculationEnabled && market.home_score !== undefined && market.away_score !== undefined && (event.type_1 === 'Home' || event.type_1 === 'Away')) {
            var delta = market.home_score - market.away_score;
            switch (event.type_1) {
                case "Home":
                    base += delta;
                    break;
                case "Away":
                    base -= delta;
                    break;
            }

        } else if (market.type && market.type.substr(-8) === 'Handicap' && event.base > 0) {
            prefix = '+';
        }

        if (Config.main.disableBracketsForLanguages && Config.main.disableBracketsForLanguages.indexOf(Config.env.lang) > -1) {
            return ' ' + prefix + base + ' ';
        }

        return '(' + prefix + base + ')';
    };



    /**
     * @ngdoc method
     * @name getStatWidth
     * @methodOf vbet5.service:GameInfo
     * @description
     * counts the with of statistics chart based on scores
     *
     * @param {object} teamsScores object that contains teams statistics score
     *
     */
    GameInfo.getStatWidth = function getStatWidth(teamsScores) {
        if (teamsScores) {
            var team1_score = parseInt(teamsScores.split(':')[0], 10);
            var team2_score = parseInt(teamsScores.split(':')[1], 10);
            return (team1_score + team2_score) === 0 ? 50 : (team1_score * 100) / (team1_score + team2_score);
        }
    };

    /**
     * @ngdoc method
     * @name isEventInBetSlip
     * @methodOf vbet5.service:GameInfo
     * @param {object} event event object
     * @param {String} oddType odd type
     * @description  checks if provided event is in betslip
     * @returns {boolean} true if current event is in betslip, false otherwise
     */
    GameInfo.isEventInBetSlip = function isEventInBetSlip(event, oddType) {
        var mainCondition = event
            && event.id
            && $rootScope.betEvents
            && ($rootScope.betEvents[event.id] !== undefined)
            && $rootScope.betEvents[event.id].selected;

        oddType = oddType || 'odd';

        if (oddType === 'sp') {
            return (mainCondition && $rootScope.betEvents[event.id].oddType === 'sp');
        }

        return (mainCondition && $rootScope.betEvents[event.id].oddType !== 'sp');
    };

    // map of all animation sounds paths
    GameInfo.animationSoundsMap = {
        'Goal': 'audio/soccer/Goal',
        'RedCard': 'audio/soccer/RedCard',
        'YellowCard': 'audio/soccer/YellowCard',
        'BallInPlay': 'audio/tennis/BallInPlay',
        'Ace': 'audio/tennis/Ace',
        'ServiceFault': 'audio/tennis/ServiceFault',
        'beep' : 'audio/beep.mp3'
    };
    /**
     * @ngdoc method
     * @name setSound
     * @methodOf vbet5.service:GameInfo
     * @description  sets the animations sound effect on/off
     *
     * @param {String} format sound state (on, off)
     */
    GameInfo.setSound = function setSound(format) {
        Config.env.sound = format;
        Storage.set('sound', format);
    };

    /**
     * @ngdoc method
     * @name changeVolume
     * @methodOf vbet5.service:GameInfo
     * @description  sets sound volume based on config sound value
     *
     */
    GameInfo.changeVolume = function changeVolume() {
        var i;
        var audioList = document.getElementsByTagName("audio");
        for (i = 0; i < audioList.length; i++) {
            audioList[i].volume = Config.env.sound;
            audioList[i].autoplay = true;
        }
    };

    /**
     * @ngdoc method
     * @name getStatsLink
     * @methodOf vbet5.service:GameInfo
     * @description  returns stats link for game
     * @param {Object} game game object
     *
     */
    GameInfo.getStatsLink = function getStatsLink(game) {
        var statLang = Moment.getStatisticsLang() || 'en';
        var hostName = Config.main.statsHostname.prefixUrl + statLang + Config.main.statsHostname.subUrl;
        return hostName + 'redirect/' + game.id;
    };

    if (Storage.get('sound') !== undefined) {
        var volume = parseFloat(Storage.get('sound'));
        if (isNaN(volume) || volume === null) {volume = 0; }
        GameInfo.setSound(volume);
    }

    $rootScope.$watch('env.sound', function (value) {
        Storage.set('sound', value);
    });

    $rootScope.$on("slideEnded", function (event) {
        GameInfo.changeVolume();
    });

    GameInfo.maxBetRequests = {};

    /**
     * @ngdoc method
     * @name displayEventLimit
     * @methodOf vbet5.service:GameInfo
     * @param {Object} event  event object
     * @param {Function} callback function to update data-tile
     * @description loads max bet for event and stores it in event's maxBet property
     */
    GameInfo.displayEventLimit = function displayEventLimit(event, callback) {


        // call this function from template if functional will be divided
        /*GameInfo.getExchangeEventFairPrice(event, game, false, market);*/

        if (GameInfo.maxBetRequests[event.id]) {
            return;
        }
        event.maxBet = undefined;
        GameInfo.maxBetRequests[event.id] = $timeout(function () {
            Zergling.get({events: [event.id]}, 'get_max_bet').then(function(response) {
                if (GameInfo.maxBetRequests[event.id]) {
                    if (!response.result_text) {
                        event.maxBet = Config.main.onlyDecimalStakeAmount ? Math.floor(response.details.amount) : parseFloat(response.details.amount);
                    }
                    if (callback) { callback(); }
                    GameInfo.maxBetRequests[event.id] = undefined;
                }
            });
        }, 500);
    };


    GameInfo.exchangeEventsMap = {};

    /**
     * @ngdoc method
     * @name getExchangeEventFairPrice
     * @methodOf vbet5.service:GameInfo
     * @param {Object} event  event object
     * @param {Boolean} cancel  if true cancel Event Processing
     * @description get exchange the best fair event
     */
    GameInfo.getExchangeEventFairPrice = function getExchangeEventFairPrice(event, game, cancel, market) {

        cancel = cancel || false;

        if (!Config.main.showExchangePrices  || GameInfo.exchangeEventsMap[event.id] && !cancel || Config.main.sportsLayout === 'combo') {
            return;
        }

        if (cancel) {
            $timeout.cancel(GameInfo.exchangeEventsMap[event.id]);
            GameInfo.exchangeEventsMap[event.id] = undefined;
            return;
        }

        // bugfix for: https://betconstruct.atlassian.net/browse/WEB-4853
        if (!market.is_fair) {
            return;
        }

        GameInfo.exchangeEventsMap[event.id] = $timeout(function () {
            Zergling.get({event_id: event.id}, 'get_fair_price').then(function (response) {
                if (response && response.details && response.details.k && response.details.k !== "") {
                    event.exchangePrice = response.details.k;
                    if (game) {
                        event.exchangeDeepLink = '/exchange/'+ game.type + '/' + game.sport.id + '/' + game.region.id + '/' + game.competition.id + '/' +  game.id;
                    }
                } else {
                    event.exchangePrice = undefined;
                    event.exchangeDeepLink = undefined;
                }
                GameInfo.exchangeEventsMap[event.id] = undefined;
            });
        }, 500);
    };

    /**
     * @ngdoc method
     * @name cancelDisplayEventLimit
     * @methodOf vbet5.service:GameInfo
     * @param {Object} event  event object
     * @param {Function} callback function to update data-title
     * @description cancels displayEventLimit request for event
     */
    GameInfo.cancelDisplayEventLimit = function cancelDisplayEventLimit(event, callback) {
        if (GameInfo.maxBetRequests[event.id]) {
            $timeout.cancel(GameInfo.maxBetRequests[event.id]);
            GameInfo.maxBetRequests[event.id] = undefined;
            event.maxBet = undefined;
            callback && callback();
        }

        // call this function from template if functional will be divided
        /*GameInfo.getExchangeEventFairPrice(event, null, true, null);*/
    };

    /**
     * @ngdoc method
     * @name updateOpenGameTextInfo
     * @methodOf vbet5.service:GameInfo
     * @description Renders game info text
     */
    GameInfo.updateOpenGameTextInfo = function updateOpenGameTextInfo(openGame) {
        if (openGame) {
            if (openGame.info && openGame.info.add_info && openGame.info.add_info.indexOf(';') === -1) {
                if (!!openGame.info.add_info.trim()) {
                    openGame.gameInfoText = openGame.info.add_info;
                    return;
                }
            }

            if (openGame.text_info) {
                if (!!openGame.text_info.split(';').pop().trim()) {
                    openGame.gameInfoText = openGame.text_info.split(';').pop();
                    openGame.gameInfoText = openGame.gameInfoText.split(',')[0];
                    return;
                }
            }

            openGame.gameInfoText = false;
        }
    };

    /**
     * @ngdoc method
     * @name addOrderingDataToSoccerGameEvents
     * @methodOf vbet5.service:GameInfo
     * @description Add ordering data to soccer events
     */
    GameInfo.addOrderingDataToSoccerGameEvents = function addOrderingDataToSoccerGameEvents (game) {
        if (!game.live_events) {
            return;
        }

        game.live_events.map(function (event) {
            event.add_info_order = parseInt(event.add_info, 10);
        });
    };

    /**
     * @ngdoc method
     * @name updateSelectedSportByLiveGameViewData
     * @methodOf vbet5.service:GameInfo
     * @description Render selected sport by live view data
     */
    GameInfo.updateSelectedSportByLiveGameViewData = function updateSelectedSportByLiveGameViewData (scope) {
        if (!scope.selectedSport) {
            scope.selectedSport = scope.liveGameViewData[0];
        } else {
            var ind, length;
            for (ind = 0, length = scope.liveGameViewData.length; ind < length; ind += 1) {
                if (scope.selectedSport.id === scope.liveGameViewData[ind].id) {
                    scope.selectedSport = scope.liveGameViewData[ind];
                    break;
                }
            }
            if (ind === length) {
                scope.selectedSport = scope.liveGameViewData[0];
            }
        }
    };


    /**
     * @ngdoc method
     * @name divideIntoColumns
     * @methodOf vbet5.service:GameInfo
     * @description divides market events into columns
     * @param {Object} market the market Object
     * @param {String} type the market's type
     * @returns {Array} array of columns
     */
    GameInfo.divideIntoColumns = function divideIntoColumns(market, type) {
        var leftCol = [], midCol = [], rightCol = [];
        switch (type) {
            case 'preDivided':
                if (market.col_count === 2) {
                    angular.forEach(market.event, function(event) {
                        event.display_column === 1 ? leftCol.push(event) : rightCol.push(event);
                    });
                } else {
                    angular.forEach(market.event, function(event) {
                        switch (event.display_column) {
                            case 1:
                                leftCol.push(event);
                                break;
                            case 2:
                                midCol.push(event);
                                break;
                            case 3:
                                rightCol.push(event);
                                break;
                        }
                    });
                }
                leftCol.sort(Utils.orderSorting);
                midCol.sort(Utils.orderSorting);
                rightCol.sort(Utils.orderSorting);
                break;
            case 'correctScore':
                angular.forEach(market.event, function(event) {
                    if(event.home_value > event.away_value) {
                        leftCol.push(event);
                    } else if(event.home_value < event.away_value) {
                        rightCol.push(event);
                    } else {
                        midCol.push(event);
                    }
                });
                leftCol.sort(function(a,b) {
                    return Utils.compare(a.home_value, b.home_value) || Utils.compare(a.away_value, b.away_value);
                });
                midCol.sort(function(a,b) {return a.home_value - b.home_value});
                rightCol.sort(function(a,b) {
                    return Utils.compare(a.away_value, b.away_value) || Utils.compare(a.home_value, b.home_value);
                });
                break;
        }

        return [leftCol, midCol, rightCol];
    };


    /**
     * @ngdoc method
     * @name reorderMarketEvents
     * @methodOf vbet5.service:GameInfo
     * @description change market events (listed in marketsPreDividedByColumns variable in center.js and virtualSports.js) order for 2 & 3 columns view
     * @param {Object} market the market Object
     * @param {String} type the market's type
     * @returns {Array} array of virtual sport ids
     */
    GameInfo.reorderMarketEvents = function reorderMarketEvents(market, type) {
        var columns = GameInfo.divideIntoColumns(market, type);
        var leftCol = columns[0],
            midCol = columns[1],
            rightCol = columns[2];

        market.events = [];
        var length;

        if (market.col_count === 3) {
            length = Math.max(leftCol.length, rightCol.length, midCol.length);
            for(var i = 0; i < length; i++) {
                leftCol[i] = leftCol[i] || {id: -(i * 3), is_empty: true};
                leftCol[i].order = i * 3;

                midCol[i] = midCol[i] || {id: -(i * 3 + 1), is_empty: true};
                midCol[i].order = i * 3 + 1;

                rightCol[i] = rightCol[i] || {id: -(i * 3 + 2), is_empty: true};
                rightCol[i].order = i * 3 + 2;

                market.events.push(leftCol[i]);
                market.events.push(midCol[i]);
                market.events.push(rightCol[i]);
            }
        } else {
            rightCol.push.apply(rightCol, midCol);
            length = Math.max(leftCol.length, rightCol.length);
            for(var j = 0; j < length; j++) {
                leftCol[j] = leftCol[j] || {id: -(j * 2), is_empty: true};
                leftCol[j].order = j * 2;

                rightCol[j] = rightCol[j] || {id: -(j * 2 + 1), is_empty: true};
                rightCol[j].order = j * 2 + 1;

                market.events.push(leftCol[j]);
                market.events.push(rightCol[j]);
            }
        }
    };


    return GameInfo;
}]);

