var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var urldb = "mongodb://localhost:27017";
var Users     = require('../models/users.server.model');

var mongoose = require('mongoose');

//Connect to localhost
mongoose.connect('mongodb://localhost:27017/LCC');

//Connect to MongoLab sandbox...
/* 
mongoose.connect('mongodb://gabrieldomene:teste123@ds018248.mlab.com:18248/lcc'); */

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function(){
  console.log('DB CONECTADO!');
  
})




/* GET users listing. */
/* router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/teste', function(req, res){
  res.render('dashboard',{title: 'APLICACAO'});
}) */

/* var User = new Users();
User.username = 'gabrieldomene';
User.password = 'teste1234'; */


router.post('/login', function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  MongoClient.connect(urldb, function(err, db){
    var dbo = db.db('LCC');
    var query = {username: username, password: password};
    dbo.collection('Users').findOne(query, function(err, user){
      if(err) throw new Error(err);
      if(!user){ //CASO NAO LOGUE, PRECISA FAZER A VIEW DE ERRO!!
        console.log('Not found');
        res.write('Login/senha inválidos');
        res.end();
      }else{//CASO LOGADO, ENVIAR VIEW DASH e criar session
        res.render('dashboard', {title: 'BEM VINDO'});
      }
    });

  });
});

router.post('/cadastrar', function(req, res){
  let username = req.body.username;
  let password = req.body.password;
  let idcentro = req.body.centroID;
  console.log(username, password, idcentro);
  MongoClient.connect(urldb, function(err, db){
    var dbo = db.db('LCC');
    var query = {username: username};
    var myobj = {idcentro: idcentro, username: username, password: password};
    dbo.collection('Users').findOne(query, function(err, user){
      if (err) throw new Error(err);
      if(!user){
        dbo.collection('Users').insertOne(myobj, function(err, res){
          if (err) throw err;
        });
        res.render('index', {title: 'LOGIN PAGE'});
      }else{
        res.write('Usuario ja cadastrado, fazer view');
        res.end();
      }
    });
  });
});


router.post('/cadastro-sala', function(req, res){
  let desc = req.body.descSala;
  desc = desc.toUpperCase();
  let capac = req.body.capcSala;
  let tipoSala = req.body.tipoSala;
  let fator1 = req.body.fator1;
  if(fator1 == '') fator1 = 0;
  let fator2 = req.body.fator2;
  if(fator2 == '') fator2 = 0;
  let fator3 = req.body.fator3;
  if(fator3 == '') fator3 = 0;
  
  MongoClient.connect(urldb, function(err, db){
    var dbo = db.db('LCC');
    var query = {descricao: desc};
    var myobj = {descricao: desc, capacidade: capac, tiposala: tipoSala, fator1: fator1, fator2: fator2, fator3: fator3};
    dbo.collection('Salas').findOne(query, function(err, sala){
      if (err) throw new Error(err);
      if(!sala){
        dbo.collection('Salas').insertOne(myobj, function(err, res){
          if (err) throw err;
        });
        res.render('dashboard', {title: 'Seja Bem Vindo!'});
      }else{
        res.write('Sala já cadastrada, fazer view!');
        res.end();
      }
    });
  });
});

module.exports = router;
