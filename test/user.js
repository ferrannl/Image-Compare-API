const request = require('supertest');
const expect = require('chai').expect;
const should = require('chai').should();
const app = require('../app');
const targets = require('../routes/targets');
const fs = require('fs');
const path = require("path");
const UserModel = require("../model/user");
const SubmissionModel = require("../model/submission");
const faker = require('faker');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA2ZjQwZWFhMDc3MWIyZjY4ZDFkZTgzIiwiZW1haWwiOiJhZG1pblVzZXJAdXNlci5ubCIsInJvbGUiOnsiX2lkIjoiNjA2ZjQwZTlhMDc3MWIyZjY4ZDFkZTgxIiwibmFtZSI6ImFkbWluIiwiX192IjowfX0sImlhdCI6MTYxNzkwNjk5OX0.VmuDs6aQVJQgEyLKomYzafUfu_q4rJzJGu7McH4jrc4"

function makeRequest(route, statusCode, done) {
  request(app)
    .get(route)
    .expect(statusCode)
    .set('x-access-token', authToken)
    .end(function (err, res) {
      if (err) { return done(err); }
      done(null, res);
    });
};

describe('POST: /signup route to insert new user', async () => {
  it('valid data', (done) => { 
    request(app).post('/signup')
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch((err) => done(err))
  })
});

describe("GET /users", async function () {
  describe('with limit param', async function () {
    it('should return all users with a limit of items per page', async function (done) {
      const url = '/users?limit=2';
      makeRequest(url, 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body).to.have.property('users');
        expect(res.body).to.have.property('limit');
        expect(res.body.limit).to.not.be.undefined;
        expect(res.body.limit).to.equal('2');
        done();
      });
    });
  });
});

describe("GET /users", async function () {
  describe('with id param', async function () {
    it('should return a single user', async function (done) {
      const user = await UserModel.findOne();
      const url = '/users/' + user._id;
      makeRequest(url, 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body).to.have.property('email');
        expect(res.body.email).to.not.be.undefined;
        done();
      });
    });
  });
});
