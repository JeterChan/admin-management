const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');

// admin 相關路由
router.get('/orders', adminController.getAllOrders);

module.exports = router;