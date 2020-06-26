const mongoose = require('mongoose');
const rolefunction = require('./rolefunctions.js')

const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'setrole',
			group: 'rolegroup',
			memberName: 'setrole',
			guildOnly: true,
			aliases: ['role'],
			description: 'Sets your role.',
			throttling: { // how many usages allowed within a certain duration in seconds
				usages: 3,
				duration: 10
			},
			args: [
				{
					key: 'newRoleName',
					prompt: 'What new role name?',
					type: 'string',
				},
			],
		});
    }
    
    run(message, { newRoleName }) {
		let changeMember = message.author;
		if (message.mentions.users.array()[0]) {
			if (message.member.hasPermission('MANAGE_ROLES')) { // If member tries to and has permission to change another users role.
				if (message.content.replace("setrole", "").replace(/<@.*>/, '').replace(" ", "").length <= 3) { // make sure a rolename was specified
					return message.say(":x: Please specify the role name you want "+message.mentions.users.array()[0].username+" to have.")
				}
				changeMember = message.mentions.users.array()[0];
			} else {
				return message.say(":x: You are not permitted to change other peoples roles. The ```MANAGE_ROLES``` permission is required.");
			}
		}
		rolefunction.requestRoleChange(message, newRoleName, changeMember, (err, newName, wasCreated) => {
			if (err) {
				console.error(err);
				return message.say(":x: Error: "+err);
			}
			let who;
			if (message.author!=changeMember) {who=changeMember.username+"'s"} else {who="your"};
			if (wasCreated) { // if the user didn't have a role and we needed to create one.
				return message.say(":white_check_mark: Successfully created "+who+" role.");
			} else { // if the user already had a role so we updated it.
				return message.say(":white_check_mark: Successfully updated "+who+" role."); 
			}
		});
		}
    
};

