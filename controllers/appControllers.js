const express = require('express')

const Aluno = require('../model/aluno')
const Turma = require('../model/turma')


async function buscarAluno(req, res) {
    const {nome_aluno} = req.body

    if (!nome_aluno) {
        return res.status(400).send("Nome do aluno é obrigatório")
    }

    try {
        const aluno = await Aluno.findOne({where: {nome_aluno: nome_aluno}})
        if (!aluno) {
            return res.status(404).send("Aluno não encontrado")
        }
        return res.status(200).json(aluno)
    } catch (error) {
        console.error("Erro ao buscar aluno:", error)
        return res.status(500).send("Erro ao buscar aluno")
    }
}

async function getRematricular(req,res){
    const {id} = req.params

    if(!id){
        return res.status(400).json({error: "ID não informado"})
    }

    try{
    const aluno = await Aluno.findByPk(id)
    const turmas_possiveis = await Turma.findAll({
        where: {
          curso: aluno.curso,
          level: aluno.level_2025,
          //modalidade: modalidade
        }
      });

    if(!aluno){
        return res.status(404).send("Rematrícula não encontrada")
    }
    await aluno.save()
    return res.render('rematricula', {aluno , turmas_possiveis})
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
        const rematricula = await Rematricula.findByPk(id)

    if (!rematricula) {
        //await transaction.rollback()
        return res.status(404).json({error: "Rematrícula não encontrada"})  
    }

    if(rematricula.cpf_responsavel !== cpf_responsavel){
       // await transaction.rollback()
        return res.status(400).json({error: "CPF do responsável não confere"})
    }

    
    rematricula.aceite = true
    rematricula.data_aceite = new Date()
    await rematricula.save()
   // await transaction.commit()
    console.log(`Rematrícula ${id} confirmada com sucesso`)

    return res.status(201).redirect('/sucesso')
}
catch(err){
    await transaction.rollback()
    console.error(`Erro ao confirmar aceite da rematrícula ${id}: ${error.message}`);
    return res.status(500).json({error: err.message})
}
}

async function confirmarMensalidadeTurma(req, res) {
    const id = req.params.id;
    const {turma_2025, quantidade_parcelas, forma_de_pagamento, modalidade } = req.body;

    try {
        const aluno = await Aluno.findByPk(id)
        const novoLevel = aluno.level_2025 + 1
        const valor_2025 = aluno.valor_2024 * 1.04
        const turmas_possiveis = await Turma.findAll({
            where: {
              curso: aluno.curso,
              level: novoLevel,
              modalidade: modalidade
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
        aluno.valor_2025 = valor_2025
        aluno.turma_2025 = turma_2025
        aluno.modade = modalidade
        aluno.quantidade_parcelas = quantidade_parcelas
        aluno.forma_de_pagamento = forma_de_pagamento
        
       
       
        await rematricula.save();

        // Redirect to success page
        res.redirect(`/rematricula/${id}/aceite`);
    } catch (error) {
        console.error("Error updating rematrícula:", error);
        res.status(500).send("Erro ao atualizar rematrícula");
    }
}

module.exports = {
    buscarAluno,
    confirmarAceite,
    confirmarMensalidadeTurma,
    getRematricular
}