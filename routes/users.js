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
const BCRYPT_SALT_ROUNDS = 12;
const exec = require("child_process").exec

var mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
//Connection to mlab
var db = require("../config/keys").mongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.log(err));

//Bring models
let userModel = require('../models/user-model');
let roomModel = require('../models/room-model');
let classModel = require('../models/class-model');

router.get('/', function (req, res) {
  //Console mostrando quem é o user e se está autenticado
  console.log(req.user);
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.render('dashboard', {
      title: 'Ensalamento ',
      name: req.user
    });
  } else {
    res.render('index', {
      title: 'Ensalamento UFSC'
    });
  }
});

router.get('/logout', authenticationMiddleware(), (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render('index');
    }
  });
});

router.get('/dashboard', function (req, res) {
  res.redirect('/');
});

router.post('/login', function (req, res) {
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
        bcrypt.compare(passinput, user.password, function (err, result) {
          if (err) throw new Error(err)
          else {
            if (!result) {
              //Não existe match no BD
              res.render('index', {
                title: 'Login inválido',
                msg_login: 'Usuário/Senha inválida'
              })
            } else {
              const user_id = user.username;
              req.session.userId = user.idcentro
              req.login(user_id, function (err) {
                res.render('dashboard', {
                  title: 'BEM VINDO',
                  name: user_id
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

passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});




/* COMENTARIO ALL DESATIVADO CADASTRO
router.post('/cadastrar',
  //Validação
  check('username', 'Insira um usuário').isLength({
    min: 1
  }),
  check('password', 'Senha inválida, mínimo 6 caracteres').isLength({
    min: 6
  }),
  check('email', 'Insira um email válido').isEmail(),

  function (req, res) {
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

      return res.render('index', {
        errors: mensagens
      })
    } else {
      userModel.findOne({
        username: userInput
      }, function (err, userdb) {
        if (err) throw err;
        else {
          if (!userdb) {
            //Hashing password before saving
            bcrypt.hash(passInput, BCRYPT_SALT_ROUNDS, function (err, hash) {
              if (err) throw new Error(err)
              else {
                let newUser = new userModel({
                  username: userInput,
                  password: hash,
                  email: emailInput,
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
              user_already: 'Usuário já existente!'
            });
          }
        }
      });
    }

});
COMENTARIO ALL*/



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

  function searchIDroom(user_name, desc, capac, tipoSala, fator1, fator2, fator3) {
    let nameToSearch = user_name;
    userModel.findOne({
      username: nameToSearch
    }, function (err, user) {
      if (err) throw err;
      else {
        if (!user) {
          return 0
        } else {
          roomModel.findOne({
            descricao: desc,
            idcentro: user.idcentro
          }, function (err, roomdb) {
            if (err) throw err;
            else {
              if (!roomdb) { //Sala não existe, cadastrada e avisado sucesso
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
                res.render('room', {
                  title: 'DASHBOARD',
                  name: req.user,
                  msg_sala: 'Sala ' + desc + ' cadastrada'
                });
              } else /*if(user.idcentro != roomdb.idcentro)*/ {
                console.log('SALA JÁ EXISTE COM ESSE ID')
                res.render('room', {
                  title: 'DASHBOARD',
                  name: req.user,
                  msg_sala_erro: 'Sala ' + desc + ' não cadastrada, já existe'
                });
              }
            }
          });
        }
      }
    });
  }
  searchIDroom(userSession, desc, capac, tipoSala, fator1, fator2, fator3);
});

router.post('/cadastro-turma', function (req, res) { //FALTA CADASTRAR O ID DA SESSAO!!!!
  let descricaoInput = req.body.disciplina;
  descricaoInput = descricaoInput.toUpperCase();
  let faseInput = req.body.fase;
  faseInput = faseInput.toUpperCase();
  let ofertaInput = req.body.oferta;
  let demandaInput = req.body.demanda;
  let diaInput = req.body.dia;
  let startInput = req.body.startTimer;
  let creditosInput = req.body.creditos;
  let salaTurmaInput = req.body.salaTurma;
  //let iduser = algo

  let userSession = req.user;
  console.log('USUARIO = ', userSession);


  function searchIDclass(user_name, desc, fase, oferta, demanda, dia, start, creditos, tipoSalaTurma) {
    let nameToSearch = user_name;
    userModel.findOne({
      username: nameToSearch
    }, function (err, user) {
      if (err) throw err;
      else {
        if (!user) {
          return 0
        } else {
          classModel.findOne({
            fase: faseInput
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
                res.render('class', {
                  title: 'DASHBOARD',
                  name: req.user,
                  msg_turma: 'Turma ' + desc + ' cadastrada'
                });
              } else {
                res.render('class', {
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
  searchIDclass(userSession, descricaoInput, faseInput, ofertaInput, demandaInput, diaInput, startInput, creditosInput, salaTurmaInput);

});


// COMENTADO ANTIGA MONTAGEM DE ARQUIVOS
/* //Rota para montagem do arquivo txt necessário para o algoritmo - SALAS
router.get('/verSalas', authenticationMiddleware(), function (req, res) {
  //Usa o room model definido previamente para fazer a busca no mlab
  let nameToSearch = req.user;
  userModel.findOne({
    username: nameToSearch
  }, function (err, user) {
    roomModel.find({
      idcentro: user.idcentro
    }, function (err, result) {
      if (err) throw err;
      else {
        if (!result) {
          console.log('SEM DADOS');
          res.end();
        } else {
          let conc = ''
          for (let i = 0; i < result.length; i++) {
            conc += result[i].descricao + ' ' + result[i].capacidade + ' ' + result[i].tipoSala + ' ' + result[i].fator1 + ' ' + result[i].fator2 + ' ' + result[i].fator3 + '\n';
          }
          //Comando caso for separar os txt do script
          //let file_name = "./outputs/outSala"+user.idcentro+".txt"
          let file_name = "./algoritmo/outSala" + user.idcentro + ".txt"
          fs.writeFile(file_name, conc, 'utf8', function (err) {
            if (err) {
              res.render('room', {
                title: 'Erro',
                name: req.user,
                msg_erro: 'Falha ao gerar arquivo'
              })
              throw new Error(err)
            } else {

              console.log('Salvo');
              res.render('room', {
                title: 'Ensalamento UFSC',
                name: req.user,
                msg_success: 'Arquivo gerado'
              })
            }
          });
        }
      }
    });
  });
});


//Rota para montagem do arquivo txt necessário para o algoritmo - DISCIPLINAS
router.get('/verTurmas', authenticationMiddleware(), function (req, res) {
  let nameToSearch = req.user;
  userModel.findOne({
    username: nameToSearch
  }, function (err, user) {
    classModel.find({
      idcentro: user.idcentro
    }, function (err, result) {
      if (err) throw new Error(err);
      else {
        if (!result) {
          console.log('Não existe dados');
        } else {
          var final = ""
          for (let i = 0; i < result.length; i++) {
            let base = '';
            base = result[i].descricao + ' ' + result[i].fase + ' ' + result[i].oferta + ' ' + result[i].demanda;
            let temp = []
            if (result[i].dia.length > 1) {
              for (let j = 0; j < result[i].dia.length; j++) {
                let temporaria = result[i].dia[j] + ' ' + result[i].start[j] + ' ' + result[i].creditos[j] + ' : ' + result[i].tipoSalaTurma[j];
                temp.push(temporaria);
              }
            } else {
              let temporaria = result[i].dia + ' ' + result[i].start + ' ' + result[i].creditos + ' : ' + result[i].tipoSalaTurma;
              temp.push(temporaria);
            }
            let conc = '';
            if (temp.length > 1) {
              for (let k = 0; k < temp.length; k++) {
                if (k == 0) {
                  conc = '{' + temp[k] + ', ';
                } else if (k == (temp.length - 1)) {
                  conc = conc + temp[k] + '}';
                } else {
                  conc = conc + temp[k] + ', '
                }
              }
            } else {
              conc = '{' + temp + '}';
            }
            final = final + base + ' ' + conc + '\n';
            //console.log(final)
          }
          //Linha caso for separar os txt do script
          //let file_name = "./outputs/outTurma"+user.idcentro+".txt"
          let file_name = "./algoritmo/outTurma" + user.idcentro + ".txt"
          fs.writeFile(file_name, final, function (err) {
            if (err) throw new Error(err)
            console.log('Salvo');
          });
        }
      }
    });
  })
  //res.download('OutTurma.txt');
  res.render('class', {
    title: 'Ensalamento',
    msg_successT: 'Arquivo gerado',
    name: req.user
  })
}); */

//Solução final do ensalamento
router.get('/solucao', authenticationMiddleware(), (req, res) => {
  req.setTimeout(3600000);

  let arq_config = "ConfigCentro" + req.session.userId + ".txt"
  let arq_rooms = 'outSala' + req.session.userId + '.txt';
  let arq_classes = 'outTurma' + req.session.userId + '.txt';
  console.log(arq_config)
  console.log(arq_rooms)
  console.log(arq_classes)
  let comando = "cd algoritmo/ && ./classroom.sh " + arq_config + " " + arq_rooms + " " + arq_classes
  console.log(comando)


  //O FAMOSO HIGHWAY TO CALLBACKHELL, arrumar nas férias!!
  let nameToSearch = req.user;
  console.log(nameToSearch)
  userModel.findOne({
    username: nameToSearch
  }, function (err, user) {
    roomModel.find({
      idcentro: user.idcentro
    }, function (err, result) {
      if (err) throw err;
      else {
        if (!result) {
          console.log('SEM DADOS');
          res.end();
        } else {
          //Envia email avisando requerimento de ensalamento ------------------------------------------
          //Comentário temporário para verificar utilização no server da ufsc
          /*let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: 'lcc.ufsc@gmail.com', // generated ethereal user
              pass: 'lccufsc2018' // generated ethereal password
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          */
          //let msg_corpo = 'Solicitante: ' + req.user + '\n\nEmail: ' + user.email + '\n\nCentro: ' + user.idcentro
          // FIM COMENTÁRIO TEMPORARIO 1

          // setup email data with unicode symbols
          /*let attachments_out = 'outCentro' + req.session.userId + '.txt'
          let path_out = './algoritmo/' + attachments_out
          console.log(path_out)

          let attachments_stats = 'statisticsCentro' + req.session.userId + '.txt'
          let path_stats = './algoritmo/' + attachments_stats
          console.log(path_stats)*/

          /* Comentário temporário 2
          let mailOptions = {
            from: '"LCC Araranguá" <lcc.ufsc@gmail.com>', // sender address
            to: 'lcc.ufsc@gmail.com', // list of receivers
            subject: 'Requisição de ensalamento '+ req.user,
            text: msg_corpo
          };
          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          });
          
          FIM DO COMENTÁRIO TEMPORÁRIO 2*/
          //FIM DO ENVIO DO EMAIL ---------------------------------------------------------------------

          let conc = ''
          for (let i = 0; i < result.length; i++) {
            conc += result[i].descricao + ' ' + result[i].capacidade + ' ' + result[i].tipoSala + ' ' + result[i].fator1 + ' ' + result[i].fator2 + ' ' + result[i].fator3 + '\n';
          }
          //Comando caso for separar os txt do script
          //let file_name = "./outputs/outSala"+user.idcentro+".txt"
          let file_name = "./algoritmo/outSala" + user.idcentro + ".txt"
          fs.writeFile(file_name, conc, 'utf8', function (err) {
            if (err) {
              throw new Error(err)
            } else {
              console.log('----------- ESCRITO ARQUIVO DE SALA -------------');
              console.log(user)
              classModel.find({
                idcentro: user.idcentro
              }, function (err, result) {
                if (err) throw new Error(err);
                else {
                  if (!result) {
                    console.log('Não existe dados');
                  } else {
                    var final = ""
                    for (let i = 0; i < result.length; i++) {
                      let base = '';
                      let faseClean = result[i].fase.split('-') //Separa o dash na string e retorna a segunda parte
                      base = result[i].descricao + ' ' + faseClean[1] + ' ' + result[i].oferta + ' ' + result[i].demanda;
                      let temp = []
                      if (result[i].dia.length > 1) {
                        for (let j = 0; j < result[i].dia.length; j++) {
                          let temporaria = result[i].dia[j] + ' ' + result[i].start[j] + ' ' + result[i].creditos[j] + ' : ' + result[i].tipoSalaTurma[j];
                          temp.push(temporaria);
                        }
                      } else {
                        let temporaria = result[i].dia + ' ' + result[i].start + ' ' + result[i].creditos + ' : ' + result[i].tipoSalaTurma;
                        temp.push(temporaria);
                      }
                      let conc = '';
                      if (temp.length > 1) {
                        for (let k = 0; k < temp.length; k++) {
                          if (k == 0) {
                            conc = '{' + temp[k] + ', ';
                          } else if (k == (temp.length - 1)) {
                            conc = conc + temp[k] + '}';
                          } else {
                            conc = conc + temp[k] + ', '
                          }
                        }
                      } else {
                        conc = '{' + temp + '}';
                      }
                      final = final + base + ' ' + conc + '\n';
                      //console.log(final)
                    }
                    //Linha caso for separar os txt do script
                    //let file_name = "./outputs/outTurma"+user.idcentro+".txt"
                    let file_turma = "./algoritmo/outTurma" + user.idcentro + ".txt"
                    fs.writeFile(file_turma, final, function (err) {
                      if (err) throw new Error(err)
                      else {
                        console.log(' -------------- ARQ DE CLAS ESCRITO ----------------');
                        // EX-CÓDIGO FUNCIONAL PRA BAIXO ------------------------------------------------------
                        /*exec(comando, (err, stdout, stderr) => {
                          res.render('success', {
                            title: 'Sucesso'
                          });
                        });*/
                        res.render('success', {
                          title: 'Sucesso'
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  });
});

//Rota para carregar a página de CRUD sala
router.get('/attRoom', authenticationMiddleware(), (req, res) => {
  roomModel.find({
    idcentro: req.session.userId
  }, {
    _id: 0,
    __v: 0
  }, (err, result) => {
    if (err) throw err;
    res.render('updateRoom', {
      title: 'Alterar',
      objeto: result
    });
  }).sort({//Ordenação da lista
    descricao: 1
  });
});

//Rota para carregar a página de CRUD disciplina
router.get('/attClass', authenticationMiddleware(), (req, res) => {
  classModel.find({
    idcentro: req.session.userId
  }, {
    _id: 0,
    __v: 0
  }, (err, result) => {
    if (err) throw err;
    
    res.render('updateClass', {
      title: 'Alterar',
      objeto: JSON.parse(JSON.stringify(result))
    });
  }).sort({//Ordenação da lista
    descricao: 1
  });;
})

//Rota para remover a linha selecionada
router.post('/roomRemove', authenticationMiddleware(), (req, res) => {
  let desc = req.body.descricao;
  desc = desc.toUpperCase();
  console.log(req.body)
  if (desc == '') {
    res.send('erro');
    res.end();
  } else {
    //Busca e deleta o primeiro match com id da descricao (id sala único)
    roomModel.deleteOne({
      descricao: desc
    }, (err, result) => {
      if (err) {
        throw Error;
        res.send('erro');
        res.end();
      } else {
        if (!result) {
          res.send('erro')
        } else {
          res.send('sucesso');
          res.end();
        }
      }
    })
  }

});

//Rota para atualizar linha selecionada (modificar dados)
router.post('/roomUpdate', authenticationMiddleware(), (req, res) => {
  //Procura o ID que bate com a sala e faz a alteracao enviada pelo ajax
  let desc = req.body.descricao;
  desc = desc.toUpperCase();
  if (desc == '') {
    res.send('erro');
    res.end();
  } else {
    roomModel.findOne({
      descricao: desc
    }, (err, result) => {
      if (err) {
        throw Error;
        res.send('erro');
        res.end();
      } else {
        if (!result) {
          //Caso a sala NÃO EXISTA, é permitido a troca de ID
          roomModel.findOneAndUpdate({
            descricao: req.body.old
          }, {
            $set: {
              descricao: desc,
              capacidade: req.body.capacidade,
              tipoSala: req.body.tiposala
            }
          }, {
            new: true
          }, (err, result) => {
            if (err) throw new Error
            else {
              console.log('Update feito');

              res.send('sucesso')
              res.end();
            }
          });
        } else {
          //Caso a sala JÁ EXISTA, só é permitido a troca dos outros campos menos o ID!!
          roomModel.findOneAndUpdate({
            descricao: req.body.old
          }, {
            $set: {
              capacidade: req.body.capacidade,
              tipoSala: req.body.tiposala
            }
          }, {
            new: true
          }, (err, result) => {
            if (err) throw new Error
            else {
              console.log('Update parcial feito');
              res.send('partial')
              res.end();
            }
          });
        }
      }
    });
  }
});

router.post('/classRemove', authenticationMiddleware(), (req, res) => {
  let turma = req.body.descricao;
  turma = turma.toUpperCase();
  console.log(req.body)
  if (turma == '') {
    res.send('erro');
    res.end();
  } else {
    //Busca e deleta o primeiro match com id da descricao (id sala único)
    classModel.deleteOne({
      fase: turma
    }, (err, result) => {
      if (err) {
        throw Error;
        res.send('erro');
        res.end();
      } else {
        if (!result) {
          res.send('erro')
        } else {
          res.send('sucesso');
          res.end();
        }
      }
    })
  }
});

router.post('/classUpdate', authenticationMiddleware(), (req, res) => {

  //SE COLOCAR UM ID JÁ EXISTENTE, ELA SOBREESCREVE COM AQUELE ID!!! ARRUMAR
  let turma = req.body.old.toUpperCase();
  let desc = req.body.descricao.toUpperCase();
  let newTurma = req.body.fase.toUpperCase();
  let jsondia = JSON.parse(req.body.dia);
  let jsonstart = JSON.parse(req.body.start);
  let jsontipoSalaTurma  = JSON.parse(req.body.tipoSalaTurma);
  let jsoncreditos = JSON.parse(req.body.creditos);


  console.log('Old '+turma)
  console.log('New '+newTurma)

  
  if (newTurma == '')
  {
    res.send('erro');
    res.end();
  } else {
    classModel.findOne({//Busca se o valor inserido já existe no bd
      fase: newTurma
    }, (err, result) => {
      if (err)
      {
        throw Error;
        res.send('erro');
        res.end();
      } else {
        if (!result)
        {//Caso a disciplina nao exista com essa turma, é permitido alterar a antiga para a nova
          classModel.findOneAndUpdate({fase: req.body.old},
          {
            $set: {
              descricao: desc,
              fase: newTurma,
              oferta: req.body.oferta,
              demanda: req.body.demanda,
              dia: jsondia,
              start: jsonstart,
              tipoSalaTurma : jsontipoSalaTurma,
              creditos: jsoncreditos
            }
          },{
            new: true
          }, (err, result) => {
            if (err) throw new Error
            else {
              console.log('Update feito');
              res.send('sucesso');
              res.end();
            }
          });
        } else {//Caso já exista uma turma, troca toda informação da antiga, menos o valor novo da turma
          classModel.findOneAndUpdate({
            fase: req.body.old
          }, {
            $set: {
              descricao: desc,
              oferta: req.body.oferta,
              demanda: req.body.demanda,
              dia: jsondia,
              start: jsonstart,
              tipoSalaTurma : jsontipoSalaTurma,
              creditos: jsoncreditos
            }
          }, {
            new: true
          }, (err, result) => {
            if (err) throw new Error
            else {
              console.log('Update parcial feito');
              res.send('partial');
              res.end();
            }
          });
        }
      }
    });
  }

  //console.log('UPDATE ENVIADO: \n');
  //console.log(req.body);
});

router.get('/recover', (req, res) => {
  res.render('recover');
});

router.post('/sendReset', (req, res) => {
  console.log(req.body.email);
  userModel.findOne({email:req.body.email}, function (err, match){
    if (err) throw err;
    else{
      if (!match){//SEM EMAIL, RENDERIZAR AVISO
        console.log('Não tem email no banco');
        res.end();
      }else{
        console.log('Email encontrado: '+ match.email);
        res.end();
      }
    }
  })
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'lcc.ufsc@gmail.com', // generated ethereal user
        pass: '*' // generated ethereal password
      }
    });

    let msg_corpo = 'Para redefinir sua senha acesse o link abaixo e defina uma nova senha de acesso.'
    // setup email data with unicode symbols
    let mailOptions = {
      from: '"LCC Araranguá" <lcc.ufsc@gmail.com>', // sender address
      to: req.body.email, // list of receivers
      subject: 'Redefinição de senha',
      text: msg_corpo,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.end();
    });
})

//Verifica autenticação para ver páginas
function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if (req.isAuthenticated()) return next();
    res.render('index', {
      title: 'Não autenticado'
    })
  }
}

module.exports = router;