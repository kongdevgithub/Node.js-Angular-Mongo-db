/**
 * Module dependencies
 */
var db = require('../module/databaseManager');
var collection = db.collection('airlines');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var Airline = function(data) {
  this.data = data;
};

/**
 * Static methods
 */

// Find all users
Airline.findAll = function(callback) {
  collection.find().toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a user - id is a string
Airline.findOne = function(id, callback) {
  var self = this;
  collection.findOne({
    $or: [{
      _id: ObjectID.createFromHexString(id)
    }, {
      fbId: id
    }]
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Update a user - user object has a ObjectID
Airline.updateOne = function(airline, update, callback) {
    updateNew = {
        airline: update.airline,
        updated: new Date()
    }
  collection.updateOne({
    _id: ObjectID.createFromHexString(airline._id)
  }, {
    $set: updateNew
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a airline - airline object has a ObjectID
Airline.removeOne = function(airline, callback) {
  collection.deleteOne({
    _id: ObjectID.createFromHexString(airline)
}).then(function(result) {
    // console.log(result);
    callback(null, {
      delete: 1,
      airline: airline
    });
  }).catch(function(err) {
      console.log(err);
    callback(err);
  });
};

/**
 * Instance methods
 */

// Ensure data is a object of the class
Airline.prototype.data = {};

//Getter for data field name
Airline.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
Airline.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
Airline.prototype.save = function(callback) {
  var self = this;
  this.data.created = moment().utc().toDate();
  this.data.updated = moment().utc().toDate();
  collection.save(this.data).then(function(result) {
    var airline = self.data;
    callback(null, airline);
  }).catch(function(err) {
    callback(err);
  });
};

//Find the object based on facebookID
Airline.prototype.findOne = function(callback) {
  var self = this;
  collection.findOne({
    fbId: this.data.fbId
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

/**
 * Find the object and return it
 * If the object is not Found
 * Create the object and return it
 */
Airline.prototype.findOrCreate = function(io, callback) {
  var self = this;
  this.findOne(function(err, item) {
    if (err) {
      return callback(err);
  } else if (item) {
      return callback(null, item);
    }
    self.save(io, callback);
  });
};


/**
 * Find the object and return it
 * If the object is not Found
 * Create the object and return it
 */
Airline.prototype.sanitize = function(data) {
  data = data || {};
  var schema = schemas.airline();
  data = _.pick(_.defaults(data, schema), _.keys(schema));
  if (data._id && ObjectID.isValid(data._id)) {
    data._id = ObjectID.createFromHexString(data._id);
  }
  if (data.created && !_.isDate(data.created)) {
    data.created = moment(data.created).utc().toDate();
  }
  data.updated = moment().utc().toDate();
  return data;
};

module.exports = Airline;
