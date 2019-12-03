const bcrypt = require('bcryptjs');
const userModel = require("../models/user-model");


exports.check_login = function (req, res) {
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
}

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render('index');
        }
    });
}

exports.loginUser = function (req, res) {
    getUser(req, res);
}

async function getUser(req, res) {
    try {
        const userinput = req.body.username;
        const passinput = req.body.password;
    
        // Retorna array de users com limite 1 - user = [result]
        const user = await userModel.find({
            username: userinput
        }).limit(1).catch((err) => {
            console.log('User not found');
            res.render('index',{
                title:'Login inválido',
                msg_login: 'Usuário não encontrado'
            });
        });
    
        const match = await bcrypt.compare(passinput, user[0].password);
    
        if (user && match) {
            const user_id = user[0].username;
            req.session.userId = user[0].idcentro
            req.login(user_id, function (err) {
                res.render('predash', {
                    title: 'Seleção semestre',
                    name: user_id
                });
            });
        } else {
            res.render('index', {
                title: 'Login inválido',
                msg_login: 'Senha inválida'
            })
        }
    } catch (e) {
        res.render('index', {
            title: 'Error',
            msg_login: 'Usuário não cadastrado!'
        });
    }
}