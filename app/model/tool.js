/**
 * Module dependencies
 */
var db = require('../module/databaseManager');
var collection = db.collection('tools');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var Tool = function(data) {
  this.data = data;
};

/**
 * Static methods
 */

// Find all users
Tool.findAll = function(callback) {
  collection.find().toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a user - id is a string
Tool.findOne = function(id, callback) {
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
Tool.updateOne = function(data, update, callback) {

    data.updated = new Date();
    updateNew = data;

  collection.updateOne({
    _id: ObjectID.createFromHexString(data._id)
  }, {
    $set: {
        toolName: updateNew.toolName,
        purpose: updateNew.purpose,
        additionalComments: updateNew.additionalComments,
        updated: updateNew.updated
    }
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a airline - airline object has a ObjectID
Tool.removeOne = function(airline, callback) {
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
Tool.prototype.data = {};

//Getter for data field name
Tool.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
Tool.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
Tool.prototype.save = function(callback) {
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
Tool.prototype.findOne = function(callback) {
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
Tool.prototype.findOrCreate = function(io, callback) {
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
Tool.prototype.sanitize = function(data) {
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

module.exports = Tool;
