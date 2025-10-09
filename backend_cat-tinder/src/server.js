const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

// ✅ Import connectDB
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket/socketServer');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoute'));
// app.use('/api/users', require('./routes/users')); // ⏸️ Comment ไว้ก่อน (ยังไม่ได้สร้าง)
// app.use('/api/cats', require('./routes/cats')); // ⏸️ Comment ไว้ก่อน (ยังไม่ได้สร้าง)
// app.use('/api/matches', require('./routes/matches')); // ⏸️ Comment ไว้ก่อน (ยังไม่ได้สร้าง)
app.use('/api/conversations', require('./routes/conversationsRoute'));
app.use('/api/messages', require('./routes/messagesRoute'));

// ✅ เชื่อมต่อ MongoDB ก่อนเริ่ม server
connectDB();

// Initialize Socket.IO
const io = initializeSocket(server);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.IO server is ready`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});