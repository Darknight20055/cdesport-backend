const GlobalRanking = require('../models/GlobalRanking');

// 🔥 Fonction pour mettre à jour les points après un tournoi
exports.updateRankingAfterTournament = async (req, res) => {
  try {
    const { tournamentId, classement } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7); // Exemple : "2025-04"

    if (!tournamentId || !classement) {
      return res.status(400).json({ error: "tournamentId et classement sont requis." });
    }

    for (let i = 0; i < classement.length; i++) {
      const player = classement[i];
      const userId = player.userId;
      let points = 10; // Points de participation de base

      if (i === 0) points = 100; // 1er
      else if (i === 1) points = 75; // 2e
      else if (i === 2) points = 50; // 3e
      else if (i < 10) points = 30; // Top 10
      else if (i < 20) points = 20; // Top 20

      // Cherche si l'entrée existe déjà pour ce joueur ce mois-ci
      let ranking = await GlobalRanking.findOne({ userId, month: currentMonth });

      if (ranking) {
        ranking.points += points;
        await ranking.save();
      } else {
        await GlobalRanking.create({
          userId,
          points,
          month: currentMonth
        });
      }
    }

    res.status(200).json({ message: "Classement mis à jour avec succès ✅" });
  } catch (err) {
    console.error("Erreur updateRankingAfterTournament:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// 🔍 Fonction pour récupérer le Top 10 des joueurs du mois
exports.getTopRanking = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Exemple : "2025-04"

    const topPlayers = await GlobalRanking.find({ month: currentMonth })
      .populate('userId', 'pseudo avatar') // Remonter pseudo et avatar seulement
      .sort({ points: -1 }) // Trier du plus de points au moins
      .limit(10); // Limiter à 10 joueurs

    res.status(200).json(topPlayers);
  } catch (err) {
    console.error("Erreur getTopRanking:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
