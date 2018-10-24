var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator/check');
const BCRYPT_SALT_ROUNDS = 12;
const exec = require("child_process").exec

var mongoose = require('mongoose');
//Connection to mlab
var db = require("../config/keys").mongoURI;
mongoose
    .connect(db, {useNewUrlParser:true})
    .then(() => console.log('Mongo connected'))
    .catch(err => console.log(err));

//Bring models
let userModel = require('../models/user-model');
let roomModel = require('../models/room-model');
let classModel = require('../models/class-model');

router.get('/', function(req, res) {
  //Console mostrando quem é o user e se está autenticado
  console.log(req.user);
  console.log(req.isAuthenticated());
  if(req.isAuthenticated()){
    res.render('dashboard', { title : 'Ensalamento ', name : req.user});
  }else{
    res.render('index', { title: 'Ensalamento UFSC' });
  }
});

router.get('/dashboard', function(req, res){
  res.redirect('/');
});

router.post('/login', function (req, res) { //FALTA CRIPTOGRAFAR SENHA + VALIDACAO
  let userinput = req.body.username;
  let passinput = req.body.password;

  userModel.findOne({
    username: userinput
  }, function (err, user) {
    if (err) throw err;
    else {
      if (!user) { //nao achou usuario AVISAR
        res.write('NAO ACHOU USER');
        res.end();
      } else { //achou usuario PRECISA VALIDAR NO PASSPORT
        bcrypt.compare(passinput, user.password, function(err, result){
          if (err) throw new Error(err)
          else{
            if(!result){
              //Não existe match no BD
              res.render('index', {
                title: 'Login inválido',
                msg_login: 'Usuário/Senha inválida'
              })
            }else{
              const user_id = user.username;
              req.login(user_id, function(err){
                res.render('dashboard', {
                  title: 'BEM VINDO',
                  name : user_id
                });
              });
            }
          }
        });
        //console.log(user.username, user.idcentro);
      }
    }
  });
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});



//https://www.youtube.com/watch?v=onPlF3gC0T4
router.post('/cadastrar',

  check('username', 'Insira um usuário').isLength({min:1}),
  check('password', 'Senha inválida, mínimo 6 caracteres').isLength({min: 6}),
  check('email', 'Insira um email válido').isEmail()

,function (req, res) {// FALTA ATRELAR O LOGIN A CADA ID CENTRO (SESSAO)
  let userInput = req.body.username;
  let passInput = req.body.password;
  let centroInput = req.body.centroID;
  let emailInput = req.body.email;

  let errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    let arrayErrors = errors.mapped()

    let mensagens = arrayErrors

    console.log(arrayErrors)

    return res.render('index', {errors: mensagens})
  }else{

    

    userModel.findOne({
      username: userInput
    }, function (err, userdb) {
      if (err) throw err;
      else {
        if (!userdb) {
          //Hashing password before saving
          bcrypt.hash(passInput, BCRYPT_SALT_ROUNDS, function(err, hash) { 
            if (err) throw new Error(err)
            else{
              let newUser = new userModel({
                username: userInput,
                password: hash,
                email:    emailInput,
                idcentro: centroInput
              });
              //Cadastro feito
              newUser.save(function (err) {
                if (err) throw err;
              });
              //Redirecionamento
              res.render('index', {
                title: 'BEM VINDO',
                cadastro: 'Cadastro completo'
              });
            }
          });
        } else { //Cadastro falhou, usuário já existe
          res.render('index', {
            title: 'Usuário existente',
            user_already: 'Usuário já existe, insira outro novamente.'
          });
        }
      }
    });
  }
});


