const express = require('express');
const Course = require('../models/Course'); // Importa nosso modelo
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, courseSchemas } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas GET - acessíveis para todos os usuários autenticados
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Rotas POST/PUT/DELETE - apenas para administradores e coordenadores
router.post('/', 
  authorize(['administrator', 'coordinator']),
  validate(courseSchemas.create),
  createCourse
);

router.put('/:id',
  authorize(['administrator', 'coordinator']),
  validate(courseSchemas.update),
  updateCourse
);

router.delete('/:id',
  authorize(['administrator']),
  deleteCourse
);

router.patch('/:id/toggle-status',
  authorize(['administrator']),
  toggleCourseStatus
);

module.exports = router;

