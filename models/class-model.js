const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Class Schema
var classSchema = new Schema({
    descricao: {type: String, required: true},
    fase: {type: String},
    semester: {type: Number},
    oferta: {type: String},
    demanda: {type: String},
    dia: {type: Array},
    start: {type: Array},
    tipoSalaTurma: {type: Array},
    creditos: {type: Array},
    idcentro: {type: String}
});

module.exports = mongoose.model('Disciplinas', classSchema);