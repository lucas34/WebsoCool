var communicator = new function () {
    var self = this;

    var method_factory = function (start, stop) {
        return {
            'start': start,
            'stop': stop,
        }
    }

    var polling = method_factory(
        function () {

        },
        function () {

        });

    var long_polling = method_factory(
        function () {

        },
        function () {

        });

    var push = method_factory(
        function () {

        },
        function () {

        });

    var start = function () { }
    var stop = function () { }

    this.changeTo = function (method) {
        stop();

        stop = method.stop();
        start = method.start();

        start();
    }

    this.onMessage = function (json) {

    }
}();