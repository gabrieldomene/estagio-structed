var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var urldb = "mongodb://localhost:27017";
var Users     = require('../models/users.server.model');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/LCC');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));




/* GET users listing. */
/* router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/teste', function(req, res){
  res.render('dashboard',{title: 'APLICACAO'});
}) */

var User = new Users();
User.username = 'gabrieldomene';
User.password = 'teste1234';


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
      }else{//CASO LOGADO, ENVIAR VIEW DASH
        res.render('dashboard', {title: 'BEM VINDO'});
      }
    });
  });
});

router.post('/cadastrar', function(req, res){
  res.write(User);
  res.end();
});


router.post('/cadastro-sala', function(req, res){
  let desc = req.body.descSala;
  desc = desc.toUpperCase();
  let capac = req.body.capcSala;
  let tipoSala = req.body.tipoSala;
  let fator1 = req.body.fator1;
  let fator2 = req.body.fator2;
  let fator3 = req.body.fator3;
  
  

})

module.exports = router;
