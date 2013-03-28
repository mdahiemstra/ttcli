const mongoose = require('mongoose'),
      _ = require('underscore');

mongoose.connect('mongodb://localhost/ttcli');

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