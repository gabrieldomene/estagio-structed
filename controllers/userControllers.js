const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const BCRYPT_SALT_ROUNDS = 12;
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

exports.registerUser = function (req, res) {
    let userInput = req.body.username;
    let passInput = req.body.password;
    let centroInput = req.body.centroID;
    let emailInput = req.body.email;

    // let errors = validationResult(req);
    // console.log(errors);
    // if (!errors.isEmpty()) {
    //     let arrayErrors = errors.mapped()

    //     let mensagens = arrayErrors

    //     console.log(arrayErrors)

    //     return res.render('index', {
    //         errors: mensagens
    //     })
    // } else {
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

// }

exports.recoverPass = function (req, res) {
    console.log(req.body.email);
    userModel.findOne({
        email: req.body.email
    }, function (err, match) {
        if (err) throw err;
        else {
            if (!match) { //SEM EMAIL, RENDERIZAR AVISO
                console.log('Não tem email no banco');
                res.end();
            } else {
                console.log('Email encontrado: ' + match.email);
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
            pass: 'lccufsc2018' // generated ethereal password
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
}

exports.recover = function (req, res) {
    res.render('recover');
}