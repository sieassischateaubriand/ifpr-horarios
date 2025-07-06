const StudentGroup = require('../models/StudentGroup');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Listar todas as turmas
const getStudentGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', course, active } = req.query;
    
    const query = {};
    
    // Filtro por busca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por curso
    if (course) {
      query.course = course;
    }
    
    // Filtro por status ativo
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const studentGroups = await StudentGroup.find(query)
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await StudentGroup.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        studentGroups,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter turma por ID
const getStudentGroupById = async (req, res) => {
  try {
    const studentGroup = await StudentGroup.findById(req.params.id)
      .populate('course', 'name code');
    
    if (!studentGroup) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { studentGroup }
    });
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar nova turma
const createStudentGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    // Verificar se o curso existe
    const course = await Course.findById(req.body.course);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    const studentGroupData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const studentGroup = new StudentGroup(studentGroupData);
    await studentGroup.save();
    
    // Adicionar turma ao curso
    await Course.findByIdAndUpdate(
      req.body.course,
      { $push: { studentGroups: studentGroup._id } }
    );
    
    await studentGroup.populate('course', 'name code');
    
    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      data: { studentGroup }
    });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma turma com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar turma
const updateStudentGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const oldStudentGroup = await StudentGroup.findById(req.params.id);
    if (!oldStudentGroup) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Se o curso mudou, atualizar referências
    if (req.body.course && req.body.course !== oldStudentGroup.course.toString()) {
      // Remover do curso antigo
      await Course.findByIdAndUpdate(
        oldStudentGroup.course,
        { $pull: { studentGroups: oldStudentGroup._id } }
      );
      
      // Adicionar ao novo curso
      await Course.findByIdAndUpdate(
        req.body.course,
        { $push: { studentGroups: oldStudentGroup._id } }
      );
    }
    
    const studentGroup = await StudentGroup.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('course', 'name code');
    
    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: { studentGroup }
    });
  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe uma turma com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar turma
const deleteStudentGroup = async (req, res) => {
  try {
    const studentGroup = await StudentGroup.findById(req.params.id);
    
    if (!studentGroup) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    // Remover referência do curso
    await Course.findByIdAndUpdate(
      studentGroup.course,
      { $pull: { studentGroups: studentGroup._id } }
    );
    
    await StudentGroup.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Turma excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar turma
const toggleStudentGroupStatus = async (req, res) => {
  try {
    const studentGroup = await StudentGroup.findById(req.params.id);
    
    if (!studentGroup) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }
    
    studentGroup.isActive = !studentGroup.isActive;
    await studentGroup.save();
    
    await studentGroup.populate('course', 'name code');
    
    res.json({
      success: true,
      message: `Turma ${studentGroup.isActive ? 'ativada' : 'desativada'} com sucesso`,
      data: { studentGroup }
    });
  } catch (error) {
    console.error('Erro ao alterar status da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getStudentGroups,
  getStudentGroupById,
  createStudentGroup,
  updateStudentGroup,
  deleteStudentGroup,
  toggleStudentGroupStatus
};

