require('dotenv').config();

const User = require('./models/user');

User.sync({
    force: true,
})
.then(() => {
    console.log(`${User.name} Database synced.`);
})
.catch((err) => {
    console.log(err);
});