/**
 * Module dependencies.
 */
var router = require('express').Router();
var Admin = require('../model/admin');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

/* GET admin page. */

router.route('/users')
  .post(function(req, res) {
    if (req.body.login) {
      var login = req.body.login;
      // TODO: Login
      if (login.token) {
        // TODO: token login
        jwt.verify(login.token, req.app.get('secretAdmin'), function(err, decoded) {
          if (decoded && decoded.email) {
            Admin.findOneByEmail(decoded.email).then(function(admin) {
              delete admin.password;
              res.json(admin);
            });
          } else {
            res.status(400).json('Bad request');
          }
        });
      } else if (login.email && login.password && _.isString(login.email) && _.isString(login.password)) {
        //ensure they are strings and then find user in db
        Admin.findOneByEmail(login.email).then(function(admin) {
          // TODO: Password encryption
          if (admin) {
            bcrypt.compare(login.password, admin.password, function(err, validPassword) {
              if (err) {
                res.status(500).json({
                  error: err
                });
              } else if (validPassword) {
                delete admin.password;
                admin.token = jwt.sign(admin, req.app.get('secretAdmin'), {
                  expiresInMinutes: 1440 // expires in 24 hours
                });
                res.json(admin);
              } else {
                res.status(400).json('Wrong email or password!');
              }
            });
          } else {
            res.status(400).json('Wrong email or password!');
          }
        });
      } else {
        res.status(400).json('Login failed!');
      }
    } else if (req.body.user) {
      // TODO: New User
      var user = req.body.user;
      if (user.email && user.password) {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            user.password = hash;
            var newAdmin = new Admin(user);
            newAdmin.save(function(err, admin) {
              if (err) {
                res.status(500).json(err);
              } else if (admin) {
                delete admin.password;
                res.json(admin);
              } else {
                res.status(400).json('Bad request');
              }
            });
          });
        });
      } else {
        res.status(400).json('Missing field');
      }
    } else {
      res.status(400).json('Bad request');
    }
  })
  .get(function(req, res) {
    Admin.findAll(function(err, data) {
         res.json(data);
    });
  })
  .put(function(req, res) {
      Admin.updateOne(req.body.email, req.body, function(err, data) {
          res.status(200);
      });
  });


  router.route('/users/:id')
    .get(function(req, res) {
      Admin.findOne(req.params.id, function(err, data) {
           res.json(data);
      });
    })
    .delete(function(req, res) {
        Admin.removeOne({ _id: req.params.id }, function(err, data) {
             res.json(data);
        });
    });

module.exports = router;
