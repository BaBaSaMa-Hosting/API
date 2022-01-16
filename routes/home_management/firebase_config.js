const admin = require("firebase-admin");
var service_account = require("./service_account.json");

admin.initializeApp({
    credential: admin.credential.cert(service_account)
});

module.exports.admin = admin