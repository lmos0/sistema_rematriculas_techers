const Aluno = require('../model/aluno');

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

module.exports = {
    getAlunos,
    addAluno,
    deleteAlunos,
    renderEditAluno,
    postEditAluno
    };