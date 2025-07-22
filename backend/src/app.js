const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const authRoutes = require('./routes/auth.js');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('EssayBinder API is online');
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});