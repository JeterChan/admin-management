const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { initializeModels } = require('./models');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// passport.js
const passport = require('passport');
const configurePassport = require('./config/passport');

dotenv.config();

const app = express();

async function initializeApp() {
  try {
    // 1. connect database
    const mongoose = await connectDB();

    // 2. 初始化 models
    initializeModels(mongoose);

  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.ADMIN_CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// session setting
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 小時（後台工作時間較長）
    httpOnly: false, // TEMP: Make cookie visible in DevTools
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    domain: process.env.COOKIE_DOMAIN
  },
  name: 'admin.sid'
}));

// passport setting - must be after session middleware
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());


// Routes
const adminRouter = require('./routes/adminRouter');
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'admin-management', // 🔥 不同的服務名稱
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'UNHEALTHY',
      error: error.message
    });
  }
});

app.get('/api/admin/quick-test', (req, res) => {
    res.json({
        hasCookies: !!req.headers.cookie,
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
        userEmail: req.user?.email,
        message: req.isAuthenticated() ? 'Authentication OK' : 'Not authenticated'
    });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || '伺服器內部錯誤';
  
  console.error('Error:', err);
  
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

async function startServer() {
  try {
    await initializeApp();

    app.listen(process.env.PORT, () => {
      console.log(`🚀 [Admin] 後台管理系統運行在 port ${process.env.PORT}`);
      console.log(`📍 [Admin] 環境: ${process.env.NODE_ENV}`);
      console.log(`🌐 [Admin] CORS 允許來源: ${process.env.ADMIN_CLIENT_URL}`);
    });
  } catch (error) {
    console.error('❌ [Admin] Server startup failed:', error);
    process.exit(1);
  }
}

startServer();