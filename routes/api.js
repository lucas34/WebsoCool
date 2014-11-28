var express = require('express');
var router = express.Router();
var chat = require('../lib/websocool');

/* GET users listing. */
router.get('/polling', function(req, res) {
  chat.createRoom('hello');
  res.send(chat.getListOfRooms());
});

router.get('/long-polling', function(req, res) {
  res.send('respond with a resource');
});

router.get('/websocket', function(req, res) {
  res.send('respond with a resource');
});


module.exports = router;
