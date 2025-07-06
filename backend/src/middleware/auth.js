const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar papéis específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes'
      });
    }
    
    next();
  };
};

// Middleware para verificar se o usuário pode acessar recursos específicos
const authorizeResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const resourceId = req.params.id;
      
      // Administradores têm acesso total
      if (user.role === 'administrator') {
        return next();
      }
      
      // Lógica específica por tipo de recurso
      switch (resourceType) {
        case 'course':
          const Course = require('../models/Course');
          const course = await Course.findById(resourceId);
          
          if (!course) {
            return res.status(404).json({
              success: false,
              message: 'Curso não encontrado'
            });
          }
          
          // Coordenadores só podem acessar seus próprios cursos
          if (user.role === 'coordinator' && course.coordinator.toString() !== user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Acesso negado ao curso'
            });
          }
          break;
          
        case 'distribution':
          const Distribution = require('../models/Distribution');
          const distribution = await Distribution.findById(resourceId).populate('course');
          
          if (!distribution) {
            return res.status(404).json({
              success: false,
              message: 'Distribuição não encontrada'
            });
          }
          
          // Coordenadores só podem acessar distribuições de seus cursos
          if (user.role === 'coordinator' && distribution.course.coordinator.toString() !== user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Acesso negado à distribuição'
            });
          }
          break;
          
        case 'teacherRestriction':
          const TeacherRestriction = require('../models/TeacherRestriction');
          const restriction = await TeacherRestriction.findById(resourceId);
          
          if (!restriction) {
            return res.status(404).json({
              success: false,
              message: 'Restrição não encontrada'
            });
          }
          
          // Professores só podem acessar suas próprias restrições
          if (user.role === 'teacher' && restriction.teacher.toString() !== user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Acesso negado à restrição'
            });
          }
          break;
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware para verificar se o usuário é dono do recurso ou tem permissão
const authorizeOwnerOrRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const targetUserId = req.params.userId || req.params.id;
      
      // Verificar se é o próprio usuário
      if (user._id.toString() === targetUserId) {
        return next();
      }
      
      // Verificar se tem papel permitido
      if (allowedRoles.includes(user.role)) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeResource,
  authorizeOwnerOrRole
};

