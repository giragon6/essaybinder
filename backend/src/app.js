const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const { initRedis } = require('./config/redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const authRoutes = require('./routes/auth');
const essayRoutes = require('./routes/essay');
const positionRoutes = require('./routes/position');

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.send('EssayBinder API is online');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'essaybinder backend online' });
});

app.use('/auth', authRoutes);
app.use('/essays', essayRoutes);
app.use('/positions', positionRoutes);

const startServer = async () => {
  try {
    await initRedis();
    console.log('Redis initialized successfully');
  } catch (error) {
    console.warn('Redis initialization failed, continuing without cache:', error.message);
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();