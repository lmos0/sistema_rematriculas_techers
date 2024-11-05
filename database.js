require('dotenv').config()
const {Sequelize} = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    //storage: './database/database.sqlite',
    storage: process.env.DATABASE_URL,

    logging: false
})

module.exports = sequelize