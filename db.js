const mongoose = require('mongoose')
    , _        = require('underscore')
    , config   = require('./config');

mongoose.connect('mongodb://'+config.mongo.hostname+'/'+config.mongo.database,
                 config.mongo.username ? {user: config.mongo.username, pass: config.mongo.password} : false);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
});

var models = {};

_.extend(models, {'Log': mongoose.model('Log', mongoose.Schema({
    project: String,
    time: String,
    message: String,
    date: { type: Date, default: Date.now},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    removed: { type: Boolean, default: false }
}))});

_.extend(models, {'User': mongoose.model('User', mongoose.Schema({
    name: String
}))});

module.exports = models;