var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require("mongodb").MongoClient;
var logger = require("./logger");

var dbPort = 27017,
    dbHost = 'localhost',
    dbName = 'worldofcrew';

//Setup the Connection to mongo database
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {
    auto_reconnect: true
}), {
    w: 1
});

db.open(function(error, data) {
    if (error) {
        logger.error("Ther was a error connecting to MongoDB :: " + error);
    } else {
        logger.info("connected to database now :: " + dbName);
    }
});

module.exports = db;
