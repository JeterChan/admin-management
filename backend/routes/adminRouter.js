const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const passport = require("passport");

router.use(passport.authenticate('jwt',{ session: false }));

// 需要身份驗證的路由
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;