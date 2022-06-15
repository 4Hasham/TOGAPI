var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var connection = require('./config');
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
        if(results.length > 0) {
          bcrypt.compare(pass, results[0].password, function(err, result) {
            if(err)
              throw err;
            if(result)
              res.send({
                drivID: results[0].ID,
                userID: results[0].userID
              });
            else {
              res.send({drivID: 0, userID: 0});
            }
          });
        }
        else {
          res.send({
            drivID: 0,
            userID: 0
          })
        }
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
    connection.query("SELECT * FROM trucks WHERE ID = ?", [req.body.tID],
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

router.get('/getDriver', (req, res, next) => {
  var obj = {
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
  };
  connection.query("SELECT * FROM `drivers` WHERE `ID`=?", [req.query.driverID], (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      console.log("F");
      connection.query("SELECT * FROM `users` WHERE `ID`=?", [results[0].userID], (err1, results1, fields1) => {
        if(err1)
          throw err1;
        if(results1.length > 0) {
          obj.drivID = req.query.driverID;
          obj.dob = results1[0].dob;
          obj.gender = results1[0].gender;
          obj.uID = results1[0].userID;
          obj.userID = results1[0].userID;
          obj.first_name = results1[0].first_name;
          obj.last_name = results1[0].last_name;
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
  connection.query("SELECT * FROM wallet WHERE ID = ?", [req.body.userID],
    (err, results, fields) => {
      if(err)
        throw err;
      if(results.length > 0) {
        let updated = results[0].amount + req.body.amount;
        connection.query("UPDATE wallet SET amount = ? WHERE ID = ?", [updated, req.body.userID],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          connection.query("SELECT * FROM drivers WHERE wallet = ?", [req.body.userID],
          (err2, results2, fields2) => {
            if(err2)
              throw err2;
            if(results2.length > 0) {
              res.send(true);
            }
            else {
              connection.query("UPDATE drivers SET wallet = ? WHERE userID = ?", [req.body.userID, req.body.userID],
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
        connection.query("INSERT INTO wallet VALUES(?, ?)", [req.body.userID, req.body.amount],
        (err1, results1, fields1) => {
          if(err1)
            throw err1;
          connection.query("UPDATE drivers SET wallet = ? WHERE userID = ?", [req.body.userID, req.body.userID],
          (err3, results3, fields3) => {
            if(err3) {
              throw err3;
            }
            res.send(true);
          });          
        });
      }
    }
  );
});

router.get('/getPrevDriverRidesApp', (req, res, next) => {
  ret = [];
  console.log(req.query);
  connection.query("SELECT * FROM bookingdetails WHERE truckID = ? ORDER BY ID DESC LIMIT 10", [req.query.truckID],
  (err, results, fields) => {
      if(err)
          throw err;
          console.log(results);
      if(results.length > 0) {
          for(let i = 0; i < results.length; ++i) {
              let c = {
                  bID: results[i].ID,
                  custID: results[i].custID,
                  truckID: results[i].truckID,
                  pickup: results[i].pickup,
                  destination: results[i].destination,
                  date: results[i].date,
                  time: results[i].time,
                  rating: results[i].rating,
                  paymentID: results[i].paymentID,
                  loadID: results[i].loadID,
                  intercity: results[i].intercity
              };
              ret.push(c);
          }
          res.send(ret);
      }
      else {
          res.send(ret);            
      }
  });
});

router.get('/getAggregateRatingIntercity', (req, res, next) => {
  connection.query("SELECT * FROM driverrating WHERE driverID = ?", [req.query.did],
  (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      let rating = 0.0;
      for(let i = 0; i < results.length; ++i) {
        rating = rating + results[i].rating;
      }
      rating = (rating / results.length).toFixed();
      res.send(rating.toString());
    }
    else {
      res.send((0).toString());
    }
  });
});

router.get('/getAggregateRatingIntracity', (req, res, next) => {
  connection.query("SELECT * FROM bookingdetails WHERE rating > 0 AND rating <= 5 AND truckID IN (SELECT ID FROM trucks WHERE driverID = ?)",
  [req.query.did],
  (err, results, fields) => {
    if(err)
      throw err;
    if(results.length > 0) {
      let rating = 0.0;
      for(let i = 0; i < results.length; ++i) {
        rating = rating + results[i].rating;
      }
      rating = (rating / results.length).toFixed();
      res.send(rating.toString());
    }
    else {
      res.send((0).toString());
    }
  });
});

router.post('/setDriverInfo', (req, res, next) => {
  console.log(req.files);
  console.log(req.body);
  try {
    if(!req.files) {
        res.send({
            status: false,
            message: 'No file uploaded'
        });
    } else {
        let cnicFront = req.files.cnicFront;        
        let cnicBack = req.files.cnicBacl;        
        let licenseFront = req.files.licenseFront;        
        let licenseBack = req.files.licenseBack;        
        cnicFront.mv(__dirname + '../public/uploads/' + req.body.cnicFrontName);
        cnicBack.mv(__dirname + '../public/uploads/' + req.body.cnicBackName);
        licenseFront.mv(__dirname + '../public/uploads/' + req.body.licenseFrontName);
        licenseBack.mv(__dirname + '../public/uploads/' + req.body.licenseBackName);

        connection.query("INSERT INTO driver_info(driverID, license_front, license_back, cnic_front, cnic_back) VALUES(?, ?, ?, ?, ?)",
        [req.body.driverID, req.body.licenseFrontName, req.body.licenseBackName, req.body.cnicFrontName, req.body.cnicBackName],
        (err, results, fields) => {
          if(err)
            throw err;
          res.send({
            status: true,
            message: 'Files uploaded',
            data: {
              cnicFront: {
                name: req.body.cnicFrontName,
                mimetype: cnicFront.mimetype,
                size: cnicFront.size
              },
              cnicBack: {
                name: req.body.cnicBackName,
                mimetype: cnicBack.mimetype,
                size: cnicBack.size
              },
              licenseFront: {
                name: req.body.licenseFrontName,
                mimetype: licenseFront.mimetype,
                size: licenseFront.size
              },
              licenseBack: {
                name: req.body.licenseBackName,
                mimetype: licenseBack.mimetype,
                size: licenseBack.size
              }
            }
          });
        });

    }
  } catch (err) {
    res.status(500).send(err);
  }  
});

module.exports = router;