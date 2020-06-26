const Discord = require('discord.js');
const Commando = require('discord.js-commando');
const token = require('./shared/token.js');
const config = require('./shared/config.js');
const levelIntegration = require('./Commands/options/levelIntegFunctions.js');
const path = require('path');
const mongoose = require('mongoose');
const models = require('./shared/models.js');
const CronJob = require('cron').CronJob;

const client = new Commando.Client({
  commandPrefix: config.prefix,
  owner: '709427685947998230',
  disableMentions: "everyone"
});
const job = new CronJob('0 */10 * * * *', function() { // synchronize roles with the mee6 leaderboard every x mintutes if enabled in the guild
  levelIntegration.syncMembers(client);
}); 
job.start();



mongoose.connect(config.mongooseConnect, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

client.registry
.registerGroups([
  ['rolegroup', 'All the role commands.'],
  ['options', 'Commands for changing the bot settings.'],
  ['other', 'Other commands.'],
])
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands({
    help: true,
  })
	.registerCommandsIn(path.join(__dirname, 'Commands'));


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!\nActive in ${client.guilds.cache.size} guilds.`);
  client.user.setPresence({ activity: { name: 'Prefix: '+config.prefix }, status: 'online' })
  .catch(console.error);
});

client.on('error', console.error);

client.on('guildDelete', async guild => { // Deletes all data from a server once we get kicked/banned
  console.log("Bot was kicked from guild "+guild.id)
  mongoose.model(guild.id, models.roleSchema).collection.drop();
  await mongoose.model('guildOptions', models.optionSchema).findOneAndDelete({guildId: guild.id});
});

client.on('guildMemberRemove', async member => { // remove users from the database and deletes their roles once they leave their guild
  let record = await mongoose.model(member.guild.id, models.roleSchema).findOneAndDelete({userID: member.id});
  let guild = client.guilds.cache.get(member.guild.id);
  let role = await guild.roles.fetch(record.roleID);
  await role.delete();
})

client.login(token);