var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userProfile = new Schema({
    username: String,
    password: String
});

var roomProfile = new Schema({
    descricao: String,
    capacidade: String,
    tipoSala: String,
    fator1: String,
    fator2: String,
    fator3: String
});

var classProfile = new Schema({
    descricao: String,
    fase: String,
    oferta: String,
    dia: String,
    start: String,
    tipoSalaTurma: String,
    creditos: String
});