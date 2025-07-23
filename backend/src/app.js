const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const authRoutes = require('./routes/auth.js');

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser()); 

app.get('/', (req, res) => {
  res.send('EssayBinder API is online');
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});