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
        const idadeDoAluno = aluno.idade
    
    const turmas_possiveis = await Turma.findAll({
        where: {
          curso: cursoDoAluno,
          level: levelDoAluno,
            faixa_etaria : {
              [Op.between]: [idadeDoAluno -2, idadeDoAluno +2]
            }
          
        }
      })

    
    //   console.log('testando', aluno.curso, aluno.level_2025)
    //   console.log('turmas possíveis', turmas_possiveis)
    //   console.log('aluno.curso', aluno.curso)

    if(!aluno){
        return res.status(404).send("Rematrícula não encontrada")
    }
    await aluno.save()
    return res.render('rematricula_modalidade', {aluno , turmas_possiveis})
}
catch(err){
    console.error('Erro ao buscar rematrícula:', err)
    return res.status(500).json({error: err.message})
}
}

async function confirmarAceite(req, res) {
    const id = req.params.id;
    const {cpf_responsavel} = req.body
    const aluno = await Aluno.findByPk(id)

    if (!id || !cpf_responsavel) {
        return res.status(400).send("ID e CPF do responsável são obrigatórios")
    }

    //const transaction = await sequelize.transaction()

    try {
        const aluno = await Aluno.findByPk(id)
        const turma = await Turma.findOne({where: {id: aluno.turma_2025}})

    if (!aluno) {
        //await transaction.rollback()
        return res.status(404).json({error: "Rematrícula não encontrada"})  
    }

    if(aluno.cpf_responsavel !== cpf_responsavel){
       // await transaction.rollback()
        return res.status(400).json({error: "CPF do responsável não confere"})
    }

    
    aluno.aceite = true
    aluno.data_aceite = new Date()
    await aluno.save()
   // await transaction.commit()
    console.log(`Rematrícula ${id} confirmada com sucesso`)

    return res.status(201).redirect('/sucesso')
}
catch(err){
    //await transaction.rollback()
    console.error(`Erro ao confirmar aceite da rematrícula ${id}: ${err.message}`);
    return res.status(500).json({error: err.message})
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
    
    const turmas_possiveis = await Turma.findAll({
        where: {
          curso: cursoDoAluno,
          level: levelDoAluno,
          [Op.or]: [
            { modalidade: modalidadeDoAluno },
            { modalidade: 'Híbrida' }
        ]
          
        }
      })
     
      return res.render('rematricula_turma', {aluno, turmas_possiveis})
    }
    catch(err){
        console.error('Erro ao buscar rematrícula:', err)
        return res.status(500).json({error: err.message})
    }

}

async function confirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    const {turma_2025, quantidade_parcelas, forma_de_pagamento } = req.body;

    try {
        const aluno = await Aluno.findByPk(id)
        const novoLevel = aluno.level_2025 + 1
        //const valor_2025 = aluno.valor_2024 * 1.04
        const turmas_possiveis = await Turma.findAll({
            where: {
              curso: aluno.curso,
              level: novoLevel,
             
            }
          });

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
        aluno.quantidade_parcelas = quantidade_parcelas
        aluno.forma_de_pagamento = forma_de_pagamento
        
       
       
        await aluno.save();

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

    if(!id){
        return res.status(400).json({error: "ID não informado"})
    }

    try{
    const aluno = await Aluno.findByPk(id)

    aluno.modalidade = modalidade_2025

    if(!aluno){
        return res.status(404).send("Rematrícula não encontrada")
    }
    await aluno.save()
    console.log(aluno.modalidade)
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