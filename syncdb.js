require('dotenv').config();

const User = require('./models/user');

User.sync({
    force: true,
})
.then(() => {
    console.log("Database synced.");
})
.catch((err) => {
    console.log(err);
});