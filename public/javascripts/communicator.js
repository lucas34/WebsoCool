var communicator = new function () {
    var self = this;

    var method = new function() {
        var self = this;

        self.polling = 0;
        self.long_polling = 1;
        self.websocket = 2;
    }();

    self.method = method;
    self.last_update = 0;

    var interval_id = null;
    self.switchTo = function(method_id) {
        (function () {
            if(interval_id !== null) {
                clearInterval(interval_id);
            }

            interval_id = null;
        })();

        if(method_id === method.polling) {
            interval_id = setInterval(function() {
                $.ajax({
                        type: "GET",
                        url: "/api/polling",
                        data: { last_update: self.last_update }
                        }).done(function(data) {
                        self.last_update = data.date;

                        self.onMessage(data.from, data.chat, data.content)
                });
            }, 10000); // 10s
        }


        if(method_id === method.long_polling) {
            var infinity = function() {
                $.ajax({
                    type: "GET",
                    url: "/api/long-polling",
                    data: { last_update: self.last_update }
                }).done(function(data) {
                    self.last_update = data.date;

                    self.onMessage(data.from, data.chat, data.content);
                    infinity();
                }).fail(function (){
                    infinity();
                });
            };

            infinity();
        }

        if(method_id === method.websocket) {
        }
    };

    self.onMessage = function (from_id, chat_id, content) {
        console.log("Dans le chat <" + chat_id + "> L'utilisateur <" + from_id + "> a écrit : " + content);
    }
}();