router.post('/cadastro-sala', function (req, res) { //FALTA CADASTRAR O ID DA SESSAO!!!!
  let desc = req.body.descSala;
  desc = desc.toUpperCase();
  let capac = req.body.capcSala;
  let tipoSala = req.body.tipoSala;
  let fator1 = req.body.fator1;
  if (fator1 == '') fator1 = 1;
  let fator2 = req.body.fator2;
  if (fator2 == '') fator2 = 1;
  let fator3 = req.body.fator3;
  if (fator3 == '') fator3 = 1;

  let userSession = req.user;
  //console.log('USUARIO = ', userSession);

  function searchIDroom (user_name, desc, capac, tipoSala, fator1, fator2, fator3){
    let nameToSearch = user_name;
    userModel.findOne({
      username: nameToSearch
    }, function(err, user) {
      if (err) throw err;
      else {
        if (!user) {
          return 0
        } else {
          roomModel.findOne({
            descricao: desc
          }, function (err, roomdb) {
            if (err) throw err;
            else {
              if (!roomdb) { //Sala cadastrada avisar mensagem
                let newRoom = new roomModel({
                  descricao: desc,
                  capacidade: capac,
                  tipoSala: tipoSala,
                  fator1: fator1,
                  fator2: fator2,
                  fator3: fator3,
                  idcentro: user.idcentro
                });
                newRoom.save(function (err) {
                  if (err) throw err;
                });
                res.render('dashboard', {
                  title: 'DASHBOARD',
                  name : req.user,
                  msg_sala: 'Sala ' + desc + ' cadastrada' 
                });
              } else {
                res.render('dashboard', {
                  title: 'DASHBOARD',
                  name: req.user
                });
              }
            }
          });
        }
      }
    });
  }
  searchIDroom (userSession, desc, capac, tipoSala, fator1, fator2, fator3);
});

router.post('/cadastro-turma', function (req, res) { //FALTA CADASTRAR O ID DA SESSAO!!!!
  let descricaoInput = req.body.disciplina;
  descricaoInput = descricaoInput.toUpperCase();
  let faseInput = req.body.fase;
  let ofertaInput = req.body.oferta;
  let demandaInput = req.body.demanda;
  let diaInput = req.body.dia;
  let startInput = req.body.startTimer;
  let creditosInput = req.body.creditos;
  let salaTurmaInput = req.body.salaTurma;
  //let iduser = algo

  let userSession = req.user;
  console.log('USUARIO = ', userSession);


  function searchIDclass (user_name, desc, fase, oferta, demanda, dia, start, creditos, tipoSalaTurma){
    let nameToSearch = user_name;
    userModel.findOne({
      username: nameToSearch
    }, function(err, user) {
      if (err) throw err;
      else {
        if (!user) {
          return 0
        } else {
          classModel.findOne({
            descricao: desc
          }, function (err, classdb) {
            if (err) throw err;
            else {
              if (!classdb) { //Sala cadastrada avisar mensagem
                let newClass = new classModel({
                  descricao: descricaoInput,
                  fase: faseInput,
                  oferta: ofertaInput,
                  demanda: demandaInput,
                  dia: diaInput,
                  start: startInput,
                  creditos: creditosInput,
                  tipoSalaTurma: salaTurmaInput,
                  idcentro: user.idcentro
                });
                newClass.save(function (err) {
                  if (err) throw err;
                });
                res.render('dashboard', {
                  title: 'DASHBOARD',
                  name : req.user,
                  msg_turma: 'Turma ' + desc + ' cadastrada'  
                });
              } else {
                res.render('dashboard', {
                  title: 'DASHBOARD',
                  name: req.user
                });
              }
            }
          });
        }
      }
    });
  }
  searchIDclass (userSession, descricaoInput, faseInput, ofertaInput, demandaInput, diaInput, startInput, creditosInput, salaTurmaInput);

});

//Autenticar ver salas
router.get('/verSalas', authenticationMiddleware(), function(req, res){
  //Usa o room model definido previamente para fazer a busca no mlab
  let nameToSearch = req.user;
    userModel.findOne({
      username: nameToSearch
    }, function(err, user) {
    roomModel.find({idcentro: user.idcentro}, function(err, result){
      if (err) throw err;
      else{
        if (!result) {
          console.log('SEM DADOS');
          res.end();
        } else {
          let conc = ''
          for(let i=0; i<result.length; i++){
            conc += result[i].descricao + ' ' + result[i].capacidade + ' ' + result[i].tipoSala + ' ' + result[i].fator1 + ' ' + result[i].fator2 + ' ' + result[i].fator3 + '\n';
          }
          fs.writeFile('OutSala'+user.idcentro+'.txt', conc, 'utf8', function(err){
            if (err) 
            {
              res.render('dashboard', {title: 'Erro', name: req.user, msg_erro: 'Falha ao gerar arquivo'})
              throw new Error(err)
            }else{

            console.log('Salvo');
            res.render('dashboard', {title: 'Ensalamento UFSC', name: req.user, msg_success: 'Arquivo gerado'})
            }
          });
          }
        }
    });
  });
});


