var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Class Schema
var classProfile = new Schema({
    descricao: String,
    fase: String,
    oferta: String,
    dia: String,
    start: String,
    tipoSalaTurma: String,
    creditos: String
});

let Class = module.exports = mongoose.model('Classes', classProfile);