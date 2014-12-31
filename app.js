var express = require('express');
var path = require('path');
var logger = require('morgan');
var RED = require("node-red");
var http = require('http');
var poller = require("./modules/poller");
var favicon = require('serve-favicon');
var request = require('request');


var app = express();

app.use(logger('dev'));
app.use(favicon(__dirname + '/public/images/favicon.gif'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'rednodes')));
app.use("/bower_components", express.static(path.join(__dirname, 'bower_components')));

var nodeRedSettings = {
    httpAdminRoot:"/red",
    httpNodeRoot: "/api",
    userDir: path.join(__dirname, 'usernodes'),
    nodesDir: path.join(__dirname, 'rednodes'),
    verbose: true
};

var server = http.createServer(app);

// Initialise the runtime with a server and settings
RED.init(server,nodeRedSettings);

// Serve the editor UI from /red
app.use(nodeRedSettings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(nodeRedSettings.httpNodeRoot,RED.httpNode);

app.use('/ruter', function(req, res) {
  var url = "http://reisapi.ruter.no" + req.url;
  req.pipe(request(url)).pipe(res);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
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

poller.startAll();

server.listen(8000, "0.0.0.0");

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err);
});


// Start the runtime
RED.start();


module.exports = app;
