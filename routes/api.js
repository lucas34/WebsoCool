var express = require('express');
var router = express.Router();
var chat = require('../lib/websocool');

/* GET messages listing. */
router.get('/messages/polling', function(req, res) {
  var room = req.query.room;
  var last_update = req.query.last_update;

  if ((room === undefined) || (last_update === undefined)) {
    res.send(null);
  }
  else {
    res.send(chat.getListOfMessage(room, last_update));
  }
});

router.get('/messages/long-polling', function(req, res) {
  var user = req.query.user;
  var room = req.query.room;
  var last_update = req.query.last_update;

  if ((user === undefined) || (room === undefined) || (last_update === undefined)) {
    res.send(null);
  }
  else {
    var current = chat.getListOfMessage(room, last_update);
    if(current.messages.length === 0) {
      chat.subscribe(user, function (room, message) {
        chat.unsubscribe(user);
        res.send({
          date: message.creation,
          messages: [message.simplify()]
        })
      });
    }
    else {
      res.send(current);
    }
  }
});

/* Get new rooms & users */
router.get('/rooms', function(req, res) {
  var user = req.query.user;

  if (user === undefined) {
    res.send(null);
  }
  else {
    res.send(chat.getListOfRoomsByUser(user));
  }
});

router.get('/users', function(req, res) {
  var last_update = req.query.last_update;

  if (last_update === undefined) {
    res.send(null);
  }
  else {
    res.send(chat.getListOfUsersInRoomsFrom(last_update));
  }
});

/* Create room, user & message */
router.post('/create/room', function(req, res) {
  var name = req.body.name;

  console.log("ici");

  if(name !== undefined) {
    console.log("la");
    var room = chat.createRoom(name);
    res.send({ id : room.id });
  }
  else {
    res.send(null);
  }
});

router.post('/create/user', function(req, res) {
  var name = req.body.name;

  if(name !== undefined) {
    var user = chat.createUser(name);
    res.send({ id : user.id });
  }
  else {
    res.send(null);
  }
});

router.post('/post/user', function(req, res) {
  var user = req.body.user;
  var room = req.body.room;

  if ((user === undefined) || (room === undefined)) {
    res.send({ successful: false});
  }
  else {
    chat.addUserInRoom(user, room);
    res.send({ successful: true});
  }
});


router.post('/post/message', function(req, res) {
  var content = req.body.content;
  var user = req.body.user;
  var room = req.body.room;

  if ((content === undefined) || (user === undefined) || (room === undefined)) {
    res.send({ successful: false });
  }
  else {
    chat.postMessage(user, room, content);
    res.send({ successful: true });
  }
});


module.exports = router;
