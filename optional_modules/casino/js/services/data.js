/**
 * @ngdoc service
 * @name CASINO.service:casinoData
 * @description
 * provides methods for getting content from casino server
 */
CASINO.service('casinoData', ['CConfig', 'Config', 'WPConfig', 'content', '$http', function (CConfig, Config, WPConfig, content, $http) {
    'use strict';

    // maybe it's not a good idea keeping this in $http, but it's needed in $http.post
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";

    var casinoData = {};

    var DATA_URL = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/casino/' : CConfig.dataUrl;
    var WP_URL = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/json' : WPConfig.wpUrl;


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
     * @typedef {Object} data
     * @property {string} category
     * @property {string} provider
     * @property {string} country
     * @property {number} offset
     * @property {number} limit
     * @property {string} search
     * @property {Array} id
     * @property {Array} external_id
     * @property {Array} restrictedGamesIds
     * @property {string} additionalParams
     *
     * @returns {Object} promise
     */
    casinoData.getGames = function getGames(data) {
        var dataUrl = DATA_URL + 'getGames?partner_id=' + Config.main.site_id + '&lang=' + Config.env.lang;

        Object.keys(data).forEach(function(key) {
           if (data.hasOwnProperty(key) && data[key] !== undefined && data[key] !== null) {
               switch (key) {
                   case "restrictedGamesIds":
                       for (var i = 0, length = data.restrictedGamesIds.length; i < length; i += 1) {
                           dataUrl += '&except[]=' + data.restrictedGamesIds[i];
                       }
                       break;
                   case "id":
                   case "external_id":
                       dataUrl += '&' + key + "=" + data[key].join();
                       break;
                   case "additionalParams":
                       dataUrl += data[key];
                       break;
                   case "category":
                   case "provider":
                       if (data[key] !== "all") {
                           dataUrl += '&' + key + "=" + data[key];
                       }
                       break;
                   default:
                       dataUrl += '&' + key + "=" + data[key];
               }
           }
        });

        return $http.get(dataUrl);
    };

    /**
     * @ngdoc method
     * @name getOptions
     * @methodOf CASINO.service:casinoData
     * @description returns promise which will be resolved  with the list of options (categiry and provider list)
     *
     * @param {string} countryCode user's country code id
     * @param {string} categoryId categoryId
     * @param {string} providerName providerName
     * @param {string} playerId
     * @param {string} onlyRecommendedCategory
     * @returns {Object} promise
     */
    casinoData.getOptions = function getOptions(countryCode, categoryId, providerName, playerId, onlyProviders) {
        return $http.get(DATA_URL + 'getOptions?partner_id=' + Config.main.site_id + (countryCode && ('&country=' + countryCode) || '') + (categoryId && ('&categories=' + categoryId) || '') + (providerName && ('&providers=' + providerName + '&only_categories=1') || '') + (playerId ? ('&player_id=' + playerId) : '') + (onlyProviders ? '&only_providers=1' : '') + ('&lang=' + Config.env.lang));
    };

    casinoData.getJackpotGames = function getJackpotGames (jackpotId, provider, from, to) {
        if(jackpotId || provider){
            var dataUrl = DATA_URL + 'getJackpotGames?partner_id=' + Config.main.site_id + (jackpotId && ('&jackpot_id=' + jackpotId) || '') +  (provider && ('&provider=' + provider) || '');
            from !== undefined && from !== null && (dataUrl += '&offset=' + from);
            to !== undefined && to !== null && (dataUrl += '&limit=' + to);

            return $http.get(dataUrl);
        }else{
            return $http.get(DATA_URL + 'getJeckpots?partner_id=' + Config.main.site_id);
        }

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

    casinoData.getJackpotBanners = function getJackpotBanners() {
        return $http.get(WP_URL + '/getJackpotBanners?lang=' + Config.env.lang);
    };

    casinoData.getTournamentGames = function getTournamentGames(tournamentId, offset, limit, withImages) {
        return $http.get(DATA_URL + 'getTournamentGames?partner_id=' + Config.main.site_id + (tournamentId && ('&tournament_id=' + tournamentId) || '') + (offset && ('&offset=' + offset) || '') + (limit && ('&limit=' + limit) || '') + (withImages ? '&with=images' : ''));
    };


    casinoData.getPageOptions = function getPageOptions(scope, withBackgrounds) {
        var url = WP_URL + '/getPageOptions?partner_id=' + Config.main.site_id + '&type=live-casino';
        $http.get(url, {cache: true}).then(function (data) {
            if (data && data.data && data.data.options) {
                scope.pageOptions = data.data.options;
                scope.halfPadding = scope.pageOptions.g_container_gaps === '0' ? 0 : scope.pageOptions.g_container_gaps / 2 + 'px';
            }
        }, function (e) {
            console.log('Failed to load page options');
        });

        if (withBackgrounds) {
            content.getPage('live-casino-backgrounds-' + Config.env.lang).then(function (data) {
                if (data && data.data && data.data.page) {
                    scope.pageBackgrounds = data.data.page;
                }
            }, function (e) {
                console.log('Failed to load page backgrounds');
            });
        }

    };

    return casinoData;
}]);
