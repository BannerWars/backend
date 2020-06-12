const mongoose = require('mongoose')
const Schema = mongoose.Schema

const inviteSchema = new Schema({
    sender: { type: String, required: true },
    reciver: { type: String, required: true},
    expires: {type: Date, required: true},
    lobbyId: {type: String, required: true}
    
})

module.exports = mongoose.model('Invite', inviteSchema)