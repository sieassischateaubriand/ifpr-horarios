const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Disciplina é obrigatória']
  },
  studentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentGroup',
    required: [true, 'Turma é obrigatória']
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  }],
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  aulasPorSemana: {
    type: Number,
    required: [true, 'Aulas por semana é obrigatório'],
    min: [1, 'Deve ter pelo menos 1 aula por semana']
  },
  divideTurma: {
    type: Boolean,
    default: false
  },
  semestre: {
    type: Number,
    required: [true, 'Semestre é obrigatório'],
    min: [1, 'Semestre deve ser pelo menos 1']
  },
  distribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distribution',
    required: [true, 'Distribuição é obrigatória']
  },
  activityType: {
    type: String,
    enum: ['theoretical', 'practical', 'laboratory', 'seminar', 'project'],
    default: 'theoretical'
  },
  requirements: {
    needsProjector: {
      type: Boolean,
      default: false
    },
    needsComputers: {
      type: Boolean,
      default: false
    },
    needsAirConditioning: {
      type: Boolean,
      default: false
    },
    needsSpecialEquipment: [{
      type: String,
      trim: true
    }],
    minCapacity: {
      type: Number,
      min: [1, 'Capacidade mínima deve ser pelo menos 1']
    }
  },
  scheduling: {
    preferredDays: [{
      type: String,
      enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    }],
    preferredTimes: [{
      type: String,
      trim: true
    }],
    consecutiveClasses: {
      type: Boolean,
      default: false
    },
    avoidDays: [{
      type: String,
      enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    }]
  },
  status: {
    type: String,
    enum: ['planned', 'approved', 'scheduled', 'cancelled'],
    default: 'planned'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem ter mais de 500 caracteres']
  },
  fetData: {
    activityId: {
      type: Number
    },
    activityGroupId: {
      type: Number
    },
    totalDuration: {
      type: Number
    }
  }
}, {
  timestamps: true
});

// Índices
activitySchema.index({ distribution: 1 });
activitySchema.index({ subject: 1, studentGroup: 1 });
activitySchema.index({ teachers: 1 });
activitySchema.index({ room: 1 });
activitySchema.index({ status: 1 });

// Middleware para validar professores
activitySchema.pre('save', async function(next) {
  if (this.isModified('teachers')) {
    const User = mongoose.model('User');
    
    for (const teacherId of this.teachers) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return next(new Error(`Professor inválido: ${teacherId}`));
      }
    }
  }
  next();
});

// Middleware para validar carga horária
activitySchema.pre('save', async function(next) {
  if (this.isModified('aulasPorSemana') || this.isModified('subject')) {
    const Subject = mongoose.model('Subject');
    const Distribution = mongoose.model('Distribution');
    
    const subject = await Subject.findById(this.subject);
    const distribution = await Distribution.findById(this.distribution);
    
    if (subject && distribution) {
      const totalAulasNoSemestre = this.aulasPorSemana * distribution.configuration.weeksPerSemester;
      const cargaHorariaMaxima = subject.ementa.cargaHorariaTotal;
      
      if (totalAulasNoSemestre > cargaHorariaMaxima) {
        return next(new Error(`Carga horária excede o limite. Máximo: ${cargaHorariaMaxima} aulas no semestre`));
      }
    }
  }
  next();
});

// Método para verificar conflitos de horário
activitySchema.methods.checkConflicts = async function() {
  const conflicts = [];
  
  // Verificar conflitos de professor
  for (const teacherId of this.teachers) {
    const teacherActivities = await this.constructor.find({
      teachers: teacherId,
      distribution: this.distribution,
      _id: { $ne: this._id }
    });
    
    if (teacherActivities.length > 0) {
      conflicts.push({
        type: 'teacher',
        teacherId,
        message: 'Professor já possui outras atividades nesta distribuição'
      });
    }
  }
  
  // Verificar conflitos de sala
  if (this.room) {
    const roomActivities = await this.constructor.find({
      room: this.room,
      distribution: this.distribution,
      _id: { $ne: this._id }
    });
    
    if (roomActivities.length > 0) {
      conflicts.push({
        type: 'room',
        roomId: this.room,
        message: 'Sala já está sendo utilizada por outras atividades'
      });
    }
  }
  
  return conflicts;
};

// Método para gerar dados para o FET
activitySchema.methods.generateFETData = function(activityId, activityGroupId) {
  this.fetData = {
    activityId,
    activityGroupId,
    totalDuration: this.aulasPorSemana
  };
  
  return this.save();
};

// Método estático para processar divisão de turma
activitySchema.statics.processDividedClass = async function(activityData) {
  if (!activityData.divideTurma) {
    return [activityData];
  }
  
  const StudentGroup = mongoose.model('StudentGroup');
  const originalGroup = await StudentGroup.findById(activityData.studentGroup);
  
  if (!originalGroup) {
    throw new Error('Turma não encontrada');
  }
  
  // Criar subgrupos A e B
  const subgroupA = new StudentGroup({
    ...originalGroup.toObject(),
    _id: new mongoose.Types.ObjectId(),
    name: `${originalGroup.name}-A`,
    numberOfStudents: Math.ceil(originalGroup.numberOfStudents / 2)
  });
  
  const subgroupB = new StudentGroup({
    ...originalGroup.toObject(),
    _id: new mongoose.Types.ObjectId(),
    name: `${originalGroup.name}-B`,
    numberOfStudents: Math.floor(originalGroup.numberOfStudents / 2)
  });
  
  await subgroupA.save();
  await subgroupB.save();
  
  // Criar duas atividades
  const activityA = {
    ...activityData,
    studentGroup: subgroupA._id,
    notes: `${activityData.notes || ''} - Subgrupo A`.trim()
  };
  
  const activityB = {
    ...activityData,
    studentGroup: subgroupB._id,
    notes: `${activityData.notes || ''} - Subgrupo B`.trim()
  };
  
  return [activityA, activityB];
};

module.exports = mongoose.model('Activity', activitySchema);

