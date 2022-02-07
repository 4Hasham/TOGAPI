var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var admin1 = require('../routes/firebase-config');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hashamali641!',
  database: 'truckongo'
});

connection.connect((err) => {
  if(err)
    return console.error(err.message);
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/registerDriverToken', function(req, res, next) {
  var mysqlTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  connection.query("SELECT * FROM driver_tokens WHERE driver_id=?", [req.body.uID], (err, results, fields) => {
    if(err)
      throw err;

    if(results.length < 1) {
      connection.query("INSERT INTO driver_tokens(driver_id, token, last_updated) VALUES(?, ?, ?)", [req.body.uID, req.body.token, mysqlTimestamp],
      (err1, results1, fields1) => {
        if(err1)
          throw err1;

        res.send(true);
      });
    }
    else {
      connection.query("UPDATE driver_tokens SET token = ?, last_updated = ? WHERE driver_id = ?", [req.body.token, mysqlTimestamp, req.body.uID],
      (err1, results1, fields1) => {
        if(err1)
          throw err1;
        res.send(true);
      });
    }
  });
});

router.post('/registerCustomerToken', function(req, res, next) {
    var mysqlTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [req.body.uID], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length < 1) {
        connection.query("INSERT INTO customer_tokens(customer_id, token, last_updated) VALUES(?, ?, ?)", [req.body.uID, req.body.token, mysqlTimestamp],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          res.send(true);
        });
      }
      else {
        connection.query("UPDATE customer_tokens SET token = ?, last_updated = ? WHERE customer_id = ?", [req.body.token, mysqlTimestamp, req.body.uID],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          res.send(true);
        });
      }
    });
});  

router.post('/sendToDriver', function(req, res, next) {

  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  connection.query("SELECT * FROM customers WHERE ID = ?", [req.body.custID], (err, results, fields) => {
    if(err)
      throw err;
    connection.query("SELECT * FROM users WHERE ID = ?", [results[0].userID], (err1, results1, fields1) => {
      if(err1)
        throw err1;
        if(results1.length > 0) {
          console.log(req.body.pickup);
          connection.query("SELECT * FROM address WHERE ID = ?", [req.body.pickup], (err_, results_, fields_) => {
            if(err_)
              throw err_;
            if(results_.length > 0) {
              var payload = {
                notification: {
                  title: "New Customer Request: " + results1[0].first_name + " " + results1[0].last_name,
                  body: "Pickup location: " + results_[0].line1 + " " + results_[0].line2
                }
              };
              connection.query("SELECT * FROM driver_tokens WHERE driver_id = ?", [req.body.truckID],
              (err2, results2, fields2) => {
                  if(err2)
                    throw err;
                  if(results2.length > 0) {
                      admin1.messaging().sendToDevice(results2[0].token, payload, options)
                      .then(function(response) {
                        console.log("Successfully sent message:", response);
                        res.send(true);
                      })
                      .catch(function(error) {
                        console.log("Error sending message:", error);
                      });
                  }
                  else {
                    res.send(false);
                  }
              });
            }
          });
        }
    });
  });
});

router.post('/sendToCustomer', function(req, res, next) {
  
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };

  var payload = {
    notification: {
      title: "This is a Notification",
      body: "This is the body of the notification message."
    }
  };

  connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [req.body.custID],
  (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        admin.messaging().sendToDevice(results[0].token, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
          res.send(true);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
      }
      else {
        res.send(false);
      }
  });
});

module.exports = router;