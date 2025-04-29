const express = require('express');
const router = express.Router();
const { assignBadgesAtMonthEnd } = require('../controllers/badgeController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin'); // ✅ On importe le middleware admin

// Cette route sera appelée MANUELLEMENT à la fin du mois
router.post('/assign', protect, admin, assignBadgesAtMonthEnd); // ✅ On ajoute admin ici

module.exports = router;
