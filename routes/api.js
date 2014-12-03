var express = require('express');
var router = express.Router();
var chat = require('../lib/websocool');

/* GET users listing. */
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
  var user = chat.getUser(req.user);
  var last_update = req.query.last_update;

  if ((user === undefined) || (last_update === undefined)) {
    res.send(null);
  }
  else {
    var messages = [];
    user.rooms.forEach(function (room) {
      messages = messages.concat(chat.getListOfMessage(room, last_update));
    });

    if (messages.length > 0) {
      res.send(messages);
    }
    else {
      chat.onMessage[user.id] = function (message) {
        req.send([message]);
        req.end();
      }
    }
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

router.post('/create/room', function(req, res) {
  var name = req.body.name;
  if(name !== undefined) {
    var room = chat.createRoom(name);
    res.send({ id : room.id });
  }
  else {
    res.send(null);
  }
});

router.post('/post/message', function(req, res) {
  var content = req.body.content;
  var user = req.body.user;
  var room = req.body.room;

  if ((content === undefined) || (user === undefined) || (room === undefined)) {
    res.send(null);
  }
  else {
    res.send(chat.postMessage(user, room, content));
  }
});


module.exports = router;
