var express = require('express');
var router = express.Router();
var path = require('path');
var mysql = require('mysql');
var fs = require('fs');

router.post('/signUp', (req, res, next) => {
    console.log(req.body);
    res.send(true);
});

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

router.get('/Data', (req, res, next) => {
    var pth = path.join(__dirname + "/" + req.query['file'] + ".json");
    try {
        var d = fs.readFileSync(pth,  {encoding:'utf8', flag:'r'});
        console.log(pth, d);    
    }
    catch(e) {
        console.log(e);
    }
    var parsed = JSON.parse(d);
    res.send(parsed);
});

router.get('/DataA', (req, res, next) => {
    var pth = path.join(__dirname + "/" + req.query['file'] + ".json");
    try {
        var d = fs.readFileSync(pth,  {encoding:'utf8', flag:'r'});
        console.log(pth, d);    
    }
    catch(e) {
        console.log(e);
    }
    var parsed = JSON.parse(d);
    res.send({data: parsed});
});


router.get('/dbData', (req, res, next) => {
    switch(req.query['name']) {
        case 'routes':
            connection.query("SELECT * FROM bookingdetails WHERE intercity = 1",
            (err, results, fields) => {
                if(err)
                    throw err;
                console.log(results);
                res.send(results);
            });
            break;
        default:
            res.send({res: undefined});
            break;
    }
});

router.get('/getAddress', (req, res, next) => {
    var id = parseInt(req.query.id);
    connection.query("SELECT line1, line2, city FROM address WHERE ID = ?", [id], (err, results, fields) => {
        if(err) {
            throw err;
        }
        var addr = [results[0].line1, results[0].line2, results[0].city];
        res.send({res: addr});
    });
});

router.get('/getAddressA', (req, res, next) => {
    var obj = {
        aID: 0,
        line1: "",
        line2: "",
        city: ""
    };
    connection.query("SELECT line1, line2, city FROM address WHERE ID = ?", [req.query.aid], (err, results, fields) => {
        if(err) {
            throw err;
        }
        if(results.length > 0) {
            obj.aID = results[0].ID;
            obj.line1 = results[0].line1;
            obj.line2 = results[0].line2;
            obj.city = results[0].city;
            res.send(obj);
        }
        else {
            res.send(obj);
        }
    });
});

router.get('/getLoadsA', (req, res, next) => {
    var obj = {
        lID: 0,
        load: "",
        iID: "",
        category: ""
    };
    connection.query("SELECT * FROM loads WHERE ID = ?", [req.query.lid], (err, results, fields) => {
        if(err) {
            throw err;
        }
        if(results.length > 0) {
            obj.lID = results[0].ID;
            obj.load = results[0].loadItems;
            obj.iID = results[0].icID;
            obj.category = results[0].categories;
            res.send(obj);
        }
        else {
            res.send(obj);
        }
    });
});

router.get('/getLoads', (req, res, next) => {
    var obj = {
        lID: 0,
        load: "",
        iID: 0,
        category: ""
    };
    connection.query("SELECT * FROM loads WHERE ID = ?", [req.query.lid],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            obj.lID = results[0].ID;
            obj.load = results[0].loadItems;
            obj.iID = results[0].icID;
            obj.category = results[0].categories;
        }
        res.send(obj);
    });
});

router.post('/getCategories', (req, res, next) => {
    var obj = {
        lID: 0,
        load: "",
        iID: 0,
        category: ""
    };
    connection.query("SELECT * FROM loads WHERE ID = ?", [req.body.lID],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            obj.lID = results[0].ID;
            obj.load = results[0].loadItems;
            obj.iID = results[0].icID;
            obj.category = results[0].categories;
        }
        res.send(obj);
    });
});

router.post('/checkTruckAssigned', (req, res, next) => {
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
            console.log(results[0]);
            if(results[0].truckID != null && results[0].truckID > 0) {
                res.send(false);
            }
            else {
                res.send(true);
            }
        }
    });
});

module.exports = router;