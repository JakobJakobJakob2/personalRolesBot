const mongoose = require('mongoose');
mongoose.pluralize(null);
const models = require('../../shared/models.js')
const config = require('../../shared/config.js');


const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'setcolor',
			group: 'rolegroup',
            memberName: 'setcolor',
            guildOnly: true,
			aliases: ['color', 'colour', 'setcolour'],
			description: 'Sets the color of your role.',
			args: [
				{
					key: 'newRoleColor',
					prompt: `What new role color? Accepted types are for example: "${config.prefix}setcolor GREEN2 and "${config.prefix}setcolor #20eb00". Type "${config.prefix}colors" for a list of available colors`,
					type: 'string',
				},
			],
        });
    };
        run(message, { newRoleColor }) {
            newRoleColor = newRoleColor.toUpperCase();
            let roleModel = mongoose.model(message.guild.id, models.roleSchema);
            roleModel.findOne({ userID: message.author.id}, async (err, record) => {
                if (record === null) { return message.say(`:x:You don't have a role created for you yet. create one with the "${config.prefix}setrole" command`);}
                let role;
                try {
                    role = await message.guild.roles.fetch(record.roleID);
                } catch(err) {
                    return message.say(`:x:Failed to fetch your role. Please try recreating it with ${config.prefix}deleterole and then ${config.prefix}setrole`);
                }
                if (role !== null) {
                    try {
                        await role.edit({ color: newRoleColor });
                    } catch(err) {
                        return message.say(`:x:Failed to edit your roles color. Please refer to ${config.prefix}colors for what colors you can apply to your role.`);
                    }
                    return message.say(":white_check_mark:Successfully updated your role color.");
                }
            });
        }

};