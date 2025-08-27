const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// login route
// POST /auth/login
router.post('/login', authController.adminLogin);

// create admin (for initiation)
router.post('/create', authController.createAdmin);

module.exports = router;