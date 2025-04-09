// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // funciona parecido com o unique do Sequelize
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true // se quiser manter createdAt e updatedAt
});

module.exports = mongoose.model('Admin', adminSchema);
