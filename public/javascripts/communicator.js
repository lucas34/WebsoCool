var communicator = new function () {
    var self = this;

    self.method = new function(communicator) {
        var self = this;
        var interval_id = null;

        var clear = function () {
            if(interval_id !== null) {
                clearInterval(interval_id);
            }

            interval_id = null;
        };

        self.polling = function () {
            clear();
            interval_id = setInterval(function() {
                communicator.rooms.forEach(function(room) {
                    $.ajax({
                        type: "GET",
                        url: "/api/messages/polling",
                        data: { last_update: communicator.last_update, room: room['id'] }
                    }).done(function(data) {
                        communicator.last_update = data.date;

                        data.messages.forEach(function(message) {
                            communicator.onMessage(message.from, room, message.content)
                        });
                    });
                });
            }, 10000); // 10s
        };

        self.long_polling = function () {
            clear();
            var infinity = function() {
                $.ajax({
                    type: "GET",
                    url: "/api/messages/long-polling",
                    data: { last_update: self.last_update }
                }).done(function(data) {
                    self.last_update = data.date;

                    communicator.onMessage(data.from, data.chat, data.content);
                    infinity();
                }).fail(function (){
                    infinity();
                });
            };

            infinity();
        };

        self.websocket = function () {
            clear();
            // TODO
        };
    }(self);

    self.last_update = 0;
    self.rooms = [];

    self.rooms.push({
        id: 0,
        name: "L'amour est dans le pré"
    });

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

            if(data.id !== -1) {
                user.id = data.id,
                user.name = name
            }
           
        });
    };

    self.createRoom = function (name) {
        if(user.id !== null) {
            $.ajax({
                type: "POST",
                url: "/api/create/room",
                data: { name: name, user: user.id }
            }).done(function(data) {
                if(data !== null) {
                    self.rooms.push({
                        id: data.id,
                        name: name
                    });
                }
            });
        }
    };

    self.sendMessage = function (content, room) {
        room = room || { id: 0};

        if(user.id !== null) {
            $.ajax({
                type: "POST",
                url: "/api/post/message",
                data: { content: content, user: user, room: room.id }
            }).done(function(data) {
                if(data !== null) {
                    console.log("ok");
                }
            });
        }
    };

    self.onMessage = function (from_id, chat_id, content) {
		view.message.add(from_id,content,chat_id);

        console.log("Dans le chat <" + chat_id + "> L'utilisateur <" + from_id + "> a écrit : " + content);
    }
}();
