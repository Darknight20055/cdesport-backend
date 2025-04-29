const mongoose = require('mongoose');

const GlobalRankingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  month: {
    type: String, // Exemple : "2025-04"
    required: true,
  }
});

module.exports = mongoose.model('GlobalRanking', GlobalRankingSchema);
