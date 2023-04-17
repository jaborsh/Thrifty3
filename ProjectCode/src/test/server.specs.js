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
describe('Server!', () => {
  //We are checking POST /add_user API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
  //Positive cases
  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({username: 'test_user', email: 'test_user@gmail.com', password: 'pass', card_no: '12345678910'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Success');
        done();
      });
  });
    it('Test successful login.', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'test_user', password: 'pass' })
        .end((err, res) => {
          //expect(err).to.be.null;
          //expect(res.body.status).to.equals('Success');
          expect(res).to.have.status(200);
          expect(res.body.message).to.equals('Success');
          //expect(res).to.redirectTo('/home');
          done();
        });
    });
    it('Test unsuccessful login.', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'test_user', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body.message).to.equals('Fail');
          done();
        });
    });
});