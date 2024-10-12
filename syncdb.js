require('dotenv').config();

const BannedMember = require('./models/bannedMember.js');

BannedMember.sync({
    force: true,
})
.then(() => {
    console.log("Database synced.");
})
.catch((err) => {
    console.log(err);
});