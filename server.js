// require express and other modules
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    hbs = require('hbs'),
    mongoose = require('mongoose'),
    auth = require('./resources/auth');
    var port = process.env.PORT || 3000;

// require and load dotenv
require('dotenv').load();

// configure bodyParser (for receiving form data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static files from public folder
app.use(express.static(__dirname + '/public'));

// set view engine to hbs (handlebars)
app.set('view engine', 'hbs');

// connect to mongodb
mongoose.connect('mongodb://localhost/lol-synergy');
  process.on('exit', function() {mongoose.disconnect();
});

// require User and Post models
var Comp = require('./models/comp');
var User = require('./models/user');
var Champion = require('./models/champion');


//Api Routes
app.get('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user.populate('comps'));
  });
});

app.put('/api/me', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found.' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.send(user);
    });
  });
});

app.get('/api/champs', function (req, res) {
  Champion.find({}, function(err, champs) {
    err ? console.log('error', err) : res.send(champs);
  });
});

app.post('/api/comps', function(req,res){
  console.log('comp req', req.body);
  var comp = new Comp({
  c1: req.body.c1,
  c2: req.body.c2,
  c3: req.body.c3,
  c4: req.body.c4,
  c5: req.body.c5,
  // description: req.body.description
  });
  comp.save(function(err,result){
    if (err) {
        res.status(500).send({ message: err.message });
      }
      console.log("result",result);
      res.send(result);
    });
});

//Auth Routes
app.post('/auth/signup', function (req, res) {
  User.findOne({ email: req.body.email }, function (err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken.' });
    }
    var user = new User({
      displayName: req.body.displayName,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function (err, result) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.send({ token: auth.createJWT(result) });
    });
  });
});

app.post('/auth/login', function (req, res) {
  User.findOne({ email: req.body.email }, '+password', function (err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Invalid email or password.' });
    }
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid email or password.' });
      }
      res.send({ token: auth.createJWT(user) });
    });
  });
});


//Catch All Route
app.get(['/', '/signup', '/login', '/profile', '/comps', '/aram'], function (req, res) {
  res.render('index');
});


//Listening on localhost:9000
app.listen(port, function() {
  console.log('Listening on Localhost', port);
});
