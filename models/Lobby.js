const mongoose = require('mongoose')
const Schema = mongoose.Schema

const lobbySchema = new Schema({
    owner: { type: String, required: true },
    name: { type: String, required: true },
    teams: [{ name: String, banners: [] }],
    history: { type: Array, default: [] },
    users: [{ id: { type: String, required: true }, team: { type: String }, username: { type: String, required: true } }],
})

module.exports = mongoose.model('Lobby', lobbySchema)