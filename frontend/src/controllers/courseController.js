const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Listar todos os cursos
const getCourses = async (req, res) => {
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
    
    const courses = await Course.find(query)
      .populate('coordinator', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter curso por ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('coordinator', 'name email')
      .populate('studentGroups');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo curso
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const courseData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const course = new Course(courseData);
    await course.save();
    
    await course.populate('coordinator', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Curso criado com sucesso',
      data: { course }
    });
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um curso com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar curso
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('coordinator', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Curso atualizado com sucesso',
      data: { course }
    });
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um curso com este código'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar curso
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    // Verificar se há turmas associadas
    if (course.studentGroups && course.studentGroups.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir curso com turmas associadas'
      });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Curso excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar curso
const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }
    
    course.isActive = !course.isActive;
    await course.save();
    
    await course.populate('coordinator', 'name email');
    
    res.json({
      success: true,
      message: `Curso ${course.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: { course }
    });
  } catch (error) {
    console.error('Erro ao alterar status do curso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
};

