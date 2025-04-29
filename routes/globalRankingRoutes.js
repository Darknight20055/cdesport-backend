const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { updateRankingAfterTournament, getTopRanking } = require('../controllers/globalRankingController');

// 🔥 Route pour mettre à jour les points après un tournoi
router.post('/update', protect, updateRankingAfterTournament);

// 🔍 Route pour récupérer le Top 10 des joueurs
router.get('/top', getTopRanking);

module.exports = router;
