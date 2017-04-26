/**
 * @ngdoc service
 * @name CASINO.service:casinoData
 * @description
 * provides methods for getting content from casino server
 */
CASINO.service('casinoData', ['CConfig', 'Config', '$http', function (CConfig, Config, $http) {
    'use strict';

    // maybe it's not a good idea keeping this in $http, but it's needed in $http.post
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";

    var casinoData = {};

    //var lang = $rootScope.env.lang;

    /**
     * @ngdoc method
     * @name getAllGames
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with list of all games
     *
     * @param {string} partnerID. id of partner to get all games
     * @returns {Object} promise
     */
    casinoData.getAllGames = function getAllGames(partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {action: 'allgames', partnerID: partnerID});
    };

    /**
     * @ngdoc method
     * @name getAllMiniGames
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with list of all mini games
     *
     * @param {string} partnerID. id of partner to get all games
     * @returns {Object} promise
     */
    casinoData.getAllMiniGames = function getAllMiniGames(partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {action: 'bycat', param: 'Mini Games', partnerID: partnerID});
    };

    /**
     * @ngdoc method
     * @name getAction
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with list of current action
     *
     * @param {string} action. action
     * @param {string} partnerID. id of partner to get categories
     * @returns {Object} promise
     */
    casinoData.getAction = function getAction(action, partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {action: action, partnerID: partnerID});
    };

    /**
     * @ngdoc method
     * @name getCategory
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved with Category containing games
     *
     * @param {string} partnerID. id of partner to get category
     * @param {string} categoryId. id of Category to get category games
     * @returns {Object} promise
     */
    casinoData.getCategory = function getCategory(categoryId, partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {
            action: 'bycat',
            param: categoryId,
            partnerID: partnerID
        });
    };

    /**
     * @ngdoc method
     * @name getSearchResult
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of researching game results
     *
     * @param {string} searchCommand search term
     * @param {string} partnerID. id of partner
     * @returns {Object} promise
     */
    casinoData.getSearchResult = function getSearchResult(searchCommand, partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {
            action: 'searchGame',
            searchQ: searchCommand,
            partnerID: partnerID
        });
    };

    /**
     * @ngdoc method
     * @name getFilterOptions
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of all games and filtering options
     *
     * @returns {Object} promise
     */
    casinoData.getFilterOptions = function getFilterOptions() {
        return $http.post(CConfig.cUrlPrefix + CConfig.cUrl, {action: 'getGamesJson'});
    };

    /**
     * @ngdoc method
     * @name getJackpotLeadersList
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of leaders
     *
     * @param {string} partnerID. id of partner
     * @returns {Object} promise
     */
    casinoData.getJackpotLeadersList = function getJackpotLeadersList(partnerID) {
        return $http.post(CConfig.cUrlPrefix + CConfig.jackpot.url, {partnerID: partnerID});
    };

    /* used for getting data from cms */
    casinoData.getGames = function getGames(category, provider, from, to, searchCommand, restrictedGamesIds, gameIds, gameExternalIds) {
        var dataUrl = CConfig.dataUrl + 'getGames?partner_id=' + Config.main.site_id;
        if (category !== null && category !== 'all') {
            dataUrl += '&category=' + category;
        }
        if (provider !== null && provider !== 'all' && provider !== undefined) {
            dataUrl += '&provider=' + provider;
        }
        if (from !== undefined && from !== null) {
            dataUrl += '&offset=' + from;
        }
        if (to !== undefined && to !== null) {
            dataUrl += '&limit=' + to;
        }
        if (searchCommand) {
            dataUrl += '&search=' + searchCommand;
        }
        if (restrictedGamesIds && restrictedGamesIds.length) {
            for (var i = 0, length = restrictedGamesIds.length; i < length; i += 1) {
                dataUrl += '&except[]=' + restrictedGamesIds[i];
            }
        }
        if (gameIds !== undefined && gameIds !== null) {
            dataUrl += '&id=' + gameIds.join();
        }
        if(gameExternalIds !== undefined && gameExternalIds !== null) {
            dataUrl += '&external_id=' +gameExternalIds.join();
        }
        return $http.get(dataUrl);
    };

    casinoData.getOptions = function getOptions() {
        return $http.get(CConfig.dataUrl + 'getOptions?partner_id=' + Config.main.site_id);
    };

    casinoData.getJackpotGames = function getJackpotGames () {
        return $http.get(CConfig.dataUrl + 'getJeckpots?partner_id=' + Config.main.site_id)
    };

    casinoData.getCasinoGameDetails = function getCasinoGameDetails(game_skin_id) {
        return $http.get(CConfig.dataUrl + 'getSkinGameDesc?game_skin_id=' + game_skin_id);
    };

    casinoData.getDraw = function getDraw() {
      return $http.get(Config.main.drawDataUrl);
    };

    casinoData.getGameWinners = function getGameWinners() {
        return $http.get(CConfig.dataUrl + 'getGameWinners?site_id=' + Config.main.site_id);
    };

    return casinoData;
}]);