/**
 * Module dependencies
 */

var db = require('../module/databaseManager');
var collection = db.collection('pins');
var schemas = require('./schemas');
var _ = require("lodash");
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var Category = require('./category');
var helper = require('../module/helper');
var hiddenFields = {
  location:0,
};

collection.createIndex({
  location: "2dsphere"
});

/**
 * Pin class
 * Contains all the functions needed for database manipluation
 */


var Pin = function(data) {
  this.data = data;
};

/**
 * Static methods
 */
// Pin.getDeals = function(deals, callback) {
//   helper.map(deals, self.getCategoryFromDeal, callback);
// };
//
// Pin.getCategoryFromDeal = function(deal, callback) {
//   db.collection('category').findOne({
//     _id: obj.categoryId
//   }).then(function(category) {
//     obj.category = category.name;
//     callback(null, obj);
//   }).catch(function(err) {
//     callback(err);
//   });
// };

//Find all and return the array of objects
Pin.findAll = function(callback) {
  var self = this;
  collection.find({}, {
    location: 0
  }).toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

Pin.createIndex = function() {
  collection.createIndex({
    location: "2dsphere"
  });
};

// Update a pin - Pin object has a ObjectID
Pin.updateOne = function(pin, update, callback) {
    update.updated = new Date();
  collection.updateOne({
    _id: ObjectID(pin._id)
  }, {
    $set: update
  }).then(function(result) {
    var updated = _.merge(pin, update);
      callback(null, updated);
  }).catch(function(err) {
    callback(err);
  });
};

// Remove a pin - Pin object has a ObjectID
Pin.removeOne = function(pin, callback) {
  collection.deleteOne({
    _id: pin._id
  }).then(function(result) {
    callback(null, {
      delete: 1,
      pin: pin
    });
  }).catch(function(err) {
    callback(err);
  });
};

// Find pin based on coordinates with a radius.
Pin.findByCoordinates = function(query, callback) {
  collection.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [query.longitude, query.latitude]
        },
        $maxDistance: query.radius
      }
    }
  }, {
    location: 0
  }).toArray().then(function(documents) {
    callback(null, documents);
  }).catch(function(err) {
    callback(err);
  });
};

Pin.findBasedOnHours = function(hour, callback) {
  var subtractedDate = moment().utc().subtract(hour, 'hours').toDate();
  collection.find({
    updated: {
      $gt: subtractedDate
    }
  }).toArray().then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

// Find pin based on PlaceID - id is a string
Pin.findOne = function(id, callback) {
  var self = this;
  collection.findOne({
    _id: ObjectID.createFromHexString(id)
  }, {
    location: 0
  }).then(function(result) {
    callback(null, result);
  }).catch(function(err) {
    callback(err);
  });
};

/**
 * Instance methods
 */

// Ensure data is a object of the class
Pin.prototype.data = {};

//Getter for data field name
Pin.prototype.get = function(name) {
  return this.data[name];
};

//Setter with name and value param for data manipluation
Pin.prototype.set = function(name, value) {
  this.data[name] = value;
};

//Save the object - if the object has _id it will update
Pin.prototype.save = function(io, callback) {
  var self = this;
  this.data = this.sanitize(this.data);
  this.data.updated = moment().utc().toDate();
  collection.save(this.data).then(function(result) {
    var pin = self.data;
    io.emit('NewPin', pin);
    callback(null, pin);
  }).catch(function(err) {
    callback(err);
  });
};

//Find the object based on googlePlaceId
Pin.prototype.findOne = function(callback) {
  var self = this;
  collection.findOne({
    googlePlaceId: this.data.googlePlaceId
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
Pin.prototype.findOrCreate = function(io, callback) {
  var self = this;
  this.findOne(function(err, pin) {
    if (err) {
      return callback(err);
    }
    if (pin) {
      return callback(null, pin);
    }
    self.save(io, callback);
  });
};

/**
 * clean the data model
 * have to change the schema to store
 */
Pin.prototype.sanitize = function(data) {
  data = data || {};
  var schema = schemas.pin();
  data = _.pick(_.defaults(data, schema), _.keys(schema));
  // if (data._id && ObjectID.isValid(data._id)) {
  //   console.log(1, data._id);
  //   data._id = ObjectID.createFromHexString(data._id);
  //   console.log(2, data._id);
  // }
  if (data.latitude && data.longitude) {
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    // GeoJSON spec coordinates are in Longitude, Latitude order.
    data.location = {
      "type": "Point",
      "coordinates": [data.longitude, data.latitude]
    };
  }
  if (data.expires && !_.isDate(data.expires)) {
    data.expires = moment(data.expires).utc().toDate();
  }
  if (data.created && !_.isDate(data.created)) {
    data.created = moment(data.created).utc().toDate();
  }
  return data;
};

module.exports = Pin;
