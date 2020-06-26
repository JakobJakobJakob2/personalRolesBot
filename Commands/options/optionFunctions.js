const models = require('../../shared/models.js')
const mongoose = require('mongoose')

module.exports = {
    optionObjectCheck:  function (record, message, whatChange, callback) { // check if the options object exists and if it doesn't it creates one
    let optionModel = mongoose.model('guildOptions', models.optionSchema);
    if (record === null) { // if the guild doesn't have an option object yet
        let newSetting = new optionModel({guildId: message.guild.id});
        newSetting.save(function (err, newSetting) {
            if (err) {console.error(err); callback("Something database related went wrong.")};
            updateOptionObject(whatChange, message, optionModel, callback);
        });	
    } else { // if the guild already has a option object
        updateOptionObject(whatChange, message, optionModel, callback);
    }
}
}
function updateOptionObject(whatChange, message, optionModel, callback) {
    optionModel.findOneAndUpdate({guildId: message.guild.id}, {options: whatChange}, (err, record2) => {
        if (err) {console.error(err); callback("Failed to update the guilds options.")};
        callback(false);
    });
}