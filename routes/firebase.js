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

router.post('/cancelRideCustomer', function(req, res, next) {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  console.log(req.body);
  connection.query("UPDATE bookingdetails SET rating = ? WHERE ID = ?", [6, req.body.bookingID],
  (err, results, fields) => {
    if(err)
      throw err;
    var payload = {
      notification: {
        title: "Ride Cancelled",
        body: "The customer cancelled the ride."
      },
      data: {
        mess_str: JSON.stringify(req.body),
        mess_type: "1"
      }
    };
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.body.bookingID],
    (err1, results1, fields1) => {
      if(err1)
        throw err1;
      if(results1.length > 0) {
        connection.query("SELECT * FROM trucks WHERE ID = ?", [results1[0].truckID],
        (err2, results2, fields2) => {
          if(err2)
            throw err2;
          if(results2.length > 0) {
            connection.query("SELECT * FROM driver_tokens WHERE driver_id = ?", [results2[0].driverID],
            (err3, results3, fields3) => {
              if(err3)
                throw err3;
              if(results3.length > 0) {           
                admin1.messaging().sendToDevice(results3[0].token, payload, options)
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
          else {
            res.send(false);
          }
        });
      }
      else {
        res.send(false);
      }
    });
  });
});

router.post('/cancelRideDriver', function(req, res, next) {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  connection.query("UPDATE bookingdetails SET rating = ? WHERE ID = ?", [-1, req.body.bookingID],
  (err, results, fields) => {
    if(err)
      throw err;
    var payload = {
      notification: {
        title: "Ride Cancelled",
        body: "Driver cancelled the ride."
      },
      data: {
        mess_str: JSON.stringify(req.body),
        mess_type: "1"
      }
    };
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.body.bookingID],
    (err1, results1, fields1) => {
      if(err1)
        throw err1;
      if(results1.length > 0) {
        connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [results1[0].custID],
        (err2, results2, fields2) => {
          if(err2)
            throw err2;
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
      else {
        res.send(false);
      }
    });
  });
});

router.post('/sendToDriver', function(req, res, next) {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  connection.query("SELECT * FROM customers WHERE ID = ?", [req.body.custID],
  (err, results, fields) => {
    if(err)
      throw err;
    connection.query("SELECT * FROM users WHERE ID = ?", [results[0].userID],
    (err1, results1, fields1) => {
      if(err1)
        throw err1;
      if(results1.length > 0) {
        console.log(req.body.pickup);
        connection.query("SELECT * FROM address WHERE ID = ?", [req.body.pickup],
        (err_, results_, fields_) => {
          if(err_)
            throw err_;
          if(results_.length > 0) {
            var payload = {
              notification: {
                title: "New Customer Request: " + results1[0].first_name + " " + results1[0].last_name,
                body: "Pickup location: " + results_[0].line1 + " " + results_[0].line2
              },
              data: {
                mess_str: JSON.stringify(req.body),
                mess_type: "0"
              }
            };
            connection.query("SELECT * FROM trucks WHERE ID = ?", [req.body.truckID],
            (err3, results3, fields3) => {
              if(err3)
                throw err3;
              if(results3.length > 0) {
                connection.query("SELECT * FROM driver_tokens WHERE driver_id = ?", [results3[0].driverID],
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
              else {
                res.send(false);
              }
            });
          }
          else {
            res.send(false);
          }
        });
      }
      else {
        res.send(false);
      }
    });
  });
});

router.post('/sendToCustomer', function(req, res, next) {
  console.log(req.body);
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  connection.query("SELECT * FROM drivers WHERE ID = ?", [req.body.driverID], (err, results, fields) => {
    if(err)
      throw err;
    console.log("F1");
    connection.query("SELECT * FROM users WHERE ID = ?", [results[0].userID], (err1, results1, fields1) => {
      if(err1)
        throw err1;
        console.log("F2");
      if(results1.length > 0) {
        connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [req.body.capacity],
        (err2, results2, fields2) => {
          if(err2)
            throw err2;
            console.log("F3");
          if(results2.length > 0) {
            var truckInfo;
            connection.query("SELECT * FROM trucks WHERE ID = ?", [req.body.tID],
            (err3, results3, fields3) => {
              if(err3)
                throw err3;
                console.log("F4");
              if(results3.length > 0) {
                console.log(results3[0])
                truckInfo = results3[0];
                var truckd = {
                  tID: truckInfo.ID,
                  driverID: truckInfo.driverID,
                  capacity: truckInfo.capacity,
                  length: req.body.length,
                  numberPlate: truckInfo.numberplate,
                  ttype: truckInfo.type
                };
                var payload = {
                  notification: {
                    title: results1[0].first_name + " " + results1[0].last_name + " is on the way to pickup location.",
                    body: truckInfo.type + "- "+ truckInfo.numberplate
                  },
                  data: {
                    mess_str: JSON.stringify(truckd),
                    mess_type: "0"
                  }
                };

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
                console.log("Could not find truck.");
                res.send(false);
                return;
              }
            });
          }
          else {
            res.send(false);
          }
        });
      }
      else {
        res.send(false);
      }
    });
  });
});

module.exports = router;