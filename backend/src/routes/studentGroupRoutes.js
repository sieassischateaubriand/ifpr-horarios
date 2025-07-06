const express = require('express');
const {
  getStudentGroups,
  getStudentGroupById,
  createStudentGroup,
  updateStudentGroup,
  deleteStudentGroup,
  toggleStudentGroupStatus
} = require('../controllers/studentGroupController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, studentGroupSchemas } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas GET - acessíveis para todos os usuários autenticados
router.get('/', getStudentGroups);
router.get('/:id', getStudentGroupById);

// Rotas POST/PUT/DELETE - apenas para administradores e coordenadores
router.post('/', 
  authorize(['administrator', 'coordinator']),
  validate(studentGroupSchemas.create),
  createStudentGroup
);

router.put('/:id',
  authorize(['administrator', 'coordinator']),
  validate(studentGroupSchemas.update),
  updateStudentGroup
);

router.delete('/:id',
  authorize(['administrator', 'coordinator']),
  deleteStudentGroup
);

router.patch('/:id/toggle-status',
  authorize(['administrator', 'coordinator']),
  toggleStudentGroupStatus
);

module.exports = router;

