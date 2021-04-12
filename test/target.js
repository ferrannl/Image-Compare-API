const request = require('supertest');
const expect = require('chai').expect;
const should = require('chai').should();
const app = require('../app');
const targets = require('../routes/targets');
const fs = require('fs');
const path = require("path");
const TargetModel = require("../model/target");
const UserModel = require("../model/user");
const SubmissionModel = require("../model/submission");

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA3MzA1YzMwNGY2NWQ0MjEwYWYzMmYzIiwiZW1haWwiOiJhZG1pblVzZXJAdXNlci5ubCIsInJvbGUiOnsiX2lkIjoiNjA3MzA1YzEwNGY2NWQ0MjEwYWYzMmYxIiwibmFtZSI6ImFkbWluIiwiX192IjowfX0sImlhdCI6MTYxODE1MDkxMX0.LRWWOmOmxaWzgokCxNFfLHj0l7dRQ657iOQerRcpvWc"
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

function makePostRequest(url, req) {
  request(app)
    .post(url)
    .send({ req })
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      if (err) { return done(err); }
      done(null, res);
    });
}

// Create
describe('POST: /targets route to insert data', async () => {
  it('valid data', (done) => {        
    request(app).post('/targets')
      .set('x-access-token', authToken)
      .field("Content-Type", "multipart/form-data")
      .field("name", "testTarget")
      .field("lon", 12)
      .field("lat", 11)
      .field("radius", 69)
      .attach("image", "test/kitten.jpg")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch((err) => done(err))
  })
});

// update target 
describe('PUT: /targets route to update data', async () => {
  it('valid data', async (done) => {    
    const target = await TargetModel.findOne();
    const change = target.radius;
    const url = '/targets/' + target._id;
    request(app).put(url)
      .set('x-access-token', authToken)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({ radius: change + 1 })
      .then((res) => {
        expect(res.body.radius).to.equal(change + 1);
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch((err) => done(err))
  })
});

// createSubmission
describe('POST: /target id/submissions route to insert data', async () => {
  it('valid data', async (done) => { 
    const target = await TargetModel.findOne();
    const url = '/targets/' + target._id + '/submissions';
    request(app).post(url)
      .set('x-access-token', authToken)
      .field("Content-Type", "multipart/form-data")
      .attach("image", "test/kitten2.jpg")
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch((err) => done(err))
  })
});

//get all targets
describe("GET /targets", async function () {
  describe('without params', async function () {
    it('should return all targets', function (done) {
      makeRequest('/targets', 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body).to.have.property('targets');
        expect(res.body.targets).to.not.be.undefined;
        done();
      });
    });
  });
});

// get one target
describe("GET /target", async function () {
  describe('with id param', async function () {
    it('should return a single target', async function (done) {
      const target = await TargetModel.findOne();
      const url = '/targets/' + target._id;
      makeRequest(url, 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body).to.have.property('name');
        expect(res.body.name).to.not.be.undefined;
        done();
      });
    });
  });
});

// get all submissions of one target
describe("GET /target id/submissions", async function () {
  describe('with target id param', async function () {
    it('should return all submissions of a single target', async function (done) {
      const target = await TargetModel.findOne();
      const url = '/targets/' + target._id + '/submissions';
      makeRequest(url, 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body[0]).to.have.property('target');
        expect(res.body[0].target).to.not.be.undefined;
        expect(res.body[0]).to.have.property('user');
        expect(res.body[0].user).to.not.be.undefined;
        done();
      });
    });
  });
});

// get all targets with a limit
describe("GET /targets", async function () {
  describe('with limit param', async function () {
    it('should return all targets with a limit of items per page', async function (done) {
      const url = '/targets?limit=1';
      makeRequest(url, 200, function (err, res) {
        if (err) { return done(err); }
        expect(res.body).to.have.property('targets');
        expect(res.body.targets).to.not.be.undefined;
        expect(res.body.targets[0]).to.have.property('name');
        expect(res.body.targets[0].name).to.not.be.undefined;
        expect(res.body).to.have.property('limit');
        expect(res.body.limit).to.not.be.undefined;
        expect(res.body.limit).to.equal('1');
        done();
      });
    });
  });
});

// insert vote to target
describe('PUT: /targets/:id/vote to insert vote', async () => {
  it('valid data', async (done) => {
    const target = await TargetModel.findOne();
    const user = await UserModel.findOne();
    const url = '/targets/' + target._id + '/vote'
    request(app).put(url)
      .set('x-access-token', authToken)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        user: user,
        vote: 1,
      })
      .then((res) => {
        expect(res.statusCode).to.equal(200);
        done();
      })
      .catch((err) => done(err))
  })
});

// insert wrong vote to target
describe('PUT: /targets/:id/vote to insert vote', async () => {
  it('invalid data', async (done) => {
    const target = await TargetModel.findOne();
    const user = await UserModel.findOne();
    const url = '/targets/' + target._id + "/vote"
    request(app).put(url)
      .set('x-access-token', authToken)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        user: user,
        vote: 5,
      })
      .then((res) => {
        expect(res.statusCode).to.equal(500);
        done();
      })
      .catch((err) => done(err))
  })
});

// get nearby targets
describe('GET: /targets/nearby/lon/lat', async () => {
  it('invalid data', async (done) => {
    const user = await UserModel.findOne();
    let target = await TargetModel.create({ name: 'nick', photo: 'foto1', lon: 5.342345237731911, lat: 51.77390670776311, radius: 50, user: user._id });
    const url = '/targets/nearby/5.342345237731900/51.77390670776311'
    makeRequest(url, 200, function (err, res) {
      if (err) { return done(err); }
      expect(res.body).to.not.be.undefined
      expect(res.body[0]).to.have.property('submissions');
      expect(res.body[0].submissions).to.not.be.undefined;
      done();
    })
  })
});
