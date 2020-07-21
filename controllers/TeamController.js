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
            Lobby.findById(lobbyId).then(lobby => {
                // console.log(lobby)

                currentUser = lobby.users.filter(lobbyUser => lobbyUser.id == user._id)[0]
                if(!currentUser) {
                    return res.status(401).json({message:"user not in lobby"})
                }
                currentTeam = lobby.teams.filter(team => team.name == teamName)
                if (currentTeam.length > 0) {
                    return res.status(401).json({message: "team name taken"})
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

router.post("/join", (req, res) => {
    const { token, lobbyId, teamName } = req.body
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }
        const { _id: id } = decoded

        Lobby.findById(lobbyId).then(lobby => {

            currentUser = lobby.users.filter(lobbyUser => lobbyUser.id == id)[0]
            if(!currentUser) {
                return res.status(401).json({message:"user not in lobby"})
            }

            team = lobby.teams.filter(team => team.name == teamName)[0]
            if(!team) {
                return res.status(404).json({message: "team does not exist"})
            }

            currentUser.team = teamName
            lobby.markModified("users")
            lobby.save().then(lobby => res.status(200).json({message: "team joined"})).catch(err => console.log(err))
        }).catch(err => console.log(err))
    })
})

router.post("/steal", (req, res) => {
    const { token, lobbyId, teamName, banner } = req.body
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: err.message })
            return console.log(err)
        }
        const { _id: id } = decoded

        Lobby.findById(lobbyId).then(lobby => {

            currentUser = lobby.users.filter(lobbyUser => lobbyUser.id == id)[0]
            if(!currentUser) {
                return res.status(401).json({message:"user not in lobby"})
            }
            if(!currentUser.team) {
                return res.status(401).json({message:"user not in a team"})
            }

            team = lobby.teams.filter(team => team.name == teamName)[0]
            if(!team) {
                return res.status(404).json({message: "team does not exist"})
            }

            flagIndex = team.banners.reduce((r, flag, i) => flag == banner? i : r, -1)
            if(flagIndex == -1) {
                return res.status(404).json({message: "team does not have banner"})
            }

            new_banner = team.banners.splice(flagIndex, 1)[0]

            userTeam = lobby.teams.filter(team => team.name == currentUser.team)[0]
            userTeam.banners.push(new_banner)
            lobby.markModified("teams")
            lobby.save().then(lobby => {
                res.status(200).json({message: "banner stolen"})
            })
            
        })

    })

})

module.exports = router