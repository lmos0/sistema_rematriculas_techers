const express = require('express')
const router = express.Router()

const {addAluno, addTurma, getAlunos, getTurmas} = require('../controllers/adminControllers')


router.get('/', (req, res) => {res.send('Teste')})

router.get('/turmas', getTurmas)
router.post('/turmas', addTurma)

router.get('/alunos', getAlunos)
router.post('/alunos', addAluno)



module.exports = router