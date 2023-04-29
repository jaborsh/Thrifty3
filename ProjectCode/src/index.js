// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
// const cloudinary = require('cloudinary').v2; //Image uploading
// npm install cloudinary somewhere in package
require('dotenv').config();

// Cloudinary Configuration 
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });
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

// User JSON for user session
const curr_user = {
  user_ID: undefined,
  username: undefined,
  email: undefined,
  first_name: undefined,
  last_name: undefined,
  gender: undefined,
  major: undefined,
  size_preference: undefined,
  card_no: undefined,
  member_since: undefined,
  is_paid: undefined,
  preference_ID: undefined,
  cart: []
};

app.get('/', (req, res) => {
  res.redirect('/login'); //redirect to /login endpoint
});

app.get('/register', (req, res) => {
  res.render('pages/register', {user: curr_user})
});

// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into 'users' table
  const query = 'insert into users (username, email, password, first_name, last_name, card_no, is_paid) values ($1, $2, $3, $4, $5, $6, $7) returning *;';
  db.any(query, [req.body.username, req.body.email, hash, req.body.first_name, req.body.last_name, req.body.card_no, 'Y'])
  .then(function(data) {
      res.redirect('/login');
  })
  .catch(function(err) {
    res.render('pages/register', {message: 'Invalid information', error: true, user: curr_user});
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login', {user: curr_user})
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
        res.render('pages/login', {message: 'Incorrect username or password', error: true, user: curr_user});
      } else{
        // Update session user to queried user

        curr_user.user_ID = user.user_id;
        curr_user.username = user.username;
        curr_user.email = user.email;
        curr_user.first_name = user.first_name;
        curr_user.last_name = user.last_name;
        curr_user.gender = user.gender;
        curr_user.major = user.major;
        curr_user.size_preference = user.size_preference;
        curr_user.card_no = user.card_no;
        curr_user.member_since = user.member_since;
        curr_user.is_paid = user.is_paid;
        curr_user.preference_ID = user.preference_id;

        req.session.user = curr_user;
        req.session.save();
        res.redirect("/catalog");
      }
      
    })
    .catch(function(err) {
      res.render('pages/login', {message: 'Incorrect username or password', error: true, user: curr_user});
    });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/login', {user: null});
});

// Profile
app.get('/profile', (req, res) => {
  res.render('pages/profile', {user: curr_user});
});

app.get('/profile_changes', (req, res) => {
  res.render('pages/profile_changes', {user: curr_user})
});

// Edit account info on profile page
app.post('/profile_changes', async (req, res) => {
  const query = 'UPDATE users SET major = $1, gender = $2, size_preference = $3 WHERE user_ID = $4 returning major, gender, size_preference;';
  await db.any(query, [req.body.major, req.body.gender, req.body.size, curr_user.user_ID])
  .then(function(user) {
    // Update session user to queried user
    curr_user.gender = req.body.gender;
    curr_user.major = req.body.major
    curr_user.size_preference = req.body.size;

    res.redirect('/profile')
  })
  .catch(function(err) {
   res.render('pages/profile_changes', {message: 'Invalid information', error: true, user: curr_user});
  });
});

// Catalog
app.get('/catalog', (req, res) => {
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID;`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {user: curr_user, items: data});
    })
});

app.get('/locations', (req, res) => {
  
  const query = `
    SELECT * FROM pickup_location;
  `;
  db.any(query)
    .then(data => {
      res.render('pages/location', {user: curr_user, pickup_location: data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error occurred while retrieving locations from DB');
    });
});

app.get('/search', (req, res) => {
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID
  WHERE items.name ILIKE '%${req.query.query}%' OR item_category.name ILIKE '%${req.query.query}%';`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {user: curr_user, items: data});
    })
});

