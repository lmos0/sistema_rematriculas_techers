const express = require('express')
const router = express.Router()

const {addAluno, addTurma, deleteTurma, getAlunos, getTurmas, renderAddTurma} = require('../controllers/adminControllers')


router.get('/', (req, res) => res.render('login'))

router.get('/turmas', getTurmas)

router.get('/turmas/adicionar', renderAddTurma)
router.post('/turmas', addTurma)
router.delete('/turmas/:id', deleteTurma)

router.get('/alunos', getAlunos)
router.get('/alunos/adicionar', (req, res) => res.render('addaluno'))
router.post('/alunos/adicionar', addAluno)



module.exports = router