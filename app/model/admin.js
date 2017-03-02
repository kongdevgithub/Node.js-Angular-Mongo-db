/**
 * Module dependencies
 */

var db = require('../module/databaseManager');
var collection = db.collection('admin');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var hiddenFields = {

}

var Admin = function(data) {
  this.data = data;
};

/**
 * Static methods
 */

// Find all users
Admin.findAll = function(callback) {
  collection.find().toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a user - id is a string
Admin.findOne = function(id, callback) {
  var self = this;
  collection.findOne({
    _id: ObjectID.createFromHexString(id)
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a user - id is a string
Admin.findOneByEmail = function(email) {
  return collection.findOne({
    email: email
  });
};

// Update a user - user object has a ObjectID
Admin.updateOne = function(user, update, callback) {
    update.updated = new Date();
  collection.updateOne({
    email: user.email
  }, {
    $set: update
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a user - user object has a ObjectID
Admin.removeOne = function(user, callback) {
  collection.deleteOne({
    _id: ObjectID.createFromHexString(user._id)
  }).then(function(result) {
    callback(null, {
      delete: 1,
      user: user
    });
  }).catch(function(err) {
    callback(err);
  });
};

/**
 * Instance methods
 */

// Ensure data is a object of the class
Admin.prototype.data = {};

//Getter for data field name
Admin.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
Admin.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
Admin.prototype.save = function(callback) {
  var self = this;
  this.data = this.sanitize(this.data);
  collection.save(this.data).then(function(result) {
    callback(null, self.data);
  }).catch(function(err) {
    callback(err);
  });
};

//Find the object based on facebookID
Admin.prototype.findOne = function(callback) {
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
Admin.prototype.sanitize = function(data) {
  data = data || {};
  var schema = schemas.admin();
  return _.pick(_.defaults(data, schema), _.keys(schema));
};


module.exports = Admin;
