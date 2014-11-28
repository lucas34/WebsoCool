var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/polling', function(req, res) {
  res.send('respond with a resource');
});

router.get('/long-polling', function(req, res) {
  res.send('respond with a resource');
});

router.get('/websocket', function(req, res) {
  res.send('respond with a resource');
});


module.exports = router;
