const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// 身份驗證路由 (不需要登入)
router.post('/login', adminController.adminLogin);
router.post('/logout', adminController.adminLogout);
router.post('/create', adminController.createAdmin); // 用於初始化管理員帳號

// 需要身份驗證的路由
router.get('/orders', requireAdminAuth, adminController.getAllOrders);
router.patch('/orders/:orderId/status', requireAdminAuth, adminController.updateOrderStatus);

module.exports = router;