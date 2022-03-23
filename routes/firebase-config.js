var admin = require("../functions/node_modules/firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://still-nebula-323018-default-rtdb.firebaseio.com"
});

module.exports = admin;