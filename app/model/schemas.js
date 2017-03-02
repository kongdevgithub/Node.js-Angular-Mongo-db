var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
var schemas = {
  user: function() {
    return {
      _id: new ObjectID(),
      fbId: null,
      displayName: null,
      firstName: null,
      middleName: null,
      lastName: null,
      phone: null,
      gender: null,
      birthday: null,
      email: null,
      push: null,
      log: 0,
      hideme: false,
      disabled: false,
      lastLogin: moment().utc().toDate(),
      created: moment().utc().toDate()
    };
  },
  category: function() {
    return {
      _id: new ObjectID(),
      name: null
    };
  },
  pin: function() {
    return {
      _id: new ObjectID(),
      latitude: 0,
      longitude: 0,
      location: {
        type: "Point",
        coordinates: [0, 0]
      },
      deals: null,
      image: null,
      title: null,
      discount: null,
      description: null,
      category: null,
      companyName: null,
      country: null,
      city: null,
      email: null,
      address: null,
      phone: null,
      disabled: false,
      updatedBy: null,
      hits: null,
      isEdited: false,
      airline: null,
      created: moment().utc().toDate(),
      expires: moment().utc().add(7, 'days').toDate(),
    };
  },
  admin: function() {
    return {
      _id: new ObjectID(),
      email: null,
      password: null,
      name: null
    };
  },
  airline: function() {
      return {
          _id: new ObjectID(),
          airline: null,
          created: moment().utc().toDate(),
          updated: moment().utc().toDate()
      }
  },
  tool: function() {
      return {
          _id: new ObjectID(),
          toolName: null,
          purpose: null,
          additionalComments: null,
          created: moment().utc().toDate(),
          updated: moment().utc().toDate()
      }
  }
};

module.exports = schemas;
