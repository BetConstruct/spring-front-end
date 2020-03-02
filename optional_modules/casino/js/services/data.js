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
     * @param {string} category the games category
     * @param {string} provider the games provider
     * @param {int} from start index
     * @param {int} to end index
     * @param {string} searchCommand the term of search
     * @param {array} restrictedGamesIds the ids of restricted games
     * @param {array} gameIds the games ids
     * @param {array} gameExternalIds the games external ids
     * @param {string} countryCode the code of user's country
     * @param {String} additionalParams
     *
     * @returns {Object} promise
     */
    casinoData.getGames = function getGames(category, provider, countryCode,  from, to, searchCommand, restrictedGamesIds, gameIds, gameExternalIds, additionalParams) {
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
        additionalParams && (dataUrl += additionalParams);

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
        return $http.get(DATA_URL + 'getOptions?partner_id=' + Config.main.site_id + (countryCode && ('&country=' + countryCode) || '') + (categoryId && ('&categories=' + categoryId) || '') + (providerName && ('&providers=' + providerName + '&only_categories=1') || '') + (playerId ? ('&player_id=' + playerId) : '') + (onlyProviders ? '&only_providers=1' : ''));
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
