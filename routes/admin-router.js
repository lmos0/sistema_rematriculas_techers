const express = require('express')
const router = express.Router()

const {addAluno, addTurma, deleteTurma, deleteAlunos, getAlunos, getTurmas, renderAddTurma, loginAdmin, registerAdmin, renderEditAluno} = require('../controllers/adminControllers')


router.get('/', (req, res) => res.render('login'))
router.post('/', loginAdmin)

router.get('/turmas', getTurmas)

router.get('/turmas/adicionar', renderAddTurma)
router.post('/turmas', addTurma)
router.delete('/turmas/:id', deleteTurma)

router.get('/alunos', getAlunos)
router.get('/alunos/adicionar', (req, res) => res.render('addaluno'))
router.post('/alunos/adicionar', addAluno)

router.post('/excluir/:id', deleteAlunos)

router.get('/editar/:id', renderEditAluno)

router.post('/registrar', registerAdmin )



module.exports = router