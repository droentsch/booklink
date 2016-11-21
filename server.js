var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var compress = require('compression');
var app = express();
var http = require('http');
var querystring = require('querystring');
var url = require('url');
var request = require('request');
var multer = require('multer');

app.set('port', process.env.PORT || 4452);
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(compress({
    threshold: 512
}));

app.use("/app", express.static(path.join(__dirname, '/public/app')));

var HOST = 'dev2';

app.get('/index.html', function(req, res) {
    res.sendFile('/index.html', { root: __dirname }),
        function(err) {
            if (err) {
                console.log(err.message);
                res.status(500).end();
            } else {
                console.log('Got index.html');
            }
        }
});
app.get('/opener.html', function(req, res) {
    res.sendFile('/opener.html', { root: __dirname }),
        function(err) {
            if (err) {
                console.log(err.message);
                res.status(500).end();
            } else {
                console.log('Got opener.html');
            }
        }
});
app.get('/opener.tfn.html', function(req, res) {
    res.sendFile('opener.tfn.html', { root: __dirname }),
        function(err) {
            if (err) {
                console.log(err.message);
                res.status(500).end();
            } else {
                console.log('Got opener.tfn.html');
            }
        }
});
app.get('/uploads/:name', function(req, res) {
    res.sendFile('/uploads/' + req.params.name, { root: __dirname }),
        function(err) {
            if (err) {
                console.log(err.message);
                res.status(500).end();
            } else {
                console.log(req.params.name);
            }
        }
});
app.get('/connectconfig/*', function(req, res) {
    var img = 'http://connect' + HOST + '.mheducation.com' + req.originalUrl;

    console.log('url: ' + img);
    request(img).pipe(res);
});

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})

var uploader = multer({ storage: storage });

app.post('/connectconfig/restservices/controller/ebook/action/uploadResource', uploader.single('file'), function(req, res) {
    console.log('file uploaded: ' + req.file.originalname);
    var retval = {
        resourceId: '100024',
        resourceURL: '/uploads/' + req.file.originalname
    };
    res.send(JSON.stringify(retval)).end();
});
app.post('/connectconfig/restservices/controller/ebook/action/saveEbook', function(req, response) {
    var postData = '';

    req.on('data', function(data) {
        postData += data;
    });
    req.on('end', function() {
        console.log('POST to connect...');
        handleRemoteRequest('connect' + HOST + '.mheducation.com', req, response, postData);
    });
});
var handleRemoteRequest = function(host, req, response, postData) {
    console.log('going remote ...');

    var options = {
        host: host,
        path: req.path + '?oauth_consumer_key=connect_oauth_key',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    callback = function(res) {
        var str = '';

        res.on('data', function(chunk) {
            str += chunk;
        });

        res.on('end', function() {
            response.send(str);
        });
    }
    var postRequest = http.request(options, callback);
    postRequest.write(postData);
    postRequest.end();
};

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});