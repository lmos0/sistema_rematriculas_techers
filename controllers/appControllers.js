const { Op } = require('sequelize');
const Aluno = require('../model/aluno')
const Turma = require('../model/turma')

const session = require('express-session')
const flash = require('connect-flash')


function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function buscarAluno(req, res) {
    const {nome_aluno} = req.body
    const nome_aluno_busca = removeAccents(req.body.nome_aluno).toLowerCase().trim()

    if (!nome_aluno) {
        
        req.flash('error', 'Nome do aluno é obrigatório')
        return res.redirect('/')
    }

    try {
       
        const aluno = await Aluno.findOne({where: {nome_aluno_busca: nome_aluno_busca}})
        if (!aluno) {
            req.flash('error', `Aluno ${req.body.nome_aluno} não encontrado. Verifique a grafia e tente novamente`)
            return res.redirect('/')
            
        }
        return res.status(200).redirect(`/rematricula/${aluno.id}`)
    } catch (error) {
        console.error("Erro ao buscar aluno: ", error)
        return res.status(500).send("Erro ao buscar aluno")
    }
}

async function renderBuscarAluno(req, res) {
    
   return res.render('buscar_aluno', {messages: req.flash('error')})
}

async function getRematricular(req,res){
    const {id} = req.params

    if(!id){
        return res.status(400).json({error: "ID não informado"})
    }

    try{
    const aluno = await Aluno.findByPk(id)

    const cursoDoAluno = aluno.curso
    const levelDoAluno = aluno.level_2025
    const segundoCursoDoAluno = aluno.segundo_curso
    let idadeDoAluno

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
    const turmas_possiveis = await Turma.findAll({
        where: {
          curso: cursoDoAluno,
          level: levelDoAluno,
          faixa_etaria: idadeDoAluno
        }
      })

      const turmas_possiveis_segundo_curso = await Turma.findAll({
        where: {
            curso: segundoCursoDoAluno,
            level: 2,
            faixa_etaria: idadeDoAluno
        }
    })

     console.log('testando', aluno.curso, aluno.level_2025)
     console.log('turmas possíveis', turmas_possiveis)
     console.log('aluno.curso', aluno.curso)

    if(!aluno){
        return res.status(404).send("Rematrícula não encontrada")
    }
    await aluno.save()
    return res.render('rematricula_modalidade', {aluno , turmas_possiveis, turmas_possiveis_segundo_curso})
}
catch(err){
    console.error('Erro ao buscar rematrícula:', err)
    return res.status(500).json({error: err.message})
}
}

