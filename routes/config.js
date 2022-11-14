var mysql = require('mysql');
var fs = require('fs');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hashamali641!',
    database: 'truckongo',
    port: 3306,
    // ssl: {
    //     ca:fs.readFileSync(__dirname + "/DigiCertGlobalRootCA.crt.pem")
    // }
});

con.connect((err) => {
    if(err)
        return console.error(err.message);
})

module.exports = con;