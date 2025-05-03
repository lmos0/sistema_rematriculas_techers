const bcrypt = require('bcrypt');
const session = require('express-session');

const Admin = require('../model/admin');
const Aluno = require('../model/aluno');
const Turma = require('../model/turma');

// Função auxiliar para remover acentos
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const calcularIdade = (dataNascimento) => {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

// Obtém uma rematrícula por ID e renderiza a página de aceite
async function getRematriculaById(req, res) {
  const id = req.params.id;

  if (!id) {
    throw new Error('ID não fornecido');
  }

  const rematricula = await Aluno.findById(id);
  if (!rematricula) {
    return res.status(404).send("Rematrícula não encontrada");
  }

  // Busca turma correspondente ao curso e level_2025 do aluno
  const turma = await Turma.findOne({ curso: rematricula.curso, level: rematricula.level_2025 });
  // Busca turma para o segundo curso, se aplicável
  const turmaSegundoCurso = await Turma.findOne({ curso: rematricula.segundo_curso });

  if (!rematricula.turma_2025 || !rematricula.valor_2025 || !rematricula.quantidade_parcelas || !rematricula.forma_de_pagamento) {
    return res.status(400).send("Rematrícula não está completa");
  }

  try {
    if (rematricula.aceite === true) {
      return res.status(208).render('aceiteconfirmado', { rematricula });
    }

    res.render('aceite', { rematricula, turma, turmaSegundoCurso, messages: req.flash('error') });
  } catch (err) {
    console.error('Erro ao buscar rematrícula:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Renderiza os alunos com rematrículas concluídas
async function renderMatriculasConcluidas(req, res) {
  try {
    const rematriculas = await Aluno.find({ aceite: true });
    const turmas = await Turma.find();

    const turmaMap = {};
    turmas.forEach(turma => {
      turmaMap[turma._id] = turma.nome;
    });
    rematriculas.forEach(aluno => {
      aluno.turmaNome = turmaMap[aluno.turma_2025] || 'Turma não encontrada';
    });

    res.render('concluidos', { rematriculas, turmas });
  } catch (err) {
    console.error('Erro ao renderizar rematrículas concluídas:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Renderiza a página de "growTechers"
async function growTechers(req, res) {
  try {
    const rematriculados = await Aluno.find({ aceite: true });
    const total = rematriculados.length * 50;
    res.render('grow', { total });
  } catch (err) {
    console.error('Erro ao renderizar growTechers:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Registra um admin
async function registerAdmin(req, res) {
  const { email, password } = req.body;
  try {
    const admin = await Admin.create({ email, password });
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Renderiza a página de login do admin
async function renderAdmin(req, res) {
  if (req.session.admin) {
    return res.redirect('/admin/alunos');
  }
  res.render('login', { messages: req.flash('error') });
}

// Realiza o login do admin
async function loginAdmin(req, res) {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      req.flash('error', 'Credenciais inválidas');
      return res.status(404).redirect('/admin');
    }
    req.session.admin = admin;
    res.status(200).redirect('/admin/alunos');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Renderiza a página para adicionar nova turma


module.exports = {
  getRematriculaById,
  growTechers,
  loginAdmin,
  registerAdmin,
  renderMatriculasConcluidas,
  renderAdmin
};
