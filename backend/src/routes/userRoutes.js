const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas GET - apenas para administradores
router.get('/', 
  authorize(['administrator']),
  getUsers
);

router.get('/stats',
  authorize(['administrator']),
  getUserStats
);

router.get('/:id',
  authorize(['administrator']),
  getUserById
);

// Rotas POST/PUT/DELETE - apenas para administradores
router.post('/', 
  authorize(['administrator']),
  validate(userSchemas.create),
  createUser
);

router.put('/:id',
  authorize(['administrator']),
  validate(userSchemas.update),
  updateUser
);

router.delete('/:id',
  authorize(['administrator']),
  deleteUser
);

router.patch('/:id/toggle-status',
  authorize(['administrator']),
  toggleUserStatus
);

module.exports = router;

