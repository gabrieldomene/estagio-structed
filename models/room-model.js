var mongoose = require('mongoose');
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

module.exports = mongoose.model('Salas', roomProfile);