module.exports = new function () {
    var self = this;

    var user_id = 0;
    var room_id = 1;

    // Inner... classes?! #sexyjs
    var User = function () {
        var self = this;
        var prototype = User.prototype;

		// Variable of instance
        self.id = user_id++;
        self.creation = null;
        self.name = null;
        self.rooms = [];

        // Method of prototype
        prototype.writeMessage = function (content) {
            var message = new Message();

            message.from = self;
            message.creation = Date.now();
            message.content = content;

            return message;
        };

        prototype.simplify = function () {
            return {
                id: self.id,
                name: self.name
            }
        };
    };

    var Message = function () {
        var self = this;
        var prototype = Message.prototype;

        // Variable of instance
        self.from = null; // user
        self.creation = null; // creation date
        self.content = "";
        self.room = null;

        // Method of prototype
        prototype.postTo = function (room) {
            self.room = room;
            room.postMessage(self);

            return self;
        };

        prototype.simplify = function () {
            return {
                from: self.from.id,
                creation: self.creation,
                content: self.content,
                room: self.room.id
            }
        }
    };

    var Room = function () {
        var self = this;
        var prototype = Room.prototype;

        // Variable of instance
        self.id = room_id++;
        self.creation = null;
        self.name = null;
        self.participants = []; // list of users connected to this rooms
        self.messages = []; // list of messages

        // Method of prototype
        prototype.addParticipant = function (user) {
            self.participants.push(user);
            user.rooms.push(self);
        };

        prototype.postMessage = function (message) {
            self.messages.push(message);
        };

        prototype.getMessagesOrigin = function (origin) {
            var res = [];

            self.messages.forEach(function(message) {
                if(origin < message.creation) {
                    res.push(message.simplify);
                }
            });

            return res;
        };

        prototype.simplify = function () {
            var messages = [];
            var participants = [];

            self.messages.forEach(function (message) {
                messages.push(message.simplify);
            });

            self.participants.forEach(function (participant) {
                participants.push(participant.simplify);
            });


            return {
                id: self.id,
                name: self.name,
                messages: messages,
                participants: participants
            }
        };
    };

    // Inner method
    var createUser = function (name) {
        var user = new User();

        user.name = name;
        user.creation = Date.now();


        return user;
    };

    var createRoom = function (name) {
        var room = new Room();

        room.name = name;
        room.creation = Date.now();

        return room;
    };

    // Variable of instance
    var rooms = {}; // lists rooms
    var users = {}; // lists rooms

    // Method of prototype
    self.createUser = function (name) {
        var user = createUser(name);

        rooms[0].addParticipant(user);
        users[user.id] = user;

        return user;
    };

    self.createRoom = function (name) {
        var room = createRoom(name);

        rooms[room.id] = room;

        return room;
    };

    self.postMessage = function (user_id, room_id, content) {
        var user = users[user_id];
        var room = rooms[room_id];


        if ((user === undefined) || (room === undefined))
            return null;

		
        message = user.writeMessage(content).postTo(room);

		console.log(message);

		/*
		 *	id de quoi ? > User (Un user est associé à un callback
		 */
        for(var id in self.onMessage) {
       	   self.onMessage[id](message.simplify);
        }

        return message;
    };

    self.getListOfMessage = function (room_id, origin) {
        var room = rooms[room_id];
        var date = Date.now();

        if (room === undefined)
            return null;

        return {
            date: date,
            messages: room.getMessagesOrigin(origin)
        };
    };

    self.getListOfRooms = function () {
        return rooms;
    };

    self.getListOfRoomsFrom = function (from, user_id) {
        var res = [];
        var user = self.getUser(user_id);
        var date = Date.now();

        if (user === undefined)
            return [];

        user.rooms.forEach(function (room) {
            if(from < room.creation) {
                res.push(room);
            }
        });

        return {
            date: date,
            rooms: res
        };
    };

    self.getListOfUsersFrom = function (from) {
        var res = [];
        var date = Date.now();

        users.forEach(function (user) {
            if(from < user.creation) {
                res.push(message.simplify);
            }
        });

        return {
            date: date,
            users: res
        };
    };

    self.getListOfUserRooms = function (user_id) {
        var user = self.getUser(user_id);

        if (user === undefined)
            return [];

        return user.rooms;
    };

    self.getUser = function (id) {
        return users[id];
    };

    self.getRoom = function (id) {
        return rooms[id];
    };

    self.onMessage = {};
    rooms[0] = new Room(); // Main room
}();
