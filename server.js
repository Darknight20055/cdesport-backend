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

// ✅ Allow only the Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.cdesport.com',
  credentials: true
}));

app.use(express.json());

// 🔗 Connect to MongoDB
connectDB();

// 🔀 API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentParticipantRoutes);
app.use('/api/ranking', globalRankingRoutes);
app.use('/api/badges', badgeRoutes);

// ✅ Basic test route
app.get('/', (req, res) => {
  res.send('✅ Backend is up and running on Render!');
});

// ❌ 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`📦 Backend server started on port ${PORT} 🚀`);
});
