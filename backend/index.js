const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { initializeModels } = require('./models');
const dotenv = require('dotenv');
dotenv.config();

// passport.js
const passport = require('passport');
const configurePassport = require('./config/passport');

const app = express();

// 1. 信任反向代理 
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// passport setting - without session middleware
configurePassport(passport);
app.use(passport.initialize());

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

app.use(cors({
  origin: process.env.ADMIN_CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Routes
const adminRouter = require('./routes/adminRouter');
const authRouter = require('./routes/authRouter');
app.use('/api/admin', adminRouter);
app.use('/auth', authRouter);

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