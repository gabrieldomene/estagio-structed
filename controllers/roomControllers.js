const userModel = require('../models/user-model');
const mongoose = require('mongoose');
// const roomModel = require('../models/room-model');

var Schema = mongoose.Schema;

//Room Schema
var roomProfile = new Schema({
    descricao: String,
    capacidade: String,
    tipoSala: String,
    fator1: String,
    fator2: String,
    fator3: String,
    idcentro: String
});
exports.insertRoom = async function (req, res) {
    // Inserção de salas, semelhante ao classControllers

    try{

        let roomModel = mongoose.model('Salas'+req.session.year, roomProfile, 'sala-'+req.session.year);
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

        const user = await userModel.find({
            username: userSession
        }).limit(1);

        const room = await roomModel.findOne({
            descricao: desc,
            idcentro: user[0].idcentro, 
            semester: req.session.year
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
                        idcentro: user[0].idcentro
                    });
                    newRoom.save(function (err) {
                        if (err) throw err;
                    });
                    res.render('room', {
                        title: 'DASHBOARD',
                        name: req.user,
                        msg_sala: 'Sala ' + desc + ' cadastrada'
                    });
                } else {
                    console.log('SALA JÁ EXISTE COM ESSE ID')
                    res.render('room', {
                        title: 'DASHBOARD',
                        name: req.user,
                        msg_sala_erro: 'Sala ' + desc + ' não cadastrada, já existe'
                    });
                }
            }
        });
    } catch (e) {
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }
}

exports.attRoom = function (req, res) {
    // Busca no banco a partir do modelo

    let roomModel = mongoose.model('Salas'+req.session.year, roomProfile, 'sala-'+req.session.year);
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
    }).sort({ //Ordenação da lista
        descricao: 1
    });
}

exports.removeRoom = async function (req, res) {
    try{

        let roomModel = mongoose.model('Salas'+req.session.year, roomProfile, 'sala-'+req.session.year);
        let desc = req.body.descricao;
        desc = desc.toUpperCase();
        console.log(req.body)
        if (desc == '') {
            res.send('erro');
            res.end();
        } else {
            //Busca e deleta o primeiro match com id da descricao (id sala único)
            const room = await roomModel.deleteOne({
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
    } catch (e){
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }

}

exports.updateRoom = async function (req, res) {
    // Ver classControllers se precisar, semelhante.
    try{

        let roomModel = mongoose.model('Salas'+req.session.year, roomProfile, 'sala-'+req.session.year);
        let desc = req.body.descricao;
        desc = desc.toUpperCase();
        if (desc == '') {
            res.send('erro');
            res.end();
        } else {
            const room = await roomModel.findOne({
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
    } catch(e) {
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }
}