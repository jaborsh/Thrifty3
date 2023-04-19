// Imports the index.js file to be tested.
const server = require('../index.js'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

/*
describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  }); */

  // ===========================================================================
  // TO-DO: Part A Login unit test case


/*  With current login route, Login Positive test cases will FAIL
    because 'user' row in DB does not have an encrypted password;
    /login route decrypts password after querying, which 'pass' isn't encrypted,
    so we will always get a 'fail' message
    [const match = await bcrypt.compare(req.body.password, user.password);] <<
*/

/*
describe('Registration', () => {
    it('Test successful registration.', done => {
      chai
        .request(server)
        .post('/register')
        .send({ username: 'test', password: 'password', email: 'test@email.com', card_no: '1234567890123456', is_paid: 'Y' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirectTo('/login');
          done();
        });
    });
}); */

describe('Login Positive', () => {
    it('Login Positive', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'test', password: 'password' })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.redirectTo('http://127.0.0.1:3000/home');
          done();
        });
    });
});

describe('Login Negative', () => {
    it('Login Negative', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'test', password: 'wrong' })
        .end((err, res) => {
          expect(res.body.status).to.equals('fail');
          done();
        });
    });
});