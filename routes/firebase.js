var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var admin1 = require('../routes/firebase-config');
//var mailer = require('nodemailer');
const sock = require('../bin/www');
const { JavaCaller } = require('java-caller');
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
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
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
      if(req.body.token !== results[0].token) {
        connection.query("UPDATE driver_tokens SET token = ?, last_updated = ? WHERE driver_id = ?", [req.body.token, mysqlTimestamp, req.body.uID],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
            var payload = {
              notification: {
                title: "Login from New Device",
                body: "A new sign in detected from another device."
              },
              data: {
                mess_str: JSON.stringify(req.body),
                mess_type: "-10"
              }
            };    
            admin1.messaging().sendToDevice(results[0].token, payload, options)
            .then(function(response) {
              console.log("Successfully sent message:", response);
              res.send(true);
            });
        });  
      }
      else {
        res.send(true);
      }
    }
  });
});

router.post('/registerCustomerToken', function(req, res, next) {
    var mysqlTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var options = {
      priority: "high",
      timeToLive: 60 * 60 *24
    };
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
            var payload = {
              notification: {
                title: "Login from New Device",
                body: "A new sign in detected from another device."
              },
              data: {
                mess_str: JSON.stringify(req.body),
                mess_type: "10"
              }
            };    
            admin1.messaging().sendToDevice(results[0].token, payload, options)
            .then(function(response) {
              console.log("Successfully sent message:", response);
              res.send(true);
            });
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

router.get('/cancelRideCustomerA', function(req, res, next) {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  console.log(req.query);
  connection.query("UPDATE bookingdetails SET rating = ? WHERE ID = ?", [6, req.query.bookingID],
  (err, results, fields) => {
    if(err)
      throw err;
    var payload = {
      notification: {
        title: "Ride Cancelled",
        body: "The customer cancelled the ride."
      },
      data: {
        mess_str: JSON.stringify(req.query),
        mess_type: "1"
      }
    };
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.query.bookingID],
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

router.get('/cancelRideDriver', function(req, res, next) {
  //rating 7: Ride cancelled by driver
  console.log(req.body);
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  console.log(req.body);
  connection.query("UPDATE bookingdetails SET rating = ? WHERE ID = ?", [7, req.query.bookingID],
  (err, results, fields) => {
    if(err)
      throw err;
    var payload = {
      notification: {
        title: "Ride Cancelled",
        body: "Driver cancelled the ride."
      },
      data: {
        mess_str: JSON.stringify(req.query),
        mess_type: "1"
      }
    };
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.query.bookingID],
    (err1, results1, fields1) => {
      if(err1)
        throw err1;
      if(results1.length > 0) {
        console.log(results1);
        connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [results1[0].custID],
        (err2, results2, fields2) => {
          if(err2)
            throw err2;
          if(results2.length > 0) {
            console.log(results2);           
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

const sendToDriverFunc = function(req, res, next) {
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
}

router.post('/sendToDriver', sendToDriverFunc);

const sendToCustomerFunc = function(req, res, next) {
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
              
              // var transporter = mailer.createTransport({
              //   service: 'gmail',
              //   auth: {
              //     user: '18-CS-074@student.hitecuni.edu.pk',
              //     pass: '8641hashamali641'
              //   }
              // });

              // var mailOptions = {
              //   from: '18-CS-074@student.hitecuni.edu.pk',
              //   to: results["email"],
              //   subject: results1[0].first_name + " " + results1[0].last_name + " is on the way to pickup location.",
              //   text: truckInfo.type + " - "+ truckInfo.numberplate
              // };

              //socket.io
              var ioF = sock.getIO();
              var returnData = {
                truck: truckd,
                driver: {
                  account: results[0],
                  personal: results1[0]
                }
              }
              ioF.emit('rideshare_' + req.body.capacity, returnData);

              // transporter.sendMail(mailOptions, function(error__, info){
              //   if (error__)
              //     console.log(error__);
              //   else
              //     console.log('Email sent: ' + info.response);
              // });

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
            }
            else {
              console.log("Could not find truck.");
              res.send(false);
              return;
            }
          });
        });
      }
      else {
        res.send(false);
      }
    });
  });
}

router.post('/sendToCustomer', sendToCustomerFunc);

// var getDriver = async(truckID) => {
//   var obj = {
//     drivID: 0,
//     userID: 0,
//     phone: '',
//     pass: '',
//     wallet: 0,
//     uID: 0,
//     gender: '',
//     first_name: '',
//     last_name: '',
//     dob: ''
//   };
//   console.log("Inside", truckID);
//   connection.query("SELECT * FROM `trucks` WHERE `ID`=?", [truckID], async(err, results, fields) => {
//     if(err)
//       throw err;
//       console.log(results);
//     if(results.length > 0) {
//       console.log("F");
//       connection.query("SELECT * FROM `drivers` WHERE `ID`=?", [results[0].driverID], async(err1, results1, fields1) => {
//         if(err1)
//           throw err1;
//           console.log(results1);
//         if(results1.length > 0) {
//           connection.query("SELECT * FROM `users` WHERE ID=?", [results[0].userID],
//           async(err2, results2, fields2) => {
//             if(err2)
//               throw err2;
//               console.log(results2);
//             if(results2.length > 0) {
//               obj.drivID = results[0].driverID;
//               obj.dob = results2[0].dob;
//               obj.gender = results2[0].gender;
//               obj.uID = results1[0].userID;
//               obj.userID = results1[0].userID;
//               obj.first_name = results2[0].first_name;
//               obj.last_name = results2[0].last_name;
//               obj.phone = results[0].phone;
//               res.send(obj);                    
//             }
//             else {
//               res.send(obj);
//             }
//           });
//         }
//         else
//           res.send(obj);
//       });
//     }
//     else
//       res.send(obj);
//   });
// }

router.post('/getRating', (req, res, next) => {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 *24
  };
  connection.query("SELECT * FROM trucks WHERE ID = ?", [req.body.truckID],
  (err_, results_, fields_) => {
    if(err_)
      throw err_;
    console.log("results_", results_);
    if(results_.length > 0) {
      console.log(results_[0].driverID);
      connection.query("SELECT * FROM drivers WHERE ID = ?", [results_[0].driverID], (err, results, fields) => {
        if(err)
          throw err;
        console.log("results", results);
        if(results.length > 0) {
          console.log("F1");
          connection.query("SELECT * FROM users WHERE ID = ?", [results[0].userID], (err1, results1, fields1) => {
            if(err1)
              throw err1;
            console.log("results1",results1);
            if(results1.length > 0) {
              connection.query("SELECT * FROM customer_tokens WHERE customer_id = ?", [req.body.custID],
              (err2, results2, fields2) => {
                if(err2)
                  throw err2;
                console.log("results2", results2);
                var payload = {
                  notification: {
                    title: "Please rate your booking with " + results1[0].first_name + " " + results1[0].last_name,
                    body: "Rate"
                  },
                  data: {
                    mess_str: JSON.stringify(req.body),
                    mess_type: "-1"
                  }
                };
                
                //socket.io
                var ioF = sock.getIO();
                var returnData = {
                  truck: req.body,
                  driver: {
                    account: results[0],
                    personal: results1[0]
                  }
                }
                ioF.emit('ratingshare_' + req.body.custID, returnData);

                if(results1.length > 0) {
                  admin1.messaging().sendToDevice(results2[0].token, payload, options)
                  .then(function(response) {
                    console.log("Successfully sent message:", response);
                    res.send(true);
                  })
                  .catch(function(error) {
                    console.log("Error sending message:", error);
                  });
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

router.post("/findDrivers", async(req, res, next) => {
  var db = admin1.database();
  const ref = db.ref('trucks');
  ref.on('value', async(snapshot) => {
    try {
      const java = new JavaCaller({
        classPath: ['business/RTreeMap.jar', 'business/p/gson-2.2.2.jar', 'business/p/rtree2-0.9-RC1.jar', 'business/p/grumpy-core-0.4.5.jar', 'business/p/commons-math3-3.6.1.jar', 'business/p/guava-mini-0.1.2.jar', 'business/p/geocoder-java-0.15.jar'],
        mainClass: 'p.RTreeMap',
        rootPath: __dirname,
        minimumJavaVersion: 17
      });
      var rss = snapshot.val();
      console.log(req.body.cust, rss);
      let rarr = [];
      for(let i in rss)
        rarr.push(rss[i]);
      const {status, stdout, stderr} = await java.run([JSON.stringify(req.body.cust), JSON.stringify(rarr)]);
      console.log(stdout, stderr);
      if(stdout) {
        var truck = JSON.parse(stdout)[0];
        var booking = {...req.body.booking};
        var req1 = {...req};
        if(truck !== undefined) {
          booking.truckID = truck.tID; 
          req1.body = booking;
          console.log(req1.body);
          sendToDriverFunc(req1, res); 
        }
      }
    }
    catch(e) {
      console.log(e);
    }
  }, (errorObject) => {
    console.log(errorObject.name);
  });
});

const sendInterToDriver = function(req, res, next) {
  var options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
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
        console.log(req.body.loadID);
        connection.query("SELECT * FROM loads WHERE ID = ?", [req.body.loadID],
        (err_, results_, fields_) => {
          if(err_)
            throw err_;
          if(results_.length > 0) {
            var payload = {
              notification: {
                title: "New Intercity Request: " + results1[0].first_name + " " + results1[0].last_name,
                body: "Load: " + results_[0].loadItems
              },
              data: {
                mess_str: JSON.stringify(req.body),
                mess_type: "-1"
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
}

router.post('/sendIntercityRequestToDriver', sendInterToDriver);

module.exports = router;