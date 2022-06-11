var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');

var connection = require('./config');
router.get('/getBooking', (req, res, next) => {
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.query.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            res.send({
                bID: results[0].ID,
                custID: results[0].custID,
                truckID: results[0].truckID,
                pickup: results[0].pickup,
                destination: results[0].destination,
                date: results[0].date,
                time: results[0].time,
                rating: results[0].rating,
                paymentID: results[0].paymentID,
                loadID: results[0].loadID,
                intercity: results[0].intercity
            });
        }
        else {
            res.send({
                bID: 0,
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
            })
        }
    });
});

router.post('/completeRating', (req, res, next) => {
    console.log(req.body);
    connection.query("UPDATE bookingdetails SET rating=? WHERE ID=?", [req.body.rating, req.body.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        res.send(true);
    });
});

router.post('/completePayment', (req, res, next) => {
   console.log(req.body);
   connection.query("INSERT INTO payment(paid, extra, fare) VALUES(?, ?, ?)", [req.body.paid, req.body.extra, req.body.fare],
   (err, results, fields) => {
       if(err)
        throw err;
       res.send((results.insertId).toString())
   });
});

router.post('/completeRide', (req, res, next) => {
    connection.query("UPDATE bookingdetails SET paymentID = ? WHERE ID = ?", [req.body.paymentID, req.body.bID],
    (err, results, fields) => {
        if(err)
         throw err;
        res.send(true);
    });
});

router.post('/calculateFare', (req, res, next) => {
    //Base Fare + ((Cost per minute x time of the ride) + (cost per mile x ride distance) x surge boost multiplier) + booking fee
    console.log(req.query);
    var base = 500;
    var cp_min = 12;
    var cp_mile = 10;
    var booking_fee = 50;
    var surge = req.body.surge;
    var mins = req.body.mins;
    var miles = req.body.miles;
    var ride_type = req.body.ride_type;

    if(ride_type == 1)
        base = 1000;
    else if(ride_type == 2)
        base = 2000;        

    var fee = base + booking_fee + ((cp_min * mins) + (cp_mile * miles) * surge);
    console.log(fee);
    console.log("Company commission: " + ((fee * 8)) / 100)
    res.send({
        pID: 0,
        paid: 0,
        extra: 0,
        fare: Math.round(fee)
    });
});

