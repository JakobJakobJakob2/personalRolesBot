const mongoose = require('mongoose')
const models = require('../../shared/models.js')
const optionFuncs = require('./optionFunctions');

const { Command } = require('discord.js-commando');
module.exports = class setRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'options',
			group: 'options',
			memberName: 'options',
			userPermissions: ['ADMINISTRATOR'],
			guildOnly: true,
			aliases: ['settings'],
			description: 'Change the bots settings for this guild.',
			args: [
				{
					key: 'whatOption',
					type: 'string',
					prompt: 'What option would you like to change?',
					default: 'none'
				},
				{
					key: 'whatValue',
					type: 'string',
					prompt: 'What value would you like to set this option to?',
					default: 'none'
				},
			],
		});
    }

    run(message, { whatOption, whatValue }) {
		let optionModel = mongoose.model('guildOptions', models.optionSchema);

		if (whatOption == 'none') {
			return message.say(`
			List of options:
			**toprole** sets the role that all your user roles will be put under. Usage:
			\`options toprole @role/roleid\`

			**mee6integration** Makes users role position in the hiearchy the same to their mee6 level in the server. Usage:
			\`options mee6integration on/off\`
		`)};

		if (whatOption != 'none' && whatValue == 'none') {
			return message.say(":x:You need to provide what to change the option to. Please type the options command without any arguments to view the usage of this command.")
		} else if (whatOption != 'none' && whatValue != 'none') { // if valid arguments are recieved

			
			if (whatOption == "toprole") {
				toproleCommand(optionModel, whatValue, message);
			} else if (whatOption == "mee6integration") {
				mee6integrationCommand(optionModel, whatValue, message);
			} else {
				return message.say(":x:Invalid option.")
			}
		}
		
    };

};

async function toproleCommand(optionModel, whatValue, message) {
	let roleId = whatValue.split("<@&").pop().split(">")[0]; // if you tag a role it formats it to <@&ROLEID> therefore we remove that <@& and > so we're left with just the roleId
	let topRole;
	let er;
	try {
		topRole = await message.guild.roles.fetch(roleId);
	} catch(err) {
		console.error(err);
		er = true;
	}
	if (topRole == null || topRole == undefined || er) {
		return message.say(":x:Failed to fetch the role. please make sure you have put in the correct roleId or that you tagged the role correctly.");
	}


	optionModel.findOne({ guildId: message.guild.id}, (err, record) => {
		if (err) {console.error(err); return message.say("Database error.")};
		
		let updatedOptionsObject = {};
		if(record !== null) {
			updatedOptionsObject = record.options;
		}
		updatedOptionsObject.topRoleId = topRole.id;
		optionFuncs.optionObjectCheck(record, message, updatedOptionsObject, (err) => {
			if (err) {console.error(err); return message.say(":x:Something went wrong.")}
			return message.say(":white_check_mark: Successfully changed the top role!");
		});
	});
}

function mee6integrationCommand(optionModel, whatValue, message) {
	let note = "\nNote: This bot has nothing to do with the mee6 bot so please do not ask support about this feature to them. This feature may also become unstable and broken at any time. Make sure you have the mee6 bot in the server with level integration enabled"
	optionModel.findOne({ guildId: message.guild.id}, (err, record) => {
		if (err) {console.error(err); return message.say(":x:Database error.");};
		let updatedOptionsObject = {};
		if (record !== null) {
			updatedOptionsObject = record.options;
		}
		if (whatValue.toLowerCase() == "off") {
			updatedOptionsObject.mee6Enabled = false;
		} else if (whatValue.toLowerCase() == "on") {
			updatedOptionsObject.mee6Enabled = true;
		} else {
			return message.say("Unknown value. Please choose either \"on\" or \"off\" accordingly.")
		}
		optionFuncs.optionObjectCheck(record, message, updatedOptionsObject, (err) => {
			if (err) {console.error(err); return message.say("Something went wrong.")}
			return message.say(":white_check_mark: Successfully turned " + whatValue + " mee6 integration!"+note);
		});
	});
}