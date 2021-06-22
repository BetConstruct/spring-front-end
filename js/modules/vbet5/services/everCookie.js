/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:analytics
 * @description
 * google analytics
 */
VBET5.service('everCookie', ['$rootScope', '$http', 'Config', 'AuthData', function ($rootScope, $http, Config, AuthData) {
    'use strict';

    var evercookie = {};

    function generateCookie () {
        function randHex (length) {
            var id = [];
            for (var i = 0; i < length * 2; i++) {
                id[i] = Math.random() * 16 | 0;
            }
            return id.map(function(v) {return v.toString(16)}).join('');
        }

        return btoa(JSON.stringify({
            "id": randHex(16),
            "ts": +new Date()
        }));
    }

    evercookie.init = function () {
        var ec = new Evercookie(Config.everCookie.options);
        try{
            Fingerprint2.getPromise().then(function() {
                evercookie.fingerPrint = Fingerprint2.authenticationCode;

                ec.get("afec", function(value) {
                    if (value) {
                        evercookie.value = value;
                    } else {
                        evercookie.value = generateCookie();
                        ec.set("afec", evercookie.value);
                    }
                    /* $rootScope.$on('$routeChangeSuccess', function(ev, currentRoute, prevRoute) {
                         var ref = prevRoute && prevRoute.$$route && prevRoute.$$route.originalPath;
                         evercookie.log({ref: ref});
                     });
                     evercookie.log();*/
                });
            });
        } catch(error) {

        }

    };


   /* evercookie.log = function(data) {
        data = data || {};
        try {
            var cookieObj = JSON.parse(atob(evercookie.value));
            var msg = {
                partnerId: parseInt(Config.main.site_id) || 0,
                url: window.location.href,
                source: parseInt(Config.main.source) || 0,
                sessionToken: AuthData.getAuthToken() || "",
                sessionStart: 0,
                cookieId: cookieObj.id,
                cookieTs: cookieObj.ts,
                referrer: data.ref || document.referrer,
                clientId: ($rootScope.profile && $rootScope.profile.id) || 0,
                fingerprint: evercookie.fingerPrint
            };
            var kafkaMsg = evercookie.getMessageJson(msg);
            // console.log("******************", cookieObj, msg, kafkaMsg);
            evercookie.postToKafka(kafkaMsg);
        } catch (err) {
            console.error(err);
        }
    };*/

    /*evercookie.postToKafka = function(msg) {
        var req = {
            method: 'POST',
            url: Config.everCookie.afecUrl,
            headers: {
                "Content-Type": "application/vnd.kafka.avro.v2+json",
                "Accept": "application/vnd.kafka.v2+json"
            },
            data: JSON.stringify(msg)
        };

        $http(req).then(
            function(response){
                console.log("ok", response);
            },
            function(response){
                console.log("not ok", response);
            }
        );
    };*/

    /*evercookie.getMessageJson = function(data) {
        return {
            "key_schema": JSON.stringify({
                "name": "cookieId",
                "type": "string"
            }),
            "value_schema": JSON.stringify({
                "type": "record",
                "name": "ClientActivity",
                "namespace": "com.betconstruct.antifraud.avro",
                "fields": [
                    {
                        "name": "partnerId",
                        "type": "int"
                    },
                    {
                        "name": "url",
                        "type": "string"
                    },
                    {
                        "name": "source",
                        "type": "int"
                    },
                    {
                        "name": "sessionToken",
                        "type": "string"
                    },
                    {
                        "name": "sessionStart",
                        "type": "long"
                    },
                    {
                        "name": "fingerprint",
                        "type": "string"
                    },
                    {
                        "name": "cookieId",
                        "type": "string"
                    },
                    {
                        "name": "cookieTs",
                        "type": "long"
                    },
                    {
                        "name": "referrer",
                        "type": "string"
                    },
                    {
                        "name": "clientId",
                        "type": "int"
                    },
                    {
                        "name": "data",
                        "type": {
                            "type": "map",
                            "values": "string"
                        }
                    }
                ]
            }),
            "records": [{
                "key": data.cookieId,
                "value": {
                    "partnerId": data.partnerId,
                    "url": data.url,
                    "source": data.source,
                    "sessionToken": data.sessionToken,
                    "sessionStart": data.sessionStart,
                    "sessionId": 0,
                    "fingerprint": data.fingerprint || "",
                    "cookieId": data.cookieId,
                    "cookieTs": data.cookieTs,
                    "referrer": data.referrer,
                    "clientId": data.clientId,
                    "data": {}
                }
            }]
        };
    };*/

    return evercookie;

}]);


//btoa/atob polyfill - TODO: move to separate file
(function () {

    var object =
        typeof exports !== 'undefined' ? exports :
            typeof self !== 'undefined' ? self : // #8: web workers
                $.global; // #31: ExtendScript

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function InvalidCharacterError(message) {
        this.message = message;
    }
    InvalidCharacterError.prototype = new Error;
    InvalidCharacterError.prototype.name = 'InvalidCharacterError';

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
        object.btoa = function (input) {
            var str = String(input);
            for (
                // initialize result and counter
                var block, charCode, idx = 0, map = chars, output = '';
                // if the next str index does not exist:
                //   change the mapping table to "="
                //   check if d has no fractional digits
                str.charAt(idx | 0) || (map = '=', idx % 1);
                // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
                output += map.charAt(63 & block >> 8 - idx % 1 * 8)
            ) {
                charCode = str.charCodeAt(idx += 3/4);
                if (charCode > 0xFF) {
                    throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
                }
                block = block << 8 | charCode;
            }
            return output;
        });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
        object.atob = function (input) {
            var str = String(input).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
            if (str.length % 4 == 1) {
                throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = str.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        });

}());
