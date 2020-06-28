const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'colors',
            group: 'rolegroup',
            guildOnly: false,
			memberName: 'colors',
			aliases: ['colors', 'colours'],
			description: 'Sends a list of colors you can use with the `setcolor` command.',
        });
    };

    run(message) {
        const colorEmbed = {
            color: "#1C37FF",
            title: 'Colors',
            description: 'A list of colors you can use for the setcolor command.\nYou can get hex color values from here: https://htmlcolors.com/google-color-picker',
            fields: [
                {
                    name: 'HEX color value',
                    value: 'For Example: #2A20E6',
                },
                {
                    name: 'Color presets',
                    value: 'Example: DEFAULT, WHITE, AQUA, GREEN, BLUE, YELLOW, PURPLE, LUMINOUS_VIVID_PINK, GOLD, ORANGE, RED, GREY, DARKER_GREY, NAVY. DARK_AQUA, DARK_GREEN, DARK_BLUE, DARK_PURPLE, DARK_VIVID_PINK, DARK_GOLD, DARK_ORANGE, DARK_RED. DARK_GREY, LIGHT_GREY, DARK_NAVY, RANDOM',
                    inline: false,
                },
            ],
            footer: {
                text: 'RoleBot',
            },
        };
        message.channel.send({ embed: colorEmbed });
    };
};