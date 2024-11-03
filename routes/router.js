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

const {buscarAluno,
     renderBuscarAluno,
      confirmarAceite, 
      confirmarMensalidadeTurma, 
      getRematricular,
    rematriculaSelectModalidade,
    renderConfirmarMensalidadeTurma} = require('../controllers/appControllers')


const {isAuth} = require('../middlewares/is-auth')


router.get('/', renderBuscarAluno)
router.post('/', buscarAluno)

router.get('/growtechers', growTechers)

router.get('/rematricula/:id', getRematricular)
router.post('/rematricula/:id', rematriculaSelectModalidade)

router.get('/rematricula/:id/turma', renderConfirmarMensalidadeTurma)
router.post('/rematricula/:id/turma', confirmarMensalidadeTurma)

router.get('/rematricula/:id/aceite', getRematriculaById)
router.post('/rematricula/:id/aceite', confirmarAceite)

router.get('/sucesso', (req, res) => {res.render('sucesso')})



module.exports = router