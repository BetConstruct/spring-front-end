VBET5.service('covid19Socket',[function () {
    var socket = null;
    this.init = function init(callback) {
        socket = io("https://casino-service-dev-ws.bcsocial.net/covid");
        socket.on('disconnect', function () {
            console.log('disconnect client event....');
        });
        socket.on("connect", function () {
            callback();
        });
    };

    this.close = function () {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    };

    this.subscribe = function subscribe(command, callback) {
        socket.emit(command, {subscribe: true}, callback);

    };

}]);
