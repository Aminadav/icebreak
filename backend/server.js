const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('./console-logger')
require('dotenv').config();

const setupSocketHandlers = require('./routes/socket');
const setupDatabase = require('./scripts/setupDatabase');

const app = express();
const server = http.createServer(app);

// הגדרת CORS
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:5173"], // כתובת ה-frontend
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

// Testing route for E2E tests
const testingRouter = require('./routes/testing');
app.use('/api/testing', testingRouter);

const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);

// Google OAuth routes
const googleRouter = require('./routes/google');
app.use('/api/google', googleRouter);

// הגדרת Socket.io עם CORS
//@ts-ignore
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:4000", "http://localhost:5173"],
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

setupSocketHandlers(io);


// Add Socket.io engine debugging
io.engine.on('connection_error', (err) => {
  console.log('❌ Socket.io engine connection error:', err.req?.url);
  console.log('❌ Error code:', err.code);
  console.log('❌ Error message:', err.message);
  console.log('❌ Error context:', err.context);
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

const PORT = process.env.PORT || 4001;

// התחלת השרת
async function startServer() {
  try {
    // הגדרת מסד הנתונים
    await setupDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
