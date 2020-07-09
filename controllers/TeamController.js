const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


const Lobby = require('../models/Lobby')
const User = require('../models/User')


router.post("/new", (req, res) => {
    const { token, lobbyId, teamName } = req.body
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }

        const { _id: id } = decoded

        User.findById(id).then(user => {
            console.log(user)
            Lobby.findById(lobbyId).then(lobby => {
                console.log(lobby)

                currentUser = lobby.users.filter(lobbyUser => lobbyUser.id == user._id)[0]
                if(!currentUser) {
                    return res.status(401).json({message:"user not in lobby"})
                }
                lobby.teams.push({name: teamName, banners: [teamName]})
                currentUser.team = teamName
                lobby.markModified("users")
                lobby.save().then(lobby => {
                    res.status(200).json({message: "team created!"})
                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))

    })
})

module.exports = router