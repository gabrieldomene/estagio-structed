var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
var passport = require('passport');
var mongoose = require('mongoose');

//Connection to mlab
/* const db = require('./config/keys').mongoURI;

mongoose
    .connect(db, {useNewUrlParser:true})
    .then(() => console.log('Mongo connected'))
    .catch(err => console.log(err)); */

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: [
        __dirname + '/views/partials',
    ]
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.disable('x-powered-by');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/', indexRouter);
app.use('/', usersRouter);

module.exports = app;