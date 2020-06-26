const mongoose = require('mongoose');
mongoose.pluralize(null);// tells mongoose to not put an "s" at the end of the name or turn it into a plural
const models = require('../../shared/models.js')
const request = require('request');
var minusNum;

module.exports = {
    requestRoleChange:  function (message, rolename, memberToChange, callback) {
      rolename = rolename.replace(/<@.*>/, ''); // remove any mentions from the arguments.
      mongoose.model(message.guild.id, models.roleSchema).findOne({ userID: memberToChange.id}, (err, record) => { // check if a user role record already exists so we can figure out if wheter to create a new one or edit the current one
        if (err) {callback("Database error."); throw err; };
        if (record === null) { // if the user doesn't have a role made for them yet
          createRole(rolename, message, memberToChange, callback);
        } else { // if the user already has a role and we need to modify it.
          updateRole(rolename, message, record, callback);
        }
      });
  }
  };


async function createRole(rolename, message, memberToChange, callback) {
  // get the guildOptions and the TopRole
  let guildOptions;
  try {
    guildOptions = await mongoose.model('guildOptions', models.optionSchema).findOne({ guildId: message.guild.id });
  } catch(err) {callback("Something went wrong with getting this servers options from our database. ```"+err+"```");return;};
  if (guildOptions === null || !guildOptions.options.topRoleId) { callback("You do not have a toprole configured. please refer to the `options` command.");return;};// If we didn't find the mongodb document or it didn't have a toprole configured
  let toprole = await message.guild.roles.fetch(guildOptions.options.topRoleId);
  if (toprole == null) {callback("Failed to find the toprole. Try setting the toprole again with the `options` command."); return;}

  // create the new role
  let newRole;
  try {
    newRole = await message.guild.roles.create({
      data: {
        name: rolename,
        color: 'YELLOW',
        mentionable: true,
        position: await getAppropiatePosition(message.guild, memberToChange, toprole.position, guildOptions.options),
        hoist: true,
      },
      reason: 'as requested by '+message.author.username,
      });
  } catch(err) {
    console.error(err);
    if (err.message == "Missing Permissions") {
      callback("Missing permissions. Please make sure that the bot's role is higher than your TopRole and that it has permission to manage roles.")
    } else {
      callback(err);
    }
    return;
  }
  // Give the role to the member
  let roleMember = await message.guild.members.fetch(memberToChange.id);
  try {
    roleMember.roles.add(newRole);
  } catch(err) {
    callback(err);
    return;
  }

  // Add the role to the database
  let newRoleModel = new mongoose.model(message.guild.id, models.roleSchema)({userID: memberToChange.id, roleID: newRole.id});
  newRoleModel.save(function (err, newRoleModel) {
    if (err) {console.error(err); callback("Something database related went wrong.");return;};
    callback(false, rolename, true);
  });
}



async function updateRole(rolename, message, record, callback) {
  // Find the users role
  let theRole = await message.guild.roles.fetch(record.roleID);
  if (theRole == null) {callback("Failed to find your role even though it should exist. Try removing your role with the `deleterole` command."); return;}

  // update the role
  try {
    await theRole.edit({ name: rolename });
  } catch(err) {
    callback(err);
    return;
  }
  
  callback(false, rolename, false)
}



function getAppropiatePosition(guild, userId, toprolePos, options) {
  return new Promise( (resolve, reject) => {
    if (!options.mee6Enabled) {resolve(toprolePos); return;} // if mee6 integration is NOT enabled

    request("https://mee6.xyz/api/plugins/levels/leaderboard/"+guild.id+"?page=0", async (error, response, body) => {
      if (error) {console.error(error); resolve(null); return;};
      let bodyjson = JSON.parse(body);
      if (bodyjson.status_code) {
        console.error("Mee6 Api Error Code: "+bodyjson.status_code);
        reject();
        return;
      } else {
        minusNum=0;
        let wasFound;
        for (let z in bodyjson.players) {
          if (bodyjson.players[z].id == userId) {
            resolve(toprolePos-(parseInt(z))+minusNum);
            wasFound = true;
            return;
          } else {
            await findPos(bodyjson, toprolePos, guild, z); //we run this for every person so if anyone doesn't have a role the users position is correct
          }
        }

        if (!wasFound) { // executed for users who aren't in the mee6 leaderboard at all
          // get bottomrole from guildoptions and return it
          mongoose.model("guildOptions", models.optionSchema).findOne({ guildId: guild.id}, async (err, rec) => {
            if (err) {console.error(err); resolve(null); return}
            resolve(rec.bottomRole);
          });
        }
    }
    });
  });
}

function findPos(bodyjson, toprolePos, guild, z) { // Figure out if we need to plus minusnum to adjust the role to it's proper position
  return new Promise( (resolve, reject) => {
    mongoose.model(guild.id, models.roleSchema).findOne({ userID: bodyjson.players[z].id}, async (err, rec) => {
      if (err) {console.error(err); resolve(); return;}
      if (rec != null) {
        let person;
        try {
          person = await guild.members.fetch(bodyjson.players[z].id);
        } catch {
          minusNum = minusNum+1;
        }
      }
      resolve();
    });
  })

}