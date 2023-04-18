// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
require('dotenv').config();

// *****************************************************
// <!-- Connect to DB -->
// *****************************************************


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

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
  
// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);
  
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- API Routes -->
// *****************************************************

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
      res.redirect('/login');
  })
  .catch(function(err) {
      res.redirect('/register');
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login')
});

// Login submission
// Rewrite logic to handle non-existent username.
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const query = `select * from users where username = '${username}';`;

  db.one(query)
    .then(async (user) => {
      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) {
        return res.json({
          status: "fail",
          message: "Invalid username or password",
        });
      }

      req.session.user = user;
      req.session.save();
      res.redirect("/home");
    })
});

// Catalog
app.get('/catalog', (req, res) => {
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID;`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {items: data});
    })
});

app.get('/search', (req, res) => {
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID
  WHERE items.name ILIKE '%${req.query.query}%' OR item_category.name ILIKE '%${req.query.query}%';`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {items: data});
    })
});

// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000, () => {
    console.log('listening on port 3000');
  });