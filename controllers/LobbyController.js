const express = require('express');
const router = express.Router();
const mailgun = require("mailgun-js");
const jwt = require('jsonwebtoken')



const User = require('../models/User')
const Lobby = require('../models/Lobby')

router.post("/new", (req, res) => {
    const { name, token } = req.body
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }
        // console.log(decoded)
        const { _id: owner } = decoded
        User.findById(owner).then(user => {
            if (!user) {
                return res.status(401).json({ message: "User doesn't exist" })
            }
            Lobby.findOne({ owner, name }).then(lobby => {
                if (lobby) {
                    return res.status(401).json({ message: "Name Taken!" })
                }

                lobby = new Lobby({ name, owner })

                lobby.users.push({ id: owner, team: "" })

                lobby.save().then(lobby => {

                    res.status(200).json({ message: "lobby created" })

                }).catch(err => console.log(err))
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })

})

router.post("/new-invite", (req, res) => {
    const { token, lobbyId, email } = req.body

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }

        const { _id: userId, username } = decoded
        User.findById(userId).then(user => {
            if (!user) {
                return res.status(401).json({ message: "User doesn't exist" })
            }
            Lobby.findById(lobbyId).then(lobby => {
                if (!lobby) {
                    return res.status(401).json({ message: "Lobby doesn't exist!" })
                }
                user = lobby.users.reduce((reducer, user) => user.id == userId ? user : reducer, {})
                if (user._id) {
                    today = new Date()
                    expires = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3)
                    lobby.invites.push({ email, expires })
                    lobby.markModified("invites")
                    lobby.save().then(lobby => {
                        User.findOne({ email }).then(newUser => {

                            inviteId = lobby.invites.filter(invite => invite.email == email)[0]._id

                            const DOMAIN = process.env.mailgunDomain
                            const mg = mailgun({ apiKey: process.env.mailgunKey, domain: DOMAIN })
                            const data = {
                                from: 'Banner Wars Team <Support@BannerWars.com>',
                                to: email,
                                subject: "You've been Invited!",
                                text: `${username} has invited you to a Banner Wars lobby! \n To join, click the link below! \n https://SomeDomainName.com/${newUser? `lobby/join/${lobby._id}/${inviteId}` : `sign-up/${lobby._id}/${inviteId}`}`
                            }
                            mg.messages().send(data, function (error, body) {
                                console.log(body);
                                res.status(200).json({ message: "Invite Sent!" })
                            });
                        })


                    })
                }
                else {
                    res.status(401).json({ message: "user not in game" })
                }

            }).catch(err => console.log(err))
        }).catch(err => console.log(err))


    })
})

// router.post("accept-invite", (req, res) => {

// })

module.exports = router