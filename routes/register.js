var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

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

router.post('/truck', function(req, res, next) {
  connection.query("INSERT INTO trucks(`numberplate`, `type`, `driverID`, `capacity`, `length`) VALUES(?, ?, ?, ?, ?)", [req.body.numberPlate, req.body.truckType, req.body.driverID, req.body.capacity, req.body.length],
  (err, results, fields) => {
    if(err)
      throw err;
  });
  res.send(true);
});

router.post('/route', function(req, res, next) {
    var time = req.body.timeH + ":" + req.body.timeM;
    var days = JSON.stringify(req.body.days);
    var pickup, destination;
    connection.query("INSERT INTO address(city) VALUES(?)", [req.body.pickup], (err, results, fields) => {
      if(err)
        throw err;
      pickup = results.insertId;
      connection.query("INSERT INTO address(city) VALUES(?)", [req.body.destination], (err, results, fields) => {
        if(err)
          throw err;
        destination = results.insertId;
        connection.query("INSERT INTO bookingdetails(custID, truckID, pickup, destination, date, time, rating, paymentID, totalLoad, intercity) VALUES(0, 0, ?, ?, ?, ?, 0, 0, 0, 1)", [pickup, destination, days, time],
        (err, results, fields) => {
          
          if(err)
            throw err;
        });
      });
    });
    res.send(true);
});

router.post('/truckAssign', function(req, res, next) {
  connection.query("UPDATE bookingdetails SET truckID = ? WHERE ID = ?", [req.body.truckID, req.body.routeID],
  (err, results, fields) => {
    if(err)
      throw err;
  });
  res.send(true);  
});

module.exports = router;