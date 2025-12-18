const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/owners', require('./routes/ownersRoute'));
app.use('/api/cats', require('./routes/catsRoute'));
app.use('/api/swipes', require('./routes/swipesRoute'));
app.use('/api/matches', require('./routes/matchesRoute'));
app.use('/api/messages', require('./routes/messagesRoute'));

connectDB();

const io = initializeSocket(server);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.IO server is ready`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});

server.timeout = 300000;
server.keepAliveTimeout = 30000;
server.headersTimeout = 31000;