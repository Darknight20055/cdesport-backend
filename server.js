const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🛠️ Ajouté ici pour servir le frontend React

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const tournamentParticipantRoutes = require('./routes/tournamentParticipantRoutes');
const globalRankingRoutes = require('./routes/globalRankingRoutes');
const badgeRoutes = require('./routes/badgeRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à la base MongoDB
connectDB();

// Routes API
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentParticipantRoutes);
app.use('/api/ranking', globalRankingRoutes);
app.use('/api/badges', badgeRoutes);

// ➡️ Servir le frontend React en production (npm run build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Si aucune route API ne match, renvoyer index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Route de test racine
app.get('/', (req, res) => {
  res.send('✅ Backend opérationnel');
});

// Démarrer serveur
app.listen(PORT, () => {
  console.log(`📦 Serveur backend lancé sur le port ${PORT} 🚀`);
});
