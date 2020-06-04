const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')


const User = require('../models/User')

router.post('/new', (req, res) => {
    User.findOne({ username: req.body.username }).then(user => {
        if (user) {
            return res.status(401).send({ message: 'Username Taken!' });
        }
        const newUser = new User(req.body)
        newUser.save().then(user => {
            const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, { expiresIn: '60 days' })
            res.json({ token })
        })
    })

})

router.post('/login', (req, res) => {
    const { username, password } = req.body
    User.findOne({ username }).then(user => {
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
            const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, { expiresIn: '60 days' })
            return res.status(200).json({ token });
        });
    })
        .catch((err) => {
            console.log(err);
        });
})


module.exports = router