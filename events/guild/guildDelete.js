const Guild = require('../../models/guild.js');
const GuildMember = require('../../models/guildMember.js');
const BannedMember = require('../../models/bannedMember.js');

module.exports = {
    name: 'guildDelete',
    async execute(guild) {
        await Guild.destroy({
            where: {
                id: guild.id
            }
        });
        await GuildMember.destroy({
            where: {
                guildId: guild.id
            }
        });
        await BannedMember.destroy({
            where: {
                guildId: guild.id
            }
        });
    }
}