var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/LCC');

//User Schema
var userProfile = mongoose.Schema({
    username: String,
    password: String,
    idcentro: String
});

module.exports = mongoose.model('User', userProfile); //terceiro parametro salva na colecao desejada