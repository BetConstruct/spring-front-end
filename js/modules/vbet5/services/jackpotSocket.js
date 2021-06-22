/**
 * @ngdoc service
 * @name VBET5.service:jackpotSocket
 * @description
 * provides methods for getting content from casino server
 */
VBET5.service('jackpotSocket', ['$rootScope', 'Config', function ($rootScope, Config) {
    'use strict';
    var jackpotSocket = {};
    var socket = null;
    var socketPreloadMessages = null;
    var stack = [];

    var uri = Config.main.jackpot ? Config.main.jackpot.socketUrl : null;

    var callbacks = {};

    function getRequestId() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }


    function initConnection() {
        if (socket || !uri) {
            return;
        }
        socketPreloadMessages = [];
        socket = new WebSocket(uri);
        socket.onopen = function (event) {
            if (socketPreloadMessages) {
                var i, messages = socketPreloadMessages;
                socketPreloadMessages = null;
                for (i = 0; i < messages.length; i++) {
                    jackpotSocket.msg(messages[i].command, messages[i].data, messages[i].callback, messages[i].requestId);
                }
            }
        };
        socket.onclose = function () {
            stack.forEach(function (value, key) {
                socket = null;
                socketPreloadMessages = null;
                jackpotSocket.msg(value.command, value.data, value.callback, value.requestId);
                stack.slice(key, 1);
            });
        };

        socket.onmessage = function (event) {
            if (event && event.data) {
                var data = JSON.parse(event.data);
                if (data.Status === 1 && callbacks[data.RequestId] && callbacks[data.RequestId]) {
                    callbacks[data.RequestId](data.Data);
                }
            }

        };
        socket.onerror = function (event) {
            console.log("Casino Socket Error: " + event.data);
        };
    }

    jackpotSocket.msg = function msg(command, data, callback, requestId) {
        data = data || {};

        if ($rootScope.profile && $rootScope.profile.unique_id) {
            data.PlayerId = parseInt($rootScope.profile.unique_id, 10);
        }
        data.PartnerId = parseInt(Config.main.site_id, 10);

        if (socket && socket.readyState === socket.CLOSING) {
            stack.push({
                command: command,
                data: data,
                requestId: requestId,
                callback: callback
            });
            return requestId;
        }
        if (socket && socket.readyState === socket.CLOSED) {
            jackpotSocket.close();
            stack.push({
                command: command,
                data: data,
                requestId: requestId,
                callback: callback
            });
            return requestId;
        }

        initConnection();
        requestId = requestId || getRequestId();
        if (socketPreloadMessages) {
            socketPreloadMessages.push({
                command: command,
                data: data,
                requestId: requestId,
                callback: callback
            });
            return requestId;
        }

        callbacks[requestId] = callback;
        var request = {
            Command: command,
            Data: data,
            RequestId: requestId
        };
        socket && socket.send(JSON.stringify(request));
        return requestId;
    };

    jackpotSocket.get = function get(command, data, callback) {
      return jackpotSocket.msg(command, data, callback);
    };

    jackpotSocket.subscribe = function subscribe(data, callback) {
        return jackpotSocket.msg('subscribe', data, callback);
    };

    jackpotSocket.unsubscribe = function unsubscribe(sId, data, callback) {
        jackpotSocket.msg('unsubscribe', data || null, callback, sId);
    };

    jackpotSocket.close = function close() {
        if (socket) {
            socket.close();
            socket = null;
            socketPreloadMessages = null;
        }
    };

    return jackpotSocket;
}]);
