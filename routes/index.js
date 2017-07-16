const express = require('express');
const router  = express.Router();
const app = require('../server.js');
const crypto = require('crypto');
const models = require('../models')
let creators = [];

const getSnippet = function (req, res, next) {
  models.snippets.findById(req.params.snippetId).then(function(snippet){
    if(snippet) {
      req.snippet = snippet;
      console.log(req.snippet);
      next();
    } else {
      res.status(404).send("Not Found");
    }
  })
}

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

    // console.log('these are the iterations: ', data.iterations);
    var hash = crypto.pbkdf2Sync(data.attempt, data.salt, data.iterations, config.keylen, config.digest);
    var hashedPassword = hash.toString('base64');

    return data.password === hashedPassword;
}

router.get('/login', function(req, res) {
  res.render('index');
});

router.post('/login', function(req, res){
  req.checkBody('username', 'You must enter a username').notEmpty();
  req.checkBody('password', 'You must enter a password').notEmpty();

  req.getValidationResult().then(function(result){
  if(result.isEmpty()){
    models.users.findOne({
      where: {
        username: req.body.username
      }
    }).then(function(user){
      if (user){
        // console.log("we in there");
        let data = {
          password: user.password,
          salt: user.salt,
          attempt: req.body.password,
          iterations: user.iterations
        }
        // console.log('do we get here');
        if(isPasswordCorrect(data)) {
          req.session.username = user.username;
          req.session.userId = user.id;
          res.redirect('/home');
        } else {
          let noMatch = {
            message: "This username or password does not exist"
          }
          res.render('index', {noMatch: noMatch})
        }
    }
    })
  } else {
    const errors = result.mapped();

    res.render('index', {errors: errors})
  }

})
});

router.get('/signup', function(req, res){
  res.render('signup')
});

router.post('/signup', function(req, res){
  let userData = hashPassword(req.body.password);
  // console.log(userData.hash);
  // console.log(req.body.password);
  // console.log(userData);
  userData.username = req.body.username;

  models.users.create(userData).then(res.redirect('/login'));

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
        id: snippet.id

      }
      creators.push(snippetCreator);
      // console.log(creators);
    })

    res.render('home', {snippets: creators, username: req.session.username})
  })

})



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
    userId: req.session.userId
  }

  models.snippets.create(newSnippet).then(function(){
    res.redirect('/home');
  })
});

router.post('/home/:snippetId/delete', getSnippet, function(req, res){
  req.snippet.destroy().then(function() {
    res.redirect("/home");
  });
  // res.redirect('/:snippetId/snippet')
});

router.post('/snippet/:snippetId', getSnippet, function(req, res){
  console.log(req.params.snippetId);
  models.snippets.findOne({
    where: {
      id: req.params.snippetId
    },
    include: [{
      model: models.users,
      as: 'users'
    }]
  }).then(function(snippet){
    res.render('snippet', {snippet: snippet});
  })
});

// router.get('/snippets/javascript', function(req, res){
//   creators = [];
//   models.snippets.findAll({
//     where: {
//       language: "javascript"
//     },
//     include: [{
//       model: models.users,
//       as: 'users'
//     }]
//   }).then(function(snippets){
//     snippets.forEach(function(snippet){
//       snippetCreator = {
//         snippetUser: snippet.users.dataValues.username,
//         title: snippet.title,
//         body: snippet.body,
//         notes: snippet.notes,
//         language: snippet.language,
//         tags: snippet.tags,
//         stars: snippet.stars,
//         createdAt: snippet.createdAt,
//         id: snippet.id
//
//       }
//       creators.push(snippetCreator);
//     })
//     res.render('javascript-snippets', {snippets: creators})
//   })
// });

// router.get('/snippets/java', function(req, res){
//   creators = [];
//   models.snippets.findAll({
//     where: {
//       language: "java"
//     },
//     include: [{
//       model: models.users,
//       as: 'users'
//     }]
//   }).then(function(snippets){
//     snippets.forEach(function(snippet){
//       snippetCreator = {
//         snippetUser: snippet.users.dataValues.username,
//         title: snippet.title,
//         body: snippet.body,
//         notes: snippet.notes,
//         language: snippet.language,
//         tags: snippet.tags,
//         stars: snippet.stars,
//         createdAt: snippet.createdAt,
//         id: snippet.id
//
//       }
//       creators.push(snippetCreator);
//     })
//     res.render('java-snippets', {snippets: creators})
//   })
// })

// router.get('/snippets/ruby', function(req, res){
//   creators = [];
//   models.snippets.findAll({
//     where: {
//       language: "ruby"
//     },
//     include: [{
//       model: models.users,
//       as: 'users'
//     }]
//   }).then(function(snippets){
//     snippets.forEach(function(snippet){
//       snippetCreator = {
//         snippetUser: snippet.users.dataValues.username,
//         title: snippet.title,
//         body: snippet.body,
//         notes: snippet.notes,
//         language: snippet.language,
//         tags: snippet.tags,
//         stars: snippet.stars,
//         createdAt: snippet.createdAt,
//         id: snippet.id
//
//       }
//       creators.push(snippetCreator);
//     })
//     res.render('ruby-snippets', {snippets: creators})
//   })
// });

router.post('/language-search', function(req, res){
  creators = [];
  models.snippets.findAll({
    where: {
      language: req.body.language
    },
    include: [{
      model: models.users,
      as: 'users'
    }]
  }).then(function(snippets){
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
        id: snippet.id

      }
      creators.push(snippetCreator);
    })
    res.render('language-search', {snippets: creators})
  })
})

router.post('/tag-search', function(req, res){
  creators = [];
  console.log(creators);
  models.snippets.findAll({
    where: {
      tags: req.body.tag.split(" ")
    },
    include: [{
      model: models.users,
      as: 'users'
    }]
  }).then(function(snippets){
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
        id: snippet.id

      }
      creators.push(snippetCreator);
    })
    res.render('tag-search', {snippets: creators})
  })
})

// router.get('/snippet/:snippetId', getSnippet, function(req, res){
//   models.snippets.findOne({
//     where: {
//       id: req.params.snippetId
//     },
//     include: [{
//       model: models.users,
//       as: 'users'
//     }]
//   }).then(function(snippet){
//     res.render('snippet', {snippet: snippet});
//   })
//
// });



module.exports = router;
