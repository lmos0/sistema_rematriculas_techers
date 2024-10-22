const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const Turma = sequelize.define('Turma', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:{
        type: DataTypes.STRING,
        allowNull: false
    },
    curso:{
        type: DataTypes.STRING,
        allowNull: false
    },
    level:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    modalidade:{
        type: DataTypes.STRING,
        allowNull: false
    },
    dia_semana:{
        type: DataTypes.STRING,
        allowNull: false
    },
    horario:{
        type: DataTypes.STRING,
        allowNull: false
    },
    vagas:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = Turma