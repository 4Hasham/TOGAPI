var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');

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

router.post('/intercity', (req, res, next) => {
    connection.query("INSERT INTO bookingDetails(custID, truckID, pickup, destination, date, time, rating, paymentID, loadID, intercity) VALUES(?, 0, ?, ?, ?, ?, 0, 0, ?, 1)", [id], (err, results, fields) => {
        if(err) {
            throw err;
        }
        res.send({
            bID: results.insertId,
            custID: 0,
            truckID: 0,
            pickup: 0,
            destination: 0,
            date: '',
            time: '',
            rating: 0,
            paymentID: 0,
            loadID: 0,
            intercity: 1
        });
    });
});

router.post('/intracity', (req, res, next) => {
    connection.query("INSERT INTO bookingDetails(custID, truckID, pickup, destination, date, time, rating, paymentID, loadID) VALUES(?, 0, ?, ?, ?, ?, 0, 0, ?)", [req.body.custID, req.body.pickup, req.body.destination, req.body.date, req.body.time, req.body.loadID], (err, results, fields) => {
        if(err) {
            throw err;
        }
        res.send({
            bID: results.insertId,
            custID: 0,
            truckID: 0,
            pickup: 0,
            destination: 0,
            date: '',
            time: '',
            rating: 0,
            paymentID: 0,
            loadID: 0,
            intercity: 0
        });
    });
});

router.get('/getIntercity', (req, res, next) => {
    var pickupID = -1, destID = -1;
    connection.query("SELECT * FROM address WHERE city=?", [req.query.pickup],
    (err, results, fields) => {
        if(err)
            throw err;
        console.log(results[0]);
        if(results.length > 0)
            pickupID = results[0].ID
        
        connection.query("SELECT * FROM address WHERE city=?", [req.query.destination],
        (err1, results1, fields1) => {
            if(err1)
                throw err1;
            if(results1.length > 0)
                destID = results1[0].ID
            if(destID >= 0 && pickupID >= 0)
                connection.query("SELECT * FROM bookingDetails WHERE intercity = 1 AND pickup = ? AND destination = ?", [pickupID, destID],
                (err2, results2, fields2) => {
                    if(err2)
                        throw err2;
                    var ret = [];
                    for(let i = 0; i < results2.length; ++i)
                        ret.push({
                            bID: results2[i].ID,
                            custID: results2[i].custID,
                            truckID: results2[i].truckID,
                            pickup: results2[i].pickup,
                            destination: results2[i].destination,
                            date: results2[i].date,
                            time: results2[i].time,
                            rating: results2[i].rating,
                            paymentID: results2[i].paymentID,
                            loadID: results2[i].loadID,
                            intercity: results2[i].intercity
                        });
                    console.log(ret);
                    res.send(ret);
                });
            else
                res.send([]);
        });    
    });
});

module.exports = router;