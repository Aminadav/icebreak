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

// הוספת תמיכה בקבצים סטטיים
app.use(express.static('public'));

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Watermark route
const watermarkRouter = require('./routes/watermark');
app.use('/api/watermark', watermarkRouter);

// הגדרת Socket.io עם CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  allowUpgrades: true,
  cookie: false,
  debug: true,
});

// הוספת לוג לדיבוג
console.log('⚡ Socket.io instance created with options:', {
  cors: io._corsObj,
  transports: io._opts?.transports || 'default',
  path: io.path(),
  adapter: io.adapter && io.adapter.constructor.name,
});

// הגדרת Socket handlers תחילה
setupSocketHandlers(io);
console.log('🔗 Socket handlers setup completed');

// Add direct connection event for debugging - למטרות דיבוג בלבד
io.on('connection', (socket) => {
  console.log('⭐ DIRECT connection handler in server.js: client connected:', socket.id);
  console.log('⭐ Transport type:', socket.conn.transport.name);
  console.log('⭐ Handshake data:', JSON.stringify({
    headers: socket.handshake.headers,
    query: socket.handshake.query,
    auth: socket.handshake.auth,
  }, null, 2));
});

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
    message: 'Socket.io is running',
    handlers: Object.keys(io.listeners('connection')).length || 0,
    engineHandlers: Object.keys(io.engine.listeners('connection')).length || 0
  });
});

// HTML דף הבדיקה
app.get('/test', (req, res) => {
  res.redirect('/socket-test.html');
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
