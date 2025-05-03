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

async function renderAddTurma(req, res) {
    res.render('addturma');
  }

async function getTurmas(req, res) {
    try {
      const turmas = await Turma.find();
      res.render('turmas', { turmas });
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
      return res.status(500).json({ error: err.message });
    }
  }

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

module.exports = {
    addTurma,
    deleteTurma,
    getTurmas,
    renderAddTurma,
    renderEditTurma,
    postEditTurma
    };