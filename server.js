const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
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

// ✅ CORS configuration (supporte www.cdesport.com + localhost + preview Vercel si tu veux)
const allowedOrigins = [
  'https://www.cdesport.com',
  'http://localhost:3000',
  'https://cddesport-7jhcl232w-charlys-projects-d00150b3.vercel.app' // (facultatif: pour testing Vercel)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// ✅ Basic test route
app.get('/', (req, res) => {
  res.send('✅ Backend is up and running!');
});

// ❌ 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server (Render.io requires 0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📦 Backend server started on port ${PORT} 🚀`);
});