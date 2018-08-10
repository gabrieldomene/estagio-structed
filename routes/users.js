var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var urldb = "mongodb://localhost:27017";
var passport = require('passport');

var mongoose = require('mongoose');

//Connect to localhost
mongoose.connect('mongodb://localhost:27017/LCC');

//Connect to MongoLab sandbox...
/* 
mongoose.connect('mongodb://gabrieldomene:teste123@ds018248.mlab.com:18248/lcc'); */

//Check db connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log('DB CONECTADO!');

})

//Bring models
let userModel = require('../models/user-model');
let roomModel = require('../models/room-model');
let classModel = require('../models/class-model');


router.post('/login', function (req, res) {
  let userinput = req.body.username;
  let passinput = req.body.password;
  
  userModel.findOne({username: userinput}, function(err, user){
    if (err) throw err;
    else{
      if(!user){ //nao achou usuario AVISAR
        /* newUser.save(function(err){
          if (err) throw err;
        }); */
        res.write('NAO ACHOU USER');
        res.end();
      }else{ //achou usuario PRECISA VALIDAR NO PASSPORT
        res.render('dashboard', {
          title: 'BEM VINDO'
        });
      }
    }
  });
  
  /* let username = req.body.username;
  let password = req.body.password;
  MongoClient.connect(urldb, function (err, db) {
    var dbo = db.db('LCC');
    var query = {
      username: username,
      password: password
    };
    dbo.collection('Users').findOne(query, function (err, user) {
      if (err) throw new Error(err);
      if (!user) { //CASO NAO LOGUE, PRECISA FAZER A VIEW DE ERRO!!
        console.log('Not found');
        res.write('Login/senha inválidos');
        res.end();
      } else { //CASO LOGADO, ENVIAR VIEW DASH e criar session
        res.render('dashboard', {
          title: 'BEM VINDO'
        });
      }
    });

  }); */
});

router.post('/cadastrar', function (req, res) {
  let userInput = req.body.username;
  let passInput = req.body.password;
  let centroInput = req.body.centroID;
  console.log(userInput, passInput, centroInput);

  let newUser = new userModel({
    username: userInput,
    password: passInput,
    idcentro: centroInput

  });

  userModel.findOne({username: userInput}, function(err, userdb){
    if (err) throw err;
    else{
      if(!userdb){
        newUser.save(function(err){
          if (err) throw err;
        });
        console.log('Usuário cadastrado fazer message');
        res.render('index', {
          title: 'BEM VINDO'
        });
      }else{
        console.log('Usuário ja cadastrado, login abaixo:\n');
        console.log(userdb);
      }
    }
  })

  /* 
  MongoClient.connect(urldb, function (err, db) {
    var dbo = db.db('LCC');
    var query = {
      username: username
    };
    var myobj = {
      idcentro: idcentro,
      username: username,
      password: password
    };
    dbo.collection('Users').findOne(query, function (err, user) {
      if (err) throw new Error(err);
      if (!user) {
        dbo.collection('Users').insertOne(myobj, function (err, res) {
          if (err) throw err;
        });
        res.render('index', {
          title: 'WELCOME'
        });
      } else {
        res.write('Usuario ja cadastrado, fazer view');
        res.end();
      }
    });
  }); */
});


router.post('/cadastro-sala', function (req, res) {
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

  let newRoom = new roomModel({
    descricao: desc,
    capacidade: capac,
    tiposala: tipoSala,
    fator1: fator1,
    fator2: fator2,
    fator3: fator3
  });

  newRoom.save(function(err){
    if (err) throw err;
  });
/* 
  MongoClient.connect(urldb, function (err, db) {
    var dbo = db.db('LCC');
    var query = {
      descricao: desc
    };
    var myobj = {
      descricao: desc,
      capacidade: capac,
      tiposala: tipoSala,
      fator1: fator1,
      fator2: fator2,
      fator3: fator3
    };
    dbo.collection('Salas').findOne(query, function (err, sala) {
      if (err) throw new Error(err);
      if (!sala) {
        dbo.collection('Salas').insertOne(myobj, function (err, res) {
          if (err) throw err;
        });
        res.render('dashboard', {
          title: 'Seja Bem Vindo!'
        });
      } else {
        res.write('Sala já cadastrada, fazer view!');
        res.end();
      }
    });
  }); */
});

router.post('/cadastro-turma', function(req, res){
  
});

module.exports = router;