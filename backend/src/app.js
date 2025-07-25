const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

app.use(express.json());
app.use(cookieParser()); 

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from origin: ${req.headers.origin}`);
  next();
});

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('EssayBinder API is online');
});

app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ status: 'working', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'OK', message: 'essaybinder backend online' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});