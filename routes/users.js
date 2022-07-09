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
        connection.query("INSERT INTO customers(`userID`, `email`, `phone`, `password`, `wallet`) VALUES(?, ?, ?, ?, 0)", [results.insertId, req.body.account.email, req.body.account.phone, hash],
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
  let email = req.body.email;
  let pass = req.body.pass;
  if(email.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT ID, userID, password FROM `customers` WHERE `email`=?", [email], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        bcrypt.compare(pass, results[0].password, function(err, result) {
          if(err)
            throw err;
          if(result)
            res.send({
              custID: results[0].ID,
              userID: results[0].userID
            });
          else
            res.send({custID: 0, userID: 0});
        });
      }
      else {
        res.send({custID: 0, userID: 0});
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
    connection.query("SELECT ID, userID, password FROM `customers` WHERE `email`=?", [req.body.email], (err, results, fields) => {
      if(err)
        throw err;
        if(results.length > 0) {
          res.send((-1).toString());
        }
    });
    connection.query("SELECT ID, userID, password FROM `customers` WHERE `phone`=?", [req.body.phone], (err, results, fields) => {
      if(err)
        throw err;
        if(results.length > 0) {
          res.send((1).toString());
        }
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.pass, salt, (err, hash) => {
        if(err)
          throw err;
        connection.query("INSERT INTO customers(`userID`, `email`, `phone`, `password`, `wallet`) VALUES(?, ?, ?, ?, 0)", [results.insertId, req.body.email, req.body.phone, hash],
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
  let email = req.body.email;
  let pass = req.body.pass;
  console.log(email, pass);
  if(email.trim() !== '' && pass.trim() !== '') {
    connection.query("SELECT * FROM `customers` WHERE `email`=?", [email], (err, results, fields) => {
      if(err)
        throw err;
      if(results.length == 0) {
        console.log("F");
        res.send({
          custID: 0,
          userID: 0,
          email: '',
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
              custID: results[0].ID,
              userID: results[0].userID,
              email: email,
              phone: results[0].phone,
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
            custID: 0,
            userID: 0,
            email: '',
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
    connection.query("SELECT * FROM `customers` WHERE `ID`=?", [req.query['id']], (err, results, fields) => {
      if(err)
        throw err;
        res.send(results[0]);
    });
  }
});

router.get('/getCustomer', (req, res, next) => {
  var obj = {
    custID: 0,
    userID: 0,
    email: '',
    phone: '',
    pass: '',
    wallet: 0,
    uID: 0,
    gender: '',
    first_name: '',
    last_name: '',
    dob: ''
  };
  connection.query("SELECT * FROM `customers` WHERE `ID`=?", [req.query.custID], (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      console.log("F");
      connection.query("SELECT * FROM `users` WHERE `ID`=?", [results[0].userID], (err1, results1, fields1) => {
        if(err1)
          throw err1;
        if(results1.length > 0) {
          obj.custID = req.query.custID;
          obj.dob = results1[0].dob;
          obj.gender = results1[0].gender;
          obj.uID = results[0].userID;
          obj.userID = results[0].userID;
          obj.first_name = results1[0].first_name;
          obj.last_name = results1[0].last_name;
          obj.email = results[0].email;
          obj.phone = results[0].phone;
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

router.get('/getWallet', (req, res, next) => {
  connection.query("SELECT * FROM wallet WHERE ID = ?", [req.query.walletID],
  (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      res.send({
        userID: req.query.walletID,
        amount: results[0].amount
      });
    }
    else {
      res.send({
        userID: 0,
        amount: 0
      })
    }
  });
});

router.post('/setWallet', (req, res, next) => {
  connection.query("SELECT * FROM customers WHERE ID = ?", [req.body.userID], //userID in reality points to custID here only
  (err_, results_, fields_) => {
    if(err_)
      throw err_;
    if(results_.length > 0) {
      connection.query("SELECT * FROM wallet WHERE ID = ?", [results_[0].userID],
      (err, results, fields) => {
        if(err)
          throw err;
        if(results.length > 0) {
          let updated = results[0].amount + req.body.amount;
          connection.query("UPDATE wallet SET amount = ? WHERE ID = ?", [updated, results_[0].userID],
          (err1, results1, fields1) => {
            if(err1)
              throw err1;
            connection.query("SELECT * FROM customers WHERE wallet = ?", [results_[0].userID],
            (err2, results2, fields2) => {
              if(err2)
                throw err2;
              if(results2.length > 0) {
                res.send(true);
              }
              else {
                connection.query("UPDATE customers SET wallet = ? WHERE ID = ?", [results_[0].userID, req.body.userID],
                (err3, results3, fields3) => {
                  if(err3) {
                    throw err3;
                  }
                  res.send(true);
                });
              }
            });
          });
        }
        else {
          connection.query("INSERT INTO wallet VALUES(?, ?)", [results_[0].userID, req.body.amount],
          (err1, results1, fields1) => {
            if(err1)
              throw err1;
            connection.query("UPDATE customers SET wallet = ? WHERE ID = ?", [results_[0].userID, req.body.userID],
            (err3, results3, fields3) => {
              if(err3) {
                throw err3;
              }
              res.send(true);
            });          
          });
        }
      });
    }
    else {
      res.send(false);
    }
  });
});

module.exports = router;