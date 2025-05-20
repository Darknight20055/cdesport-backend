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
  },
  riotGameName: {         // ex: "TenZ"
    type: String,
    required: true,
  },
  riotTagLine: {          // ex: "CAN"
    type: String,
    required: true,
  },
  region: {               // ex: "na"
    type: String,
    required: true,
    enum: ["na", "eu", "latam", "br", "ap", "kr"], // limiter les valeurs valides
  }
});

module.exports = mongoose.model('TournamentParticipant', TournamentParticipantSchema);
