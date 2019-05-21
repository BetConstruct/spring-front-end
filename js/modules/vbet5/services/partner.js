/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:partner
 * @description partner integration helper service
 *
 */
VBET5.service('partner', ['$rootScope', '$window', '$location', '$document', 'Config', 'Storage', 'AuthData', 'DomHelper', 'Zergling', 'GameInfo', function ($rootScope, $window, $location, $document, Config, Storage, AuthData, DomHelper, Zergling, GameInfo) {
    'use strict';
    var partner = {};

    function addBetToExternalBetslip(event, data) {
        console.log('addBetToExternalBetslip', event, data);
        $window.parent.postMessage({action: GameInfo.isEventInBetSlip(data.event) ? 'remove_bet' : 'add_bet', data: data}, '*');
    }

    /**
     * Inactivity detect and call
     */
    partner.inactivityTimer = 0;

    /**
     * Reset inactivity timer on mouse click
     */
    function mouseupInactivity() {
        partner.inactivityTimer = 0;
    }

    /**
     * Update inactivity timer
     */
    function countInactivity() {
        partner.inactivityTimer++;

        if (partner.inactivityTimer >= Config.partner.inactivityCallbackTime) {
            partner.inactivityTimer = 0;
            partner.call('userInactive', {});
            console.log('Auto Logout callback triggered');
        }
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf vbet5.service:partner
     * @description initializes the service.
     * gets the callback function from parent frame
     * and sets htmlHelper object in parent scope for parent to be able to control iframe app
     */
    partner.init = function init() {
        if (Config.partner.documentDomain) {
            try {
                if (Config.partner.documentDomain === true) {
                    $window.document.domain = $window.location.hostname.split(/\./).slice(1).join(".");
                } else {
                    $window.document.domain = Config.partner.documentDomain;
                }
            } catch (e) {
                console.warn(e);
            }
        }
        if (Config.main.customSportsBook.enabled) {
            if ($location.search().noprematch) {
                Config.main.customSportsBook.classic.showPrematch = false;
            }
            if ($location.search().nolive) {
                Config.main.customSportsBook.classic.showLive = false;
            }
            if ($location.search().nomarkets) {
                Config.main.customSportsBook.classic.showMarkets = false;
            }
            if ($location.search().nobetslip) {
                Config.main.customSportsBook.classic.showBetSlip = false;
            }
        }
        if (Config.main.customSportsBook.externalBetSLip) {
            DomHelper.onMessage(function (message) {
                if (message.data && message.data.action && message.data.action === 'remove_bet') {
                    $rootScope.$broadcast('removeBet', {eventId: message.data.eventId});
                }
            });
            $rootScope.$on('bet', addBetToExternalBetslip);
        }

        if ($location.search().callbackName) {
            try {
                var callbackFunc = $window.parent[$location.search().callbackName];
                if (callbackFunc && typeof callbackFunc === 'function') {
                    partner.callbackFn = callbackFunc;
                }
            } catch (e) {
                console.warn(e);
            }
            if (Config.partner.notifyOnResize) {
                DomHelper.onContentheightChange(function (height, width, offsetHeight) {
                    partner.call('windowSize', {height: height, width: width, offsetHeight: offsetHeight});
                }, Config.partner.notifyOnResize === true ? undefined : Config.partner.notifyOnResize);
                DomHelper.onBodyHeightChange(function (height) {
                    partner.call('bodyHeight', height);
                }, Config.partner.notifyOnResize === true ? undefined : Config.partner.notifyOnResize);
            }
        }
        // user can login by specifying auth data in URL, like   /#/sport/?&AuthToken=9e132e8d4e55a3fb35caaa399e68913a26c80fbb11ac332da95fd1afebfb3d4e&UserId=431181588
        var authToken = $location.search().AuthToken;
        var userId = $location.search().UserId;
        if (authToken && authToken.length > 1 && ((userId && userId.length > 0) || Config.partner.allowNoUserId) && authToken.toLowerCase() !== 'anonymous') {
            AuthData.integrationMode = true;
            Config.env.integrationMode = true;
            var authDataVal = {auth_token: authToken};
            if (userId) {
                authDataVal.user_id = Config.partner.allowStringUserId ? userId : parseInt(userId, 10);
            }
            AuthData.set(authDataVal);
        }
        if ($location.search().oddsType) {
            Storage.set('oddFormat', $location.search().oddsType);
            Config.env.oddFormat = $location.search().oddsType;
        }
        try {
            $window.getZergling = function () {
                return {Zergling: Zergling};
            };
            $window.parent.htmlHelper = {
                /**
                 * Switch to live or pre-match
                 * @param {String} page 'live' or 'prematch'
                 */
                switchTo: function switchTo(page) {
                    switch (page) {
                        case 'live':
                            $rootScope.$broadcast('setGamesType', true);
                            break;
                        case 'prematch':
                            $rootScope.$broadcast('setGamesType', false);
                            break;
                        default:
                            break;
                    }
                },
                /**
                 *  Returns page location
                 * @returns {String} location
                 */
                getSportsbookUrl: function getSportsbookUrl() {
                    return $window.location.href;
                },
                /**
                 * Sets odds type
                 * @param {String} type one of 'decimal' , 'fractional' or 'american'
                 */
                setOddsType: function setOddsType(type) {
                    $rootScope.$broadcast('setOddsFormat', type);
                },
                /**
                 * Opens specified slider tab
                 * @param {String} what tab name ('mygames', 'history')
                 */
                open: function open(what) {
                    $rootScope.$broadcast('open.' + what);
                }
            };

        } catch (e) {
            console.warn(e);
        }

        /**
         * Init user inactivity detection
         */
        if (Config.partner.inactivityCallbackTime) {
            $document.on('mouseup', mouseupInactivity);
            setInterval(countInactivity, 1000);
        }
    };

    /**
     * @ngdoc method
     * @name call
     * @methodOf vbet5.service:partner
     * @description calls the callback function provided by partner
     *
     * @param {String} type callback type (like 'balance', etc..)
     * @param {Object} data data object
     */
    partner.call = function call(type, data) {
        console.log('partner', type, data);
        if (partner.callbackFn) {
            partner.callbackFn(type, data);
        } else if (Config.main.integrationMode) {
            try {
                $window.parent.postMessage({
                        type: type,
                        value: data
                    },
                    '*');
            }
            catch (e) {
                console.log(e);
            }
        }
    };

    /**
     * @ngdoc method
     * @name handleGameClick
     * @methodOf vbet5.service:partner
     * @description Handle game click
     *
     * @param {Object} game
     * @param {Object} competition
     * @param {Number} sportId Sport ID
     */
    partner.handleGameClick = function handleLive(game, competition, sportId) {
        $window.parent.postMessage({action: 'open_game', data: {gameId: game.id, competitionId: competition.id, regionId: competition.region.id, sportId: sportId}}, '*');
    };

    return partner;
}]);
