const express = require('express');
const router = express.Router();
const { assignBadgesAtMonthEnd } = require('../controllers/badgeController');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin'); // ✅ Admin middleware

// This route is called MANUALLY at the end of the month
router.post('/assign', protect, admin, assignBadgesAtMonthEnd); // ✅ Admin required

module.exports = router;
