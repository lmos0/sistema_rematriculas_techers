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
    required: true
  },
  nome_aluno_busca: {
    type: String,
    required: true
  },
  data_de_nascimento: {
    type: Date,
    required: true
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
  segundo_curso: {
    type: String,
    default: null
  },
  turmas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turma'
    }
  ],
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
    type: Number
  },
  forma_de_pagamento: {
    type: String
  },
  aceite: {
    type: Boolean,
    required: true,
    default: false
  },
  data_aceite: {
    type: Date
  },
  modalidade: {
    type: String
  },
  modalidade_segundo_curso: {
    type: String
  }
}, {
  timestamps: true
});

alunoSchema.virtual('idade').get(function () {

  if (!this.data_de_nascimento){
    return null
  }

  try {
    const hoje = new Date()
    const nascimento = new Date(this.data_de_nascimento)

    if (isNaN(nascimento.getTime())){
      console.warn('Data de nascimento inválida para o aluno:', this._id)
      return null
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear()

    const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
    const aniversarioJaOcorreu = hoje >= aniversarioEsteAno;

    if (!aniversarioJaOcorreu){
      idade--
    }

    return idade
    
  } catch (error) {
    console.error('Erro ao calcular idade do aluno:', error);
    return null;
  }

})

alunoSchema.pre('save', function(next) {
  this.nome_aluno_busca = this.nome_aluno.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  next()
})

module.exports = mongoose.model('Aluno', alunoSchema);