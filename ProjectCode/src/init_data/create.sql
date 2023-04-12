CREATE TABLE IF NOT EXISTS item_category (
  category_id SERIAL NOT NULL,
  name VARCHAR(255) NOT NULL,
  base_price DECIMAL(2),
  PRIMARY KEY (category_id)
);

-- -----------------------------------------------------
-- Table preferences
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS preferences (
  preference_ID SERIAL NOT NULL,
  major VARCHAR(45) NOT NULL,
  gender CHAR(1) NOT NULL,
  category_ID VARCHAR(45) NOT NULL,
  size VARCHAR(5),
  PRIMARY KEY (preference_ID),
  FOREIGN KEY (category_ID) REFERENCES item_category (category_ID)
);


-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_ID SERIAL NOT NULL,
  username VARCHAR(16) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(32) NOT NULL,
  first_name VARCHAR(45),
  last_name VARCHAR(45),
  gender CHAR(1),
  major VARCHAR(45),
  size_preference VARCHAR(5),
  card_no CHAR(16) NOT NULL,
  member_since DATE NOT NULL DEFAULT CURRENT_DATE,
  is_paid BINARY(1) NOT NULL CONSTRAINT is_paid CHECK (is_paid in ('Y','N')),
  preference_ID INT,
  PRIMARY KEY (user_ID),
  FOREIGN KEY (preference_ID) REFERENCES preferences (preference_ID)
);
-- -----------------------------------------------------
-- Table item_images
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS item_images (
  images_ID SERIAL NOT NULL,
  url VARCHAR(255) NOT NULL,
  item_ID INT NOT NULL,
  PRIMARY KEY (images_ID),
  FOREIGN KEY (item_ID) REFERENCES items (item_ID) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table items
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
  item_ID SERIAL NOT NULL,
  name VARCHAR(255) NOT NULL,
  user_ID INT,
  category_ID INT NOT NULL,
  color VARCHAR(45),
  size VARCHAR(5),
  images_id INT NOT NULL,
  PRIMARY KEY (item_ID),
  FOREIGN KEY (user_ID) REFERENCES users (username),
  FOREIGN KEY (category_ID) REFERENCES item_category (category_id),
  FOREIGN KEY (images_id) REFERENCES item_images (images_ID)
);
-- -----------------------------------------------------
-- Table pickup_location
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pickup_location (
  location_id INT NOT NULL,
  building_name VARCHAR(45) NOT NULL,
  num_listings INT,
  PRIMARY KEY (location_id)
 );

-- -----------------------------------------------------
-- Table listings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  listing_ID SERIAL NOT NULL,
  item_ID INT NOT NULL,
  price DECIMAL(2) NOT NULL,
  is_sale CHAR(1) NOT NULL DEFAULT 'N' CONSTRAINT is_sale CHECK (is_sale in ('Y','N')),
  date_listed DATE NOT NULL DEFAULT CURRENT_DATE,
  location_ID INT NOT NULL,
  description VARCHAR(255),
  PRIMARY KEY (listing_ID),
  FOREIGN KEY (item_ID) REFERENCES items (item_ID) ON DELETE CASCADE,
  FOREIGN KEY (location_ID) REFERENCES pickup_location (location_id) ON DELETE CASCADE
);