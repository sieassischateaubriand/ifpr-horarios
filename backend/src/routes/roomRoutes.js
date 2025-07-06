const express = require('express');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomStatus,
  getRoomTypes,
  getBuildings
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, roomSchemas } = require('../middleware/validation');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas GET - acessíveis para todos os usuários autenticados
router.get('/', getRooms);
router.get('/types', getRoomTypes);
router.get('/buildings', getBuildings);
router.get('/:id', getRoomById);

// Rotas POST/PUT/DELETE - apenas para administradores
router.post('/', 
  authorize(['administrator']),
  validate(roomSchemas.create),
  createRoom
);

router.put('/:id',
  authorize(['administrator']),
  validate(roomSchemas.update),
  updateRoom
);

router.delete('/:id',
  authorize(['administrator']),
  deleteRoom
);

router.patch('/:id/toggle-status',
  authorize(['administrator']),
  toggleRoomStatus
);

module.exports = router;

