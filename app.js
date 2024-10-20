const express = require('express')
const bodyParser = require('body-parser')
const Rematricula = require('./model/rematricula')
const sequelize = require('./config/database')
const router = require('./routes/router')


const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())

app.use(router)


sequelize.sync().then(() => {
    console.log('Database connected')
    app.listen(3000, () => {
        console.log('Server running')
    })
})
