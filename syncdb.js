require('dotenv').config();
const Guild = require('./models/guild.js');

Guild.sync({
    force: true,
})
.then(() => {
    console.log('Guild Database synced.');
})
.catch((err) => {
    console.log(err);
});