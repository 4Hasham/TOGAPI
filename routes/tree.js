var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var admin1 = require('../routes/firebase-config');
const { JavaCaller } = require('java-caller');
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

router.post("/findDrivers", async(req, res, next) => {
  var db = admin1.database();
  const ref = db.ref('trucks');
  ref.on('value', async(snapshot) => {
    try {
      const java = new JavaCaller({
        classPath: ['business/RTreeMap.jar', 'business/p/gson-2.2.2.jar', 'business/p/rtree2-0.9-RC1.jar', 'business/p/grumpy-core-0.4.5.jar', 'business/p/commons-math3-3.6.1.jar', 'business/p/guava-mini-0.1.2.jar', 'business/p/geocoder-java-0.15.jar'],
        mainClass: 'p.RTreeMap',
        rootPath: __dirname,
        minimumJavaVersion: 17
      });
      const {status, stdout, stderr} = await java.run([JSON.stringify(req.body), JSON.stringify(snapshot.val())]);
      console.log(stdout, stderr);
    }
    catch(e) {
      console.log(e);
    }
  }, (errorObject) => {
    console.log(errorObject.name);
  });
});

module.exports = router;