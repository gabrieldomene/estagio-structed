var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcryptjs');
require('dotenv').config();
const nodemailer = require('nodemailer');
const {
  check,
  validationResult
} = require('express-validator/check');


const loginControllers = require('../controllers/loginControllers');
const userControllers = require('../controllers/userControllers');
const roomControllers = require('../controllers/roomControllers');
const classControllers = require('../controllers/classControllers');
const solutionControllers = require('../controllers/solutionControllers');

//Bring models
const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');
const classModel = require('../models/class-model');

const mongoose = require('mongoose');
//Connection to mlab
const db = require("../config/keys").mongoURI;

mongoose.set('useFindAndModify', false);


// mongoose
//   .connect(db, {
//     useNewUrlParser: true
//   })
//   .then(() => console.log('Mongo connected'))
//   .catch(err => console.log(err));

router.get('/', loginControllers.check_login);

router.get('/logout', authenticationMiddleware(), loginControllers.logout);

router.post('/login', loginControllers.loginUser);


router.post('/cadastrar',
  //Validação
  check('username', 'Insira um usuário').isLength({
    min: 1
  }),
  check('password', 'Senha inválida, mínimo 6 caracteres').isLength({
    min: 6
  }),
  check('email', 'Insira um email válido').isEmail(), userControllers.registerUser);

router.post('/cadastro-sala', roomControllers.insertRoom);

router.post('/cadastro-turma', classControllers.insertClass);

//Solução final do ensalamento
router.get('/solucao', authenticationMiddleware(), solutionControllers.generateSolution);

//Rota para carregar a página de CRUD disciplina
router.get('/attClass', authenticationMiddleware(), classControllers.attClass);

router.post('/classRemove', authenticationMiddleware(), classControllers.removeClass);

router.post('/classUpdate', authenticationMiddleware(), classControllers.updateClass);

//Rota para carregar a página de CRUD sala
router.get('/attRoom', authenticationMiddleware(), roomControllers.attRoom);

//Rota para remover a linha selecionada
router.post('/roomRemove', authenticationMiddleware(), roomControllers.removeRoom);

//Rota para atualizar linha selecionada (modificar dados)
router.post('/roomUpdate', authenticationMiddleware(), roomControllers.updateRoom);

router.get('/recover', userControllers.recover);

router.post('/sendReset', userControllers.recoverPass);

//Verifica autenticação para ver páginas
function authenticationMiddleware() {
  return (req, res, next) => {
    // console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if (req.isAuthenticated()) return next();
    res.render('index', {
      title: 'Não autenticado'
    })
  }
}

passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

module.exports = router;