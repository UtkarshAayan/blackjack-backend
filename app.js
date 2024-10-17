const dotenv = require('dotenv');
dotenv.config();

const express = require('express')
const mongoose = require('mongoose')


const bodyParser = require('body-parser')

// const errorMiddleware = require('./middleware/errorMiddleware')
const PORT = process.env.PORT || 3000
const MONGO_URL = process.env.MONGO_URL

const cookieParser = require('cookie-parser')
var cors = require('cors')
var app = express();

app.use(bodyParser.json());

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);


//database connect

mongoose.set("strictQuery", false)
mongoose.
    connect(MONGO_URL)
    .then(() => {
        console.log('connected to MongoDB')
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`)
        });
    }).catch((error) => {
        console.log(error)
    })
