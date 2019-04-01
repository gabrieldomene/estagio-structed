const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');

exports.insertRoom =  function (req, res) {
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
  }