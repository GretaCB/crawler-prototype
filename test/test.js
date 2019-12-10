const request = require("supertest");
const assert = require('assert');
const app = require("../app.js");

describe('GET /', function() {
  it('responds with expected string', function(done) {
    request(app)
      .get('/')
      .expect('Welcome to the Crawler service...')
      .expect(200, done);
  });
});

describe('POST /', function() {
  it('responds with expected json', function(done) {
  	const expectedurl = 'http://carolbhansen.com'

    request(app)
      .post('/')
      .send({seedurl: expectedurl, levels: 4})
      .set('Accept', 'application/json')
      .expect(200)
      .then(res => {
      	assert.equal(res.body.seedurl, expectedurl);
      	assert.equal(res.body.status, 'pending');
      	assert.notStrictEqual(res.body.id, undefined);
      	persistedid = res.body.id;
      	done();
      });
  });
});