const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['coordinator', 'teacher', 'administrator'],
    default: 'teacher'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    specializations: [{
      type: String,
      trim: true
    }],
    preferences: {
      language: {
        type: String,
        default: 'pt-BR'
      },
      timezone: {
        type: String,
        default: 'America/Sao_Paulo'
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        system: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  permissions: [{
    type: String
  }],
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obter dados públicos do usuário
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

