const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const tournamentParticipantController = require('../controllers/tournamentParticipantController');

// 🔐 Enregistrer un joueur dans un tournoi (protégé par token)
router.post('/register', protect, tournamentParticipantController.registerPlayer);

// 🔍 Obtenir la liste des participants d’un tournoi
router.get('/:tournamentId', tournamentParticipantController.getParticipants);

module.exports = router;
