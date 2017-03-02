/**
 * Module dependencies
 */
var ObjectID = require('mongodb').ObjectID;
var db = require('../module/databaseManager');
var router = require('express').Router();
var User = require('../model/user');
var Pin = require('../model/pin');
var Airline = require('../model/airline');
var Tool = require('../model/tool');
var Category = require('../model/category');
var path = require('path');
var multer = require('multer');
var request = require('request');
var cheerio = require('cheerio');
var dir = path.join(__dirname, '..', '..', 'public/');
var uploading = multer({
  dest: path.join(dir, 'uploads/')
});

/**
 * Documentation:
 * https://docs.google.com/document/d/11Z9b5sYNHmvGiM-K0QeqywYJd8nqOqCjJC2OFaSbL9U/
 */

/* GET base route. */
router.get('/', function(req, res, next) {
  res.json({
    message: "hello world"
  });
});

router.get('/coffeeistheelixiroflife', function(req, res) {
  db.dropDatabase().then(function(result) {
    Pin.createIndex();
    res.json({
      message: 'Database dropped'
    });
  });
});

/* PARAM checks */

router.param('user', function(req, res, next, id) {
  // Is ID Valid?
  if (ObjectID.isValid(id)) {
    // Locate user
    User.findOne(id, function(err, user) {
      if (err) {
        next(err);
      } else if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json([]);
      }
    });
  } else {
    res.status(400).json({
      error: 'Invalid ID'
    });
  }
});

router.param('category', function(req, res, next, id) {
  // Is ID Valid?
  if (ObjectID.isValid(id)) {
    // Locate category
    Category.findOne(id, function(err, category) {
      if (err) {
        next(err);
      } else if (category) {
        req.category = category;
        next();
      } else {
        res.status(404).json([]);
      }
    });
  } else {
    res.status(400).json({
      error: 'Invalid ID'
    });
  }
});

router.param('pin', function(req, res, next, id) {
  // Is ID Valid?
  if (ObjectID.isValid(id)) {
    // Locate pin
    Pin.findOne(id, function(err, pin) {
      if (err) {
        next(err);
      } else if (pin) {
        req.pin = pin;
        next();
      } else {
        res.status(404).json([]);
      }
    });
  } else {
    res.status(400).json({
      error: 'Invalid ID'
    });
  }
});

/**
* - GET number of users
**/

router.route('/userCount')
    .get(function(req, res) {
        User.findAll(function(err, users) {

            var stat = {
                daily: 0,
                weekly: 0,
                monthly: 0
            };

            // Today
            var today = new Date();

            // Past Week
            var pastWeek = new Date().setDate(new Date().getDate() - 7);

            // Past Month
            var pastMonth = new Date().setDate(new Date().getDate() - 30);

            // Redefine and change format
            today = new Date(today).toISOString().slice(0, 10);
            pastWeek = new Date(pastWeek).toISOString().slice(0, 10);
            pastMonth = new Date(pastMonth).toISOString().slice(0, 10);

            for (var i = 0; i < users.length; i++) {

                // If lastLogin field exists
                if (users[i].lastLogin) {

                    let lastLogin = new Date(users[i].lastLogin).toISOString().slice(0, 10)

                    // Today
                    if (lastLogin == today) {
                        stat.daily = stat.daily + 1;
                    }

                    // Past Week
                    if (lastLogin >= pastWeek && lastLogin <= today) {
                        stat.weekly = stat.weekly + 1;
                    }

                    // Past Month
                    if (lastLogin >= pastMonth && lastLogin <= today) {
                        stat.monthly = stat.monthly + 1;
                    }

                }
            }

            res.json({
                amount: users.length,
                stat: stat
            });
        });
    });

router.route('/totalDownloads/android')
    .get(function(req, res) {

        request('https://play.google.com/store/apps/details?id=com.worldofcrew', function(err, response, body) {
            var $ = cheerio.load(body);
            $('div.content').each(function(i, item) {
                if (i === 1) {
                    res.json({
                        total: $(this).text()
                    });
                }
            });


        });

    });


// Merge Firebase and MongoDB database for reported discounts proceed
router.route('/proceed')
.post(function(req, res) {
    Pin.findAll(function(err, discounts) {

        var reports = req.body;

        var data = [];

        discounts.map((discount) => {
            reports.map((report) => {
                if (String(discount._id) === String(report.discount_id)) {

                    data.push({
                        discount: discount,
                        report: report
                   });

                }
            });
        });

        res.json(data);
    });
});



/* Users route.
 * - GET get array of all users
 * - POST add new user
 */

router.route('/users')
  .get(function(req, res) {
    User.findAll(function(err, documents) {
      // Return array of users
      res.json(documents);
    });
  })
  .post(function(req, res) {
    // Add User
    // TODO: Validation
    var user = new User(req.body);
    user.findOrCreate(req.app.get('socketio'), function(err, result) {
      res.json({
        user: result
      });
    });
  });

/* User route.
 * - PARAM: userId
 * - GET: Return user
 * - PUT: Update user
 * - DELETE: Disable user
 */

