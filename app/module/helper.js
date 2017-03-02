var _ = require('lodash');
var moment = require('moment');
var helper = {
  //Params:
  //array: an array to loop over
  //filter: a function with item and callback that filter/adapts the array.
  //callback: a callback function for when it is done.
  map: function(array, filter, callback) {
    var counter = array.length;
    if (counter === 0) {
      return callback(null, []);
    }
    var new_array = [];
    array.forEach(function(item, index) {
      filter(item, function(err, result) {
        if (err) {
          callback(err);
          return;
        }
        if (result) {
          new_array.push(result);
        }
        counter--;
        if (counter === 0) {
          callback(null, new_array);
        }
      });
    });
  },
  mapDeals: function(array, filter, callback) {
    var counter = array.length;
    if (counter === 0) {
      return callback(null, []);
    }
    var new_array = [];
    array.forEach(function(item, index) {
      filter(item.deals, function(err, result) {
        if (err) {
          callback(err);
          return;
        }
        if (result) {
          new_array.push(result);
        }
        counter--;
        if (counter === 0) {
          callback(null, new_array);
        }
      });
    });
  }
};
module.exports = helper;
