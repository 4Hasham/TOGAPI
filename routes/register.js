var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var connection = require('./config');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/truck', function(req, res, next) {
  connection.query("INSERT INTO trucks(`numberplate`, `type`, `driverID`, `capacity`, `length`) VALUES(?, ?, ?, ?, ?)", [req.body.numberPlate, req.body.truckType, req.body.driverID, req.body.capacity, req.body.length],
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
    connection.query("SELECT * FROM address WHERE city = ? AND line1 IS NULL ORDER BY ID DESC", [req.body.pickup],
    (err_, results_, fields_) => {
      if(err_)
        throw err_;
      if(results_.length > 0) {
        pickup = results_[0].ID
        connection.query("SELECT * FROM address WHERE city = ? AND line1 IS NULL ORDER BY ID DESC", [req.body.destination],
        (err_1, results_1, fields_1) => {
          if(err_1)
            throw err_1;
          if(results_1.length > 0) {
            destination = results_1[0].ID;
            connection.query("INSERT INTO routes(truckID, days, pickup, destination, time) VALUES(0, ?, ?, ?, ?)", [days, pickup, destination, time],
            (err, results, fields) => {         
              if(err)
                throw err;
              res.send(true);
            });
          }
          else {
            connection.query("INSERT INTO address(city) VALUES(?)", [req.body.destination], (err3, results3, fields3) => {
              if(err3)
                throw err3;
              destination = results3.insertId;
              connection.query("INSERT INTO routes(truckID, days, pickup, destination, time) VALUES(0, ?, ?, ?, ?)", [days, pickup, destination, time],
              (err, results, fields) => {         
                if(err)
                  throw err;
                res.send(true);
              });
            });
          }
        });
      }
      else {
        connection.query("INSERT INTO address(city) VALUES(?)", [req.body.pickup], (err1, results1, fields1) => {
          if(err1)
            throw err1;
          pickup = results1.insertId;
          connection.query("SELECT * FROM address WHERE city = ? AND line1 IS NULL ORDER BY ID DESC", [req.body.destination],
          (err2, results2, fields2) => {
            if(err2)
              throw err2;
            if(results2.length > 0) {
              destination = results2[0].ID;
              connection.query("INSERT INTO routes(truckID, days, pickup, destination, time) VALUES(0, ?, ?, ?, ?)", [days, pickup, destination, time],
              (err, results, fields) => {         
                if(err)
                  throw err;
                res.send(true);
              });
            }
            else {
              connection.query("INSERT INTO address(city) VALUES(?)", [req.body.destination], (err3, results3, fields3) => {
                if(err3)
                  throw err3;
                destination = results3.insertId;
                connection.query("INSERT INTO routes(truckID, days, pickup, destination, time) VALUES(0, ?, ?, ?, ?)", [days, pickup, destination, time],
                (err, results, fields) => {         
                  if(err)
                    throw err;
                  res.send(true);
                });
              });
            }
          });
        });
      }
    });
});

router.post('/truckAssign', function(req, res, next) {
  console.log(req.body);
  connection.query("SELECT * FROM trucks WHERE numberplate=?", [req.body.truck],
  (err, results, fields) => {
    if(err)
    throw err;
    if(results.length > 0) {
      connection.query("UPDATE routes SET truckID = ? WHERE ID = ?", [results[0].ID, req.body.routeID],
      (err1, results1, fields1) => {
        if(err1)
          throw err1;
        res.send({truckID: results[0].ID});
      });
    }
    else {
      res.send({truckID: -1});
    }
  });
});

router.post('/address', function(req, res, next) {
  if(req.body.line1 == '') {
    connection.query("SELECT * FROM address WHERE city = ? AND line1 IS NULL ORDER BY ID DESC", [req.body.city],
    (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        res.send({
          aID: results[0].ID,
          line1: '',
          line2: '',
          city: ''
        });
      }
      else {
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
      }
    });
  }
  else {
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
  }
});

router.post('/load', function(req, res, next) {
  connection.query("INSERT INTO loads(loadItems, icID, categories) VALUES(?, ?, ?)",
  [req.body.load, req.body.iID, req.body.category],
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

router.post('/intercity', function(req, res, next) {
  connection.query("INSERT INTO intercity(bookingID, custID, loadID, payment, day) VALUES(?, ?, ?, ?, ?)", [req.body.bookingID, req.body.custID, req.body.loadID, 0, req.body.day],
  (err, results, fields) => {
    if(err)
      throw err;
    res.send({
      iID: results.insertId,
      bookingID: 0,
      custID: 0,
      loadID: 0,
      payment: 0,
      day: 0
    });
  });
});

module.exports = router;