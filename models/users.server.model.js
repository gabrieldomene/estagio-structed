var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = function(){
    var User = new Schema({
        username: String,
        password: String
    });
    return mongoose.model('User', User);
}
