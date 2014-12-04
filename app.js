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
var io = require('socket.io').listen(5000);

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

// error handlers

// development error handler
// will print stacktrace
/*
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
*/
// --------- Socket ------------
(function() {
    io.on('connection', function (socket) {
        socket.on('subscribe', function (data) {
            var user = chat.getUser(data.user);

            if (user !== undefined) {
                var messages = [];
                user.rooms.forEach(function (room) {
                    room.messages.forEach(function (message) {
                        messages.push(message);
                    });
                });

                chat.onMessage[user.id] = function (message) {
                    var room = message.room;

                    if (user.rooms.contains(room)) {
                        socket.emit('message', message);
                    }
                };

                socket.emit('init', messages);
            }
        });

        socket.on('unsubscribe', function (data) {
            var user = chat.getUser(data.user);
            if (user !== undefined) {
                delete chat.onMessage[user.id];
            }
        });
    });

}());

// --------- Socket ------------

app.listen(7070);

module.exports = app;
