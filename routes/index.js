const express = require('express');
const router  = express.Router();
const app = require('../server.js');
const crypto = require('crypto');
const models = require('../models')
let creators = [];

var config = {
    salt: function(length){
    return crypto.randomBytes(Math.ceil(32 * 3 / 4)).toString('base64').slice(0, length);
    },
    iterations: 20000,
    keylen: 512,
    digest: 'sha512'
};

function hashPassword(passwordinput){
    var salt = config.salt(32);
    var iterations = config.iterations;
    var hash = crypto.pbkdf2Sync(passwordinput, salt, iterations, config.keylen, config.digest); // Pass in password, salt, iterations, keylength, and algorithm (sha256 or sha512),.
    var hashedPassword = hash.toString('base64');

    return {salt: salt, password: hashedPassword, iterations: iterations};
}

// hashPassword('davis')

function isPasswordCorrect(data) {

    console.log('these are the iterations: ', data.iterations);
    var hash = crypto.pbkdf2Sync(data.attempt, data.password, data.salt, data.iterations, config.keylen, config.digest);
    var hashedPassword = hash.toString('base64');

    return data.password === hashedPassword;
}

router.get('/login', function(req, res) {
  res.render('index');
});

router.get('/home', function(req, res){
  creators = [];

  models.snippets.findAll({
    order: [['createdAt', 'DESC']],
    include: [{
      model: models.users,
      as: 'users'
    }]
  }).then(function(snippets){
    // console.log(snippets);
    snippets.forEach(function(snippet){
      snippetCreator = {
        snippetUser: snippet.users.dataValues.username,
        title: snippet.title,
        body: snippet.body,
        notes: snippet.notes,
        language: snippet.language,
        tags: snippet.tags,
        stars: snippet.stars,
        createdAt: snippet.createdAt,

      }
      creators.push(snippetCreator);
      console.log(creators);
    })
    res.render('home', {snippets: creators})
  })

})

router.post('/login', function(req, res){
  models.users.findOne({
    where: {
      username: req.body.username
    }
  }).then(function(user){
    // if (user){
      console.log("we in there");
      let data = {
        password: user.password,
        salt: user.salt,
        attempt: req.body.password,
        iterations: user.iterations
      }
      console.log('do we get here');
      if(isPasswordCorrect(data)) {
        console.log('do we get into check pw');
        res.redirect('/');
      }
  // }
  })
});

router.get('/signup', function(req, res){
  res.render('signup')
});

router.post('/signup', function(req, res){
  let userData = hashPassword(req.body.password);
  console.log(userData.hash);
  console.log(req.body.password);
  console.log(userData);
  userData.username = req.body.username;
  // let newperson = {
  //   username:req.body.username,
  //   password:userData
  // }
  // const userData = {
  //   username: req.body.username,
  //   password: ,
  //   // salt:
  // }
  models.users.create(userData).then(res.redirect('/login'));

});

router.get('/create-snippet', function(req, res){
  res.render('create-snippet')
})

router.post('/create-snippet', function(req, res){
  const newSnippet = {
    title: req.body.title,
    body: req.body.body,
    notes: req.body.notes,
    language: req.body.language,
    tags: req.body.tags.split(" "),
    userId: 1
  }

  models.snippets.create(newSnippet).then(function(){
    res.redirect('/home');
  })
});



module.exports = router;
