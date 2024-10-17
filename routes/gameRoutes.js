const express = require('express');
const { createPrivateGame, getPrivateGame } = require('../controllers/gameController');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();

// Create private game (Protected route)
router.post('/create', authMiddleware, createPrivateGame);

// Get private game by code (Protected route)
router.get('/:gameCode', authMiddleware, getPrivateGame);

module.exports = router;
