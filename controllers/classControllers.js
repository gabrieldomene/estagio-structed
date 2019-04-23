const userModel = require('../models/user-model');
const classModel = require('../models/class-model');

exports.insertClass = async function (req, res) { //FALTA CADASTRAR O ID DA SESSAO!!!!
    try {
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
        let userSession = req.user;

        const user = await userModel.find({
            username: userSession
        }).limit(1);

        const class_object = await classModel.findOne({
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
                        idcentro: user[0].idcentro
                    });
                    newClass.save(function (err) {
                        if (err) throw err;
                    });
                    res.render('class', {
                        title: 'DASHBOARD',
                        name: req.user,
                        msg_turma: 'Turma ' + descricaoInput + ' cadastrada'
                    });
                } else {
                    res.render('class', {
                        title: 'DASHBOARD',
                        name: req.user
                    });
                }
            }
        });

        if(class_object){
            console.log('turma cadastrada')
        }
    } catch(e) {
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }
}

exports.attClass = function (req, res) {
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
    }).sort({ //Ordenação da lista
        descricao: 1
    });;
}

exports.removeClass = async function (req, res) {
    try {
        let turma = req.body.descricao;
        turma = turma.toUpperCase();
        console.log(req.body)
        if (turma == '') {
            res.send('erro');
            res.end();
        } else {
            //Busca e deleta o primeiro match com id da descricao (id sala único)
            const class_object = await classModel.deleteOne({
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
    } catch(e) {
        console.log('Erro na remoção')
    }
    
}

exports.updateClass = async function (req, res) {
    try{
        let turma = req.body.old.toUpperCase();
        let desc = req.body.descricao.toUpperCase();
        let newTurma = req.body.fase.toUpperCase();
        let jsondia = JSON.parse(req.body.dia);
        let jsonstart = JSON.parse(req.body.start);
        let jsontipoSalaTurma = JSON.parse(req.body.tipoSalaTurma);
        let jsoncreditos = JSON.parse(req.body.creditos);

        console.log('Old ' + turma)
        console.log('New ' + newTurma)

        if (newTurma == '') {
            res.send('erro');
            res.end();
        } else {
            const class_object = await classModel.findOne({ //Busca se o valor inserido já existe no bd
                fase: newTurma
            }, (err, result) => {
                if (err) {
                    throw Error;
                    res.send('erro');
                    res.end();
                } else {
                    if (!result) { //Caso a disciplina nao exista com essa turma, é permitido alterar a antiga para a nova
                        classModel.findOneAndUpdate({
                            fase: req.body.old
                        }, {
                            $set: {
                                descricao: desc,
                                fase: newTurma,
                                oferta: req.body.oferta,
                                demanda: req.body.demanda,
                                dia: jsondia,
                                start: jsonstart,
                                tipoSalaTurma: jsontipoSalaTurma,
                                creditos: jsoncreditos
                            }
                        }, {
                            new: true
                        }, (err, result) => {
                            if (err) throw new Error
                            else {
                                console.log('Update feito');
                                res.send('sucesso');
                                res.end();
                            }
                        });
                    } else { //Caso já exista uma turma, troca toda informação da antiga, menos o valor novo da turma
                        classModel.findOneAndUpdate({
                            fase: req.body.old
                        }, {
                            $set: {
                                descricao: desc,
                                oferta: req.body.oferta,
                                demanda: req.body.demanda,
                                dia: jsondia,
                                start: jsonstart,
                                tipoSalaTurma: jsontipoSalaTurma,
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
    } catch (e) {
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }
    
    //SE COLOCAR UM ID JÁ EXISTENTE, ELA SOBREESCREVE COM AQUELE ID!!! ARRUMAR
    // let turma = req.body.old.toUpperCase();
    // let desc = req.body.descricao.toUpperCase();
    // let newTurma = req.body.fase.toUpperCase();
    // let jsondia = JSON.parse(req.body.dia);
    // let jsonstart = JSON.parse(req.body.start);
    // let jsontipoSalaTurma = JSON.parse(req.body.tipoSalaTurma);
    // let jsoncreditos = JSON.parse(req.body.creditos);

    // console.log('Old ' + turma)
    // console.log('New ' + newTurma)

    // if (newTurma == '') {
    //     res.send('erro');
    //     res.end();
    // } else {
    //     classModel.findOne({ //Busca se o valor inserido já existe no bd
    //         fase: newTurma
    //     }, (err, result) => {
    //         if (err) {
    //             throw Error;
    //             res.send('erro');
    //             res.end();
    //         } else {
    //             if (!result) { //Caso a disciplina nao exista com essa turma, é permitido alterar a antiga para a nova
    //                 classModel.findOneAndUpdate({
    //                     fase: req.body.old
    //                 }, {
    //                     $set: {
    //                         descricao: desc,
    //                         fase: newTurma,
    //                         oferta: req.body.oferta,
    //                         demanda: req.body.demanda,
    //                         dia: jsondia,
    //                         start: jsonstart,
    //                         tipoSalaTurma: jsontipoSalaTurma,
    //                         creditos: jsoncreditos
    //                     }
    //                 }, {
    //                     new: true
    //                 }, (err, result) => {
    //                     if (err) throw new Error
    //                     else {
    //                         console.log('Update feito');
    //                         res.send('sucesso');
    //                         res.end();
    //                     }
    //                 });
    //             } else { //Caso já exista uma turma, troca toda informação da antiga, menos o valor novo da turma
    //                 classModel.findOneAndUpdate({
    //                     fase: req.body.old
    //                 }, {
    //                     $set: {
    //                         descricao: desc,
    //                         oferta: req.body.oferta,
    //                         demanda: req.body.demanda,
    //                         dia: jsondia,
    //                         start: jsonstart,
    //                         tipoSalaTurma: jsontipoSalaTurma,
    //                         creditos: jsoncreditos
    //                     }
    //                 }, {
    //                     new: true
    //                 }, (err, result) => {
    //                     if (err) throw new Error
    //                     else {
    //                         console.log('Update parcial feito');
    //                         res.send('partial');
    //                         res.end();
    //                     }
    //                 });
    //             }
    //         }
    //     });
    // }
}