// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
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

app.get('/register', (req, res) => {
  res.render('pages/register');
});

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  const query = 'insert into users (username, password, email, first_name, last_name) values ($1, $2, $3, $4, $5) returning *;';
  db.any(query, [req.body.username, hash, req.body.email, req.body.first_name, req.body.last_name])
  .then(function(data) {
      res.redirect('/login');
  })
  .catch(function(err) {
      res.redirect('/register');
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post("/login", async (req, res) => {
  const username = req.body.username;
  // const password = req.body.password;
  const query = "select * from users where users.username = $1";
  const values = [username];

  db.one(query, values)
    .then((user) => {
      // check if password from request matches with password in DB
      const match = bcrypt.compare(req.body.password, user.password);

      if(match)
      {
          req.session.user = user;
          req.session.save();
          res.json({status: 'success', message: "Logged in"});
    
          res.redirect("/home");
      } else {
          res.json({status: 'fail', message: "Incorrect username or password"});
          throw new Error('Incorrect username or password');
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
    console.log('listening on port 3000');
  });