var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
var admin1 = require('../routes/firebase-config');
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

module.exports = router;