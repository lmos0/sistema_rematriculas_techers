const express = require('express')
const Rematricula = require('../model/rematricula')
const Admin = require('../model/admin')

async function addAluno(req,res){
    const {nome_aluno, nome_responsavel, cpf_responsavel, fase_negociacao, turma_atual, modalidade, mensalidade_2024} = req.body
try{
    const rematricula = await Rematricula.create({nome_aluno, nome_responsavel, cpf_responsavel, turma_atual, modalidade, mensalidade_2024})
    res.status(201).json(rematricula)
}
catch(err){
    res.status(400).json({error: err.message})

}
}

async function getRematricular(req,res){
    const id = req.params.id
    const rematricula = await Rematricula.findByPk(id)
    if(!rematricula){
        return res.status(404).send("Rematrícula não encontrada")
    }
    rematricula.fase_negociacao = 'Iniciada'
    await rematricula.save()
    res.render('rematricula', {rematricula})
}

async function getAlunos(req,res){
    const alunos = await Rematricula.findAll()
    // alunos.forEach(rematricula => {
    //     console.log(rematricula.data_aceite);
    //   });
    res.render('alunos', {alunos})
}

async function confirmarAceite(req, res) {
    const id = req.params.id;
    const rematricula = await Rematricula.findByPk(id);

    if (!rematricula) {
        return res.status(404).send("Rematrícula não encontrada");
    }

    if(rematricula.cpf_responsavel !== req.body.cpf_responsavel){
        return res.status(400).send("CPF do responsável não confere");
    }

    // Atualiza o campo 'aceite' para true
    rematricula.aceite = true;
    rematricula.data_aceite = new Date();
    await rematricula.save();

    res.redirect('/sucesso'); // Redireciona para uma página de sucesso ou outra de sua escolha
}

async function getRematriculaById(req, res) {
    const id = req.params.id;
    const rematricula = await Rematricula.findByPk(id);

    if (!rematricula) {
        return res.status(404).send("Rematrícula não encontrada");
    }

    if (rematricula.aceite === true) {
        return res.status(208).render('aceiteconfirmado', { rematricula });
    }

    res.render('aceite', { rematricula });
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
        // rematricula.turma_2025 = req.body.turma_2025; // If you plan to use this field
       
        // Save the updated record
        await rematricula.save();

        // Redirect to success page
        res.redirect(`/rematricula/${id}/aceite`);
    } catch (error) {
        console.error("Error updating rematrícula:", error);
        res.status(500).send("Erro ao atualizar rematrícula");
    }
}


async function renderAlunoSelect(req, res) {
    try {
        // Buscar todos os alunos, incluindo o nome e o id
        const alunos = await Rematricula.findAll({
          attributes: ['id', 'nome_aluno'] // Incluir o campo 'id'
        });
        console.log(alunos);
        res.render('selecionar', { alunos });
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).send('Erro no servidor');
      }
    }

async function renderMatriculasConcluidas(req,res){
    const rematriculas = await Rematricula.findAll({
        where:{
            aceite: true
        }
    })
    res.render('concluidos', {rematriculas})
}

async function growTechers(req,res){
    const rematriculados = await Rematricula.findAll({
        where:{
            aceite: true
        }
    })
    const total = rematriculados.length * 50

    res.render('grow', {total})
}

async function registerAdmin (req,res){
    const {email, password} = req.body
    try{
        const admin = await Admin.create({email, password})
        res.status(201).json(admin)
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
}

async function loginAdmin(req,res){
    const {email, password} = req.body
    try{
        const admin = await Admin.findOne({where: {email, password}})
        if(!admin){
            return res.status(404).send("Admin não encontrado")
        }
        res.status(200).json(admin)
    }
    catch(err){
        res.status(400).json({error: err.message})
    }
}


module.exports = {
    addAluno, getAlunos, confirmarAceite, getRematriculaById, renderAlunoSelect, getRematricular, confirmarMensalidadeTurma,
    renderMatriculasConcluidas, growTechers, registerAdmin, loginAdmin
}