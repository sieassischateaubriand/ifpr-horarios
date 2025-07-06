const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do curso é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
  },
  divulgationName: {
    type: String,
    trim: true,
    maxlength: [200, 'Nome de divulgação não pode ter mais de 200 caracteres']
  },
  sigla: {
    type: String,
    required: [true, 'Sigla é obrigatória'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Sigla não pode ter mais de 10 caracteres']
  },
  codigoSuap: {
    type: String,
    trim: true,
    maxlength: [20, 'Código SUAP não pode ter mais de 20 caracteres']
  },
  eixo: {
    type: String,
    required: [true, 'Eixo é obrigatório'],
    enum: [
      'Gestão e Negócios',
      'Informação e Comunicação',
      'Controle e Processos Industriais',
      'Infraestrutura',
      'Produção Alimentícia',
      'Recursos Naturais',
      'Produção Cultural e Design',
      'Ambiente e Saúde',
      'Segurança',
      'Hospitalidade e Lazer',
      'Produção Industrial'
    ]
  },
  modalidadeOferta: {
    type: String,
    required: [true, 'Modalidade de oferta é obrigatória'],
    enum: ['Presencial', 'EAD', 'Híbrido']
  },
  formaOferta: {
    type: String,
    required: [true, 'Forma de oferta é obrigatória'],
    enum: ['Superior', 'Técnico', 'Pós-graduação', 'Extensão']
  },
  valorHoraAula: {
    type: Number,
    required: [true, 'Valor da hora/aula é obrigatório'],
    min: [0, 'Valor da hora/aula deve ser positivo']
  },
  tags: [{
    type: String,
    enum: ['Semestral', 'Graduação', 'Anual', 'Pós-graduação'], // Opções para as checkboxes
    trim: true
  }],
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Coordenador é obrigatório']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres']
  },
  duration: {
    semesters: {
      type: Number,
      required: [true, 'Duração em semestres é obrigatória'],
      min: [1, 'Duração deve ser pelo menos 1 semestre']
    },
    totalHours: {
      type: Number,
      required: [true, 'Carga horária total é obrigatória'],
      min: [1, 'Carga horária total deve ser positiva']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'planning'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índices
courseSchema.index({ sigla: 1 });
courseSchema.index({ coordinator: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ eixo: 1 });

// Middleware para validar coordenador
courseSchema.pre('save', async function(next) {
  if (this.isModified('coordinator')) {
    const User = mongoose.model('User');
    const coordinator = await User.findById(this.coordinator);
    
    if (!coordinator || coordinator.role !== 'coordinator') {
      return next(new Error('Coordenador inválido'));
    }
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);

