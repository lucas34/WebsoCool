var communicator = new function () {
    var self = this;

    self.method = new function() {
        var self = this;
        var interval_id = null;

        var clear = function () {
            if(interval_id !== null) {
                clearInterval(interval_id);
            }

            interval_id = null;
        };

        self.polling = function () {
            interval_id = setInterval(function() {
                $.ajax({
                    type: "GET",
                    url: "/api/messages/polling",
                    data: { last_update: self.last_update }
                }).done(function(data) {
                    self.last_update = data.date;

                    self.onMessage(data.from, data.chat, data.content)
                });
            }, 10000); // 10s
        };

        self.long_polling = function () {
            var infinity = function() {
                $.ajax({
                    type: "GET",
                    url: "/api/messages/long-polling",
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
        };

        self.websocket = function () {
            // TODO
        };
    }();

    self.last_update = 0;
    self.user = null;
    self.rooms = [];

    self.switchTo = function (method) {
        method();
    };

    self.authenticate = function (name) {
        $.ajax({
            type: "POST",
            url: "/api/authenticate",
            data: { name: name }
        }).done(function(data) {

            user = data
        });
    };

    self.createUser = function (name) {
        $.ajax({
            type: "POST",
            url: "/api/create/user",
            data: { name: name }
        }).done(function(data) {

            console.log(data);
            if(data.id !== -1) {
                self.user = {
                    id: data.id,
                    name: name
                };
            }
        });
    };

    self.createRoom = function (name) {
        if(self.user !== null) {
            $.ajax({
                type: "POST",
                url: "/api/create/room",
                data: { name: name, user: self.user.id }
            }).done(function(data) {

                if(data.id !== -1) {
                    rooms.push({
                        id: data.id,
                        name: name
                    });
                }
            });
        }
    };

    self.onMessage = function (from_id, chat_id, content) {
        console.log("Dans le chat <" + chat_id + "> L'utilisateur <" + from_id + "> a écrit : " + content);
    }
}();