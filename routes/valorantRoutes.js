const express = require("express");
const router = express.Router();
const axios = require("axios");
const TournamentParticipant = require("../models/TournamentParticipant");

// GET /api/valorant/matches/:region/:name/:tag/:since
router.get("/matches/:region/:name/:tag/:since", async (req, res) => {
  const { region, name, tag, since } = req.params;

  try {
    const result = await axios.get(`https://api.henrikdev.xyz/valorant/v3/matches/${region}/${name}/${tag}`);
    const allMatches = result.data.data;

    const sinceDate = new Date(since);
    const filteredMatches = allMatches.filter(
      (match) => new Date(match.metadata.game_start * 1000) > sinceDate
    );

    res.json(filteredMatches);
  } catch (err) {
    console.error("Erreur API HenrikDev:", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur lors de la récupération des matchs." });
  }
});

// GET /api/valorant/scores/:tournamentId
router.get("/scores/:tournamentId", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;

    const participants = await TournamentParticipant.find({ tournamentId });

    const results = [];

    for (const player of participants) {
      const { riotGameName, riotTagLine, region, dateRegistered } = player;

      const response = await axios.get(
        `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${riotGameName}/${riotTagLine}`
      );

      const allMatches = response.data.data || [];

      const recentMatches = allMatches.filter(
        (match) => new Date(match.metadata.game_start * 1000) > new Date(dateRegistered)
      );

      const totalScore = recentMatches.reduce((sum, match) => {
        const playerData = match.players.all_players.find(
          (p) => p.name === riotGameName && p.tag === riotTagLine
        );
        return sum + (playerData?.stats?.score || 0);
      }, 0);

      results.push({
        playerId: player.userId,
        riotName: `${riotGameName}#${riotTagLine}`,
        totalScore,
        matchCount: recentMatches.length,
      });
    }

    results.sort((a, b) => b.totalScore - a.totalScore);

    res.json(results);
  } catch (error) {
    console.error("Erreur API Valorant :", error.message);
    res.status(500).json({ error: "Erreur lors du calcul des scores." });
  }
});

module.exports = router;
