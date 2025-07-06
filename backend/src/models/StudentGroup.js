const mongoose = require('mongoose');

const studentGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da turma é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  codigoSuap: {
    type: String,
    trim: true,
    maxlength: [20, 'Código SUAP não pode ter mais de 20 caracteres']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Curso é obrigatório']
  },
  numberOfStudents: {
    type: Number,
    required: [true, 'Número de alunos é obrigatório'],
    min: [1, 'Deve ter pelo menos 1 aluno']
  },
  conclusionDate: {
    type: Date,
    required: [true, 'Data de conclusão é obrigatória']
  },
  periodosOcorrencia: [{
    type: String,
    enum: ['Matutino', 'Vespertino', 'Noturno', 'Integral']
  }],
  salasPreferenciais: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  semester: {
    type: Number,
    required: [true, 'Semestre é obrigatório'],
    min: [1, 'Semestre deve ser pelo menos 1']
  },
  year: {
    type: Number,
    required: [true, 'Ano de ingresso é obrigatório'],
    min: [2000, 'Ano deve ser válido']
  },
  status: {
    type: String,
    enum: ['active', 'concluded', 'suspended'],
    default: 'active'
  },
  characteristics: {
    hasSpecialNeeds: {
      type: Boolean,
      default: false
    },
    requiresLab: {
      type: Boolean,
      default: false
    },
    maxConsecutiveClasses: {
      type: Number,
      default: 4,
      min: [1, 'Máximo de aulas consecutivas deve ser pelo menos 1']
    }
  }
}, {
  timestamps: true
});

// Índices
studentGroupSchema.index({ course: 1 });
studentGroupSchema.index({ name: 1, course: 1 }, { unique: true });
studentGroupSchema.index({ status: 1 });
studentGroupSchema.index({ year: 1, semester: 1 });

// Método para gerar nome automático baseado na sigla do curso e ano
studentGroupSchema.statics.generateName = function(courseSigla, year) {
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
                     'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const currentMonth = new Date().getMonth();
  return `${courseSigla}${monthNames[currentMonth]}${year}`;
};

// Middleware para validar curso
studentGroupSchema.pre('save', async function(next) {
  if (this.isModified('course')) {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (!course) {
      return next(new Error('Curso não encontrado'));
    }
  }
  next();
});

module.exports = mongoose.model('StudentGroup', studentGroupSchema);

