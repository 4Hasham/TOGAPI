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

router.post('/getTruck', function(req, res, next) {
  var obj = {
    tID: 0,
    numberPlate: "",
    ttype: "",
    driverID: 0,
    capacity: 0,
    length: 0
  };

  if(req.body.tID > 0) {
    connection.query("SELECT * FROM trucks WHERE ID = ?", [req.body.tID],
    (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        obj.tID = results[0].ID;
        obj.numberPlate = results[0].numberplate;
        obj.ttype = results[0].type;
        obj.driverID = results[0].driverID;
        obj.capacity = results[0].capacity;
        obj.length = results[0].length;

        res.send(obj);
      }
      else {
        res.send(obj);
      }
    });
  }
});

router.post("/getTrucks", function(req, res, next) {
  var obj = {
    tID: 0,
    numberPlate: "",
    ttype: "",
    driverID: 0,
    capacity: 0,
    length: 0
  };
  if(req.body !== null) {
    connection.query("SELECT * FROM trucks WHERE driverID = ? AND ID = ?", [req.body.driverID, req.body.tID],
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
        res.send([obj]);
      }
    });
  }
  else {
    console.log("sasd");
    res.send([obj]);
  }
});

router.get("/getTrucksByDriver", function(req, res, next) {
  var obj = {
    tID: 0,
    numberPlate: "",
    ttype: "",
    driverID: 0,
    capacity: 0,
    length: 0
  };
  console.log(req.query['truck']);
  if(req.query['truck'] !== null) {
    connection.query("SELECT * FROM trucks WHERE driverID = ?", [req.query['truck']],
    (err, results, fields) => {
      if(err)
        throw err;
      console.log(results);
      if(results.length > 0) {
        var ret = [];
        for(let i = 0; i < results.length; ++i) {
          var ob = {
            tID: results[i].ID,
            numberPlate: results[i].numberplate,
            ttype: results[i].type,
            driverID: results[i].driverID,
            capacity: results[i].capacity,
            length: results[i].length
          }
          ret.push(ob);
        }
        res.send(ret);
      }
      else {
        res.send([obj]);
      }
    });
  }
  else {
    console.log("sasd");
    res.send([obj]);
  }
});

router.post("/getCurrentTruck", (req, res, next) => {
  var uid = req.body.driverID;
  if(uid > 0) {
    connection.query("SELECT * FROM current_trucks WHERE userID = ?", [uid],
    (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        res.status(200).send((results[0].tID).toString());
      }
      else {
        connection.query("SELECT * FROM trucks WHERE driverID = ?", [uid],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          if(results1.length > 0) {
            connection.query("INSERT INTO current_trucks VALUES(?, ?)", [uid, results1[0].ID],
            (err2, results2, fiedls2) => {
              if(err2)
                throw err2;
            });
            res.status(200).send((results1[0].ID).toString());
          }
          else {
            res.status(200).send((-1).toString());
          }
        });
      }
    });
  }
  else {
    res.status(200).send((-1).toString());
  }
});

router.post("/setCurrentTruck", (req, res, next) => {
  var tid = req.body.tID;
  var uid = req.body.driverID;

  if(tid > 0 && uid > 0) {
    connection.query("SELECT * FROM current_trucks WHERE userID = ?", [uid],
    (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        connection.query("UPDATE current_trucks SET tID = ? WHERE userID = ?", [tid, uid],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          res.status(200).send(true);
        });
      }
      else {
        connection.query("INSERT INTO current_trucks(tID, userID) VALUES(?, ?)", [tid, uid],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          res.status(200).send(true);
        });
      }
    });
  }
  else {
    res.status(200).send(false);
  }
});

module.exports = router;