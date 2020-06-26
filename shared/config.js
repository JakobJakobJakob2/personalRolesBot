var config = {};

config.mongooseConnect = ""; // the connection url for mongodb https://mongoosejs.com/docs/connections.html
config.prefix = "ur!"; // the prefix for the commands
config.supportServer = false // wheter you want the info command to let the user know there is a support server
config.supportServerInvite = "discord.gg/" // only required if above is set to true

module.exports = config;