router.route('/users/:user')
  .get(function(req, res) {
    // Return specific user
    res.json(req.user);
  })
  .put(function(req, res) {
    // Update user
    User.updateOne(req.user, req.body, function(err, result) {
      res.json(result);
    });
  })
  .delete(function(req, res) {
    // Remove user
    User.removeOne(req.user, function(err, result) {
      res.json(result);
    });
  });

/* Pins route.
 * - GET get all pins
 * - POST add new pins
 */
router.route('/categories')
  .get(function(req, res) {
    // return array of pins
    Category.findAll(function(err, documents) {
      res.json(documents);
    });
  })
  .post(function(req, res) {
    // Add new pin
    // TODO: Validation
    var category = new Category(req.body);
    category.save(req.app.get('socketio'), function(err, result) {
      res.json({
        category: result
      });
    });
  });

router.route('/categories/:category')
  .get(function(req, res) {
    // return specific category
    res.json(req.category);
  })
  .put(function(req, res) {
    // Update category
    Category.updateOne(req.category, req.body, function(err, result) {
      res.json(result);
    });
  })
  .delete(function(req, res) {
    // Remove category
    Category.removeOne(req.category, function(err, result) {
      res.json(result);
    });
  });

/* Pins route.
 * - GET get all pins
 * - POST add new pins
 */
router.route('/pins')
  .get(function(req, res) {
    // return array of pins
    Pin.findAll(function(err, documents) {
      res.json(documents);
    });
  });

router.post('/pins', uploading.single('image'), function(req, res, next) {
  // Add new pin
  // TODO: Validation
  if (req.file && req.file.filename) {
    req.body.image = 'uploads/' + req.file.filename;
  }
  var pin = new Pin(req.body);
  pin.save(req.app.get('socketio'), function(err, result) {
    if (err) {
      next(err);
    }
    res.json({
      pin: result
    });
  });
});


/* Pins route.
 * - PARAM: placeId
 * - GET return specific pin
 * - PUT update specific pin
 * - DELETE disable specific pin
 */
router.route('/pins/:pin')
  .get(function(req, res) {
    // return specific pin
    res.json(req.pin);
  })
  .delete(function(req, res) {
    // Remove pin
    Pin.removeOne(req.pin, function(err, result) {
      res.json(result);
    });
  });

router.put('/pins/:pin', uploading.single('image'), function(req, res) {
  if (req.file && req.file.filename) {
    req.body.image = 'uploads/' + req.file.filename;
  }

  delete req.body._id;

  Pin.updateOne(req.pin, req.body, function(err, result) {
    res.json(result);
  });
});

/* Pins search route.
 * - PARAM: longitude, latitude, radius
 * - GET return array of pins with checkins based on longitude, latitude, radius
 */

router.get('/pins/:latitude/:longitude/:radius', function(req, res) {
  // return array of pins with checkins based on longitude, latitude, radius
  var query = {},
    radius = parseInt(req.params.radius);
  query.latitude = parseFloat(req.params.latitude);
  query.longitude = parseFloat(req.params.longitude);
  query.radius = radius * 1000;
  Pin.findByCoordinates(query, function(err, documents) {
    res.json(documents);
  });
});
router.get('/pins/:latitude/:longitude', function(req, res) {
  // return array of pins with checkins based on longitude, latitude
  var query = {};
  query.latitude = parseFloat(req.params.latitude);
  query.longitude = parseFloat(req.params.longitude);
  query.radius = 2000;
  Pin.findByCoordinates(query, function(err, documents) {
    res.json(documents);
  });
});

// Airlines
// List
router.get('/airlines', function(req, res) {
    Airline.findAll(function(err, documents) {
      res.json(documents);
    });
});

// Add/Create
router.post('/airlines', function(req, res, next) {
  var airline = new Airline(req.body);
  airline.save(function(err, result) {
    if (err) {
      next(err);
    }
    res.json({
      airline: result
    });
  });
});

// Delete
router.route('/airlines/:id')
  .get(function(req, res) {
      Airline.findOne(req.params.id, function(err, result) {
        res.json(result);
      });
  })
  .put(function(req, res) {
      Airline.updateOne(req.body, req.body, function(err, result) {
        res.json(result);
      });
  })
  .delete(function(req, res) {
    Airline.removeOne(req.params.id, function(err, result) {
        res.json(result);
    });
  });


// Tools
// List
router.get('/tools', function(req, res) {
    Tool.findAll(function(err, documents) {
      res.json(documents);
    });
});

// ADD
router.post('/tools', function(req, res, next) {
  var tool = new Tool(req.body);
  tool.save(function(err, result) {
    if (err) {
        console.log(err);
      next(err);
    }
    res.json({
      airline: result
    });
  });
});

// READ / EDIT / DELETE
router.route('/tools/:id')
  .get(function(req, res) {
      Tool.findOne(req.params.id, function(err, result) {
        res.json(result);
      });
  })
  .put(function(req, res) {
      Tool.updateOne(req.body, req.body, function(err, result) {
        res.json(result);
      });
  })
  .delete(function(req, res) {
    Tool.removeOne(req.params.id, function(err, result) {
        res.json(result);
    });
  });

module.exports = router;
