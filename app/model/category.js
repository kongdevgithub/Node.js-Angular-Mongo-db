/**
 * Module dependencies
 */

var db = require('../module/databaseManager');
var collection = db.collection('category');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var Category = function(data) {
  this.data = data;
};

/**
 * Static methods
 */

// Find all category
Category.findAll = function(callback) {
  collection.find().toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a category - id is a string
Category.findOne = function(id, callback) {
  collection.findOne({
    _id: ObjectID.createFromHexString(id)
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Update a category - Checkin objecct has a ObjectID
Category.updateOne = function(category, update, callback) {
    update.updated = new Date();
  collection.updateOne({
    _id: category._id
  }, {
    $set: update
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a category - Checkin objecct has a ObjectID
Category.removeOne = function(category, callback) {
  collection.deleteOne({
    _id: category._id
  }).then(function(result) {
    callback(null, {
      delete: 1,
      category: category
    });
  }).catch(function(err) {
    callback(err);
  });
};

/**
 * Instance methods
 */

// Ensure data is a object of the class
Category.prototype.data = {};

//Getter for data field name
Category.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
Category.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
Category.prototype.save = function(io, callback) {
  var self = this;
  this.data = this.sanitize(this.data);
  collection.save(this.data).then(function(result) {
    var category = self.data;
    io.emit('NewCategory', category);
    callback(null, category);
  }).catch(function(err) {
    callback(err);
  });
};

//Find the object based on id
Category.prototype.findOne = function(callback) {
  collection.findOne({
    _id: this.data._id
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
Category.prototype.sanitize = function(data) {
  data = data || {};
  var schema = schemas.category();
  return _.pick(_.defaults(data, schema), _.keys(schema));
};

module.exports = Category;
