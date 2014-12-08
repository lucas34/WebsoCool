var communicator = new function () {
    var self = this;
    var socket = io.connect('http://localhost:7070');

    var start_session = function () {

        (function () {
            var last_update = 0;

            var check_room = function () {
                $.ajax({
                    type: "GET",
                    url: "/api/rooms",
                    data: {last_update: last_update, user: user.id}
                }).done(function (data) {
                    last_update = data.date;

                    data.rooms.forEach(function (room) {
                        communicator.onNewRoom(room);
                    });
                });
            };

            check_room();

            setInterval(function () {
                check_room();
            }, 5000);

        })();

        (function () {
            var last_update = 0;

            var check_user = function () {
                $.ajax({
                    type: "GET",
                    url: "/api/users",
                    data: {last_update: last_update}
                }).done(function (data) {
                    last_update = data.date;

                    data.users.forEach(function (user) {
                        communicator.onNewUser(user, 0);
                    });
                });
            };

            check_user();

            setInterval(function () {
                check_user();
            }, 5000);
        })();
    };

    self.method = new function(communicator) {
        var self = this;
        var pending = {};
        var interval_id = null;

        var clear = function () {
            if(interval_id !== null) {
                clearInterval(interval_id);
            }

            pending = {};

            socket.emit('unsubscribe', { id : user.id });

            interval_id = null;
        };

        (function () {
            socket.on('message', function (message) {
                communicator.onMessage(message.from, {  id : message.room }, message.content)
            });
        })(); // Socket init

        self.polling = function () {
            clear();

            interval_id = setInterval(function() {
                rooms.forEach(function(room) {
                    $.ajax({
                        type: "GET",
                        url: "/api/messages/polling",
                        data: { last_update: communicator.last_update, room: room.id }
                    }).done(function(data) {
                        communicator.last_update = data.date;

                        data.messages.forEach(function(message) {
                            communicator.onMessage(message.from, room, message.content)
                        });
                    });
                });
            }, 5000); // 1s
        };

        self.long_polling = function () {
            clear();

            interval_id = setInterval(function() {
                rooms.forEach(function (room) {
                    if (pending[room.id] === undefined) {
                        pending[room.id] = function (room) {
                            $.ajax({
                                type: "GET",
                                url: "/api/messages/long-polling",
                                data: {last_update: communicator.last_update, room: room.id, user: user.id}
                            }).done(function (data) {
                                communicator.last_update = data.date;

                                data.messages.forEach(function(message) {
                                    communicator.onMessage(message.from, room, message.content)
                                });
                            }).always(function () {
                                if (pending[room.id]) {
                                    pending[room.id](room);
                                }
                            });
                        };

                        pending[room.id](room);
                    }
                });
            }, 10000);
        };

        self.websocket = function () {
            clear();

            socket.emit('subscribe', { user : user.id });
        };
    }(self);

    self.last_update = 0;

    /*
     *
     * API Event : SEND
     *
     */

    self.createUser = function (name, method) {
        if(user.id === undefined) {
            $.ajax({
                type: "POST",
                url: "/api/create/user",
                data: { name: name }
            }).done(function(data) {
                if(data.id !== -1) {
                    user.id = data.id;
                    user.name = name;
                    method();
                }
                start_session();
            });
        }
    };

    self.sendMessage = function (content, room) {
        room = room || 0;

        if(user.id !== null) {
            $.ajax({
                type: "POST",
                url: "/api/post/message",
                data: { content: content, user: user.id, room: room }
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
                    console.log("ok");
                }
            });
        }
    };


    /*
     *
     * API Event : Receive
     *
     */

    self.onMessage = function (from_id, chat_id, content) {
        view.message.add(from_id, chat_id, content);
    };

    self.onNewUser = function (user, room) {
        view.user.add(user);
        view.user.addInRoom(user,room);
    };

    self.onNewRoom = function (room) {
        rooms.push(room);
        view.room.add(room);
    };

    self.onExitRoom = function (user, room) {
        view.user.removeInRoom(user,room);
    };


};
