/**
 * Module dependencies
 */
 'use strict';
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
//var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var logger = require("./app/module/logger");

/**
 * Express Configuration
 */
var port = 4142;
// view engine setup for template based
// uncomment if you need a view engine (Jade, EmbeddedJS)
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log('--------------------------Hello!!!!!------------------------------');
});

app.set('secretAdmin', 'Hz2ur*kDCfk*mhzdaCU3yJCPw');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// remove this for production
app.set('env', 'development');
// Cross origin:

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Content-type, Accept, X-Access-Token, X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


// Static
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'public')));

// Bower static - Uncomment for use
app.use('bower_components', express.static(__dirname + 'client/bower_components'));

/**
 * Socket.io
 */

io.on('connection', function(socket) {
    console.log('a client connected');
    socket.on('disconnect', function() {
        console.log('client disconnected');
    });
});

app.set('socketio', io);

/**
 * Routes requirements & use
 */
var admin = require('./app/routes/admin');
var adminAPI = require('./app/routes/adminAPI');
var apiv1 = require('./app/routes/apiv1');

app.use('/', admin);
app.use('/api/admin', adminAPI);
app.use('/api/v1', apiv1);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * Error handlers
 */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});
server.listen(port, function() {
    logger.info("Listening on port :: " + port);
});
