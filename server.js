// imports
const dotenv = require('dotenv').config()
const express = require("express")
const http = require("http")
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./config')
const mongoose = require('mongoose')


// controllers
const index = require("./controllers/index")
const AuthController = require("./controllers/AuthController")
const LobbyController = require("./controllers/LobbyController")

// middleware
const app = express()
const port = process.env.PORT || 4000

// connection
mongoose.connect(process.env.mongoUri)
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.use(index)
app.use('/users', AuthController)
app.use('/lobby', LobbyController)

// server
const server = http.createServer(app);
server.listen(port, () => console.log(`Listening on port ${port}`));