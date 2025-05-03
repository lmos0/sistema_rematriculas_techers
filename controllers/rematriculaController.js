const Aluno = require('../model/aluno');
const Turma = require('../model/turma');
const mongoose = require('mongoose');

async function buscarAluno(req, res) {
    const { nome_aluno } = req.body;
    // Normaliza o nome para busca
    const nome_aluno_busca = removeAccents(nome_aluno).toLowerCase().trim();

    if (!nome_aluno) {
        req.flash('error', 'Nome do aluno é obrigatório');
        return res.redirect('/');
    }

    try {
        // Mongoose: findOne sem "where:"
        const aluno = await Aluno.findOne({ nome_aluno_busca });
        if (!aluno) {
            req.flash('error', `Aluno(a) ${nome_aluno} não encontrado(a). Verifique a grafia e tente novamente`);
            return res.redirect('/');
        }
        return res.status(200).redirect(`/rematricula/${aluno._id}`);
    } catch (error) {
        console.error("Erro ao buscar aluno: ", error);
        return res.status(500).send("Erro ao buscar aluno");
    }
}

async function renderBuscarAluno(req, res) {
    return res.render('buscar_aluno', { messages: req.flash('error') });
}


async function getRematricular(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "ID não informado" });
    }

    try {
        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).send("Rematrícula não encontrada");
        }

        // Recalcula a idade se necessário
        aluno.idade = calcularIdade(aluno.data_de_nascimento);

        const cursoDoAluno = aluno.curso;
        const levelDoAluno = aluno.level_2025;
        const segundoCursoDoAluno = aluno.segundo_curso;
        let idadeDoAluno;

        switch (true) {
            case (aluno.idade < 8):
                idadeDoAluno = "kids";
                break;
            case (aluno.idade >= 8 && aluno.idade <= 10):
                idadeDoAluno = "jr1";
                break;
            case (aluno.idade > 10 && aluno.idade <= 12):
                idadeDoAluno = "jr2";
                break;
            case (aluno.idade > 12 && aluno.idade <= 17):
                idadeDoAluno = "teens";
                break;
            case (aluno.idade > 17):
                idadeDoAluno = "adulto";
                break;
            default:
                idadeDoAluno = null;
        }

        // Usando Mongoose, find() ao invés de findAll() e sem where:
        const turmas_possiveis = await Turma.find({
            curso: cursoDoAluno,
            level: levelDoAluno,
            faixa_etaria: idadeDoAluno
        });

        const turmas_possiveis_segundo_curso = await Turma.find({
            curso: segundoCursoDoAluno,
            level: 2,
            faixa_etaria: idadeDoAluno
        });

        console.log('testando', aluno.curso, aluno.level_2025);
        console.log('turmas possíveis', turmas_possiveis);
        console.log('aluno.curso', aluno.curso);

        // Salva possíveis alterações no aluno (como a idade recalculada)
        await aluno.save();
        return res.render('rematricula_modalidade', { aluno, turmas_possiveis, turmas_possiveis_segundo_curso });
    } catch (err) {
        console.error('Erro ao buscar rematrícula:', err);
        return res.status(500).json({ error: err.message });
    }
}

