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

router.post('/signupA', function(req, res, next) {
  connection.query("INSERT INTO users(`first_name`, `last_name`, `gender`, `dob`) VALUES(?, ?, ?, ?)", [req.body.first_name, req.body.last_name, req.body.gender, req.body.dob],
  (err, results, fields) => {
    if(err)
      throw err;
    connection.query("SELECT ID, userID, password FROM `drivers` WHERE `phone`=?", [req.body.phone], (err, results, fields) => {
      if(err)
        throw err;
        if(results.length > 0) {
          res.send((-1).toString());
        }
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.pass, salt, (err, hash) => {
        if(err)
          throw err;
        connection.query("INSERT INTO drivers(`userID`, `phone`, `password`, `wallet`) VALUES(?, ?, ?, 0)", [results.insertId, req.body.phone, hash],
        (err, results, fields) => {
          if(err)
            throw err;
        });
      });
    });
  });
  res.send((0).toString());
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

router.post('/loginA', function(req, res, next) {
  let phone = req.body.phone;
  let pass = req.body.pass;
  console.log(phone, pass);
  if(phone.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT * FROM `drivers` WHERE `phone`=?", [phone], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length == 0) {
        console.log("F");
        res.send({
          custID: 0,
          userID: 0,
          phone: '',
          pass: '',
          wallet: 0,
          uID: 0,
          gender: '',
          first_name: '',
          last_name: '',
          dob: ''
        });
        return;
      }
      bcrypt.compare(pass, results[0].password, function(err, result) {
        if(err)
          throw err;
        if(result) {
          connection.query("SELECT * FROM `users` WHERE `ID`=?", [results[0]["userID"]], (err1, results1, fields1) => {
            if(err1)
              throw err1;
            var obj = {
              drivID: results[0].ID,
              userID: results[0].userID,
              phone: phone,
              pass: '',
              wallet: results[0].wallet,
              uID: results[0].userID,
              gender: results1[0].gender,
              first_name: results1[0].first_name,
              last_name: results1[0].last_name,
              dob: results1[0].dob
            }
            console.log(obj);
            res.send(obj);
            return;
          });
        }
        else {
          res.send({
            drivID: 0,
            userID: 0,
            phone: '',
            pass: '',
            wallet: 0,
            uID: 0,
            gender: '',
            first_name: '',
            last_name: '',
            dob: ''
          });
          console.log("F1");
          return;
        }
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