const mongoose = require('mongoose');
const models = require('../../shared/models.js');

const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'deleterole',
			group: 'rolegroup',
			memberName: 'deleterole',
			guildOnly: true,
			aliases: ['delete'],
			description: 'Deletes your role.',
			args: [
				{
					key: 'who',
					prompt: 'Who\'s role do you wish to delete?',
					type: 'string',
					default: '',
				},
			],
		});
    }
    
    run(message, { who }) {
		let changeMember = message.author;
		let userOrYou = "You do"
		if (who) {
			if (message.mentions.users.array()[0]) {
				if (message.member.hasPermission('MANAGE_ROLES')) { // If member tries to and has permission to change another users role.
					changeMember = message.mentions.users.array()[0];
					userOrYou = changeMember.username+" does";
				} else {
					return message.say(":x:You are not permitted to change other peoples roles. The ```MANAGE_ROLES``` permission is required.");
				}
			} else {
				return message.say(":x:The member you tagged does not exist.");
			}
		}
		mongoose.model(message.guild.id, models.roleSchema).findOneAndDelete({userID: changeMember.id}, (err, res) => {
			if (err) {return message.say(":x:Something database related went wrong.")};
			if (res !== null) { // if the role was found and deleted
				message.guild.roles.fetch(res.roleID).then(role => {
					role.delete();
					return message.say(":white_check_mark:Successfully deleted "+changeMember.username+"'s role.");
				})
				.catch(err => {
					console.log(err);
					return message.say(":x:Failed to delete your role. maybe it doesn't exist");
				});
			} else {
				return message.say(":x:"+userOrYou+" not have a role.");
			}
		})
	};
};

