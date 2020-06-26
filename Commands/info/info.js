const config = require('../../shared/config.js')

const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
            group: 'other',
            guildOnly: false,
			memberName: 'info',
			description: 'Displays information about the bot.',
        });
    };

    run(message) {
        const infoEmbed = {
            color: "#1C37FF",
            title: '__**Info**__',
            fields: [
                {
                    name: "Currently in",
                    value: message.client.guilds.cache.size+" guilds",
                    inline: true
                },
                {
                    name: "Has been online for",
                    value: msToTime(message.client.uptime),
                    inline: true
                },
            ]
        };

        if (config.supportServer) {
            infoEmbed.fields.push({
                name: "Support",
                value: "Support for the bot is available on our support server: "+config.supportServerInvite,
                inline: false
            })
        }

        message.channel.send({ embed: infoEmbed });
    };
};


function msToTime(s) { // function stolen from https://stackoverflow.com/a/9763769

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }
  
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
  
    return pad(hrs) + ' hours, ' + pad(mins) + ' minutes and ' + pad(secs) + ' seconds.';
  }