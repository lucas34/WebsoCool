var communicator = new function () {
    var self = this;
    var socket = io.connect('http://localhost:7070');
    var check_room_timeout = 1000;
    var check_user_timeout = 1000;
    var rooms_state = {};

    var start_session = function () {

        (function () {

            var isOnLoadRoom = false;
            var isOnLoadUser = false;

            var check_room = function () {
                $.ajax({
                    type: "GET",
                    url: "/api/rooms",
                    data: {user: user.id}
                }).done(function (data) {
                    if(data.length == 0) return;
                    data.forEach(function (room) {
                        if(rooms[room.id] === undefined) {
                            rooms.push(room);
                            rooms_state[room.id] = {};
                            communicator.onNewRoom(room);
                        }
                    });
                }).always(function () {
                    isOnLoadRoom = false;
                });
            };

            last_update_user = 0;
            var check_user = function () {
                $.ajax({
                    type: "GET",
                    url: "/api/users",
                    data: {}
                }).done(function (data) {

                    data.forEach(function (userInRoom) {
                        var room = rooms_state[userInRoom.room.id];

                        if(room !== undefined) {
                            if(room[userInRoom.user.id] === undefined) {
                                room[userInRoom.user.id] = true;
                                communicator.onNewUser(userInRoom.user, userInRoom.room.id);
                            }
                        }
                    });
                }).always(function () {
                    isOnLoadUser = false;
                });
            };

            setInterval(function () {
                if(!isOnLoadRoom && !isOnLoadUser){
                    isOnLoadRoom = true;
                    isOnLoadUser = true;

                    check_room();
                    check_user();

                }
            }, check_user_timeout);

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

            socket.emit('unsubscribe', { user : user.id });

            interval_id = null;
        };

        (function () {
            socket.on('message', function (message) {
                communicator.onMessage(message.from, message.room, message.content)
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
                            communicator.onMessage(message.from, room.id, message.content)
                        });
                    });
                });
            }, 1000); // 1s
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
                                    communicator.onMessage(message.from, room.id, message.content)
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
                    $.ajax({
                        type: "POST",
                        url: "/api/post/user",
                        data: { room: 0, user: user.id }
                    })
                }
                start_session();
            });
        }
    };

    self.sendMessage = function (content, room) {

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
                data: { name: name }
            }).done(function(data) {
                if(data.id !== undefined) {
                    self.addUserInRoom(user, data);
                }
            });
        }
    };

    self.addUserInRoom = function (user, room) {
        $.ajax({
            type: "POST",
            url: "/api/post/user",
            data: { room: room.id, user: user.id }
        }).done(function(data) {
            if(data.successful) {
                console.log("cool");
            }
        });
    }


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
        view.room.add(room);
    };

    self.onExitRoom = function (user, room) {
        view.user.removeInRoom(user,room);
    };


};
