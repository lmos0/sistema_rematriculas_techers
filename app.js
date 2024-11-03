
require('dotenv').config()
const methodOverride = require('method-override')
const express = require('express')

const session = require('express-session');
const flash = require('connect-flash');

const bodyParser = require('body-parser')
const sequelize = require('./config/database')
const router = require('./routes/router')
const adminRouter = require = require('./routes/admin-router')


const app = express()



app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 600000 // 10 minutes in milliseconds
    }
}));

app.use(flash())

app.set('view engine', 'ejs')

app.use(methodOverride('_method'))

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())

app.use(router)
app.use('/admin', adminRouter)


sequelize.sync({force:false}).then(() => {
    console.log('Database connected')
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`)
    })
})
