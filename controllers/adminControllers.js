const express = require('express')
const bcrypt = require('bcrypt')

//const Rematricula = require('../model/rematricula')
const Admin = require('../model/admin')
const Aluno = require('../model/aluno')
const Turma = require('../model/turma')

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function addAluno(req,res){
    const {nome_aluno,
         nome_responsavel, 
         cpf_responsavel, 
         curso, 
         level_atual, 
         valor_2024,
         quantidade_parcelas_2024} = req.body

         nome_aluno_busca = removeAccents(req.body.nome_aluno).toLowerCase()

         
        
         level_2025 = level_atual + 1
         valor_2025 = (valor_2024 * 1.04) * quantidade_parcelas_2024

        if (!nome_aluno || !nome_responsavel || !cpf_responsavel || !curso || !level_atual || !valor_2024) {
            return res.status(400).json("Todos os campos são obrigatórios");
        }
try{
    if (req.body.curso !== 'Programação'){
        level_2025 = 2
}  
    const rematricula = await Aluno.create({nome_aluno, nome_aluno_busca, nome_responsavel, cpf_responsavel, curso, level_atual, valor_2024, level_2025, valor_2025, quantidade_parcelas_2024})
    return res.status(201).redirect('/admin/alunos')
}
catch(err){
    console.error('Erro ao adicionar aluno:', err)
    return res.status(500).json({error: err.message})

}
}

async function addTurma(req,res){
    const {nome, curso, level, modalidade, dia_semana, horario, vagas} = req.body

    if(!nome || !curso || !level || !modalidade || !dia_semana || !horario || !vagas){
        return res.status(400).json("Todos os campos são obrigatórios")
    }
    try{
        const turma = await Turma.create({nome, curso, level, modalidade, dia_semana, horario, vagas})
        return res.status(201).json(turma)
    }
    catch(err){
        console.error('Erro ao adicionar turma:', err)
        return res.status(500).json({error: err.message
        })  
}
}

async function getTurmas(req,res){
    try{
        const turmas = await Turma.findAll()
        res.render('turmas', {turmas})
    }
    catch(err){
        console.error('Erro ao buscar turmas:', err)
        return res.status(500).json({error: err.message})
    }
}
    


async function getAlunos(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: alunos } = await Aluno.findAndCountAll({
      limit,
      offset,
      order: [['nome_aluno', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit);

    res.render('alunos', {
      alunos,
      currentPage: page,
      totalPages,
      totalAlunos: count,
    });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).render('error', { message: 'Erro ao carregar a lista de alunos.' });
  }
}

async function getRematriculaById(req, res) {
    const id = req.params.id;
    const rematricula = await Aluno.findByPk(id);

    if (!rematricula) {
        return res.status(404).send("Rematrícula não encontrada");
    }

    if(!rematricula.turma_2025 || !rematricula.valor_2025 || !rematricula.quantidade_parcelas || !rematricula.forma_de_pagamento){
        return res.status(400).send("Rematrícula não está completa")
    }

try{
    if (rematricula.aceite === true) {
        return res.status(208).render('aceiteconfirmado', { rematricula });
    }

    res.render('aceite', { rematricula });
}
catch(err){
    console.error('Erro ao buscar rematrícula:', err)
    return res.status(500).json({error: err.message})
}
}

async function renderAlunoSelect(req, res) {
    try {
        // Buscar todos os alunos, incluindo o nome e o id
        const alunos = await Aluno.findAll({
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
    const rematriculas = await Aluno.findAll({
        where:{
            aceite: true
        }
    })
    res.render('concluidos', {rematriculas})
}

async function growTechers(req,res){
    const rematriculados = await Aluno.findAll({
        where:{
            aceite: true
        }
    })
    const total = rematriculados.length * 50

    res.render('grow', {total})
}

async function registerAdmin (req,res){
    const {email, password} = req.body
    bcrypt
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

async function renderAddTurma (req,res){
    res.render('addTurma')
}


module.exports = {
    addAluno,
    addTurma,
    getRematriculaById,
    getAlunos,
    getTurmas,
    growTechers,
    loginAdmin,
    registerAdmin,
    renderAlunoSelect,
    renderAddTurma,
    renderMatriculasConcluidas
}