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
app.use(express.static('resources'))
  
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
// Array of category/item images for image cells
const IMGURLREF = [
  // Shirts
  [
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/true-classic-tees-lead-1656346905.jpg',
    'https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/6849354/2022/2/9/cc41bfc1-55f8-47df-a705-d5a05b286a871644388786288-Roadster-Men-Blue--Beige-Regular-Fit-Checked-Casual-Shirt-88-1.jpg'
  ],
  // Pants
  [
    'https://www.commencalusa.com/Files/106799/Img/23/T21PANTBK-_2000.jpg',
    'https://cdn.shopify.com/s/files/1/0786/5725/products/4x3shots_advp2.jpg?v=1655907567',
    'https://cdn.shopify.com/s/files/1/0786/5725/products/4x3shots_advp1_grande.jpg?v=1655907567'
  ],
  // Hats
  [
    'https://www.ikea.com/us/en/images/products/knorva-hat-blue__0812162_pe771942_s5.jpg',
    'https://i.ebayimg.com/images/g/UxcAAOSwqohiFdRe/s-l500.jpg',
    'https://cdn.shopify.com/s/files/1/0053/6422/0019/products/PIKEA_Bucket_Hat.jpg?v=1625575428'
  ],
  // Hoodies
  [
    'https://image1.superdry.com/static/images/optimised/upload9223368955666204882.jpg',
    'https://media.very.co.uk/i/very/VDZ1F_SQ1_0000000004_BLACK_MDf/superdry-code-surplus-overhead-hoodie-black.jpg?$180x240_retinamobilex2$&fmt=webp',
    'https://cms.brnstc.de/product_images/287x393/cpro/media/images/product/23/2/100143840213000_0_1675854011647.jpg'
  ],  
  // Jackets
  [  
    'https://cdn.shopify.com/s/files/1/0419/1525/products/1024x1024-Men-Jacket-Roadster-BlackCoffee-102221-1.jpg?v=1635196923',
    'https://thejacketmaker-images.s3.amazonaws.com/Men-Leather-Jackets-1582970628214.webp',
    'https://assets.overland.com/is/image/overlandsheepskin/23701-is-dkbr?wid=500'
  ],  
  // Shorts
  [
    'https://img.hollisterco.com/is/image/anf/hco_2023_JanWk4_D_FitGuide_Womens_Shorts_R_RelaxedDenim.jpg',
    'https://s7d2.scene7.com/is/image/aeo/0332_7347_857_of?$cat-main_large$',
    'https://s7d2.scene7.com/is/image/aeo/0332_7337_482_ob?$cat-main_large$'
  ],
  // Backpacks
  [
    'https://media.wired.com/photos/5b72139a4177c301e3b9b193/master/w_1280,c_limit/Jansport_05.jpg',
    'https://cdn.shopify.com/s/files/1/0290/1078/8436/products/JS00TYP7OR7.F_800x.jpg?v=1610621240',
    'https://i.ebayimg.com/images/g/LM0AAOSwvkVhUSvc/s-l500.jpg'
  ]  
];

// *****************************************************
// <!-- API Routes -->
// *****************************************************

app.get('/', (req, res) => {
  res.redirect('/login'); //redirect to /login endpoint
});

app.get('/register', (req, res) => {
  res.render('pages/register', {user: curr_user})
});

app.get('/men', (req, res) => {
  res.render('pages/men', {user: curr_user})
});

app.get('/women', (req, res) => {
  res.render('pages/women', {user: curr_user})
});

