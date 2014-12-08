module.exports = new function () {
    var self = this;

    // Variable of instance
    var user_id = 0;
    var room_id = 0;
    var rooms = {}; // lists rooms
    var users = {}; // lists rooms
    var subscription = {};

    // Inner... classes?! #sexyjs
    var User = function () {
        var self = this;

        // Variable of instance
        self.id = user_id++;
        self.creation = null;
        self.name = null;
        self.rooms = {};
    };

    // Method of prototype
    User.prototype.writeMessage = function (content) {
        var message = new Message();

        message.from = this;
        message.creation = Date.now();
        message.content = content;

        return message;
    };

    User.prototype.simplify = function () {
        return {
            id: this.id,
            name: this.name
        }
    };

    var Message = function () {
        var self = this;

        // Variable of instance
        self.from = null; // user
        self.creation = null; // creation date
        self.content = "";
        self.room = null;
    };

    // Method of prototype
    Message.prototype.postTo = function (room) {
        this.room = room;
        room.postMessage(this);

        return this;
    };

    Message.prototype.simplify = function () {
        return {
            from: this.from.id,
            creation: this.creation,
            content: this.content,
            room: this.room.id
        }
    };

    var Room = function () {
        var self = this;

        // Variable of instance
        self.id = room_id++;
        self.creation = null;
        self.name = null;
        self.participants = []; // list of users connected to this rooms
        self.messages = []; // list of messages
    };

    // Method of prototype
    Room.prototype.addParticipant = function (user) {
        this.participants.push(user);
        user.rooms[this.id] = this;
    };

    Room.prototype.postMessage = function (message) {
        this.messages.push(message);
        message.room = this;

        self.onMessage(this, message);
    };

    Room.prototype.getMessagesOrigin = function (origin) {
        var res = [];

        this.messages.forEach(function(message) {
            if(origin < message.creation) {
                res.push(message.simplify());
            }
        });

        return res;
    };

    Room.prototype.simplify = function () {
        var messages = [];
        var participants = [];

        this.messages.forEach(function (message) {
            messages.push(message.simplify());
        });

        this.participants.forEach(function (participant) {
            participants.push(participant.simplify());
        });


        return {
            id: this.id,
            name: this.name,
            messages: messages,
            participants: participants
        }
    };
    // end of JS #sexy_inner_class

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

        for (var key in user.rooms) {
            room = user.rooms[key];
            if (from < room.creation) {
                res.push(room.simplify());
            }
        }

        return {
            date: date,
            rooms: res
        };
    };

    self.getListOfUsersFrom = function (from) {
        var res = [];
        var date = Date.now();

        for (var key in users) {
            user = users[key];
            if (from < user.creation) {
                res.push(user.simplify());
            }
        }

        return {
            date: date,
            users: res
        };
    };

    self.getUser = function (id) {
        return users[id];
    };

    self.getRoom = function (id) {
        return rooms[id];
    };

    self.onMessage = function(room, message) {
        room.participants.forEach(function (user) {
            if(subscription[user.id]) {
                subscription[user.id](room, message);
            }
        });
    };

    self.subscribe = function(user, callback) {
      subscription[user] = callback;
    };

    self.unsubscribe = function(user) {
        delete subscription[user];
    };

    self.createRoom("Master room"); // Main room
}();
