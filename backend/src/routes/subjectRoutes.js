const express = require('express');
const Subject = require('../models/Subject');

const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus
} = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, subjectSchemas } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas GET - acessíveis para todos os usuários autenticados
router.get('/', getSubjects);
router.get('/:id', getSubjectById);

// Rotas POST/PUT/DELETE - apenas para administradores e coordenadores
router.post('/', 
  authorize(['administrator', 'coordinator']),
  validate(subjectSchemas.create),
  createSubject
);

router.put('/:id',
  authorize(['administrator', 'coordinator']),
  validate(subjectSchemas.update),
  updateSubject
);

router.delete('/:id',
  authorize(['administrator', 'coordinator']),
  deleteSubject
);

router.patch('/:id/toggle-status',
  authorize(['administrator', 'coordinator']),
  toggleSubjectStatus
);

module.exports = router;

