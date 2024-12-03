
require('dotenv').config()
const methodOverride = require('method-override')
const express = require('express')
const fs = require('fs')
const https = require('https')
const cors = require('cors')

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

console.log('Checking SSL files...');
console.log('Key exists:', fs.existsSync(keyPath));
console.log('Cert exists:', fs.existsSync(certPath));



// Sync database and start HTTP server
sequelize.sync({ force: false }).then(() => {
    console.log('Database connected');
    
    // Start HTTP server
    app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log(`HTTP Server running on port ${process.env.PORT}`);
    });
    
    // Set up HTTPS server
    try {
        const key = fs.readFileSync(process.env.SSL_KEY_PATH);
        const cert = fs.readFileSync(process.env.SSL_CERT_PATH);
        
        https.createServer({ key, cert }, app).listen(4040, () => {
            console.log('HTTPS Server running on port 4040');
        });
    } catch (error) {
        console.error('Error starting HTTPS server:', error);
    }
});