const mongoose = require('mongoose');

const TournamentParticipantSchema = new mongoose.Schema({
  tournamentId: {
    type: String, 
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateRegistered: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('TournamentParticipant', TournamentParticipantSchema);
