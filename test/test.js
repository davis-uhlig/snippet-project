
const models = require('../models');
const app = require('../server');
const assert  = require('assert');
const request = require('supertest');

let Snippet;
let User;
before("Setup test Database", function(done) {
  let newSnippet = {
    title: "Node Boilerplate",
    body: "this is the body",
    notes: "notes",
    language: "javascript",
    tags: ["node"],
    userId: 1
  };

  // let newUser = {
  //   username: "duhlig",
  //   password: "password",
  //   id: 1
  // }

  // models.users.create(newUser).then(function(user){
  //   User = user;
  //   done();
  // })

  models.snippets.create(newSnippet).then( function(snippet) {
    Snippet = snippet;
    console.log(Snippet);
    done();
  });
});

after("Destroy test Database", function(done) {
  models.snippets.destroy({
    where: {}
  }).then(function() {
    done();
  });
});

describe("GET /home", function() {
  it("can be retrieved", function(done) {
    request(app)
      .get('/home')
      .expect(200)
      // .expect("Content-Type", "application/json; charset=utf-8")
      .expect( function(res) {
        assert(res)

      })
      .end( function(err, res) {
        if(err) {
          done(err)
        } else {
          done();
        }
      });
  });
});
