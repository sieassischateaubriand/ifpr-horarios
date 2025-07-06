const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Rotas públicas
router.post('/register', validate(userSchemas.create), register);
router.post('/login', validate(userSchemas.login), login);

// Rotas protegidas
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validate(userSchemas.update), updateProfile);
router.put('/change-password', validate(userSchemas.changePassword), changePassword);
router.post('/logout', logout);
router.get('/verify', verifyToken);

module.exports = router;

