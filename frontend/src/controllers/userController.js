const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Listar todos os usuários
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role, active } = req.query;
    
    const query = {};
    
    // Filtro por busca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por papel
    if (role) {
      query.role = role;
    }
    
    // Filtro por status ativo
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo usuário
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const { password, ...userData } = req.body;
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      ...userData,
      password: hashedPassword,
      createdBy: req.user.id
    });
    
    await user.save();
    
    // Remover senha da resposta
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um usuário com este email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar usuário
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const { password, ...updateData } = req.body;
    
    // Se uma nova senha foi fornecida, fazer hash
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um usuário com este email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar usuário
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Não permitir deletar o próprio usuário
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir seu próprio usuário'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar usuário
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Não permitir desativar o próprio usuário
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível desativar seu próprio usuário'
      });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de usuários
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: ['$isActive', 1, 0]
            }
          }
        }
      }
    ]);
    
    const total = await User.countDocuments();
    const totalActive = await User.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      data: {
        total,
        totalActive,
        byRole: stats
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
};

