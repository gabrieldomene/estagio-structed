var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require('fs');
var path = require('path');

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
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.render('index', { title: 'Ensalamento UFSC' });
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
        const user_id = user.username;
        req.login(user_id, function(err){
          res.render('dashboard', {
            title: 'BEM VINDO'
          });
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
router.post('/cadastrar', function (req, res) {// FALTA ATRELAR O LOGIN A CADA ID CENTRO (SESSAO)
  let userInput = req.body.username;
  let passInput = req.body.password;
  let centroInput = req.body.centroID;

  let newUser = new userModel({
    username: userInput,
    password: passInput,
    idcentro: centroInput
  });

  userModel.findOne({
    username: userInput
  }, function (err, userdb) {
    if (err) throw err;
    else {
      if (!userdb) {
        newUser.save(function (err) {
          if (err) throw err;
        });
        console.log('Usuário cadastrado fazer message');
        res.render('index', {
          title: 'BEM VINDO'
        });
      } else {
        console.log('Usuário ja cadastrado, login abaixo:\n');
        console.log(userdb);
        res.render('index');
      }
    }
  });
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
  // let iduser = algo

  let newRoom = new roomModel({
    descricao: desc,
    capacidade: capac,
    tipoSala: tipoSala,
    fator1: fator1,
    fator2: fator2,
    fator3: fator3
  });

  roomModel.findOne({
    descricao: desc
  }, function (err, roomdb) {
    if (err) throw err;
    else {
      if (!roomdb) { //Sala cadastrada avisar mensagem
        newRoom.save(function (err) {
          if (err) throw err;
        });
        res.render('dashboard', {
          title: 'DASHBOARD', 
        })
      } else {
        res.write('JA CADASTRADA, FAZER MESSAGE');
        res.end();
      }
    }
  });
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

  let newClass = new classModel({
    descricao: descricaoInput,
    fase: faseInput,
    oferta: ofertaInput,
    demanda: demandaInput,
    dia: diaInput,
    start: startInput,
    creditos: creditosInput,
    tipoSalaTurma: salaTurmaInput
  });

  classModel.findOne({
    descricao: descricaoInput
  }, function (err, classdb) {
    if (err) throw err;
    else {
      if (!classdb) {
        newClass.save(function (err) {
          if (err) throw err;
        });
        res.render('dashboard', {
          title: 'DASHBOARD', created: 1, sala: descricaoInput
        });
      } else {
        console.log(classdb);
       res.render('dashboard', {
          title: 'DASHBOARD', created: 0
       });
      }
    }
  });
});

//Autenticar ver salas
router.get('/verSalas', authenticationMiddleware(), function(req, res){
  //Usa o room model definido previamente para fazer a busca no mlab
  roomModel.find({}, function(err, result){
    if (err) throw err;
    else{
      if (!result) {
        console.log('SEM DADOS');
        res.end();
      } else {
        let conc = '';
        let temp = [];
        fs.unlink('OutSala.txt', function(err){
          if(err){
            console.log('Erro');
          }else{
            console.log('Out deletado');
          }
        });
        for (let i = 0; i < result.length; i++){
          conc = result[i].descricao + ' ' + result[i].capacidade + ' ' + result[i].tipoSala + ' ' + result[i].fator1 + ' ' + result[i].fator2 + ' ' + result[i].fator3 + '\n';
          fs.appendFile('OutSala.txt', conc, 'utf-8', function(err){
            if (err){
              console.log('Falha na escrita!');
            }else{
              console.log('Adicionado uma linha');
            }
          });
        }
      }
    }
  });
  res.download('OutSala.txt');
});


//Autenticar ver turmas
router.get('/verTurmas', authenticationMiddleware(), function(req, res){
  classModel.find({}, function(err, result){
    if (err) throw new Error(err);
    else{
      if (!result){
        console.log('Não existe dados');
      }else{
        fs.unlink('OutTurma.txt', function(err){
          if (err){
            console.log('ERRO');
          }else{
            console.log('OutTurma deletado!');
          }
        });
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
          let final = base + ' ' + conc+'\n';
          console.log(final);
          fs.appendFile('OutTurma.txt', final, function(err){
            if (err){
              console.log('Falha');
            }else{
              console.log('Linha adicionada');
            }
          });
        }
      }
    }
  });
  res.download('OutTurma.txt');
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