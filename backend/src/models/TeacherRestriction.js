const mongoose = require('mongoose');

// Subdocumento para cada slot de horário modificado
const slotSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Ex: "Segunda-Feira"
  hour: { type: String, required: true }, // Ex: "08:20-09:10"
  restrictionType: {
    type: String,
    required: true,
    enum: ['Limitado', 'Bloqueado'], // Só salvamos o que NÃO é 'Livre'
  },
}, { _id: false });


const teacherRestrictionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Professor é obrigatório']
  },
  distribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distribution',
    required: [true, 'Distribuição é obrigatória']
  },
  status: {
    type: String,
    // enum: ['draft', 'submitted', 'approved', 'rejected'],
    enum: ['Rascunho', 'Aguardando Revisão', 'Aprovado', 'Requer Ajustes'],
    default: 'Rascunho'
  },
  requestedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  slots: [{
    day: {
      type: String,
      required: [true, 'Dia é obrigatório'],
      enum: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    },
    hour: {
      type: String,
      required: [true, 'Horário é obrigatório'],
      trim: true
    },
    restrictionType: {
      type: String,
      required: [true, 'Tipo de restrição é obrigatório'],
      enum: ['available', 'limited', 'blocked']
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Justificativa não pode ter mais de 200 caracteres']
    }
  }],
  observations: {
    type: String,
    trim: true,
    maxlength: [1000, 'Observações não podem ter mais de 1000 caracteres']
  },
  history: [{
    action: {
      type: String,
      enum: ['created', 'submitted', 'approved', 'rejected', 'modified'],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    comments: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Índices
teacherRestrictionSchema.index({ teacher: 1, distribution: 1 }, { unique: true });
teacherRestrictionSchema.index({ status: 1 });
teacherRestrictionSchema.index({ approvedBy: 1 });

// Middleware para validar professor
teacherRestrictionSchema.pre('save', async function(next) {
  if (this.isModified('teacher')) {
    const User = mongoose.model('User');
    const teacher = await User.findById(this.teacher);
    
    if (!teacher || teacher.role !== 'teacher') {
      return next(new Error('Professor inválido'));
    }
  }
  next();
});

// Middleware para validar aprovador
teacherRestrictionSchema.pre('save', async function(next) {
  if (this.isModified('approvedBy') && this.approvedBy) {
    const User = mongoose.model('User');
    const approver = await User.findById(this.approvedBy);
    
    if (!approver || !['coordinator', 'administrator'].includes(approver.role)) {
      return next(new Error('Aprovador deve ser coordenador ou administrador'));
    }
  }
  next();
});

// Método para submeter para aprovação
teacherRestrictionSchema.methods.submit = function() {
  if (this.status !== 'draft') {
    throw new Error('Apenas restrições em rascunho podem ser submetidas');
  }
  
  this.status = 'submitted';
  this.requestedAt = new Date();
  
  this.history.push({
    action: 'submitted',
    user: this.teacher,
    comments: 'Restrições submetidas para aprovação'
  });
  
  return this.save();
};

// Método para aprovar restrições
teacherRestrictionSchema.methods.approve = function(approverId, comments) {
  if (this.status !== 'submitted') {
    throw new Error('Apenas restrições submetidas podem ser aprovadas');
  }
  
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = approverId;
  
  this.history.push({
    action: 'approved',
    user: approverId,
    comments: comments || 'Restrições aprovadas'
  });
  
  return this.save();
};

// Método para rejeitar restrições
teacherRestrictionSchema.methods.reject = function(rejectorId, comments) {
  if (this.status !== 'submitted') {
    throw new Error('Apenas restrições submetidas podem ser rejeitadas');
  }
  
  this.status = 'rejected';
  
  this.history.push({
    action: 'rejected',
    user: rejectorId,
    comments: comments || 'Restrições rejeitadas'
  });
  
  return this.save();
};

// Método para obter restrições bloqueadas para o FET
teacherRestrictionSchema.methods.getBlockedSlotsForFET = function() {
  if (this.status !== 'approved') {
    return [];
  }
  
  return this.slots
    .filter(slot => slot.restrictionType === 'blocked')
    .map(slot => ({
      day: slot.day,
      hour: slot.hour,
      teacher: this.teacher
    }));
};

// Método estático para obter todas as restrições aprovadas de uma distribuição
teacherRestrictionSchema.statics.getApprovedRestrictions = function(distributionId) {
  return this.find({
    distribution: distributionId,
    status: 'approved'
  }).populate('teacher', 'name');
};

// Método para gerar grade de horários padrão
teacherRestrictionSchema.statics.generateDefaultSchedule = function() {
  const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
  const hours = [
    '07:00-07:50', '07:50-08:40', '08:40-09:30', '09:50-10:40', '10:40-11:30', '11:30-12:20',
    '13:00-13:50', '13:50-14:40', '14:40-15:30', '15:50-16:40', '16:40-17:30', '17:30-18:20',
    '18:30-19:20', '19:20-20:10', '20:10-21:00', '21:10-22:00'
  ];
  
  const slots = [];
  
  days.forEach(day => {
    hours.forEach(hour => {
      slots.push({
        day,
        hour,
        restrictionType: 'available',
        reason: ''
      });
    });
  });
  
  return slots;
};

module.exports = mongoose.model('TeacherRestriction', teacherRestrictionSchema);

