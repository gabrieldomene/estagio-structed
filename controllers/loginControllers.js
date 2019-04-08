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
    // let userinput = req.body.username;
    // let passinput = req.body.password;

    // // userModel.findOne({
    // //     username: userinput
    // // }, function (err, user) {
    // //     if (err) throw err;
    // //     else {
    // //         if (!user) { //nao achou usuario AVISAR
    // //             res.write('NAO ACHOU USER');
    // //             res.end();
    // //         } else { //achou usuario PRECISA VALIDAR NO PASSPORT
    // //             bcrypt.compare(passinput, user.password, function (err, result) {
    // //                 if (err) throw new Error(err)
    // //                 else {
    // //                     if (!result) {
    // //                         //Não existe match no BD
    // //                         res.render('index', {
    // //                             title: 'Login inválido',
    // //                             msg_login: 'Usuário/Senha inválida'
    // //                         })
    // //                     } else {
    // //                         const user_id = user.username;
    // //                         req.session.userId = user.idcentro
    // //                         req.login(user_id, function (err) {
    // //                             res.render('dashboard', {
    // //                                 title: 'BEM VINDO',
    // //                                 name: user_id
    // //                             });
    // //                         });
    // //                     }
    // //                 }
    // //             });
    // //         }
    // //     }
    // // });
}

async function getUser(req, res) {
    const userinput = req.body.username;
    const passinput = req.body.password;

    // Retorna array de users com limite 1 - user = [result]
    const user = await userModel.find({
        username: userinput
    }).limit(1);

    const match = await bcrypt.compare(passinput, user[0].password);

    if (user && match) {
        const user_id = user[0].username;
        req.session.userId = user[0].idcentro
        req.login(user_id, function (err) {
            res.render('dashboard', {
                title: 'BEM VINDO',
                name: user_id
            });
        });
    } else {
        res.render('index', {
            title: 'Login inválido',
            msg_login: 'Usuário/Senha inválida'
        })
    }
}