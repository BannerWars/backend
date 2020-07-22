const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const mailgun = require("mailgun-js");
const bcrypt = require('bcryptjs')
var crypto = require("crypto");


const User = require('../models/User')

router.post('/new', (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(401).send({ message: 'Email already in use!' });
        }
        const newUser = new User(req.body)
        newUser.save().then(user => {
            const DOMAIN = process.env.mailgunDomain
            const mg = mailgun({ apiKey: process.env.mailgunKey, domain: DOMAIN })
            const data = {
                from: 'Banner Wars Team <Support@BannerWars.com>',
                to: user.email,
                subject: "Verify Your Account!",
                text: `Thank you for signing up for Banner Wars, to verify your account, click the link below! \n https://SomeDomainName.com/verify/${user._id}`
            }
            mg.messages().send(data, function (error, body) {
                console.log(body);
            });
            res.status(200).send({message: "new user created"})
        })
            .catch(err => console.log(err))
    })
        .catch(err => console.log(err))

})

router.post("/verify", (req, res) => {
    const { userId } = req.body
    User.findById(userId).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Doesn't Exist" })
        }

        if (user.verified) {
            return res.status(401).send({ message: "Link Expired" })
        }

        user.verified = true
        user.save().then(user => {
            res.status(200).send({ message: "User Verified!" })
        }).catch(err => console.log(err))
    })
        .catch(err => console.log(err))

})

// sends an email to a user requesting a password reset
// The email contains a link to the website that when clicked on will bring them to a page they can update their password
// TODO: Make this link more secure than /users/reset/:userid by adding salt on the end, saving that salt, and only allowing link to work if salt has been added

router.post("/request-reset", (req, res) => {
    const { email } = req.body
    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(200).send({ message: "Recived" })
        }

        const DOMAIN = process.env.mailgunDomain
        const mg = mailgun({ apiKey: process.env.mailgunKey, domain: DOMAIN })
        var extra = crypto.randomBytes(20).toString('hex');

        const data = {
            from: 'Banner Wars Team <Support@BannerWars.com>',
            to: user.email,
            subject: "Password Reset",
            text: `To reset your password, click the link below \n https://SomeDomainName.com/reset/${user._id}/${extra} \n\n if you did not request a password reset, you can ignore this email`
        }
        mg.messages().send(data, function (error, body) {
            console.log(body)
            user.passwordExtra = extra
            user.save().then(user => {
                res.status(200).send({ message: "Recived" })
            })
        })

    })
        .catch(err => console.log(err))

})

// Resets a users password. Currently can be used at any time
// TODO: Only users that have requested a password reset can use this link
router.post("/reset", (req, res) => {
    const { userId, password, extra } = req.body
    User.findById(userId).then(user => {
        if (user.passwordExtra != "" && extra == user.passwordExtra) {
            user.password = password
            user.passwordExtra = ""
            user.save().then(user => {
                res.status(200).send({ message: "Password Changed!" })
            })
                .catch(err => console.log(err))
        }
        else {
            res.status(404).send({message: "An error has occured"})
        }

    })
        .catch(err => console.log(err))
})

router.post('/login', (req, res) => {
    const { email, password } = req.body
    User.findOne({ email }).then(user => {
        if (!user) {
            // User not found
            return res.status(401).send({ message: 'Wrong Email or Password' });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
                // Password does not match
                return res.status(401).send({ message: 'Wrong Email or Password' });
            }
            // Set a cookie and redirect to root
            if (!user.verified) {
                return res.status(401).send({ message: 'Account Not Verified' });
            }
            const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, { expiresIn: '60 days' })
            return res.status(200).json({ token });
        });
    })
        .catch((err) => {
            console.log(err);
        });
})



module.exports = router