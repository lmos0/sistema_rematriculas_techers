// models/Turma.js
const mongoose = require('mongoose');

const turmaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  curso: {
    type: String,
    required: true,
    enum: ['Programação', 'Design Gráfico', 'Robótica', 'Animação Digital']
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
    required: true,
    enum: ['presencial', 'online', 'Híbrida']
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
    required: true,
    min: 0
  },
  alunos: [
    {
      type: String, // UUID do aluno
      ref: 'Aluno'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Turma', turmaSchema);
