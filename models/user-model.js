var mongoose = require('mongoose');

//User Schema
var userProfile = mongoose.Schema({
    username:   String,
    password:   String,
    idcentro:   String,
    email:      String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

module.exports = mongoose.model('User', userProfile); //terceiro parametro salva na colecao desejada