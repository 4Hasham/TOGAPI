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
  connection.query("INSERT INTO trucks(`numberplate`, `type`, `driverID`, `capacity`, `length`) VALUES(?, ?, 0, ?, ?)", [req.body.numberPlate, req.body.truckType, req.body.capacity, req.body.length],
  (err, results, fields) => {
    if(err)
      throw err;
    console.log(req.body);
    res.send(true);
  });
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
        connection.query("INSERT INTO bookingdetails(custID, truckID, pickup, destination, date, time, rating, paymentID, loadID, intercity) VALUES(0, 0, ?, ?, ?, ?, 0, 0, 0, 1)", [pickup, destination, days, time],
        (err, results, fields) => {
          
          if(err)
            throw err;
        });
      });
    });
    res.send(true);
});

router.post('/truckAssign', function(req, res, next) {
  console.log(req.body);
  connection.query("SELECT * FROM trucks WHERE numberplate=?", req.body.truck,
  (err, results, fields) => {
    if(err)
    throw err;
    if(results.length > 0) {
      connection.query("UPDATE bookingdetails SET truckID = ? WHERE ID = ?", [results[0].ID, req.body.routeID],
      (err1, results1, fields1) => {
        if(err1)
          throw err1;
        res.send(true);
      });
    }
    else {
      res.send({truckID: -1});
    }
  });
});

router.post('/address', function(req, res, next) {
  connection.query("INSERT INTO address(line1, line2, city) VALUES(?, ?, ?)", [req.body.line1, req.body.line2, req.body.city],
  (err, results, fields) => {
    if(err)
      throw err;
    res.send({
      aID: results.insertId,
      line1: '',
      line2: '',
      city: ''
    });
  });
});

router.post('/load', function(req, res, next) {
  connection.query("INSERT INTO loads(loadItems, icID, categories) VALUES(?, ?, ?)", [req.body.load, req.body.iID, req.body.category],
  (err, results, fields) => {
    if(err)
      throw err;
    res.send({
      lID: results.insertId,
      load: '',
      icID: 0,
      category: ''
    });
  });
});

// router.post('/intercity', function(req, res, next) {
//   connection.query("INSERT INTO load(bookingID, custID, loadID, payment) VALUES(?, ?, ?, ?)", [req.body.load, req.body.iID, req.body.category],
//   (err, results, fields) => {
//     if(err)
//       throw err;
//     res.send({
//       iID: results.insertId,
//       custID: 0,
//       loadID: 0,
//       payment: 0
//     });
//   });
// });

module.exports = router;