const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
    res.send('Hello HTTPS!');
});

try {
    const key = fs.readFileSync('./SSL/server.key');
    const cert = fs.readFileSync('./SSL/server.cert');
    https.createServer({ key, cert }, app).listen(4040, () => {
        console.log('HTTPS Server running on port 4040');
    });
} catch (error) {
    console.error('Error starting HTTPS server:', error);
}


SSL_KEY_PATH = './SSL/code.key'
SSL_CERT_PATH = './SSL/code.crt'