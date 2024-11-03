const express = require('express')
const router = express.Router()

const {addAluno,
    addTurma, 
    deleteTurma, 
    deleteAlunos, 
    getAlunos, 
    getTurmas, 
    renderAddTurma, 
    loginAdmin, 
    registerAdmin, 
    renderEditAluno,
    renderMatriculasConcluidas,
    postEditTurma,
    postEditAluno,
renderEditTurma} = require('../controllers/adminControllers')

const {isAuth} = require('../middlewares/is-auth')

//Login
router.get('/', (req, res) => res.render('login'))
router.post('/', loginAdmin)

router.post('/registrar',  registerAdmin )


//turmas
router.get('/turmas', isAuth, getTurmas)
router.get('/turmas/adicionar', isAuth, renderAddTurma)
router.post('/turmas', isAuth, addTurma)
//deletar
router.post('/turmas/excluir/:id', isAuth, deleteTurma) 
//editar
router.get('/turmas/editar/:id', isAuth, renderEditTurma)
router.post('/turmas/editar/:id', isAuth, postEditTurma) 

//alunos
router.get('/alunos', isAuth, getAlunos)
router.get('/alunos/adicionar', isAuth, (req, res) => res.render('addaluno'))
router.post('/alunos/adicionar', isAuth, addAluno)

//deletar
router.post('/alunos/excluir/:id', isAuth, deleteAlunos)
//editar
router.get('/alunos/editar/:id', isAuth, renderEditAluno)
router.post('/alunos/editar/:id', isAuth, postEditAluno)


router.get('/rematriculados', isAuth, renderMatriculasConcluidas)






module.exports = router