async function confirmarAceite(req, res) {
    const { id } = req.params;
    const { cpf_responsavel } = req.body;

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
        if (!id || !cpf_responsavel) {
            req.flash('error', 'Dados incompletos para confirmação');
            return res.status(400).redirect(`/rematricula/${id}/aceite`);
        }

        // Todas as operações dentro da transação!
        const aluno = await Aluno.findById(id).session(dbSession);
        if (!aluno) {
            await dbSession.abortTransaction();
            return res.status(404).json({ error: "Rematrícula não encontrada" });
        }

        if (aluno.cpf_responsavel !== cpf_responsavel) {
            req.flash('error', 'CPF do responsável não confere');
            await dbSession.abortTransaction();
            return res.status(400).redirect(`/rematricula/${id}/aceite`);
        }

        if (aluno.aceite) {
            req.flash('info', 'Matrícula já foi confirmada anteriormente');
            await dbSession.abortTransaction();
            return res.redirect('/sucesso');
        }

        const turmaIds = [aluno.turma_2025, aluno.turma_2025_segundo_curso].filter(Boolean);

        if (turmaIds.length === 0) {
            await dbSession.abortTransaction();
            return res.status(404).json({ error: "Nenhuma turma selecionada" });
        }

        for (const turmaId of turmaIds) {
            const turma = await Turma.findById(turmaId).session(dbSession);
            if (!turma) {
                req.flash('error', `Turma não encontrada`);
                await dbSession.abortTransaction();
                return res.status(404).redirect(`/rematricula/${id}/turma`);
            }

            if (turma.vagas <= 0) {
                req.flash('error', `Turma ${turma.nome} está cheia`);
                await dbSession.abortTransaction();
                return res.status(400).redirect(`/rematricula/${id}/turma`);
            }

            // Evita duplicidade
            if (!aluno.turmas.map(String).includes(String(turma._id))) {
                aluno.turmas.push(turma._id);
            }
            if (!turma.alunos.map(String).includes(String(aluno._id))) {
                turma.alunos.push(aluno._id);
                turma.vagas -= 1;
            }
            await turma.save({ session: dbSession });
        }

        aluno.aceite = true;
        aluno.data_aceite = new Date();
        await aluno.save({ session: dbSession });

        await dbSession.commitTransaction();
        dbSession.endSession();

        console.log(`Rematrícula ${id} confirmada com sucesso`);
        return res.status(201).redirect('/sucesso');
    } catch (err) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        console.error(`Erro ao confirmar aceite da rematrícula ${id}: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
}

async function renderConfirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    try {
        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).send("Rematrícula não encontrada");
        }

        const cursoDoAluno = aluno.curso;
        const levelDoAluno = aluno.level_2025;
        const modalidadeDoAluno = aluno.modalidade;
        const segundoCursoDoAluno = aluno.segundo_curso;
        const modalidadeDoAlunoSegundoCurso = aluno.modalidade_segundo_curso;

        let idadeDoAluno;
        switch (true) {
            case (aluno.idade < 8):
                idadeDoAluno = "kids";
                break;
            case (aluno.idade >= 7 && aluno.idade <= 11):
                idadeDoAluno = "jr1";
                break;
            case (aluno.idade > 10 && aluno.idade <= 13):
                idadeDoAluno = "jr2";
                break;
            case (aluno.idade > 11 && aluno.idade <= 17):
                idadeDoAluno = "teens";
                break;
            case (aluno.idade > 17):
                idadeDoAluno = "adulto";
                break;
            default:
                idadeDoAluno = null;
        }

        // Usando Mongoose: substituir Op.or por $or
        const turmas_possiveis = await Turma.find({
            curso: cursoDoAluno,
            level: levelDoAluno,
            $or: [
                { modalidade: modalidadeDoAluno },
                { modalidade: 'Híbrida' }
            ],
            faixa_etaria: idadeDoAluno
        });

        const turmas_possiveis_segundo_curso = await Turma.find({
            curso: segundoCursoDoAluno,
            level: 2,
            $or: [
                { modalidade: modalidadeDoAlunoSegundoCurso },
                { modalidade: 'Híbrida' }
            ],
            faixa_etaria: idadeDoAluno
        });

        console.log('turmas possiveis', turmas_possiveis);
        console.log('turmas possiveis segundo curso', turmas_possiveis_segundo_curso);
        return res.render('rematricula_turma', { aluno, turmas_possiveis, turmas_possiveis_segundo_curso });
    } catch (err) {
        console.error('Erro ao buscar rematrícula:', err);
        return res.status(500).json({ error: err.message });
    }
}

async function confirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    const { turma_2025, quantidade_parcelas, forma_de_pagamento, turma_2025_segundo_curso } = req.body;

    try {
        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).send("Rematrícula não encontrada");
        }

        if (!turma_2025) {
            return res.status(400).send("Turma 2025 inválida");
        }
        if (!quantidade_parcelas || isNaN(quantidade_parcelas)) {
            return res.status(400).send("Valor inválido para quantidade de parcelas");
        }
        if (!forma_de_pagamento) {
            return res.status(400).send("Forma de pagamento inválida");
        }

        // Atualiza os campos da rematrícula
        aluno.turma_2025 = turma_2025;
        aluno.turma_2025_segundo_curso = turma_2025_segundo_curso;
        aluno.quantidade_parcelas = quantidade_parcelas;
        aluno.forma_de_pagamento = forma_de_pagamento;
        
        await aluno.save();

        // Salva as informações de turma na sessão
        req.session.turma_2025 = turma_2025;
        req.session.turma_2025_segundo_curso = turma_2025_segundo_curso;
        console.log('Sessão:', req.session.turma_2025, req.session.turma_2025_segundo_curso);

        return res.redirect(`/rematricula/${id}/aceite`);
    } catch (error) {
        console.error("Error updating rematrícula:", error);
        res.status(500).send("Erro ao atualizar rematrícula");
    }
}

async function rematriculaSelectModalidade(req, res) {
    const { id } = req.params;
    const modalidade_2025 = req.body.modalidade;
    const modalidade_segundo_curso = req.body.modalidade_segundo_curso;

    if (!id) {
        return res.status(400).json({ error: "ID não informado" });
    }

    try {
        const aluno = await Aluno.findById(id);
        if (!aluno) {
            return res.status(404).send("Rematrícula não encontrada");
        }

        aluno.modalidade = modalidade_2025;
        aluno.modalidade_segundo_curso = modalidade_segundo_curso;
        await aluno.save();

        console.log('modalidade', aluno.modalidade);
        console.log('modalidade do segundo curso', aluno.modalidade_segundo_curso);
        console.log('corpo da req', req.body);
        return res.redirect(`/rematricula/${id}/turma`);
    } catch (err) {
        console.error('Erro ao atualizar modalidade:', err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    buscarAluno,
    renderBuscarAluno,
    getRematricular,
    confirmarAceite,
    renderConfirmarMensalidadeTurma,
    confirmarMensalidadeTurma,
    rematriculaSelectModalidade
}