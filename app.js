
require('dotenv').config()
const methodOverride = require('method-override')
const express = require('express')
const fs = require('fs')
const https = require('https')
const cors = require('cors')

const Admin = require('./model/admin')

const session = require('express-session');
const flash = require('connect-flash');

const bodyParser = require('body-parser')
const sequelize = require('./config/database')
const router = require('./routes/router')
const adminRouter = require = require('./routes/admin-router')




const app = express()


const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;


app.use(session({
    secret: process.env.SESSION_SECRET,
    //secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 6000000 // 10 minutes in milliseconds
    }
}));

app.use(flash())
//app.set('views', process.env.VIEWS_DIRECTORY)
app.set('view engine', 'ejs')

app.use(methodOverride('_method'))

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())

app.use(cors())

app.use(router)
app.use('/admin', adminRouter)

app.use((req, res, next) => {
    res.status(404).render('404');
});

// console.log('Checking SSL files...');
// console.log('Key exists:', fs.existsSync(keyPath));
// console.log('Cert exists:', fs.existsSync(certPath));



// Sync database and start HTTP server
sequelize.sync({ force: true }).then(async() => {
    console.log('Database connected');

    const existingAdmin = await Admin.findOne({ where: { email: 'admin@techers.com' } });

    if (!existingAdmin) {
        await Admin.create({
            email: process.env.EMAIL,
            password: process.env.PASSWORD // de preferência, hasheado se for usado em produção!
        });
        console.log('Admin padrão criado com sucesso.');
    } else {
        console.log('Admin padrão já existe.');
    }

    
    
    // Start HTTP server
    app.listen(process.env.PORT, () => {
        console.log(`HTTP Server running on port ${process.env.PORT}`);
    });
    
});