require('dotenv').config();

const Guild = require('./models/guild.js');

Guild.sync({
    alter: true
})
    .then(() => {
        console.log("Database synced.");
    })
    .catch((err) => {
        console.log(err);
    });