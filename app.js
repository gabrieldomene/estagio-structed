var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var passport = require('passport');
const mongoose = require('mongoose');

var options = require("./config/keys").mongoURI;

//Mongo connection
mongoose.connect(options, {useNewUrlParser:true});

//Auth package
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var usersRouter = require('./routes/users');
var routers = require('./routes/routes')

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
//Express Session
app.use(session({
    secret: 'AD7FDDE3E0B292D1A9C595138823E59E',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 86400000 }
  }));
//Passport authentication
app.use(passport.initialize());
app.use(passport.session());

// app.use('/', indexRouter);
app.use('/', routers);


module.exports = app;