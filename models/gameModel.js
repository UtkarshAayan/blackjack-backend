const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameDetails: {
        type: String,
        required: true
    },
    gameCode: {
        type: String,
        unique: true,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming you have a User model for authentication
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