//Autenticar ver turmas
router.get('/verTurmas', authenticationMiddleware(), function(req, res){
  let nameToSearch = req.user;
  userModel.findOne({
    username: nameToSearch
  }, function(err, user) {
    classModel.find({idcentro: user.idcentro}, function(err, result){
      if (err) throw new Error(err);
      else{
        if (!result){
          console.log('Não existe dados');
        }else{
          var final = ""
          for (let i = 0; i < result.length; i++){
            let base = '';
            base = result[i].descricao + ' ' + result[i].fase + ' ' + result[i].oferta + ' '  + result[i].demanda;
            let temp = []
            if (result[i].dia.length > 1){
              for (let j = 0; j < result[i].dia.length; j++){
                let temporaria = result[i].dia[j] + ' ' + result[i].start[j] + ' ' + result[i].creditos[j] + ' : ' + result[i].tipoSalaTurma[j];
                temp.push(temporaria);
              }
            }else{
              let temporaria = result[i].dia + ' ' + result[i].start + ' ' + result[i].creditos + ' : ' + result[i].tipoSalaTurma;
              temp.push(temporaria);
            }
            let conc = '';
            if (temp.length > 1){
              for (let k = 0; k < temp.length; k++){
                if (k == 0 ){
                  conc = '{' + temp[k] + ', ';
                }else if (k == (temp.length - 1)){
                  conc = conc + temp[k] + '}';
                }else{
                  conc = conc + temp[k] + ', '
                }
              }
            }else{
              conc = '{' + temp +'}';
            }
            final = final+base + ' ' + conc+'\n';
            console.log(final)
          }
          let file_name = "OutTurma"+user.idcentro+".txt"
          fs.writeFile(file_name, final, function(err){
            if (err) throw new Error(err)
            console.log('Salvo');
          });
        }
      }
    });
  })
  //res.download('OutTurma.txt');
  res.render('dashboard', {title:'Ensalamento', msg_successT: 'Arquivo gerado',name: req.user})
});

router.get('/solucao', authenticationMiddleware(), (req, res) => {
  req.setTimeout(500000);
  let userinput = req.user
  
  userModel.findOne({username: userinput}, (err, user) => {
    if (err) throw err
    else {
      if (!user){
        res.write('Falhou');
        res.end();
      }else{
        let arq_rooms = 'OutSala'+user.idcentro+'.txt';
        let arq_classes = 'OutTurma'+user.idcentro+'.txt';
        let comando = "./classroom.sh configCTS20182.txt " + arq_rooms + " " + arq_classes 
        console.log(comando)
          exec(comando, (err, stdout, stderr) =>{

            let transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false, // true for 465, false for other ports
              auth: {
                  user: 'lcc.ufsc@gmail.com', // generated ethereal user
                  pass: 'PASS HERE'// generated ethereal password
              }
            });
      
            let msg_corpo = 'Olá ' + req.user + '. A solução encontrada pelo algoritmo de ensalamento está anexada em formato de texto junto a este email. Possíveis salas não alocadas estão anexadas no arquivo statistics e descrevem quais não foram possíveis.'
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"LCC Araranguá" <lcc.ufsc@gmail.com>', // sender address
                to: 'domenee.g@gmail.com', // list of receivers
                subject: 'Resultado do ensalamento',
                text: msg_corpo,
                attachments: [
                  { 
                    filename: 'outCTS20182.txt',
                    path: './outCTS20182.txt' // stream this file
                  },
                  { 
                    filename: 'statisticsCTS20182.txt',
                    path: './statisticsCTS20182.txt' // stream this file
                  }
                ]
                
            };
        
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
          res.render('dashboard', {title: 'Sucesso'});
        })
      }
    }
  });

});


//Auth to restricted pages
function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.render('index')
	}
}

module.exports = router;