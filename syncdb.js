require('dotenv').config();

const WelcomeRole = require('./models/bannedMember.js');

WelcomeRole.sync({
    force: true,
})
.then(() => {
    console.log("Database synced.");
})
.catch((err) => {
    console.log(err);
});