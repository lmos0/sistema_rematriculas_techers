const express = require('express')
const router = express.Router()
const {addAluno, getAlunos, confirmarAceite, getRematriculaById, renderAlunoSelect, getRematricular, confirmarMensalidadeTurma, renderMatriculasConcluidas, growTechers} = require('../controllers/adminControllers')



router.get('/', (req, res) => {
    res.render('login')
})

router.post('/alunos', addAluno)

router.get('/rematricula/:id', getRematricular)

router.post('/rematricula/:id', confirmarMensalidadeTurma)


router.get('/alunos', getAlunos)

router.get('/rematricula/:id/aceite', getRematriculaById)

router.post('/rematricula/:id/aceite', confirmarAceite)

router.get('/sucesso', (req, res) => {
    res.render('sucesso')
}
)

router.get('/selecionar', renderAlunoSelect)

router.get('/rematriculados', renderMatriculasConcluidas)

router.get('/growtechers', growTechers)

module.exports = router