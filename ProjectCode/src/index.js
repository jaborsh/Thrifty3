// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
require('dotenv').config();

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.set('view engine', 'ejs'); // set the view engine to EJS (So that pages can actually render)
app.use(bodyParser.json());
// /login route was not properly grabbing username from body. Below text fixes that
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Database connection details
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
// Connect to database using the above details
const db = pgp(dbConfig);

app.get('/', (req, res) => {
  res.redirect('/login'); //redirect to /login endpoint
});

app.get('/home', (req, res) => {
  res.render('pages/home') // Render home page
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  const query = 'insert into users (username, email, password, card_no, is_paid) values ($1, $2, $3, $4, $5) returning *;';
  db.any(query, [req.body.username, req.body.email, hash, req.body.card_no, 'Y'])
  .then(function(data) {
      res.json({status: 200, message: "Success"});
      //res.redirect('/login');
  })
  .catch(function(err) {
      res.redirect('/register');
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login')
});

// Login submission
/* ERROR ON LOGIN (using test_user): "TypeError: Cannot read properties of undefined (reading 'user')" */
app.post("/login", async (req, res) => {
  const username = req.body.username;
  console.log(req.body.username);
  const query = "select * from users where username = $1";
  const values = [username];

  db.one(query, values)
    .then(async (user) => {
      // check if password from request matches with password in DB
     const match = await bcrypt.compare(req.body.password, user.password);
      if(match)
      {
          //req.session.user = user; // Bug here
          //req.session.save();
          res.json({status: 200, message: "Success"});
    
          res.redirect("/home");
      } else {
        res.json({status: 401, message: "Fail"});
          //throw new Error('Incorrect username or password');
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

/* Added Session Logic */
// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000, () => {
    console.log('listening on port 3000');
  });