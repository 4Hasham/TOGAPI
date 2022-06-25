var express = require('express');
var router = express.Router();
var connection = require('./config');

router.post('/send', (req, res, next) => {
    var created = new Date();
    connection.query("INSERT INTO chat(message, sender, receiver, posted) VALUES(?, ?, ?, ?)",
    [req.body.message, req.body.sender, req.body.receiver, created],
    (err, results, fields) => {
        if(err)
            throw err;
        res.send(true);
    });
});

router.post('/getMsgs', (req, res, next) => {
    var ret = [];
    connection.query("SELECT * FROM chat WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY ID ASC",
    [req.body.id1, req.body.id2, req.body.id2, req.body.id1],
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length > 0) {
            for(let i = 0; i < results.length; ++i) {
                ret.push({
                    mID: results[i].ID,
                    message: results[i].message,
                    sender: results[i].sender,
                    receiver: results[i].receiver,
                    time: results[i].time
                })
            }
            res.send(ret);
        }
        else {
            res.send([]);
        }
    });
});

module.exports = router;