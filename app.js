var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
var passport = require('passport');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Connect to localhost
mongoose.connect('mongodb://localhost:27017/LCC');

//Connect to MongoLab sandbox...

/* mongoose.connect('mongodb://gabrieldomene:teste123@ds018248.mlab.com:18248/lcc'); */

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