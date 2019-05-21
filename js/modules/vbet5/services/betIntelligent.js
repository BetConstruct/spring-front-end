/* global VBET5 */

/**
 * @ngdoc service
 * @name vbet5.service:BetIntelligent
 */
VBET5.service('BetIntelligent', ['$rootScope', '$http', 'Config', 'Utils', function betService($rootScope, $http, Config, Utils) {
    'use strict';

    var BetIntelligent = {};

    var AVAILABLE_USERS = {
        11818649: true, // elzatester
        1920613: true, // ashotAmd
        11528944: true //geotest
    };

    var eventDisabledKeys = {
        'c_arjel_code': true,
        'm_arjel_code': true
    };

    BetIntelligent.storeBetInfo = function storeBetInfo(betInfo) {

        if (AVAILABLE_USERS[$rootScope.profile.id]) {
            var data = {events: []};
            for (var i = 0; i < betInfo.events.length; i++) {
                var event = betInfo.events[i];
                data.events[i] = {};
                for (var key in event) {
                    if (event.hasOwnProperty(key) && !eventDisabledKeys[key]) {
                        data.events[i][key] = event[key];
                    }
                }
            }
            data.bet_id = betInfo.bet_id;
            data.k = betInfo.k;
            data.type = betInfo.type;
            data.is_superbet = betInfo.is_superbet;
            data.IsLive = betInfo.IsLive;
            data.user_id = $rootScope.profile.id;

            $http({
                    method: 'POST',
                    url: Config.betIntelligentAPIUrl,
                    data: {ai: data}
                }).then(function(result) {
                    console.log(result);
            }, function (reason) {
                console.log(reason);
            });
        }
    };

    return BetIntelligent;
}]);
