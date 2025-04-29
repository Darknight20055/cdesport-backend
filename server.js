const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // 🔥 Obligatoire pour servir React correctement
const connectDB = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const tournamentParticipantRoutes = require('./routes/tournamentParticipantRoutes');
const globalRankingRoutes = require('./routes/globalRankingRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS configuration
app.use(cors({
  origin: 'https://www.cdesport.com', // Ton vrai domaine ici
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());

// 🔗 Connect to MongoDB
connectDB();

// 🔀 API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentParticipantRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/ranking', globalRankingRoutes);
app.use('/api/badges', badgeRoutes);

// ✅ Production : Serve frontend build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ✅ Basic test route (development)
app.get('/', (req, res) => {
  res.send('✅ Backend is up and running on Render!');
});

// ❌ 404 handler (important mais sera rarement atteint grâce au fallback ci-dessus)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📦 Backend server started on port ${PORT} 🚀`);
});
