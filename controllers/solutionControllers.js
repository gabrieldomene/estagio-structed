const nodemailer = require('nodemailer');
const fs = require('fs');

const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');
const classModel = require('../models/class-model');

exports.generateSolution = function(req, res) {
    createFile(req, res);
}
// 143 linhas antes 
async function createFile(req, res) {
    try{
        const arq_config = "ConfigCentro" + req.session.userId + ".txt"
        const arq_rooms = 'outSala' + req.session.userId + '.txt';
        const arq_classes = 'outTurma' + req.session.userId + '.txt';
        const comando = "cd algoritmo/ && ./classroom.sh " + arq_config + " " + arq_rooms + " " + arq_classes
        console.log(arq_config)
        console.log(arq_rooms)
        console.log(arq_classes)
        console.log(comando)
    
        const user = await userModel.find({username: req.user}).limit(1);
    
        //Enviar email
        if (user) {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'lcc.ufsc@gmail.com',
                    pass: 'lccufsc2018'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
    
            let msg_corpo = 'Solicitante: ' + user[0].username + '\nEmail: ' + user[0].email + '\nCentro: ' + user[0].idcentro +'\n\n' + Date();
    
            let mailOptions = {
                from: '"LCC Araranguá" <lcc.ufsc@gmail.com>',
                to: 'lcc.ufsc@gmail.com',
                subject: 'Requisição de ensalamento ' + user[0].username,
                text: msg_corpo
            };
            
            transporter.sendMail(mailOptions, (error, infor) => {
                if (error) {
                    return console.log(error);
                }
    
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
            });
        }
    
        const roomList = await roomModel.find({idcentro: user[0].idcentro});
    
        const classList = await classModel.find({idcentro: user[0].idcentro});
    
        console.log(roomList.length);
        console.log(classList.length);
    
        if (roomList){
            let conc = ''
            for (let i = 0; i < roomList.length; i++)
            {
                conc += roomList[i].descricao + ' ' + roomList[i].capacidade + ' ' + roomList[i].tipoSala + ' ' + roomList[i].fator1 + ' ' + roomList[i].fator2 + ' ' + roomList[i].fator3 + '\n';
            }
            let file_name = "./algoritmo/outSala" + user[0].idcentro + ".txt"
            fs.writeFile(file_name, conc, 'utf8', function (err) {
                if (err) {
                    throw new Error (err)
                } else {
                    console.log('Room file successfully write!')
                }
            });
        }
    
        if (classList){
            let final = '';
            for (let i = 0; i < classList.length; i++)
            {
                let base = '';
                let faseClean = classList[i].fase.split('-') //Separar o dash na string retornando a segunda parte
                base = classList[i].descricao + ' ' + faseClean[1] + ' ' + classList[i].oferta + ' ' + classList[i].demanda;
    
                let temp = [];
                if (classList[i].dia.length > 1)
                {
                    for (let j = 0; j < classList[i].dia.length; j++)
                    {
                        temporaria = classList[i].dia[j] + ' ' + classList[i].start[j] + ' ' + classList[i].creditos[j] + ' : ' + classList[i].tipoSalaTurma[j];
    
                        temp.push(temporaria);
                    }
                } else {
                    let temporaria = classList[i].dia + ' ' + classList[i].start + ' ' + classList[i].creditos + ' : ' + classList[i].tipoSalaTurma;
                    
                    temp.push(temporaria);
                }
                let conc = '';
                if (temp.length > 1)
                {
                    for (let k = 0; k < temp.length; k ++)
                    {
                        if (k == 0){
                            conc = '{' + temp[k] + ', ';
                        } else if (k == (temp.length - 1)){
                            conc = conc + temp[k] + '}';
                        } else{
                            conc = conc + temp[k] + ', '
                        }
                    }
                } else {
                    conc = '{' + temp + '}';
                }
                final = final + base + ' ' + conc + '\n';
            }
            let file_name = "./algoritmo/outTurma" + user[0].idcentro + ".txt"
            fs.writeFile(file_name, final, function (err){
                if (err) throw new Error(err)
            else 
                console.log('Class file successfully write!')
            });
        }
    
        res.render('success', {
            title: 'Sucesso'
        });
    } catch(e) {
        res.render('error', {
            title:'Error'
        })
    }
    

}