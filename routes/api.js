var express = require('express');
var router = express.Router();
var chat = require('../lib/websocool');

/* GET users listing. */
router.get('/messages/polling', function(req, res) {
  res.send(chat.getListOfRooms());
});

router.get('/messages/long-polling', function(req, res) {
  res.send('respond with a resource');
});

router.get('/messages/websocket', function(req, res) {
  res.send('respond with a resource');
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

  res.send('respond with a resource');
});



module.exports = router;
