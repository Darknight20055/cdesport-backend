const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { updateRankingAfterTournament, getTopRanking } = require('../controllers/globalRankingController');

// 🔥 Route to update points after a tournament
router.post('/update', protect, updateRankingAfterTournament);

// 🔍 Route to get the Top 10 players of the month
router.get('/top', getTopRanking);

module.exports = router;
