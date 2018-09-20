var express = require('express');
var router = express.Router();
var passport = require('passport');

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
        res.render('dashboard', {
          title: 'BEM VINDO'
        });
      }
    }
  });
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
  if (fator1 == '') fator1 = 0;
  let fator2 = req.body.fator2;
  if (fator2 == '') fator2 = 0;
  let fator3 = req.body.fator3;
  if (fator3 == '') fator3 = 0;
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


router.get('/verSalas', function(req, res){
  //Usa o room model definido previamente para fazer a busca no mlab
  roomModel.find({}, function(err, result){
    if (err) throw err;
    else{
      if (!result) {
        console.log('SEM DADOS');
        res.end();
      } else {
        console.log(result);
        res.end();
      }
    }
  });
});

module.exports = router;