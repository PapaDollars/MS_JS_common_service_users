const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { userValidator } = require('../middleware/validator');

const router = express.Router();

// Routes publiques
router.post('/register', userValidator.register, userController.register);
router.post('/login', userValidator.login, userController.login);

// Routes protégées
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userValidator.updateProfile, userController.updateProfile);
router.put('/change-password', authMiddleware, userValidator.changePassword, userController.changePassword);
router.get('/verify-token', authMiddleware, userController.verifyToken);

// Routes admin
router.get('/', authMiddleware, userController.getAllUsers);
router.put('/:userId/toggle-status', authMiddleware, userController.toggleUserStatus);

module.exports = router;