app.use(express.static('resourses/img'))

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
  // Destroy curr_user global
  curr_user.user_ID = undefined;
      curr_user.username = undefined;
      curr_user.email = undefined;
      curr_user.first_name = undefined;
      curr_user.last_name = undefined;
      curr_user.gender = undefined;
      curr_user.major = undefined;
      curr_user.size_preference = undefined;
      curr_user.card_no = undefined;
      curr_user.member_since = undefined;
      curr_user.is_paid = undefined;
      curr_user.preference_ID = undefined;
      curr_user.cart = [];
  res.render('pages/login', {
    user: null, err: false, message: 'Successfully logged out.'
  });
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
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price, item_category.category_ID
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID;`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {
        user: curr_user, 
        items: data,
        imgs: IMGURLREF
      });
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
app.get('/locations/:id', (req, res) => {
  const arr = [
    {
      url: 'https://www.bouldercountyarts.org/sites/default/files/venues/umc_exterior_and_fountain.jpg',
      desc: 'As the heart of campus, the UMC supports students\' academic success by providing opportunities for student involvement, leadership development and entertainment in a welcoming and inclusive environment.'
    },
    {
      url: 'https://www.colorado.edu/even/sites/default/files/styles/hero/public/page/engineering_building_hero.png?itok=OtbQcimY',
      desc: 'The CU Boulder Engineering Center hosts the EVEN undergraduate program.'
    },
    {
      url: 'https://connections.cu.edu/sites/default/files/wp-content/uploads/2014/01/ucb-bldg.jpg',
      desc: 'The C4C building and offers an exciting fusion of community and cultural dining experiences. It features 8 micro restaurants, a build your own salad bar and a dessert station for a variety of globally inspired cuisine.'
    },
    {
      url: 'https://media.crej.com/wp-content/uploads/2016/11/20105338/curec.jpg',
      desc: 'The Rec offers over 300,000 square feet of recreation activity space. Come and explore the opportunities that await you!'
    },
    {
      url: 'https://www.colorado.edu/theherd/sites/default/files/styles/small/public/collection-image/farrand_field.2.jpg?itok=UWpNfklq',
      desc: 'Farrand Field is the perfect place to lounge, have a snowball fight and play some Frisbee.'
    },
  ];
  const query = `
    SELECT * FROM pickup_location WHERE location_ID = $1;
  `;
  db.any(query, [req.params.id])
    .then(data => {
      res.render('pages/location_single', {lArr: arr, user: curr_user, pickup_location: data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error occurred while retrieving locations from DB');
    });
});

app.get('/search', (req, res) => {
  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price, item_category.category_ID
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID
  WHERE items.name ILIKE '%${req.query.query}%' OR item_category.name ILIKE '%${req.query.query}%';`;
  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {
        user: curr_user, 
        items: data,
        imgs: IMGURLREF
      });
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

  const query = `SELECT items.item_ID, items.name, item_category.name AS category, item_category.base_price, item_category.category_ID
  FROM items
  INNER JOIN item_category ON items.category_ID = item_category.category_ID
  WHERE item_category.name = '${req.query.category}';`;

  db.any(query)
    .then(function(data) {
      res.render('pages/catalog', {
        user: curr_user, 
        items: data,
        imgs: IMGURLREF
      });
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
        imgs: IMGURLREF
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
      //console.log(cat);
      cat_ID = cat[0].category_id; // get category id, base_price from query
      cat_price = cat[0].base_price;
    })
    .catch(function(err) {
      console.log(err);
      cat_info = {category_id: 1, base_price: 5.00}; //if category info not found, default to "Shirts", $5.00 (temporary)
    });
  
  //Insert item into items table
  const query_items = 'insert into items (name, user_ID, category_ID, color, size) values ($1, $2, $3, $4, $5) returning *;';
  await db.any(query_items, [req.body.title, curr_user.user_ID, cat_ID, req.body.color, req.body.size])
  .then(function(data) {
      //res.json({status: 200, message: "Item Added"});
      console.log('===item data//', data);
      listed_item = data[0].item_id;
  })
  .catch(function(err) {
    console.log(err);
    //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
    res.redirect('/donate');
  });
  
  //Create new listing based on item details
  const query_listings = 'insert into listings (item_ID, price, location_ID, description) values ($1, $2, $3, $4) returning *;';
  await db.any(query_listings, [listed_item, cat_price, req.body.location, req.body.desc])
  .then(function(data) {
      console.log('===listing data//', data);
  })
  .catch(function(err) {
    console.log(err);
    //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
    res.redirect('/donate');
  });
  
  // Update location to display listing
  const update_loc_query = 
    ' UPDATE pickup_location \
      SET num_listings = num_listings + 1 \
      WHERE location_ID = $1 \
      RETURNING *;';
  await db.one(update_loc_query, [req.body.location])
  .then(function(data) {
      console.log('===update data//', data);
      res.redirect('/donate');
  })
  .catch(function(err) {
    console.log(err);
    //res.json({status: 400, message: "Invalid listing. Make sure all required fields are valid."});
    res.redirect('/donate');
  });
});

app.get('/listings/:id', async (req, res) => {
  
  const l_query = 
    'SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON listings.item_ID = items.item_ID \
    LEFT JOIN pickup_location \
    ON listings.location_ID = pickup_location.location_ID \
    WHERE items.item_id = $1;';
  const cat_query = 
    'SELECT item_category.name AS name, base_price, item_category.category_ID \
    FROM item_category \
    LEFT JOIN items \
    ON items.category_ID = item_category.category_ID \
    WHERE items.item_ID = $1;';
  var cat;
  
  await db.one(cat_query, [req.params.id])
    .then((c) => {
      cat = c;
    });
  
  await db.one(l_query, [req.params.id])
    .then((l) => {
      res.render('pages/listings', {
        user: curr_user,
        listing: l, // JSON for all cols in query
        images: IMGURLREF[(cat.category_id)-1],
        cat //JSON for category info
      });
    })
});
app.post('/listings/:id', async (req, res) => {
  const query = 
    'SELECT *  \
    FROM listings \
    LEFT JOIN items \
    ON items.item_ID = listings.item_ID \
    WHERE listing_ID = $1';
  db.one(query, [req.params.id])
    .then((i) => {
      curr_user.cart.push(i);
      res.redirect(`/listings/${i.item_id}`);
    });
});

