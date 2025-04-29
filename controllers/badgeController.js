const GlobalRanking = require('../models/GlobalRanking');
const User = require('../models/User');

exports.assignBadgesAtMonthEnd = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Ex: "2025-04"

    const topPlayers = await GlobalRanking.find({ month: currentMonth })
      .sort({ points: -1 })
      .limit(10);

    for (let i = 0; i < topPlayers.length; i++) {
      const ranking = topPlayers[i];
      const user = await User.findById(ranking.userId);

      if (user) {
        let badge = "";

        if (i === 0) badge = `🥇 Top 1 - ${currentMonth}`;
        else if (i === 1) badge = `🥈 Top 2 - ${currentMonth}`;
        else if (i === 2) badge = `🥉 Top 3 - ${currentMonth}`;
        else badge = `🏆 Top 10 - ${currentMonth}`;

        user.badges.push(badge);
        await user.save();
      }
    }

    res.status(200).json({ message: "Badges attribués avec succès ✅" });
  } catch (err) {
    console.error("Erreur assignBadgesAtMonthEnd:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