router.post('/getActiveCustomerRides', (req, res, next) => {
    console.log(req.body);
    ret = [];
    connection.query("SELECT * FROM bookingdetails WHERE custID = ? AND rating = ? AND intercity = 0 ORDER BY ID DESC LIMIT 10", [req.body.custID, 0],
    (err, results, fields) => {
        if(err)
            throw err;
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
            console.log(ret);
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});

router.get('/getActiveCustomerRidesApp', (req, res, next) => {
    console.log(req.body);
    ret = [];
    connection.query("SELECT * FROM bookingdetails WHERE custID = ? AND rating = ? AND intercity = 0 ORDER BY ID DESC LIMIT 5", [req.query.custID, 0],
    (err, results, fields) => {
        if(err)
            throw err;
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
            console.log(ret);
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});

router.post('/getPrevCustomerRides', (req, res, next) => {
    ret = [];
    console.log(req.body);
    connection.query("SELECT * FROM bookingdetails WHERE custID = 2 AND paymentID <> 0 AND intercity = 0 LIMIT 10", [req.body.custID, 0],
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

router.get('/getPrevCustomerRidesApp', (req, res, next) => {
    ret = [];
    console.log(req.body);
    connection.query("SELECT * FROM bookingdetails WHERE custID = ? AND rating != 0 AND intercity = 0 ORDER BY ID DESC LIMIT 10", [req.query.custID],
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

router.post('/intercity', (req, res, next) => {
    connection.query("INSERT INTO bookingdetails(custID, truckID, pickup, destination, date, time, rating, paymentID, loadID, intercity) VALUES(?, 0, ?, ?, ?, ?, 0, 0, ?, 1)", [id], (err, results, fields) => {
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

router.post('/assignTruckToCustomer', (req, res, next) => {
    var obj = {
        bID: 0,
        custID: 0,
        truckID: 0,
        pickup: 0,
        destination: 0,
        date: "",
        time: "",
        rating: 0,
        paymentID: 0,
        loadID: 0,
        intercity: 0
    };
    connection.query("SELECT * FROM bookingdetails WHERE ID = ?", [req.body.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            connection.query("UPDATE bookingdetails SET truckID = ? WHERE ID = ?", [req.body.truckID, req.body.bID],
            (err1, results1, fields1) => {
                if(err1)
                    throw err1;
                res.send(true);
            });
        }
        else
            res.send(false);
    });
});


router.get('/getIntercity', (req, res, next) => {
    var pickupID = -1, destID = -1;
    connection.query("SELECT * FROM address WHERE city=? AND line1 IS NULL ORDER BY ID DESC", [req.query.pickup],
    (err, results, fields) => {
        if(err)
            throw err;
        console.log(results[0]);
        if(results.length > 0)
            pickupID = results[0].ID
        
        connection.query("SELECT * FROM address WHERE city=? AND line1 IS NULL ORDER BY ID DESC", [req.query.destination],
        (err1, results1, fields1) => {
            if(err1)
                throw err1;
            if(results1.length > 0)
                destID = results1[0].ID
            if(destID >= 0 && pickupID >= 0)
                connection.query("SELECT * FROM bookingdetails WHERE intercity = 1 AND rating = 0 AND pickup = ? AND destination = ?", [pickupID, destID],
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

router.get('/getIntercityBookable', (req, res, next) => {
    var pickupID = -1, destID = -1;
    connection.query("SELECT * FROM address WHERE city=? AND line1 IS NULL ORDER BY ID DESC", [req.query.pickup],
    (err, results, fields) => {
        if(err)
            throw err;
        console.log(results[0]);
        if(results.length > 0)
            pickupID = results[0].ID
        
        connection.query("SELECT * FROM address WHERE city=? AND line1 IS NULL ORDER BY ID DESC", [req.query.destination],
        (err1, results1, fields1) => {
            if(err1)
                throw err1;
            if(results1.length > 0)
                destID = results1[0].ID
            if(destID >= 0 && pickupID >= 0)
                connection.query("SELECT * FROM bookingdetails WHERE intercity = 1 AND pickup = ? AND destination = ? AND rating = 0", [pickupID, destID],
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

router.get('/cancelIntercityBooking', (req, res, next) => {
    connection.query("DELETE FROM intercity WHERE ID = ?", [req.query.iID],
    (err, results, fields) => {
        if(err)
            throw err;
        res.send(true);
    });
});

router.post('/setIntercityBookingStatus', (req, res, next) => {
    connection.query("UPDATE intercity SET status = ? WHERE ID = ?", [req.body.status, req.body.iID],
    (err, results, fields) => {
        if(err)
            throw err;
        res.send(true);
    });
});

router.get('/getIntercityRides', (req, res, next) => {
    console.log(req.query.truckID);
    var ret = [];
    connection.query("SELECT * FROM bookingdetails WHERE truckID = ? AND intercity = 1 AND rating = 0", [req.query.truckID],
    (err_, results_, fields_) => {
        if(err_)
            throw err_;
        if(results_.length == 0)
            res.send([]);
        else {
            for(let i = 0; i < results_.length; ++i) {
                connection.query("SELECT * FROM address WHERE ID = ?", [results_[i].pickup],
                (err, results, fields) => {
                    if(err)
                        throw err;
                    connection.query("SELECT * FROM address WHERE ID=?", [results_[i].destination],
                    (err1, results1, fields1) => {
                        if(err1)
                            throw err1;
                        ret.push({
                            bID: results_[i].ID,
                            pickup: results[0].city,
                            destination: results1[0].city,
                            day: results_[i].date,
                            time: results_[i].time
                        });
                        if(i == results_.length - 1) {
                            console.log(ret);
                            res.send(ret);
                        }
                    });    
                });
            } 
        }
    });
});

router.get('/assignPass', (req, res, next) => {
    console.log(req.query);
    ret = [];
    connection.query("SELECT * FROM intercity WHERE ID = ? AND status = 1", [req.query.bid],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            let pass = results.length + 11;
            res.send(pass.toString());
        }
        else {
            res.send((0).toString());
        }
    });
});

router.get('/getIntercityRideStatus', (req, res, next) => {
    console.log(req.query);
    ret = [];
    connection.query("SELECT * FROM intercity WHERE ID = ?", [req.query.bid],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            let pass = results[0].status;
            res.send(pass.toString());
        }
        else {
            res.send((-1).toString());
        }
    });
});

router.get('/getActiveIntercityRides', (req, res, next) => {
    console.log(req.query);
    ret = [];
    connection.query("SELECT * FROM intercity WHERE custID = ? AND (status = 0 OR status = 1 OR status = 2 OR status = 3 OR status = 4)", [req.query.custID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            for(let i = 0; i < results.length; ++i) {
                var ob = {
                    iID: results[i].ID,
                    bookingID: results[i].bookingID,
                    custID: results[i].custID,
                    loadID: results[i].loadID,
                    payment: results[i].payment,
                    day: results[i].day,
                    status: results[i].status
                };
                ret.push(ob);
            }
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});

router.get('/getPrevIntercityRides', (req, res, next) => {
    ret = [];
    connection.query("SELECT * FROM intercity WHERE custID = ? AND (status = -1 OR status = 5)", [req.query.custID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            for(let i = 0; i < results.length; ++i) {
                var ob = {
                    iID: results[i].ID,
                    bookingID: results[i].bookingID,
                    custID: results[i].custID,
                    loadID: results[i].loadID,
                    payment: results[i].payment,
                    day: results[i].day,
                    status: results[i].status
                };
                ret.push(ob);
            }
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});

router.get('/getIntercityBooking', (req, res, next) => {
    connection.query("SELECT * FROM bookingdetails WHERE ID = ? AND intercity = 1", [req.query.bookingID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            res.send({
                bID: results[0].ID,
                custID: results[0].custID,
                truckID: results[0].truckID,
                pickup: results[0].pickup,
                destination: results[0].destination,
                date: results[0].date,
                time: results[0].time,
                rating: results[0].rating,
                paymentID: results[0].paymentID,
                loadID: results[0].loadID,
                intercity: results[0].intercity
            });        
        }
    });
});

router.get('/getintercityRide', (req, res, next) => {
    ret = [];
    connection.query("SELECT * FROM intercity WHERE ID = ?", [req.query.iID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
                var ob = {
                    iID: results[0].ID,
                    bookingID: results[0].bookingID,
                    custID: results[0].custID,
                    loadID: results[0].loadID,
                    payment: results[0].payment,
                    day: results[0].day,
                    status: results[0].status
                };
            res.send(ob);
        }
        else {
            var ob = {
                iID: 0,
                bookingID: 0,
                custID: 0,
                loadID: 0,
                payment: 0,
                day: "",
                status: 0
            };
            res.send(ob);
        }
    });
});

router.post('/setBookingStatus', (req, res, next) => {
    connection.query("UPDATE bookingdetails SET rating = ? WHERE ID = ?", [req.body.rating, req.body.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        res.send(true);
    });
});

router.get('/getIntercityRidesByBooking', (req, res, next) => {
    console.log(req.query);
    ret = [];
    connection.query("SELECT * FROM intercity WHERE bookingID = ? AND status = 0", [req.query.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            for(let i = 0; i < results.length; ++i) {
                var ob = {
                    iID: results[i].ID,
                    bookingID: results[i].bookingID,
                    custID: results[i].custID,
                    loadID: results[i].loadID,
                    payment: results[i].payment,
                    day: results[i].day,
                    status: results[i].status
                };
                ret.push(ob);
            }
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});


router.get('/proceedIntercityStatus', (req, res, next) => {
    connection.query("SELECT * FROM intercity WHERE ID = ? AND rating <> -1 AND rating <> 5", [req.query.iID],
    (err_, results_, fields_) => {
        if(err_)
            throw err_;
        if(results_.length > 0) {
            connection.query("UPDATE intercity SET status = ? WHERE ID = ?", [results_[0].status + 1, req.query.iID],
            (err, results, fields) => {
                if(err)
                    throw err;
                res.send(true);
            });        
        }
        else {
            res.send(false);
        }
    });
});

router.get('/getAcceptedIntercityRidesByBooking', (req, res, next) => {
    console.log(req.query);
    ret = [];
    connection.query("SELECT * FROM intercity WHERE bookingID = ? AND status = 1", [req.query.bID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            for(let i = 0; i < results.length; ++i) {
                var ob = {
                    iID: results[i].ID,
                    bookingID: results[i].bookingID,
                    custID: results[i].custID,
                    loadID: results[i].loadID,
                    payment: results[i].payment,
                    day: results[i].day,
                    status: results[i].status
                };
                ret.push(ob);
            }
            res.send(ret);
        }
        else {
            res.send(ret);
        }
    });
});

module.exports = router;