const GlobalRanking = require('../models/GlobalRanking');

// 🔥 Update points after a tournament
exports.updateRankingAfterTournament = async (req, res) => {
  try {
    const { tournamentId, classement } = req.body;
    const currentMonth = new Date().toISOString().slice(0, 7); // Example: "2025-04"

    if (!tournamentId || !classement) {
      return res.status(400).json({ error: "tournamentId and classement are required." });
    }

    for (let i = 0; i < classement.length; i++) {
      const player = classement[i];
      const userId = player.userId;
      let points = 10; // Base participation points

      if (i === 0) points = 100; // 1st
      else if (i === 1) points = 75; // 2nd
      else if (i === 2) points = 50; // 3rd
      else if (i < 10) points = 30; // Top 10
      else if (i < 20) points = 20; // Top 20

      // Check if this player already has an entry for this month
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

    res.status(200).json({ message: "✅ Ranking successfully updated." });
  } catch (err) {
    console.error("updateRankingAfterTournament error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// 🔍 Retrieve Top 10 players of the month
exports.getTopRanking = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Example: "2025-04"

    const topPlayers = await GlobalRanking.find({ month: currentMonth })
      .populate('userId', 'pseudo avatar') // Return pseudo and avatar only
      .sort({ points: -1 }) // Sort descending by points
      .limit(10); // Top 10

    res.status(200).json(topPlayers);
  } catch (err) {
    console.error("getTopRanking error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
