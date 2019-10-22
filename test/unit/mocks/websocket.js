'use strict';

angular.module('vbet5.Mocks', [])
    //------------------------------------  Websocket --------------------------------------------
    .factory('WS', ['$q', '$rootScope', function ($q) {
        var WS = {};
        var connection;
        var res;
        var listeners = [];
        var onClose = null;
        WS.isAvailable = true;
        var failForNextRequestCode    = null;
        WS.invalidSessionRespForNextRequest = false;
        WS.failForNextRequestWithCode = function (code) {
            failForNextRequestCode = code;
        };
        WS.connect = function () {
            connection = $q.defer();
            res = connection.promise;
            if (WS.isAvailable) {
                connection.resolve(true);
            } else {
                connection.reject(false);
            }
            return res;
        };
        WS.addSubscriptionListener = function (callback) {
            listeners.push(callback);
        };
        WS.sendRequest = function (request) {
            return WS.connect().then(function () {
                console.log('Mock send request', request);
                var defer = $q.defer();
                var response = {};

                if (request.command === 'get') {
                    response = {"rid": "2", code: 0, "data": {"subid": "8187027007754353648", "data": {"sport": {"846": {"alias": "IceHockey", "name_id": 49, "name": "Ice Hockey", "id": 846}, "844": {"alias": "Soccer", "name_id": 4, "name": "Soccer", "id": 844}, "850": {"alias": "Basketball", "name_id": 1978, "name": "Basketball", "id": 850}, "852": {"alias": "Volleyball", "name_id": 2613, "name": "Volleyball", "id": 852}, "848": {"alias": "Tennis", "name_id": 1591, "name": "Tennis", "id": 848}}}}};
                    //@TODO:  emulate update message with $timeout when request.params.subscribe===true
                    // angular.forEach(listeners, function(callback){callback({data:...})});
                }
                if (request.command === 'login') {
                    response = {code: 0, data: {auth_token: 'aaa'} };
                }
                if (request.command === 'unsubscribe') {
                    response = {code: 0, data: null };
                    console.log(response);
                }
                if (failForNextRequestCode && request.command !== 'request_session') {
                    response.code = failForNextRequestCode;
                    failForNextRequestCode = null;
                }

                if (request.command === 'request_session') {
                    if (WS.invalidSessionRespForNextRequest) {
                        WS.invalidSessionRespForNextRequest = false;
                        response = {rid: "1", code: 0, data: {invalidsid: "a31c70ae-5113-11e3-8000-08606ed77687"}};
                    } else {
                        response = {rid: "1", code: 0, data: {sid: "a31c70ae-5113-11e3-8000-08606ed77687"}};
                    }

                }
                console.log('Mock response:', response);
                defer.resolve({data: response});
                return defer.promise;
            });
        };
        WS.setOnCloseCallback = function (callback) {
            onClose = callback;
        };
        return WS;
    }])
    //------------------------------------  Config --------------------------------------------
    .value('Config', {
        'main': {
            site_id: '1'
        },
        'env': {
            lang: 'eng'
        },
        'swarm': {
            url: "http://test/",
            websocket: "ws://something/",
            useWebSocket: true
        }
    });