async function confirmarAceite(req, res) {
    const id = req.params.id;
    console.log(`Confirmar aceite da rematrícula ${id}`);
    console.log('Body da requisição', req.body);
    console.log('Session', req.session);
    try {
        
        const { cpf_responsavel } = req.body;

        if (!id || !cpf_responsavel) {
            return res.status(400).send("ID e CPF do responsável são obrigatórios");
        }

        const aluno = await Aluno.findByPk(id);
        
        if (!aluno) {
            return res.status(404).json({ error: "Rematrícula não encontrada" });
        }

        if (aluno.cpf_responsavel !== cpf_responsavel) {
            req.flash('error', 'CPF do responsável não confere')
            return res.status(400).redirect(`/rematricula/${id}/aceite`);
        }

        const turma_2025 = req.session.turma_2025;
        console.log('req.session turma_2025:', turma_2025)
       const turma_segundo_curso = req.session.turma_2025_segundo_curso;

       let turma_segundo = null;

        const turma = await Turma.findOne({ where: { id: turma_2025 } });
        if (turma_segundo_curso) {

       const turma_segundo = await Turma.findOne({ where: { id: turma_segundo_curso } });
        console.log('variável turma:', turma)
        console.log('variável turma_segundo:', turma_segundo)
        } 
        if (!turma && !turma_segundo) {
            return res.status(404).json({ error: "Turma não encontrada" });
        }

        aluno.aceite = true;
        turma.vagas = turma.vagas - 1;
        
        aluno.data_aceite = new Date();

        await aluno.save();
        await turma.save();
        if (turma_segundo){
            await turma_segundo.save();
            turma_segundo.vagas = turma_segundo.vagas - 1;
        }
        

        console.log(`Rematrícula ${id} confirmada com sucesso`);

        return res.status(201).redirect('/sucesso');
    } catch (err) {
        console.error(`Erro ao confirmar aceite da rematrícula ${id}: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
}

async function renderConfirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    const aluno = await Aluno.findByPk(id)

    if (!aluno) {
        return res.status(404).send("Rematrícula não encontrada");
    }

    try{
    const aluno = await Aluno.findByPk(id)

    const cursoDoAluno = aluno.curso
    const levelDoAluno = aluno.level_2025
    const modalidadeDoAluno = aluno.modalidade
    const segundoCursoDoAluno = aluno.segundo_curso
    const modalidadeDoAlunoSegundoCurso = aluno.modalidade_segundo_curso

    let idadeDoAluno

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
    
    const turmas_possiveis = await Turma.findAll({
        where: {
          curso: cursoDoAluno,
          level: levelDoAluno,
          [Op.or]: [
            { modalidade: modalidadeDoAluno },
            { modalidade: 'Híbrida' }
        ],
            faixa_etaria: idadeDoAluno
          
        }
      })

      turmas_possiveis_segundo_curso = await Turma.findAll({
        where: {
            curso: segundoCursoDoAluno,
            level: 2,
            [Op.or]: [
                { modalidade: modalidadeDoAlunoSegundoCurso },
                { modalidade: 'Híbrida' }
            ],
            faixa_etaria: idadeDoAluno
        }
    })
    console.log(turmas_possiveis)
     console.log(turmas_possiveis_segundo_curso)
      return res.render('rematricula_turma', {aluno, turmas_possiveis, turmas_possiveis_segundo_curso})
    }
    catch(err){
        console.error('Erro ao buscar rematrícula:', err)
        return res.status(500).json({error: err.message})
    }

}

async function confirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    const {turma_2025, quantidade_parcelas, forma_de_pagamento, turma_2025_segundo_curso } = req.body;
    

    try {
        const aluno = await Aluno.findByPk(id)
        const novoLevel = aluno.level_2025 + 1
        // const turmas_possiveis = await Turma.findAll({
        //     where: {
        //       curso: aluno.curso,
        //       level: novoLevel,
             
        //     }
        //   });
        //   const turmas_possiveis_segundo_curso = await Turma.findAll({
        //     where: {
        //         curso: aluno.segundo_curso,
        //         level: 2,
        //         faixa_etaria: idadeDoAluno
        //     }
        // })

        if (!aluno) {
            return res.status(404).send("Rematrícula não encontrada");
        }
        

        if (!turma_2025) {
            return res.status(400).send("Turma 2025 inválida")
        }
        if (!quantidade_parcelas || isNaN(quantidade_parcelas)) {
            return res.status(400).send("Valor inválido para quantidade de parcelas");
        }
        if (!forma_de_pagamento) {
            return res.status(400).send("Forma de pagamento inválida");
        }
        // Update the fields
        //aluno.valor_2025 = valor_2025
        aluno.turma_2025 = turma_2025
        aluno.turma_2025_segundo_curso = turma_2025_segundo_curso
        aluno.quantidade_parcelas = quantidade_parcelas
        aluno.forma_de_pagamento = forma_de_pagamento

        
       
       
        await aluno.save()

        req.session.turma_2025 = turma_2025
        req.session.turma_2025_segundo_curso = turma_2025_segundo_curso
        console.log('mostra essa sessão ai:', req.session.turma_2025, req.session.turma_2025_segundo_curso);

        // Redirect to success page
        res.redirect(`/rematricula/${id}/aceite`);
    } catch (error) {
        console.error("Error updating rematrícula:", error);
        res.status(500).send("Erro ao atualizar rematrícula");
    }
}

async function rematriculaSelectModalidade(req,res){
    const {id} = req.params
    const modalidade_2025 = req.body.modalidade
    const modalidade_segundo_curso = req.body.modalidade_segundo_curso

    if(!id){
        return res.status(400).json({error: "ID não informado"})
    }

    try{
    const aluno = await Aluno.findByPk(id)

    aluno.modalidade = modalidade_2025
    aluno.modalidade_segundo_curso = modalidade_segundo_curso

    if(!aluno){
        return res.status(404).send("Rematrícula não encontrada")
    }
    await aluno.save()
    console.log(aluno.modalidade)
    console.log(aluno.modalidade_segundo_curso)
    console.log(req.body)
    return res.redirect(`/rematricula/${id}/turma`)
}
catch(err){
    console.error('Erro ao buscar rematrícula:', err)
    return res.status(500).json({error: err.message})
}
}



module.exports = {
    buscarAluno,
    confirmarAceite,
    confirmarMensalidadeTurma,
    getRematricular,
    renderBuscarAluno,
    rematriculaSelectModalidade,
    renderConfirmarMensalidadeTurma
}