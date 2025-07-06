const Subject = require('../models/Subject');
const { validationResult } = require('express-validator');

// Listar todas as disciplinas
const getSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active } = req.query;
    
    const query = {};
    
    // Filtro por busca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por status ativo
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const subjects = await Subject.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Subject.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        subjects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter disciplina por ID
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { subject }
    });
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova disciplina
const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const subjectData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const subject = new Subject(subjectData);
    await subject.save();
    
    res.status(201).json({
      success: true,
      message: 'Disciplina criada com sucesso',
      data: { subject }
    });
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma disciplina com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar disciplina
const updateSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Disciplina atualizada com sucesso',
      data: { subject }
    });
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma disciplina com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar disciplina
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    await Subject.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Disciplina excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar disciplina
const toggleSubjectStatus = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Disciplina não encontrada'
      });
    }
    
    subject.isActive = !subject.isActive;
    await subject.save();
    
    res.json({
      success: true,
      message: `Disciplina ${subject.isActive ? 'ativada' : 'desativada'} com sucesso`,
      data: { subject }
    });
  } catch (error) {
    console.error('Erro ao alterar status da disciplina:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus
};

