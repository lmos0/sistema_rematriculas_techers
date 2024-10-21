const express = require('express')
const router = express.Router()

const {
    addAluno,
    confirmarAceite,
    confirmarMensalidadeTurma,
    getAlunos,
    getRematriculaById,
    getRematricular,
    growTechers,
    loginAdmin,
    registerAdmin,
    renderAlunoSelect,
    renderMatriculasConcluidas
} = require('../controllers/adminControllers')


router.get('/', (req, res) => {res.render('login')})

router.get('/growtechers', growTechers)

router.get('/alunos', getAlunos)
router.post('/alunos', addAluno)

router.get('/rematricula/:id', getRematricular)
router.post('/rematricula/:id', confirmarMensalidadeTurma)

router.get('/rematricula/:id/aceite', getRematriculaById)
router.post('/rematricula/:id/aceite', confirmarAceite)

router.get('/sucesso', (req, res) => {res.render('sucesso')})


router.get('/rematriculados', renderMatriculasConcluidas)


//router.get('/selecionar', renderAlunoSelect)

module.exports = router