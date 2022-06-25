const cron = require('node-cron');
var connection = require('./routes/config');

connection.connect((err) => {
if(err)
    return console.error(err.message);
});

console.log("CRON JOBS STARTING");

cron.schedule('59 23 * * 5', function() {
    console.log("INTERCITY BOOKINGS EVERY FRIDAY STARTING..");
    connection.query("SELECT * FROM routes",
    (err, results, fields) => {
        if(err)
            throw err;
        if(results.length == 0)
            return;
        connection.query("UPDATE bookingdetails SET rating = -10 WHERE custID = ?", [results[0].ID],
        (err_, results_, fields_) => {
            if(err_)
                throw err_;
            var days = JSON.parse(results[0].days);
            for(let i = 0; i < days.length; ++i) {
                connection.query("INSERT INTO bookingdetails(custID, truckID, pickup, destination, date, time, rating, paymentID, loadID, intercity) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [results[0].ID, results[0].truckID, results[0].pickup, results[0].destination, days[i], results[0].time, 0, 0, 0, 1],
                (err1, results1, fields1) => {
                    if(err1)
                        throw err1;
                    if(i === days.length - 1) {
                        let d = new Date().toLocaleDateString();
                        connection.query("INSERT INTO scheduled(task, timestamp) VALUES(?, ?)", ["GENERATE_INTERCITY_RIDES_ROUTINE", d],
                        (err2, results2, fields2) => {
                            if(err2)
                                throw err2;                            
                            console.log("INTERCITY BOOKINGS EVERY FRIDAY COMPLETE!");
                        });
                    }
                });    
            } 
        });
    });
});