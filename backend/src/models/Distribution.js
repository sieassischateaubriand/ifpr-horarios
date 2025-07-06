const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da distribuição é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Curso é obrigatório']
  },
  semester: {
    type: String,
    required: [true, 'Semestre é obrigatório'],
    trim: true,
    match: [/^\d{4}\.[12]$/, 'Formato do semestre deve ser YYYY.1 ou YYYY.2']
  },
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  endDate: {
    type: Date,
    required: [true, 'Data de fim é obrigatória']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Coordenador é obrigatório']
  },
  statistics: {
    totalActivities: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    teachersInvolved: {
      type: Number,
      default: 0
    },
    roomsUsed: {
      type: Number,
      default: 0
    }
  },
  approvals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['approved', 'rejected'],
      required: true
    },
    comments: {
      type: String,
      trim: true
    }
  }],
  configuration: {
    weeksPerSemester: {
      type: Number,
      default: 18,
      min: [1, 'Semanas por semestre deve ser pelo menos 1']
    },
    daysPerWeek: {
      type: Number,
      default: 5,
      min: [1, 'Dias por semana deve ser pelo menos 1']
    },
    periodsPerDay: {
      type: Number,
      default: 12,
      min: [1, 'Períodos por dia deve ser pelo menos 1']
    }
  }
}, {
  timestamps: true
});

// Índices
distributionSchema.index({ course: 1, semester: 1 }, { unique: true });
distributionSchema.index({ status: 1 });
distributionSchema.index({ coordinator: 1 });
distributionSchema.index({ startDate: 1, endDate: 1 });

// Middleware para validar datas
distributionSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Data de início deve ser anterior à data de fim'));
  }
  next();
});

// Middleware para validar coordenador
distributionSchema.pre('save', async function(next) {
  if (this.isModified('coordinator')) {
    const User = mongoose.model('User');
    const coordinator = await User.findById(this.coordinator);
    
    if (!coordinator || coordinator.role !== 'coordinator') {
      return next(new Error('Coordenador inválido'));
    }
  }
  next();
});

// Método para calcular estatísticas
distributionSchema.methods.calculateStatistics = async function() {
  const Activity = mongoose.model('Activity');
  
  const activities = await Activity.find({ distribution: this._id })
    .populate('teachers')
    .populate('room');
  
  const uniqueTeachers = new Set();
  const uniqueRooms = new Set();
  let totalHours = 0;
  
  activities.forEach(activity => {
    activity.teachers.forEach(teacher => uniqueTeachers.add(teacher._id.toString()));
    if (activity.room) uniqueRooms.add(activity.room._id.toString());
    totalHours += activity.aulasPorSemana * this.configuration.weeksPerSemester;
  });
  
  this.statistics = {
    totalActivities: activities.length,
    totalHours,
    teachersInvolved: uniqueTeachers.size,
    roomsUsed: uniqueRooms.size
  };
  
  return this.save();
};

// Método para gerar nome automático
distributionSchema.statics.generateName = function(courseName, semester) {
  return `${courseName} - ${semester}`;
};

module.exports = mongoose.model('Distribution', distributionSchema);

