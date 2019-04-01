const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const BCRYPT_SALT_ROUNDS = 12;

exports.registerUser = function (req, res) {
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

}