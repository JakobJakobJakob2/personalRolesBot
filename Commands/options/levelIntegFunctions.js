const mongoose = require('mongoose');
mongoose.pluralize(null);
const models = require('../../shared/models.js')
const request = require('request')
var minusNum;
var rolepositions;

module.exports = { 
    syncMembers: function (client) {
        console.log("-----Running scheduled member synchronization-----")
        mongoose.model('guildOptions', models.optionSchema).find({ "options.mee6Enabled": true}, async (err, record) => { // gets an array of all guilds with the mee6 integration enabled that we can loop through.
            if (err) {console.error(err); return;}
            console.log("Fetched "+record.length+" guilds with mee6 integration enabled")
            for (let x in record) {
                sync(record[x].guildId, record[x].options.topRoleId, client);
                await waitABit(7000);
            }
        });
    }
};

function sync(GUILDID, TOPROLE, client) {
    console.log("Looping through all members in guild: "+GUILDID)
    request("https://mee6.xyz/api/plugins/levels/leaderboard/"+GUILDID+"?page=0", async (error, response, body) => { // fetches the leaderboard for the guild
        if (error) {console.error(error); return;}
        let bodyres = JSON.parse(body);
        if (bodyres.status_code) {
            console.error("Mee6 Api Error Code: "+bodyres.status_code);
        } else {
            minusNum=0; // what we minus to the Z variable to get the right position of roles even if some members aren't in the guild or don't have roles
            rolepositions = [] // an array of all the role positions so we can figure out what the lowest role position is 
            for (let z in bodyres.players) {
                await roleUpdate(bodyres, GUILDID, TOPROLE, client, z);
                await waitABit(500);
            }
            updateBottomRole(rolepositions, GUILDID);
            console.log("done looping through all members in "+GUILDID);
        }
    });
}

function waitABit(ms) {
    return new Promise( (resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, ms);
    
    });
}

function roleUpdate(bodyres, GUILDID, TOPROLE, client, z) {
    return new Promise( (resolve, reject) => {
        mongoose.model(GUILDID, models.roleSchema).findOne({ userID: bodyres.players[z].id}, async (err, record2) => {
            if (err) {console.error(err); resolve(); return;}
            if (record2 != null) {
                let guild;
                guild = await client.guilds.cache.get(GUILDID)
                let person;
                try {
                    person = await guild.members.fetch(bodyres.players[z].id); // fetch the person we're giving the role to
                } catch {
                    console.log("couldn't get user. user is likely not in the server anymore");
                    minusNum = minusNum+1;
                    resolve(); return;
                }

                try {
                    let topRole = await guild.roles.fetch(TOPROLE);
                    let theRole = await guild.roles.fetch(record2.roleID);
                    let correctPos = topRole.position-(parseInt(z)+1)+minusNum
                    await theRole.setPosition(correctPos);
                    rolepositions.push(correctPos);
                } catch {
                    console.log("failed to get the roles or setting the position");
                    minusNum = minusNum+1;
                    resolve();
                    return;
                }

                resolve();
            } else { // if the user doesn't have a role in the guild or isn't in there at all.
                minusNum = minusNum+1;
                resolve();
            };
        });
    });
}

function updateBottomRole(roleposArray, guildID) {
    mongoose.model('guildOptions', models.optionSchema).findOneAndUpdate({guildId: guildID}, {bottomRole: Math.min(...roleposArray)}, (err, record2) => {
    if (err) {console.error(err)};
    });
}