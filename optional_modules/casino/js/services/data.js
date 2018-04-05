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

    var DATA_URL = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/casino/' : CConfig.dataUrl;

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

    /**
     * @ngdoc method
     * @name getGames
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of games
     *
     * @param {string} category the games category
     * @param {string} provider the games provider
     * @param {int} from start index
     * @param {int} to end index
     * @param {string} searchCommand the term of search
     * @param {array} restrictedGamesIds the ids of restricted games
     * @param {array} gameIds the games ids
     * @param {array} gameExternalIds the games external ids
     * @param {string} countryCode the code of user's country
     *
     * @returns {Object} promise
     */
    casinoData.getGames = function getGames(category, provider, countryCode,  from, to, searchCommand, restrictedGamesIds, gameIds, gameExternalIds) {
        var dataUrl = DATA_URL + 'getGames?partner_id=' + Config.main.site_id + '&lang=' + Config.env.lang;

        category !== null && category !== 'all' && (dataUrl += '&category=' + category);
        provider !== null && provider !== 'all' && provider !== undefined && (dataUrl += '&provider=' + provider);
        countryCode && (dataUrl += '&country=' + countryCode);
        from !== undefined && from !== null && (dataUrl += '&offset=' + from);
        to !== undefined && to !== null && (dataUrl += '&limit=' + to);
        searchCommand && (dataUrl += '&search=' + searchCommand);

        if (restrictedGamesIds && restrictedGamesIds.length) {
            for (var i = 0, length = restrictedGamesIds.length; i < length; i += 1) {
                dataUrl += '&except[]=' + restrictedGamesIds[i];
            }
        }

        gameIds !== undefined && gameIds !== null && (dataUrl += '&id=' + gameIds.join());
        gameExternalIds !== undefined && gameExternalIds !== null && (dataUrl += '&external_id=' +gameExternalIds.join());

        return $http.get(dataUrl);
    };

    /**
     * @ngdoc method
     * @name getOptions
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of options (categiry and provider list)
     *
     * @param {string} countryCode user's country code id
     * @returns {Object} promise
     */
    casinoData.getOptions = function getOptions(countryCode) {
        return $http.get(DATA_URL + 'getOptions?partner_id=' + Config.main.site_id + (countryCode && ('&country=' + countryCode) || ''));
    };

    casinoData.getJackpotGames = function getJackpotGames () {
        return $http.get(DATA_URL + 'getJeckpots?partner_id=' + Config.main.site_id)
    };

    casinoData.getCasinoGameDetails = function getCasinoGameDetails(game_skin_id) {
        return $http.get(DATA_URL + 'getSkinGameDesc?game_skin_id=' + game_skin_id);
    };

    casinoData.getDraw = function getDraw() {
      return $http.get(Config.main.drawDataUrl);
    };

    casinoData.getGameWinners = function getGameWinners() {
        return $http.get(DATA_URL + 'getGameWinners?site_id=' + Config.main.site_id);
    };

    return casinoData;
}]);