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

// Adiciona um novo aluno
async function addAluno(req, res) {
  const {
    nome_aluno,
    nome_responsavel,
    cpf_responsavel,
    data_de_nascimento,
    curso,
    level_atual,
    valor_2024,
    quantidade_parcelas_2024,
    reajuste,
    segundo_curso
  } = req.body;

  req.body.nome_aluno = req.body.nome_aluno.trim();
  const nome_aluno_busca = removeAccents(req.body.nome_aluno).toLowerCase();
  const taxa_reajuste = (Number(reajuste) / 100) + 1;
  let level_2025 = Number(level_atual) + 1;
  let valor_2025 = (valor_2024 * taxa_reajuste) * quantidade_parcelas_2024;

  if (!nome_aluno || !nome_responsavel || !cpf_responsavel || !curso ||
      !level_atual || !valor_2024 || !data_de_nascimento || !quantidade_parcelas_2024) {
    req.flash('error', 'Todos os campos são obrigatórios');
    return res.status(400).redirect('/admin/alunos');
  }

  try {
    // Se o curso não for "Programação", força o nível para 2
    if (curso !== 'Programação') {
      level_2025 = 2;
    }
    // Verifica para o segundo curso
    let level_2025_segundo_curso;
    if (segundo_curso && segundo_curso !== 'Programação') {
      level_2025_segundo_curso = 2;
    }

    // Cria o documento do aluno
    const aluno = await Aluno.create({
      nome_aluno,
      nome_aluno_busca,
      nome_responsavel,
      cpf_responsavel,
      curso,
      level_atual,
      valor_2024,
      level_2025,
      valor_2025,
      quantidade_parcelas_2024,
      data_de_nascimento,
      taxa_reajuste: reajuste,
      segundo_curso,
      idade: calcularIdade(data_de_nascimento)
    });

    console.log('Aluno criado:', aluno);
    return res.status(201).redirect('/admin/alunos');
  } catch (err) {
    console.error('Erro ao adicionar aluno:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Adiciona uma nova turma
async function addTurma(req, res) {
  const { nome, curso, level, modalidade, dia_semana, horario, vagas, faixa_etaria } = req.body;

  if (!nome || !curso || !level || !modalidade || !dia_semana || !horario || !vagas || !faixa_etaria) {
    return res.status(400).json("Todos os campos são obrigatórios");
  }
  try {
    const turma = await Turma.create({ nome, curso, level, modalidade, dia_semana, horario, vagas, faixa_etaria });
    return res.status(201).redirect('/admin/turmas');
  } catch (err) {
    console.error('Erro ao adicionar turma:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Deleta uma turma pelo ID
async function deleteTurma(req, res) {
  const id = req.params.id;
  try {
    // Utiliza o método findByIdAndDelete do Mongoose
    const turma = await Turma.findByIdAndDelete(id);
    if (!turma) {
      return res.status(404).json("Turma não encontrada");
    }
    return res.status(200).redirect('/admin/turmas');
  } catch (err) {
    console.error('Erro ao deletar turma:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Deleta um aluno pelo ID
async function deleteAlunos(req, res) {
  const id = req.params.id;
  try {
    const aluno = await Aluno.findByIdAndDelete(id);
    if (!aluno) {
      return res.status(404).json("Aluno não encontrado");
    }
    return res.status(200).redirect('/admin/alunos');
  } catch (err) {
    console.error('Erro ao deletar aluno:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Renderiza a página de edição do aluno
async function renderEditAluno(req, res) {
  const id = req.params.id;
  try {
    const aluno = await Aluno.findById(id);
    if (!aluno) {
      return res.status(404).json("Aluno não encontrado");
    }
    return res.status(200).render('editaluno', { aluno, messages: req.flash('error') });
  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Renderiza a página de edição da turma
async function renderEditTurma(req, res) {
  const id = req.params.id;
  try {
    const turma = await Turma.findById(id);
    if (!turma) {
      return res.status(404).json("Turma não encontrada");
    }
    return res.status(200).render('editturma', { turma });
  } catch (err) {
    console.error('Erro ao buscar turma:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Processa a edição de uma turma
async function postEditTurma(req, res) {
  const id = req.params.id;
  const { nome, curso, level, modalidade, dia_semana, horario, vagas, faixa_etaria } = req.body;
  try {
    const turma = await Turma.findById(id);
    if (!turma) {
      return res.status(404).json("Turma não encontrada");
    }
    turma.nome = nome;
    turma.curso = curso;
    turma.level = level;
    turma.modalidade = modalidade;
    turma.dia_semana = dia_semana;
    turma.horario = horario;
    turma.vagas = vagas;
    turma.faixa_etaria = faixa_etaria;
    await turma.save();
    return res.status(200).redirect('/admin/turmas');
  } catch (err) {
    console.error('Erro ao editar turma:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Processa a edição de um aluno
async function postEditAluno(req, res) {
  const {
    nome_aluno,
    nome_responsavel,
    cpf_responsavel,
    data_de_nascimento,
    curso,
    level_atual,
    valor_2024,
    quantidade_parcelas_2024,
    reajuste,
    segundo_curso
  } = req.body;

  const nome_aluno_busca = removeAccents(nome_aluno).toLowerCase();
  const taxa_reajuste = (Number(reajuste) / 100) + 1;
  const level_2025 = curso !== 'Programação' ? 2 : Number(level_atual) + 1;
  const valor_2025 = (valor_2024 * taxa_reajuste) * quantidade_parcelas_2024;

  if (!nome_aluno || !nome_responsavel || !cpf_responsavel || !curso ||
      !level_atual || !valor_2024 || !data_de_nascimento || !quantidade_parcelas_2024) {
    req.flash('error', 'Todos os campos são obrigatórios');
    return res.status(400).redirect(`/admin/alunos/editar/${req.params.id}`);
  }

  try {
    // Busca o aluno pelo ID
    const alunoExistente = await Aluno.findById(req.params.id);
    if (!alunoExistente) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    alunoExistente.nome_aluno = nome_aluno;
    alunoExistente.nome_aluno_busca = nome_aluno_busca;
    alunoExistente.nome_responsavel = nome_responsavel;
    alunoExistente.curso = curso;
    alunoExistente.level_atual = level_atual;
    alunoExistente.valor_2024 = valor_2024;
    alunoExistente.level_2025 = level_2025;
    alunoExistente.valor_2025 = valor_2025;
    alunoExistente.quantidade_parcelas_2024 = quantidade_parcelas_2024;
    alunoExistente.data_de_nascimento = data_de_nascimento;
    alunoExistente.taxa_reajuste = reajuste;
    alunoExistente.segundo_curso = segundo_curso;
    alunoExistente.idade = calcularIdade(data_de_nascimento);

    await alunoExistente.save();

    console.log('Aluno atualizado:', alunoExistente);
    return res.status(200).redirect('/admin/alunos');
  } catch (err) {
    console.error('Erro ao editar aluno:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Obtém todas as turmas
async function getTurmas(req, res) {
  try {
    const turmas = await Turma.find();
    res.render('turmas', { turmas });
  } catch (err) {
    console.error('Erro ao buscar turmas:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Obtém os alunos com paginação
async function getAlunos(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await Aluno.countDocuments({});
    const alunos = await Aluno.find({})
      .sort({ nome_aluno: 1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(count / limit);

    res.render('alunos', {
      alunos,
      currentPage: page,
      totalPages,
      totalAlunos: count
    });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).render('error', { message: 'Erro ao carregar a lista de alunos.' });
  }
}

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
async function renderAddTurma(req, res) {
  res.render('addturma');
}

module.exports = {
  addAluno,
  addTurma,
  deleteTurma,
  deleteAlunos,
  getRematriculaById,
  getAlunos,
  getTurmas,
  growTechers,
  loginAdmin,
  postEditTurma,
  postEditAluno,
  registerAdmin,
  renderAddTurma,
  renderEditAluno,
  renderMatriculasConcluidas,
  renderEditTurma,
  renderAdmin
};
