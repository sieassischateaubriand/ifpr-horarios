const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da sala é obrigatório'],
    unique: true,
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  building: {
    type: String,
    required: [true, 'Prédio é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome do prédio não pode ter mais de 100 caracteres']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacidade é obrigatória'],
    min: [1, 'Capacidade deve ser pelo menos 1']
  },
  type: {
    type: String,
    required: [true, 'Tipo da sala é obrigatório'],
    enum: ['classroom', 'laboratory', 'auditorium', 'workshop', 'library', 'computer_lab']
  },
  resources: {
    hasProjector: {
      type: Boolean,
      default: false
    },
    hasComputers: {
      type: Boolean,
      default: false
    },
    hasAirConditioning: {
      type: Boolean,
      default: false
    },
    hasWhiteboard: {
      type: Boolean,
      default: true
    },
    hasSmartboard: {
      type: Boolean,
      default: false
    },
    hasAudioSystem: {
      type: Boolean,
      default: false
    },
    specialEquipment: [{
      type: String,
      trim: true
    }]
  },
  location: {
    floor: {
      type: Number,
      required: [true, 'Andar é obrigatório'],
      min: [0, 'Andar deve ser não negativo']
    },
    wing: {
      type: String,
      trim: true
    },
    accessibility: {
      type: Boolean,
      default: false
    }
  },
  availability: {
    periods: [{
      type: String,
      enum: ['Matutino', 'Vespertino', 'Noturno', 'Integral']
    }],
    restrictions: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: ['available', 'maintenance', 'reserved', 'inactive'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Índices
roomSchema.index({ name: 1 });
roomSchema.index({ building: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ capacity: 1 });

// Método para verificar se a sala atende aos requisitos
roomSchema.methods.meetsRequirements = function(requirements) {
  if (requirements.needsProjector && !this.resources.hasProjector) return false;
  if (requirements.needsComputers && !this.resources.hasComputers) return false;
  if (requirements.needsAirConditioning && !this.resources.hasAirConditioning) return false;
  if (requirements.needsSmartboard && !this.resources.hasSmartboard) return false;
  if (requirements.needsAudioSystem && !this.resources.hasAudioSystem) return false;
  
  if (requirements.needsSpecialEquipment) {
    for (const equipment of requirements.needsSpecialEquipment) {
      if (!this.resources.specialEquipment.includes(equipment)) return false;
    }
  }
  
  if (requirements.minCapacity && this.capacity < requirements.minCapacity) return false;
  if (requirements.accessibility && !this.location.accessibility) return false;
  
  return true;
};

// Método estático para buscar salas disponíveis
roomSchema.statics.findAvailable = function(requirements = {}) {
  const query = { status: 'available' };
  
  if (requirements.type) {
    query.type = requirements.type;
  }
  
  if (requirements.minCapacity) {
    query.capacity = { $gte: requirements.minCapacity };
  }
  
  if (requirements.building) {
    query.building = requirements.building;
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Room', roomSchema);

