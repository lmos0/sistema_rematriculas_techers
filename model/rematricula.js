const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')
const {v4: uuidv4} = require('uuid')

const Rematricula = sequelize.define('Rematricula', {
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    nome_aluno:{
        type: DataTypes.STRING,
        allowNull: false
    },
    fase_negociacao:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    nome_responsavel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf_responsavel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    turma_atual:{
        type: DataTypes.STRING,
        allowNull: false
    },
    modalidade:{
        type: DataTypes.STRING,
        allowNull: false
    },
    turma_2025:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    mensalidade_2024:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    mensalidade_2025:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: true,
        defaultValue: null
    },
    quantidade_parcelas:{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    forma_de_pagamento:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    aceite:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    data_aceite:{
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    pagamento_2025:{
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
})

module.exports = Rematricula