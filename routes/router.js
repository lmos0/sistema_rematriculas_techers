const express = require('express')
const router = express.Router()

const {
    addAluno,
    getRematriculaById,
    growTechers,
    loginAdmin,
    registerAdmin,
    renderAlunoSelect,
    renderMatriculasConcluidas
} = require('../controllers/adminControllers')

const {confirmarAceite, confirmarMensalidadeTurma, getRematricular} = require('../controllers/appControllers')


const {isAuth} = require('../middlewares/is-auth')

router.get('/', (req, res) => {res.render('login')})

router.get('/growtechers', growTechers)

router.get('/rematricula/:id', getRematricular)
router.post('/rematricula/:id', confirmarMensalidadeTurma)

router.get('/rematricula/:id/aceite', getRematriculaById)
router.post('/rematricula/:id/aceite', confirmarAceite)

router.get('/sucesso', (req, res) => {res.render('sucesso')})


router.get('/rematriculados', renderMatriculasConcluidas)


//router.get('/selecionar', renderAlunoSelect)

module.exports = router