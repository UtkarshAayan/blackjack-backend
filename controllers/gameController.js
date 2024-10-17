const Game = require('../models/gameModel');
const jwt = require('jsonwebtoken');

// Create Private Game
exports.createPrivateGame = async (req, res) => {
    try {
        const { gameDetails } = req.body;

        // Check if user ID is present
        console.log('User ID from token:', req.user._id); // Log this to check if the user ID is being extracted properly

        const userId = req.user._id;

        // Generate a random 10-digit game code
        const gameCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        // Create a new game
        const game = new Game({
            gameDetails,
            gameCode,
            createdBy: userId // Use the user ID extracted from the token
        });

        await game.save();

        return res.status(201).json({ success: true, message: 'Game created successfully', gameCode });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to create game', error: error.message });
    }
};

// Get Private Game by Game Code
exports.getPrivateGame = async (req, res) => {
    try {
        const { gameCode } = req.params;

        const game = await Game.findOne({ gameCode });

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        // Return the game details
        return res.status(200).json({ success: true, gameDetails: game.gameDetails });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve game', error: error.message });
    }
};
