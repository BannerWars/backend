const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lobbySchema = new Schema({
    owner: { type: String, required: true },
    name: { type: String, required: true },
    teams: { type: Array, default: [] },
    history: { type: Array, default: [] },
    users: [{ id: { type: String, required: true }, team: { type: String } }],
})

module.exports = mongoose.model('Lobby', lobbySchema)