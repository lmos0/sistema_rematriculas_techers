require('dotenv').config()
const methodOverride = require('method-override')
const express = require('express')
const fs = require('fs')
const https = require('https')
const cors = require('cors')
const session = require('express-session')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// Rotas
const router = require('./routes/router')
const adminRouter = require('./routes/admin-router')

// Modelo do Admin usando Mongoose
const Admin = require('./model/admin')

const app = express()

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 6000000 // 10 minutos em milissegundos
    }
}))

app.use(flash())
app.set('view engine', 'ejs')

app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

// Uso das rotas
app.use(router)
app.use('/admin', adminRouter)

// Middleware para rota 404
app.use((req, res, next) => {
    res.status(404).render('404')
})

// Conectando ao MongoDB via Mongoose e inicializando o servidor
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log('Conectado ao MongoDB')

    // Verificar se o admin padrão já existe
    const existingAdmin = await Admin.findOne({ email: 'admin@techers.com' })

    if (!existingAdmin) {
        const admin = new Admin({
            email: process.env.EMAIL, 
            password: process.env.PASSWORD 
        })

        await admin.save()
        console.log('Admin padrão criado com sucesso.')
    } else {
        console.log('Admin padrão já existe.')
    }

    // Inicializa o servidor HTTP
    app.listen(process.env.PORT, () => {
        console.log(`HTTP Server rodando na porta ${process.env.PORT}`)
    })

})
.catch(err => console.error('Erro na conexão com MongoDB:', err))
