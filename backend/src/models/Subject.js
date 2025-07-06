const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da disciplina é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Curso é obrigatório']
  },
  modulo: {
    type: String,
    required: [true, 'Módulo é obrigatório'],
    trim: true
  },
  tags: [{
    type: String,
    enum: ['Semestral', 'Técnica', 'Optativa', 'Dependência', 'Adaptação curricular', 'Atendimento Educacional Especializado'],
    trim: true
  }],
  areasConhecimento: [{
    type: String,
    trim: true
  }],
  salasPreferenciais: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  ementa: {
    versaoPPC: {
      type: String,
      required: [true, 'Versão do PPC é obrigatória'],
      trim: true
    },
    dataVigencia: {
      type: Date,
      required: [true, 'Data de vigência é obrigatória']
    },
    cargaHorariaTotal: {
      type: Number,
      required: [true, 'Carga horária total é obrigatória'],
      min: [1, 'Carga horária total deve ser positiva']
    },
    cargaHorariaEAD: {
      type: Number,
      default: 0,
      min: [0, 'Carga horária EAD deve ser não negativa']
    },
    cargaHorariaPratica: {
      type: Number,
      default: 0,
      min: [0, 'Carga horária prática deve ser não negativa']
    },
    cargaHorariaTeorica: {
      type: Number,
      default: 0,
      min: [0, 'Carga horária teórica deve ser não negativa']
    }
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  competencies: [{
    type: String,
    trim: true
  }],
  bibliography: {
    basic: [{
      type: String,
      trim: true
    }],
    complementary: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revision'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índices
subjectSchema.index({ course: 1 });
subjectSchema.index({ name: 1, course: 1 }, { unique: true });
subjectSchema.index({ status: 1 });
subjectSchema.index({ modulo: 1 });

// Middleware para validar carga horária
subjectSchema.pre('save', function(next) {
  const ementa = this.ementa;
  const totalCalculated = ementa.cargaHorariaEAD + ementa.cargaHorariaPratica + ementa.cargaHorariaTeorica;
  
  if (totalCalculated > ementa.cargaHorariaTotal) {
    return next(new Error('Soma das cargas horárias específicas não pode exceder a carga horária total'));
  }
  
  next();
});

// Middleware para validar curso
subjectSchema.pre('save', async function(next) {
  if (this.isModified('course')) {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (!course) {
      return next(new Error('Curso não encontrado'));
    }
  }
  next();
});

// Método para calcular duração em períodos para o FET
subjectSchema.methods.calculateDurationForFET = function(weeksPerSemester = 18) {
  return Math.ceil(this.ementa.cargaHorariaTotal / weeksPerSemester);
};

module.exports = mongoose.model('Subject', subjectSchema);

