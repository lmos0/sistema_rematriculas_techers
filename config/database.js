// config/database.js
require('dotenv').config();
const mongoose = require('mongoose');

const DATABASE_URL = process.env.DATABASE_URL_MONGO

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('❌ Erro ao conectar no MongoDB:', err);
});

db.once('open', () => {
  console.log('🟢 Conectado ao MongoDB com sucesso!');
});

module.exports = mongoose;
