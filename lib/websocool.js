module.exports = new function () {
    var self = this;

    var user_id = 0;
    var room_id = 0;

    // Inner... classes?! #sexyjs
    var User = function () {
        var self = this;
        var prototype = User.prototype;

        // Variable of instance
        self.id = user_id++;
        self.name = null;

        // Method of prototype
        prototype.isAnonymous = function () {
            return self.name === null;
        };

        prototype.writeMessage = function (content) {
            var message = new Message();

            message.from = self;
            message.creation = Date.now();
            message.content = content;

            return message;
        };
    };

    var Message = function () {
        var self = this;
        var prototype = Message.prototype;

        // Variable of instance
        self.from = null; // user
        self.creation = null; // creation date
        self.content = "";

        // Method of prototype
        prototype.isAnonymous = function () {
            return self.name === null;
        };

        prototype.postTo = function (room) {
            room.postMessage(self);
        };
    };

    var Room = function () {
        var self = this;
        var prototype = Room.prototype;

        // Variable of instance
        self.id = room_id++;
        self.name = null;
        self.participants = []; // list of users connected to this rooms
        self.messages = []; // list of messages

        // Method of prototype
        prototype.isMain = function () {
            return self.name === null;
        };

        prototype.addParticipant = function (user) {
            self.participants.push(user);
        };

        prototype.postMessage = function (message) {
            self.messages.push(message);
        };
    };

    // Inner method
    var createUser = function (name) {
        var user = new User();

        user.name = name;


        return user;
    };

    var createRoom = function (name) {
        var room = new Room();

        room.name = name;

        return room;
    };

    // Variable of instance
    var rooms = []; // lists rooms


    // Method of prototype
    self.createUser = function (name) {
        var user = createUser(name);

        rooms[0].addParticipant(user);

        return user;
    };

    self.createRoom = function (name) {
        var room = createRoom(name);

        rooms.push(room);

        return room;
    };

    self.getListOfRooms = function () {
        return rooms;
    };

    rooms.push(new Room()); // Main room
}();
