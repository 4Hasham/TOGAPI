var express = require('express');
var router = express.Router();
var mysql = require('mysql');

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

router.get("/getTruckByBookingID", function(req, res, next) {
  var obj = {
    tID: 0,
    numberPlate: "",
    ttype: "",
    driverID: 0,
    capacity: 0,
    length: 0
  };
  connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.query.bid],
  (err_, results_, fields_) => {
    if(err_)
      throw err_;
    if(results_.length > 0) {
      connection.query("SELECT * FROM trucks WHERE ID = ?", [results_[0].truckID],
      (err, results, fields) => {
        if(err)
          throw err;
        console.log(results);
        if(results.length > 0) {
          var ob = {
            tID: results[0].ID,
            numberPlate: results[0].numberplate,
            ttype: results[0].type,
            driverID: results[0].driverID,
            capacity: results[0].capacity,
            length: results[0].length
          }
          res.send(ob);
        }
        else {
          res.send(obj);
        }
      });
    }
    else {
      res.send(obj);
    }
  });
});

module.exports = router;