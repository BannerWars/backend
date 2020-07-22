const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')


const Lobby = require('../models/Lobby')
const User = require('../models/User')
const Invite = require('../models/Invite')

router.get("/lobbies", (req, res) => {
    console.log(req.headers)
    const token = req.headers.authorization
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }

        const { _id: id } = decoded
        console.log(id)

        Lobby.find({ "users.id": id }).select("name _id").then(lobbies => {
            res.status(200).json(lobbies)
        })


    })

})

router.get("/invites", (req, res) => {
    const { token } = req.body
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }

        const { _id: id } = decoded

        Invite.find({reciver: id}).then(invites => {
            res.send(invites)
        })

    })
})


module.exports = router
