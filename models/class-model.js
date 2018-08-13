var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Class Schema
var classProfile = new Schema({
    descricao: String,
    fase: String,
    oferta: String,
    dia: Array,
    start: Array,
    tipoSalaTurma: Array,
    creditos: Array,
    idcentro: String
});

module.exports = mongoose.model('Classes', classProfile);