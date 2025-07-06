const Room = require('../models/Room');
const { validationResult } = require('express-validator');

// Listar todas as salas
const getRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type, building, active } = req.query;
    
    const query = {};
    
    // Filtro por busca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por tipo
    if (type) {
      query.type = type;
    }
    
    // Filtro por prédio
    if (building) {
      query.building = { $regex: building, $options: 'i' };
    }
    
    // Filtro por status ativo
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const rooms = await Room.find(query)
      .sort({ building: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Room.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter sala por ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova sala
const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const roomData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const room = new Room(roomData);
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Sala criada com sucesso',
      data: { room }
    });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma sala com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar sala
const updateRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Sala atualizada com sucesso',
      data: { room }
    });
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma sala com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar sala
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    await Room.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Sala excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir sala:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar sala
const toggleRoomStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Sala não encontrada'
      });
    }
    
    room.isActive = !room.isActive;
    await room.save();
    
    res.json({
      success: true,
      message: `Sala ${room.isActive ? 'ativada' : 'desativada'} com sucesso`,
      data: { room }
    });
  } catch (error) {
    console.error('Erro ao alterar status da sala:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter tipos de sala disponíveis
const getRoomTypes = async (req, res) => {
  try {
    const types = await Room.distinct('type');
    
    res.json({
      success: true,
      data: { types }
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de sala:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter prédios disponíveis
const getBuildings = async (req, res) => {
  try {
    const buildings = await Room.distinct('building');
    
    res.json({
      success: true,
      data: { buildings }
    });
  } catch (error) {
    console.error('Erro ao buscar prédios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomStatus,
  getRoomTypes,
  getBuildings
};

