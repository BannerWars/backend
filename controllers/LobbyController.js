const express = require('express')
const router = express.Router()
const mailgun = require("mailgun-js")
const jwt = require('jsonwebtoken')



const User = require('../models/User')
const Lobby = require('../models/Lobby')
const Invite = require('../models/Invite')

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
                    Invite.findOne({ reciver: email, lobbyId: lobby._id }).then(invite => {
                        if (invite) {
                            if (invite.expires - new Date() > 0) {
                                return res.status(401).json({ message: "already invited" })
                            }
                            else {
                                Invite.findByIdAndDelete(invite._id).catch(err => console.log(err))
                            }
                        }

                        invite = new Invite({ sender: userId, reciver: email, expires, lobbyId: lobby._id })
                        invite.save().then(invite => {
                            const inviteId = invite._id
                            User.findOne({ email }).then(newUser => {
                                console.log(newUser)
                                existingUser = lobby.users.filter(user => user.email == email)[0]
                                console.log(existingUser)
                                if (existingUser) {
                                    Invite.findByIdAndDelete(invite._id).then(invite => {
                                        return res.status(401).json({ message: "User already in lobby" })
                                    }).catch(err => console.log(err))

                                }
                                else {
                                    const DOMAIN = process.env.mailgunDomain
                                    const mg = mailgun({ apiKey: process.env.mailgunKey, domain: DOMAIN })
                                    const data = {
                                        from: 'Banner Wars Team <Support@BannerWars.com>',
                                        to: email,
                                        subject: "You've been Invited!",
                                        text: `${username} has invited you to a Banner Wars lobby! \n To join, click the link below! \n https://SomeDomainName.com/${newUser ? `accept-invite/${inviteId}` : `sign-up/${inviteId}`}`
                                    }
                                    mg.messages().send(data, function (error, body) {
                                        console.log(body);
                                        res.status(200).json({ message: "Invite Sent!" })
                                    })
                                }
                            }).catch(err => console.log(err))


                        }).catch(err => console.log(err))
                    }).catch(err => console.log(err))
                }
                else {
                    res.status(401).json({ message: "user not in game" })
                }

            }).catch(err => console.log(err))
        }).catch(err => console.log(err))


    })
})

router.post("/accept-invite", (req, res) => {
    const { token, inviteId } = req.body
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
            Invite.findById(inviteId).then(invite => {
                if (!invite) {
                    return res.status(404).json({ message: "Invite doesn't exist" })
                }

                if (invite.expires - new Date() < 0) {
                    return res.status(401).json({ message: "Invite expired" })
                }

                if (user.email != invite.reciver) {
                    return res.status(401).json({ message: "Invite not for user" })
                }

                Lobby.findById(invite.lobbyId).then(lobby => {
                    if (!lobby) {
                        return res.status(404).json({ message: "Lobby doesn't exist" })
                    }
                    existingUser = lobby.users.filter(user => user.id == userId)[0]
                    if (existingUser) {
                        Invite.findByIdAndDelete(inviteId).then((invite) => {
                            return res.status(401).json({ message: "User already in lobby" })
                        }).catch(err => console.log(err))
                    }

                    lobby.users.push({ id: userId, team: "" })
                    lobby.save().then(lobby => {
                        Invite.findByIdAndDelete(inviteId).then((invite) => {
                            res.status(200).json({ message: "Successfully joined team" })
                        }).catch(err => console.log(err))
                    })

                }).catch(err => console.log(err))

            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })
})



module.exports = router