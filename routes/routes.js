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


mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.log(err));

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
// (req, res) => {
//   req.setTimeout(3600000);

//   let arq_config = "ConfigCentro" + req.session.userId + ".txt"
//   let arq_rooms = 'outSala' + req.session.userId + '.txt';
//   let arq_classes = 'outTurma' + req.session.userId + '.txt';
//   console.log(arq_config)
//   console.log(arq_rooms)
//   console.log(arq_classes)
//   let comando = "cd algoritmo/ && ./classroom.sh " + arq_config + " " + arq_rooms + " " + arq_classes
//   console.log(comando)


  // //O FAMOSO HIGHWAY TO CALLBACKHELL, arrumar nas férias!!
  // let nameToSearch = req.user;
  // console.log(nameToSearch)
  // userModel.findOne({
  //   username: nameToSearch
  // }, function (err, user) {
  //   roomModel.find({
  //     idcentro: user.idcentro
  //   }, function (err, result) {
  //     if (err) throw err;
  //     else {
  //       if (!result) {
  //         console.log('SEM DADOS');
  //         res.end();
  //       } else {
  //         //Envia email avisando requerimento de ensalamento ------------------------------------------
  //         let transporter = nodemailer.createTransport({
  //           host: 'smtp.gmail.com',
  //           port: 587,
  //           secure: false, // true for 465, false for other ports
  //           auth: {
  //             user: 'lcc.ufsc@gmail.com', // generated ethereal user
  //             pass: 'lccufsc2018' // generated ethereal password
  //           },
  //           tls: {
  //             rejectUnauthorized: false
  //           }
  //         });
  //         let msg_corpo = 'Solicitante: ' + req.user + '\n\nEmail: ' + user.email + '\n\nCentro: ' + user.idcentro

  //         // setup email data with unicode symbols
  //         /*let attachments_out = 'outCentro' + req.session.userId + '.txt'
  //         let path_out = './algoritmo/' + attachments_out
  //         console.log(path_out)

  //         let attachments_stats = 'statisticsCentro' + req.session.userId + '.txt'
  //         let path_stats = './algoritmo/' + attachments_stats
  //         console.log(path_stats)*/

  //         let mailOptions = {
  //           from: '"LCC Araranguá" <lcc.ufsc@gmail.com>', // sender address
  //           to: 'lcc.ufsc@gmail.com', // list of receivers
  //           subject: 'Requisição de ensalamento ' + req.user,
  //           text: msg_corpo
  //         };
  //         // send mail with defined transport object
  //         transporter.sendMail(mailOptions, (error, info) => {
  //           if (error) {
  //             return console.log(error);
  //           }
  //           console.log('Message sent: %s', info.messageId);
  //           console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  //         });

  //         //FIM DO ENVIO DO EMAIL ---------------------------------------------------------------------

  //         let conc = ''
  //         for (let i = 0; i < result.length; i++) {
  //           conc += result[i].descricao + ' ' + result[i].capacidade + ' ' + result[i].tipoSala + ' ' + result[i].fator1 + ' ' + result[i].fator2 + ' ' + result[i].fator3 + '\n';
  //         }
  //         //Comando caso for separar os txt do script
  //         //let file_name = "./outputs/outSala"+user.idcentro+".txt"
  //         let file_name = "./algoritmo/outSala" + user.idcentro + ".txt"
  //         fs.writeFile(file_name, conc, 'utf8', function (err) {
  //           if (err) {
  //             throw new Error(err)
  //           } else {
  //             console.log('----------- ESCRITO SALA ESCRITO -------------');
  //             classModel.find({
  //               idcentro: user.idcentro
  //             }, function (err, result) {
  //               if (err) throw new Error(err);
  //               else {
  //                 if (!result) {
  //                   console.log('Não existe dados');
  //                 } else {
  //                   var final = ""
  //                   for (let i = 0; i < result.length; i++) {
  //                     let base = '';
  //                     let faseClean = result[i].fase.split('-') //Separa o dash na string e retorna a segunda parte
  //                     base = result[i].descricao + ' ' + faseClean[1] + ' ' + result[i].oferta + ' ' + result[i].demanda;
  //                     let temp = []
  //                     if (result[i].dia.length > 1) {
  //                       for (let j = 0; j < result[i].dia.length; j++) {
  //                         let temporaria = result[i].dia[j] + ' ' + result[i].start[j] + ' ' + result[i].creditos[j] + ' : ' + result[i].tipoSalaTurma[j];
  //                         temp.push(temporaria);
  //                       }
  //                     } else {
  //                       let temporaria = result[i].dia + ' ' + result[i].start + ' ' + result[i].creditos + ' : ' + result[i].tipoSalaTurma;
  //                       temp.push(temporaria);
  //                     }
  //                     let conc = '';
  //                     if (temp.length > 1) {
  //                       for (let k = 0; k < temp.length; k++) {
  //                         if (k == 0) {
  //                           conc = '{' + temp[k] + ', ';
  //                         } else if (k == (temp.length - 1)) {
  //                           conc = conc + temp[k] + '}';
  //                         } else {
  //                           conc = conc + temp[k] + ', '
  //                         }
  //                       }
  //                     } else {
  //                       conc = '{' + temp + '}';
  //                     }
  //                     final = final + base + ' ' + conc + '\n';
  //                     //console.log(final)
  //                   }
  //                   //Linha caso for separar os txt do script
  //                   //let file_name = "./outputs/outTurma"+user.idcentro+".txt"
  //                   let file_turma = "./algoritmo/outTurma" + user.idcentro + ".txt"
  //                   fs.writeFile(file_turma, final, function (err) {
  //                     if (err) throw new Error(err)
  //                     else {
  //                       console.log(' -------------- ARQUIVO DE TURMA ESCRITO ----------------');
  //                       // EX-CÓDIGO FUNCIONAL PRA BAIXO ------------------------------------------------------
  //                       /*exec(comando, (err, stdout, stderr) => {
  //                         res.render('success', {
  //                           title: 'Sucesso'
  //                         });
  //                       });*/
  //                       res.render('success', {
  //                         title: 'Sucesso'
  //                       });
  //                     }
  //                   });
  //                 }
  //               }
  //             });
  //           }
  //         });
  //       }
  //     }
  //   });
  // });
// });


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