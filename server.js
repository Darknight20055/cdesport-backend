const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const tournamentParticipantRoutes = require('./routes/tournamentParticipantRoutes');
const globalRankingRoutes = require('./routes/globalRankingRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Autoriser uniquement le frontend Vercel
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.cdesport.com',
  credentials: true
}));

app.use(express.json());

// Connexion MongoDB
connectDB();

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentParticipantRoutes);
app.use('/api/ranking', globalRankingRoutes);
app.use('/api/badges', badgeRoutes);

// ✅ Route test
app.get('/', (req, res) => {
  res.send('✅ Backend Render opérationnel !');
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`📦 Serveur backend lancé sur le port ${PORT} 🚀`);
});
