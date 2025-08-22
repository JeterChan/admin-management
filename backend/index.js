const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { initializeModels } = require('./models');
const session = require('express-session');
const MongoStore = require('connect-mongo');


dotenv.config();

const app = express();

async function initializeApp() {
  try {
    // 1. connect database
    const mongoose = await connectDB();

    // 2. 初始化 models
    initializeModels(mongoose);
    console.log('✅ Models initialized');
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
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  },
  name: 'admin.sid'
}));


// Routes
const adminRouter = require('./routes/adminRouter');
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// 404 處理
// app.use('*', (req, res) => {
//   res.status(404).json({
//     status: 'error',
//     message: '[Admin] 找不到請求的資源'
//   });
// });

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