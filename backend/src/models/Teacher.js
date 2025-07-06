const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome do professor é obrigatório.'],
    unique: true,
    trim: true,
  },
  // No futuro, podemos adicionar mais campos como 'email', 'codigoSuap', etc.
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;