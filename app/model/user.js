/**
 * Module dependencies
 */
var db = require('../module/databaseManager');
var collection = db.collection('users');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

var User = function(data) {
  this.data = data;
};

/**
 * Static methods
 */

// Find all users
User.findAll = function(callback) {
  collection.find().toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

// Find a user - id is a string
User.findOne = function(id, callback) {
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
User.updateOne = function(user, update, callback) {
    update.updated = new Date();
  collection.updateOne({
    _id: user._id
  }, {
    $set: update
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a user - user object has a ObjectID
User.removeOne = function(user, callback) {
  collection.deleteOne({
    _id: user._id
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
User.prototype.data = {};

//Getter for data field name
User.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
User.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
User.prototype.save = function(io, callback) {
  var self = this;
  this.data = this.sanitize(this.data);
  if (!(this.data.birthday instanceof Date)) {
    this.data.birthday = new Date(this.data.birthday);
  }
  this.data.updated = moment().utc().toDate();
  this.data.lastLogin = moment().utc().toDate();
  collection.save(this.data).then(function(result) {
    var user = self.data;
    io.emit('NewUser', user);
    callback(null, user);
  }).catch(function(err) {
    callback(err);
  });
};

//Find the object based on facebookID
User.prototype.findOne = function(callback) {
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
User.prototype.findOrCreate = function(io, callback) {
  var self = this;
  this.findOne(function(err, user) {
    if (err) {
      return callback(err);
    } else if (user) {
            collection.update({
              _id: user._id
            }, {
              $set: {
                  lastLogin: moment().utc().toDate()
              }
          }).then(function(a) {
              return callback(null, user);
          });
    } else {
        self.save(io, callback);
    }
  });
};


/**
 * Find the object and return it
 * If the object is not Found
 * Create the object and return it
 */
User.prototype.sanitize = function(data) {
  data = data || {};
  var schema = schemas.user();
  data = _.pick(_.defaults(data, schema), _.keys(schema));
  // if (data._id && ObjectID.isValid(data._id)) {
  //   data._id = ObjectID.createFromHexString(data._id);
  // }
  if (data.birthday && !_.isDate(data.birthday)) {
    data.birthday = moment(data.birthday).utc().toDate();
  }
  if (data.created && !_.isDate(data.created)) {
    data.created = moment(data.created).utc().toDate();
  }
  data.lastLogin = moment().utc().toDate();
  data.updated = moment().utc().toDate();
  return data;
};

module.exports = User;
