const userModel = require('../models/user-model');
const classModel = require('../models/class-model');

exports.insertClass = function (req, res) { //FALTA CADASTRAR O ID DA SESSAO!!!!
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

}