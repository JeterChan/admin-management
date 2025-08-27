const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');
const passport = require("passport");

// Apply JWT authentication to all routes in this router
router.use(passport.authenticate('jwt', { session: false }));

// All routes here require JWT authentication
router.get('/check', adminController.checkAuth);
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;