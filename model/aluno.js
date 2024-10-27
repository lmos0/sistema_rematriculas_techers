const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')
const {v4:uuidv4} = require('uuid')

const Aluno = sequelize.define('Aluno', {
    id:{
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    nome_aluno:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },
    nome_responsavel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf_responsavel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    curso:{
        type: DataTypes.STRING,
        allowNull: false
    },
    level_atual:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    level_2025:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    valor_2024:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    valor_2025:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
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
    modalidade:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    turma_2025:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    
})

module.exports = Aluno