var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chat = require('./lib/websocool');

var routes = require('./routes/index');
var api = require('./routes/api');

var app = express();
var server = app.listen(7070);
var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// --------- Socket ------------
(function() {
    io.on('connection', function (socket) {
        socket.on('subscribe', function (data) {
            var user = chat.getUser(data.user);

            if (user !== undefined) {

                chat.subscribe(user.id, function (room, message) {

                    if (user.rooms[room.id] !== undefined) {
                        socket.emit('message', message.simplify());
                    }
                });
            }
        });

        socket.on('unsubscribe', function (data) {
			console.log("J'unsubscribbe ; "+data);
            var user = chat.getUser(data.user);

            if (user !== undefined) {
				console.log("le user : "+user);
                chat.unsubscribe(user.id);
            }
        });
    });

}());
// --------- Socket ------------

module.exports = app;
