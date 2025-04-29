const TournamentParticipant = require("../models/TournamentParticipant");

// 🔥 Register a player to a tournament
exports.registerPlayer = async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const userId = req.user.id; // extracted from JWT via middleware

    if (!tournamentId) {
      return res.status(400).json({ error: "tournamentId is required." });
    }

    // Check if player is already registered
    const exists = await TournamentParticipant.findOne({ tournamentId, userId });
    if (exists) {
      return res.status(400).json({ error: "❌ You are already registered for this tournament." });
    }

    // Create new registration
    const participation = await TournamentParticipant.create({
      tournamentId,
      userId,
    });

    res.status(201).json(participation);
  } catch (err) {
    console.error("registerPlayer error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// 🔍 Get all participants for a tournament
exports.getParticipants = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId) {
      return res.status(400).json({ error: "tournamentId is required in the URL." });
    }

    const participants = await TournamentParticipant.find({ tournamentId })
      .populate("userId", "pseudo avatar");

    res.json(participants);
  } catch (err) {
    console.error("getParticipants error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
