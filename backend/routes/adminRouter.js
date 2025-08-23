const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');

// admin 相關路由
// get all orders
router.get('/orders', adminController.getAllOrders);
// update order status
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;