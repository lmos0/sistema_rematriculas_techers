const express = require('express')

const Aluno = require('../model/aluno')
const Turma = require('../model/turma')

async function getRematricular(req,res){
    const {id} = req.params

    if(!id){
        return res.status(400).json({error: "ID não informado"})
    }

    try{
    const rematricula = await Rematricula.findByPk(id)
    if(!rematricula){
        return res.status(404).send("Rematrícula não encontrada")
    }
    rematricula.fase_negociacao = 'Iniciada'
    await rematricula.save()
    return res.render('rematricula', {rematricula})
}
catch(err){
    console.error('Erro ao buscar rematrícula:', err)
    return res.status(500).json({error: err.message})
}
}

async function confirmarAceite(req, res) {
    const id = req.params.id;
    const {cpf_responsavel} = req.body
    const rematricula = await Rematricula.findByPk(id)

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
    const { mensalidade_2025, turma_2025, quantidade_parcelas, forma_de_pagamento } = req.body;

    try {
        const rematricula = await Rematricula.findByPk(id);

        if (!rematricula) {
            return res.status(404).send("Rematrícula não encontrada");
        }


        // Validate that mensalidade_2025 is a valid number (optional)
        if (!mensalidade_2025 || isNaN(mensalidade_2025)) {
            return res.status(400).send("Valor inválido para mensalidade 2025");
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
        rematricula.mensalidade_2025 = mensalidade_2025
        rematricula.turma_2025 = turma_2025
        rematricula.quantidade_parcelas = quantidade_parcelas
        rematricula.forma_de_pagamento = forma_de_pagamento
        
       
       
        await rematricula.save();

        // Redirect to success page
        res.redirect(`/rematricula/${id}/aceite`);
    } catch (error) {
        console.error("Error updating rematrícula:", error);
        res.status(500).send("Erro ao atualizar rematrícula");
    }
}

module.exports = {
    confirmarAceite,
    confirmarMensalidadeTurma,
    getRematricular
}