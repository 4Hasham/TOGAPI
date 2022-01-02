var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hashamali641',
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

router.post('/signup', function(req, res, next) {
  connection.query("INSERT INTO users(`first_name`, `last_name`, `gender`, `dob`) VALUES(?, ?, ?, ?)", [req.body.personal.fname, req.body.personal.lname, req.body.personal.gender, req.body.personal.dob],
  (err, results, fields) => {
    if(err)
      throw err;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.account.pass, salt, (err, hash) => {
        if(err)
          throw err;
        connection.query("INSERT INTO drivers(`userID`, `phone`, `password`, `wallet`) VALUES(?, ?, ?, 0)", [results.insertId, req.body.account.phone, hash],
        (err, results, fields) => {
          if(err)
            throw err;
        });
      });
    });
  });
  res.send(true);
});

router.post('/login', function(req, res, next) {
  let phone = req.body.phone;
  let pass = req.body.pass;
  if(phone.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT ID, userID, password FROM `drivers` WHERE `phone`=?", [phone], (err, results, fields) => {
      if(err)
        throw err;
        bcrypt.compare(pass, results[0].password, function(err, result) {
          if(err)
            throw err;
          if(result)
            res.send({
              drivID: results[0].ID,
              userID: results[0].userID
            });
          else
            res.send({ID: 0});
        });
    });
  }
});

router.get('/getinfo', function(req, res, next) {
  if(req.query['info'] == 0) {
    connection.query("SELECT * FROM `users` WHERE `ID`=?", [req.query['id']], (err, results, fields) => {
      if(err)
        throw err;
        res.send(results[0]);
    });
  }
  else {
    connection.query("SELECT * FROM `drivers` WHERE `ID`=?", [req.query['id']], (err, results, fields) => {
      if(err)
        throw err;
        res.send(results[0]);
    });
  }
});

module.exports = router;