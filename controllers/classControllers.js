const flash = require('connect-flash');
const userModel = require('../models/user-model');
// const classModel = require('../models/class-model.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Class Schema
var classSchema = new Schema({
    descricao: {type: String, required: true},
    fase: {type: String},
    semester: {type: Number},
    oferta: {type: String},
    demanda: {type: String},
    dia: {type: Array},
    start: {type: Array},
    tipoSalaTurma: {type: Array},
    creditos: {type: Array},
    idcentro: {type: String}
});

const spawn = require("child_process").spawn;



exports.insertClass = async function (req, res) {
    // Rotina para realizar a inserção de disciplinas no banco de dados, usa-se os modelos
    // class e room, sendo feita a verificação a partir dos campos chaves semestre e fase (turma)
    try {
        let classModel = mongoose.model('Disciplinas'+req.session.year, classSchema, 'disc-'+req.session.year);

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
        console.log(req.session.year);
        await classModel.findOne({
            fase: faseInput, semester: user[0].year
        }, function (err, classdb) {
            if (err) throw err;
            else {
                if (!classdb) { //Sala cadastrada avisar mensagem
                    try {
                        let newClass = new classModel({
                            descricao: descricaoInput,
                            fase: faseInput,
                            oferta: ofertaInput,
                            demanda: demandaInput,
                            dia: diaInput,
                            start: startInput,
                            creditos: creditosInput,
                            tipoSalaTurma: salaTurmaInput,
                            semester: req.session.year,
                            idcentro: req.session.userId
                        });
                        newClass.save().then(res.render('class', {
                            title: 'DASHBOARD',
                            name: req.user,
                            msg_turma: 'Turma ' + descricaoInput + ' cadastrada'
                        }));
                    } catch (e) {
                        console.log(e);
                        res.render('index', {
                            title: 'Error',
                            objeto: 'Erro, tente novamente mais tarde!'
                        });
                    }
                } else {
                    console.log(classdb)
                    res.render('class', {
                        title: 'DASHBOARD',
                        name: req.user
                    });
                }
            }
        });
    } catch(e) {
        console.log(e)
        res.render('index', {
            title: 'Error',
            objeto: 'Erro, tente novamente mais tarde!'
        });
    }
}

exports.attClass = function (req, res) {
    // Atualização, utiliza o modelo montado e busca pelo id e ano associado na session do usuario
    let classModel = mongoose.model('Disciplinas'+req.session.year, classSchema, 'disc-'+req.session.year);
    classModel.find({
        idcentro: req.session.userId, semester: req.session.year
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
    // Página dinâmica para remoção de salas, recebe o identificador usado para remover
    try {
        let classModel = mongoose.model('Disciplinas'+req.session.year, classSchema, 'disc-'+req.session.year);
        let turma = req.body.descricao;
        turma = turma.toUpperCase();
        console.log(req.body)
        if (turma == '') {
            res.send('erro');
            res.end();
        } else {
            //Busca e deleta o primeiro match com id da descricao (id sala único)
            await classModel.deleteOne({
                fase: turma, semester: req.session.year
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
    // Semelhante ao anterior, trabalha na mesma página para poder trocar os valores,
    // apenas se respeitado as condições.
    try{
        let turma = req.body.old.toUpperCase();
        let desc = req.body.descricao.toUpperCase();
        let newTurma = req.body.fase.toUpperCase();
        let jsondia = JSON.parse(req.body.dia);
        let jsonstart = JSON.parse(req.body.start);
        let jsontipoSalaTurma = JSON.parse(req.body.tipoSalaTurma);
        let jsoncreditos = JSON.parse(req.body.creditos);
        let classModel = mongoose.model('Disciplinas'+req.session.year, classSchema, 'disc-'+req.session.year);

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
}

exports.updateCAGR = async function (req, res) {
    // Rota responsável para iniciar a aplicação após a seleção do campus e ano
    req.session.year = req.body.selectYear;
    req.session.campus = req.body.selectCampus;

    // spawn('python3',["./main.py", req.session.year, req.session.campus]);
    const comando = spawn('python3', ['./main.py', req.body.selectYear, req.body.campus]);
    console.log(comando.pid)
    req.flash('successCAGR', 'Atualização em andamento');
    res.render('dashboard', {successCAGR: req.flash('successCAGR'), year:req.body.selectYear, campus:req.body.selectCampus});
}