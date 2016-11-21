var http = require('http');
var querystring = require('querystring');
var danApp = require('./dan_modules/danApp');
var url = require('url');
var request = require('request');
var SERVER_SUBDOMAIN = 'connectqastg';
var SERVER = 'http://'+SERVER_SUBDOMAIN+'.mheducation.com';
var HOST = SERVER_SUBDOMAIN+'.mheducation.com';
var OPENAPI_HOST = 'openapidev2.mheducation.com';
var settings = danApp.config();

settings.app.get('/connectconfig*', function (req, res) {
    var img = SERVER + req.originalUrl;
    request(img).pipe(res);
});
settings.app.get('/productconfig*', function (req, res) {  
    var img = SERVER' + req.originalUrl; s
    request(img).pipe(res);
});
settings.app.get('/sites*', function (req, res) {
    var img = SERVER + req.originalUrl;
    request(img).pipe(res);
});
settings.app.get('/connectweb*', function (req, response) {
    var img = SERVER + req.originalUrl;
    request(img).pipe(response);
});
settings.app.get('/openapi*', function (req, response) {
    var img = SERVER + req.path + '?oauth_consumer_key=connect_oauth_key';
    request(img).pipe(response);
});
settings.app.post('/openapi/*', function (req, response) {
    var postData = '';

    req.on('data', function (data) {
        postData += data;
    });
    req.on('end', function () {
        handleRemoteRequest(OPENAPI_HOST, req, response, postData);
    });
});
settings.app.post('/connectconfig/*', function (req, response) {
    var postData = '';

    req.on('data', function (data) {
        postData += data;
    });
    req.on('end', function () {
        handleRemoteRequest(HOST, req, response, postData);
    });
});
var handleRemoteRequest = function (host, req, response, postData) {
    console.log('posting remote ...');

    var options = {
        host: host,
        path: req.path + '?oauth_consumer_key=connect_oauth_key',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    callback = function (res) {
        var str = '';

        res.on('data', function (chunk) {
            str += chunk;
        });

        res.on('end', function () {
            response.send(str);
        });
    }
    var postRequest = http.request(options, callback);
    postRequest.write(postData);
    postRequest.end();
};



http.createServer(settings.app).listen(settings.app.get('port'), function () {
    console.log("Express server listening on port " + settings.app.get('port'));
});