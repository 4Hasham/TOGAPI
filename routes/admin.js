var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var connection = require('./config');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Web
router.post('/signup', function(req, res, next) {
  connection.query("INSERT INTO users(`first_name`, `last_name`, `gender`, `dob`) VALUES(?, ?, ?, ?)", [req.body.personal.fname, req.body.personal.lname, req.body.personal.gender, req.body.personal.dob],
  (err, results, fields) => {
    if(err)
      throw err;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.account.pass, salt, (err, hash) => {
        if(err)
          throw err;
        connection.query("INSERT INTO admins(`userID`, `username`, `password`) VALUES(?, ?, ?)", [results.insertId, req.body.account.user, hash],
        (err, results, fields) => {
          if(err)
            throw err;
            res.send(true);
        });
      });
    });
  });
});

router.post('/login', function(req, res, next) {
  let user = req.body.user;
  let pass = req.body.pass;
  if(user.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT ID, userID, password FROM `admins` WHERE `username`=?", [user], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        bcrypt.compare(pass, results[0].password, function(err, result) {
          if(err)
            throw err;
          if(result)
            res.send({
              adminID: results[0].ID,
              userID: results[0].userID
            });
          else
            res.send({adminID: 0, userID: 0});
        });
      }
      else {
        res.send({adminID: 0, userID: 0});
      }
    });
  }
});

//Android
router.post('/signupA', function(req, res, next) {
  connection.query("INSERT INTO users(`first_name`, `last_name`, `gender`, `dob`) VALUES(?, ?, ?, ?)", [req.body.first_name, req.body.last_name, req.body.gender, req.body.dob],
  (err, results, fields) => {
    if(err)
      throw err;
    connection.query("SELECT ID, userID, password FROM `admins` WHERE `user`=?", [req.body.user], (err, results, fields) => {
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
        connection.query("INSERT INTO admins(`userID`, `username`, `password`, `wallet`) VALUES(?, ?, ?, 0)", [results.insertId, req.body.user, hash],
        (err, results, fields) => {
          if(err)
            throw err;
        });
      });
    });
  });
  res.send((0).toString());
});

router.post('/loginA', function(req, res, next) {
  let user = req.body.email;
  let pass = req.body.pass;
  console.log(user, pass);
  if(user.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT * FROM `admins` WHERE `username`=?", [user], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length == 0) {
        console.log("F");
        res.send({
          adminID: 0,
          userID: 0,
          user: '',
          pass: '',
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
              adminID: results[0].ID,
              userID: results[0].userID,
              user: user,
              pass: '',
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
            adminID: 0,
            userID: 0,
            user: '',
            pass: '',
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
    connection.query("SELECT * FROM `admins` WHERE `ID`=?", [req.query['id']], (err, results, fields) => {
      if(err)
        throw err;
        res.send(results[0]);
    });
  }
});

router.get('/getAdmin', (req, res, next) => {
  var obj = {
    adminID: 0,
    userID: 0,
    user: '',
    pass: '',
    uID: 0,
    gender: '',
    first_name: '',
    last_name: '',
    dob: ''
  };
  connection.query("SELECT * FROM `admins` WHERE `ID`=?", [req.query.adminID], (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      console.log("F");
      connection.query("SELECT * FROM `users` WHERE `ID`=?", [results[0].userID], (err1, results1, fields1) => {
        if(err1)
          throw err1;
        if(results1.length > 0) {
          obj.adminID = req.query.custID;
          obj.dob = results1[0].dob;
          obj.gender = results1[0].gender;
          obj.uID = results1[0].userID;
          obj.first_name = results1[0].first_name;
          obj.last_name = results1[0].last_name;
          obj.user = results[0].user;
          res.send(obj);
        }
        else
          res.send(obj);
      });
    }
    else
      res.send(obj);
  });
});

module.exports = router;