const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const setupSocketHandlers = require('./routes/socket');
const setupDatabase = require('./scripts/setupDatabase');

const app = express();
const server = http.createServer(app);

// הגדרת CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // כתובת ה-frontend
  credentials: true
}));

app.use(express.json());

// הגדרת Socket.io עם CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log('⚡ Socket.io instance created');
console.log('🔗 Socket.io attached to server:', !!io.httpServer);
console.log('🌐 Socket.io listening on paths:', io.path());

// Add Socket.io engine debugging
io.engine.on('connection_error', (err) => {
  console.log('❌ Socket.io engine connection error:', err.req?.url);
  console.log('❌ Error code:', err.code);
  console.log('❌ Error message:', err.message);
  console.log('❌ Error context:', err.context);
});

io.engine.on('initial_headers', (headers, req) => {
  console.log('📋 Initial headers for:', req.url);
  console.log('📋 Origin:', req.headers.origin);
  console.log('📋 User-Agent:', req.headers['user-agent']);
});

io.engine.on('headers', (headers, req) => {
  console.log('📨 Response headers for:', req.url);
});

io.engine.on('connection', (socket) => {
  console.log('🔌 Engine connection established:', socket.id);
});

io.engine.on('disconnect', (socket) => {
  console.log('🔌 Engine disconnection:', socket.id);
});

// הגדרת Socket handlers
setupSocketHandlers(io);
console.log('🔗 Socket handlers setup completed');

// בדיקת בריאות השרת
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Icebreak Backend Server is running'
  });
});

// בדיקת Socket.io
app.get('/socket-test', (req, res) => {
  res.json({
    socketio: 'ready',
    connectedClients: io.engine.clientsCount || 0,
    message: 'Socket.io is running'
  });
});

const PORT = process.env.PORT || 3001;

// התחלת השרת
async function startServer() {
  try {
    // הגדרת מסד הנתונים
    await setupDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
