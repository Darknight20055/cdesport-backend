const TournamentParticipant = require("../models/TournamentParticipant");

// 🔥 Enregistrer un joueur à un tournoi
exports.registerPlayer = async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const userId = req.user.id; // récupéré depuis le token JWT (middleware protect)

    if (!tournamentId) {
      return res.status(400).json({ error: "Le tournamentId est requis." });
    }

    // Vérifier si le joueur est déjà inscrit à ce tournoi
    const exists = await TournamentParticipant.findOne({ tournamentId, userId });
    if (exists) {
      return res.status(400).json({ error: "❌ Tu es déjà inscrit à ce tournoi." });
    }

    // Créer la participation
    const participation = await TournamentParticipant.create({
      tournamentId,
      userId,
    });

    res.status(201).json(participation);
  } catch (err) {
    console.error("Erreur registerPlayer :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 🔍 Lister les participants d’un tournoi
exports.getParticipants = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId) {
      return res.status(400).json({ error: "Le tournamentId est requis dans l'URL." });
    }

    const participants = await TournamentParticipant.find({ tournamentId }).populate("userId", "pseudo avatar");

    res.json(participants);
  } catch (err) {
    console.error("Erreur getParticipants :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
