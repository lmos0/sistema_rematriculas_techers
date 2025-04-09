// models/Aluno.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const alunoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  nome_aluno: {
    type: String,
    required: true,
    unique: true
  },
  data_de_nascimento: {
    type: Date,
    required: true
  },
  idade: {
    type: Number,
    required: true
  },
  nome_aluno_busca: {
    type: String,
    required: true,
    unique: true
  },
  nome_responsavel: {
    type: String,
    required: true
  },
  cpf_responsavel: {
    type: String,
    required: true
  },
  curso: {
    type: String,
    required: true
  },
  level_atual: {
    type: Number,
    required: true
  },
  level_2025: {
    type: Number,
    required: true
  },
  segundo_curso: {
    type: String,
    default: null
  },
  valor_2024: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  quantidade_parcelas_2024: {
    type: Number,
    required: true
  },
  valor_2025: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  taxa_reajuste: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  quantidade_parcelas: {
    type: Number,
    default: null
  },
  forma_de_pagamento: {
    type: String,
    default: null
  },
  aceite: {
    type: Boolean,
    required: true,
    default: false
  },
  data_aceite: {
    type: Date,
    default: null
  },
  modalidade: {
    type: String,
    default: null
  },
  modalidade_segundo_curso: {
    type: String,
    default: null
  },
  turma_2025: {
    type: String,
    default: null
  },
  turma_2025_segundo_curso: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Aluno', alunoSchema);