// models/Turma.js
const mongoose = require('mongoose');

const turmaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  curso: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  },
  faixa_etaria: {
    type: String,
    required: true
  },
  modalidade: {
    type: String,
    required: true
  },
  dia_semana: {
    type: String,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  vagas: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Turma', turmaSchema);
