var danApp = function () {
    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var compress = require('compression');
    var app = express();

    var settings = {};

    var config = function () {
        app.set('port', process.env.PORT || 4455);
        //app.use(bodyParser.json());
//        app.use(bodyParser.urlencoded({
//            extended: true
//        }));
        app.use(compress({
            threshold: 512
        }));

        app.use("/public", express.static(path.join(__dirname, '../public')));        

        settings.app = app;

        return settings;
    };

    return {
        config: config
    };
}();

module.exports = danApp;