app.get('/cart', (req, res) => {
  var query_delim = ''; //list of item IDs in session cart (as string; delim = ',')
  var curr_user_cart = [];
  for(let i = 0; i < curr_user.cart.length; i++) {
    curr_user_cart.push(curr_user.cart[i].item_id);
    query_delim = ','
  };
  const user_cart_query = 
    `SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON listings.item_ID = items.item_ID \
    WHERE \
    listings.item_ID IN (\
      -1\
      ${query_delim}\
      ${curr_user_cart.map(i=>Number(i))}\
      );`;
  db.any(user_cart_query)
    .then((user_cart) => {
      res.render('pages/cart', {
        user: curr_user,
        user_cart: curr_user.cart, // JSON for all current user's listings from query
        imgs: IMGURLREF
      });
    })
    .catch((err) => {
      res.render("pages/cart", {
        user: curr_user,
        user_cart: [],
        error: true,
        message: err.message,
      });
    });
});
app.get('/cart/remove/:id', (req, res) => {
  const query = 
  `SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON items.item_ID = listings.item_ID \
    WHERE listings.item_ID = $1`;
  db.one(query, [req.params.id])
  .then((item) => {
    console.log('item to remove = ', item.name);
    var index = curr_user.cart.findIndex(check => check.name==item.name);
    console.log('i==',index);
    if(index == 0 && curr_user.cart.length == 1){
      curr_user.cart = [];
    }
    else if (index >= 0){
      curr_user.cart.splice(index,1);
    }
    else{ // Not found in array
      // Do nothing
    }
    res.redirect('/cart');
  })
});

// Pay for whole cart
app.get('/payment', (req, res) => {
  res.render('pages/payment', {
    user: curr_user, 
    temp_cart: curr_user.cart,
    imgs: IMGURLREF
  });
});
// Pay for one item
app.get('/payment/:itemid', (req, res) => {
  const query = 
  `SELECT * \
    FROM listings \
    LEFT JOIN items \
    ON items.item_ID = listings.item_ID \
    WHERE listings.item_ID = $1`;
  db.one(query, [req.params.itemid])
    .then((item) => {
      console.log('item to temp cart = ', item.name);
      var index = curr_user.cart.findIndex(check => check.name==item.name);
      console.log('i==',index);
      res.render('pages/payment', {
        user: curr_user, 
        temp_cart: [curr_user.cart[index]],
        imgs: IMGURLREF
      });
  });
});

// function updateCart(ids){
//   console.log('ids in func = ',indexes);
//   var indexes = [];
//   ids.forEach(i => {
//     console.log('indexes = ',indexes);
//     var index = curr_user.cart.findIndex(
//       check => check.item_id == i
//     );
//     console.log('to push = ', index);
//     indexes.push(index);
//   });
//   indexes.forEach(i => {
//     if(i == 0 && curr_user.cart.length == 1){
//       curr_user.cart = [];
//     }
//     else if (i >= 0){
//       console.log('to splice = ', i);
//       curr_user.cart.splice(i,1);
//     }
//     else{ // Not found in array
//       // Do nothing
//     }
//   });
// }
app.post('/payment/confirm', (req, res) => {
  const list_of_ids = req.body.cart_ids; // list of ids from body (string)
  var ids_array = [];
  var query_delim = ''; //list of item IDs in session cart (as string; delim = ',')
  let temp_string = '';
  for(let i = 0; i < list_of_ids.length+1; i++) { //convert string numbers to actual array of numbers
    query_delim = ',';
    if(i == list_of_ids.length){
      ids_array.push(Number(temp_string)); //push last id to array
    }
    else if(list_of_ids[i] != ','){
      temp_string += list_of_ids[i];
    }
    else{
      ids_array.push(Number(temp_string));
      temp_string = '';
    }
  };
  const delete_query = 
    ` DELETE FROM items\
      WHERE item_id IN (
      -1
      ${query_delim} \
      ${ids_array.map(i=>Number(i))}) \
      returning *; \
      DELETE FROM listings\
      WHERE item_id IN (
        -1
        ${query_delim} \
        ${ids_array.map(i=>Number(i))}) \
      returning *;`;
  db.multi(delete_query)
    .then(function(data) {
        curr_user.cart = [];
        res.render('pages/cart', {
          user: curr_user,
          user_cart: curr_user.cart,
          imgs: IMGURLREF,
          err: false,
          message: 'Thank you for your purchase!'
        });
    })
    .catch(function(err) {
      res.redirect('/cart');
    });

});
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000, () => {
    console.log('listening on port 3000');
  });