var communicator = new function () {
    var self = this;
    var socket = io.connect('http://localhost:5000');

    self.method = new function(communicator) {
        var self = this;
        var interval_id = null;

        var clear = function () {
            if(interval_id !== null) {
                clearInterval(interval_id);
            }

            socket.emit('unsubscribe', { id : user.id });

            interval_id = null;
        };

        (function () {
            socket.on('init', function (messages) {
                messages.forEach(function (message) {
                    communicator.onMessage(message.from, room, message.content)
                });
            });

            socket.on('message', function (message) {
                communicator.onMessage(message.from, room, message.content)
            });
        })(); // Socket init

        self.polling = function () {
            clear();

            interval_id = setInterval(function() {
                rooms.forEach(function(room) {
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
            }, 1000); // 10s
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

            socket.emit('subscribe', { id : user.id });
        };
    }(self);

    self.last_update = 0;


    /*
     *	@Deprecated
     *
     self.rooms.push({
     id: 0,
     name: "Master room"
     });
     /*
     * New method :
     * rooms.push(new room(id, "name"));
     */



    /*
     *
     *	API Event : protocols
     *
     */

    self.defineMethodTransfert = function (method) {
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

    /*
     *
     * API Event : SEND
     *
     */

    self.createUser = function (name) {
        $.ajax({
            type: "POST",
            url: "/api/create/user",
            data: { name: name }
        }).done(function(data) {
            if(data.id !== -1) {
                user.id = data.id;
                user.name = name;
            }
        });
    };

    self.sendMessage = function (content, room) {
        room = room || { id: 0};

        if(user.id !== null) {
            $.ajax({
                type: "POST",
                url: "/api/post/message",
                data: { content: content, user: user.id, room: room.id }
            }).done(function(data) {
                console.log(data.successful ? "ok" : "fail");
            });
        }
    };


    self.createRoom = function (name) {
        if(user.id !== null) {
            $.ajax({
                type: "POST",
                url: "/api/create/room",
                data: { name: name, user: user.id }
            }).done(function(data) {
                if(data !== null) {
                    console.log(data);
                    var r = new room(data.id, name);
                    rooms.push(r);
                    view.room.add(r.id,name,false);
                }
            });
        }
    };


    (function () {
        var last_update = 0;

        setInterval(function() {
            $.ajax({
                type: "GET",
                url: "/api/users",
                data: { last_update: last_update, user: user.id }
            }).done(function(data) {
                last_update = data.date;

                data.users.forEach(function (user) {
                    communicator.onNewUser(user);
                });
            });
        }, 10000);
    })();

    (function () {
        var last_update = 0;

        setInterval(function() {
            $.ajax({
                type: "GET",
                url: "/api/rooms",
                data: { last_update: last_update }
            }).done(function(data) {
                last_update = data.date;

                data.rooms.forEach(function (room) {
                    communicator.onNewRoom(room);
                });
            });
        }, 10000);
    })();

    /*
     *
     * API Event : Receive
     *
     */

    self.onMessage = function (from_id, chat_id, content) {
        view.message.add(from_id,content,chat_id);
    };

    self.onNewUser = function (user, room) {
        // TODO
    };

    self.onNewRoom = function (room) {
        // TODO
    };

    self.onExitRoom = function (user, room) {
        // TODO
    };


}();