app.get('/filter', (req, res) => {
  /* Create query to filter by category:
   - If category is 'all', then return all items
   - Else, return items with category = category
   - If query is empty, then return all items */

  if (req.query.category === 'all') {
    res.redirect('/catalog');
  }

  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID
  WHERE item_category.name = '${req.query.category}';`;

  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {user: curr_user, items: data});
    })
});

// Donate
app.get('/donate', (req, res) => {
  // const user_listings_query = ' SELECT * FROM listings WHERE item_ID = \
  //                                 (SELECT item_ID FROM items WHERE user_ID = $1)';
  const user_listings_query = 
    'SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON listings.item_ID = items.item_ID \
    LEFT JOIN users \
    ON items.user_ID = users.user_ID \
    WHERE users.user_ID = $1;'
  db.any(user_listings_query, [curr_user.user_ID])
    .then((user_listings) => {
      res.render('pages/donate', {
        user: curr_user,
        user_listings, // JSON for all current user's listings from query
      });
    })
    .catch((err) => {
      res.render("pages/donate", {
        user: curr_user,
        user_listings: [],
        error: true,
        message: err.message,
      });
    });
});

//Donate post (WIP)
app.post('/donate', async (req, res) => {
  const category_ID_query = 'SELECT * FROM item_category WHERE name = $1';
  const img_files = req.body.files; // Images for upload
  var listed_item; // Listed item information
  var cat_ID; // Category information
  var cat_price;
  
  //translate dropdown category name to category_ID for insertion
  await db.any(category_ID_query, [req.body.category])
    .then(cat => {
      console.log(cat);
      cat_ID = cat[0].category_id; // get category id, base_price from query
      cat_price = cat[0].base_price;
    })
    .catch(function(err) {
      console.log(err);
      cat_info = {category_id: 1, base_price: 5.00}; //if category info not found, default to "Shirts", $5.00 (temporary)
    });
  
  //Insert item into items table
  console.log("=====cat_id", cat_ID);
  const query_items = 'insert into items (name, user_ID, category_ID, color, size) values ($1, $2, $3, $4, $5) returning *;';
  await db.any(query_items, [req.body.title, curr_user.user_ID, cat_ID, req.body.color, req.body.size])
  .then(function(data) {
      //res.json({status: 200, message: "Item Added"});
      console.log(data);
      listed_item = data[0].item_id;
  })
  .catch(function(err) {
    console.log(err);
    //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
    res.redirect('/donate');
  });
  
  //TODO: Create new listing based on item details
  const query_listings = 'insert into listings (item_ID, price, location_ID, description) values ($1, $2, $3, $4) returning *;';
  await db.any(query_listings, [listed_item, cat_price, 1, req.body.desc])
  .then(function(data) {
      //res.json({status: 200, message: "Item Added"});
      console.log(data);
      res.redirect('/donate');
  })
  .catch(function(err) {
    console.log(err);
    //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
    res.redirect('/donate');
  });
  
  // // Images query, cloudinary upload
  // i_url = cloudinary.uploader.upload
  // const image_query = 'insert into item_images (url,item_ID) values ($1, $2) returning *;';
  // await db.any(image_query, [i_url, listed_item])
  // .then(function(data) {
  //     //res.json({status: 200, message: "Image Added"});
  //     console.log(data);
  //     res.redirect('/donate');
  // })
  // .catch(function(err) {
  //   console.log(err);
  //   //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
  //   res.redirect('/donate');
  // });

});

app.get('/listings/:id', (req, res) => {
  
  const l_query = 
    'SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON listings.item_ID = items.item_ID \
    LEFT JOIN pickup_location \
    ON listings.location_ID = pickup_location.location_ID \
    WHERE items.item_id = $1;';
  const cat_query = 
    'SELECT item_category.name AS name, base_price \
    FROM item_category \
    LEFT JOIN items \
    ON items.category_ID = item_category.category_ID \
    WHERE items.item_ID = $1;';
  // TO DO: Implement images (db.any)
  // const img_query = 
  //   'SELECT * from item_images \
  //     WHERE item_ID = $1;';
  const test_image = new Array(
    {url: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/true-classic-tees-lead-1656346905.jpg'},
    {url: 'https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/6849354/2022/2/9/cc41bfc1-55f8-47df-a705-d5a05b286a871644388786288-Roadster-Men-Blue--Beige-Regular-Fit-Checked-Casual-Shirt-88-1.jpg'},
    {url: 'https://cdn.shopify.com/s/files/1/1414/2498/products/ClassicShirt_FrenchBlue8_1024x1024.jpg?v=1667207840'}
    ); //test
  var images;
  var cat;
  
  db.one(cat_query, [req.params.id])
    .then((c) => {
      cat = c;
    });
  
  db.one(l_query, [req.params.id])
    .then((l) => {
      res.render('pages/listings', {
        user: curr_user,
        listing: l, // JSON for all cols in query
        images: test_image,
        cat //JSON for category info
      });
    })
});
app.post('/listings/:id', async (req, res) => {
  const query = 'SELECT * FROM listings WHERE listing_ID = $1';
  db.one(query, [req.params.id])
    .then((i) => {
      curr_user.cart.push(i);
      console.log(curr_user);
      res.redirect(`/listings/${i.item_id}`);
    });
});
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000, () => {
    console.log('listening on port 3000');
  });