INSERT INTO pickup_location (building_name, num_listings)
VALUES 
('UMC', 0), 
('Engineering Center', 0),
('C4C', 0),
('CU Rec Center', 0),
('Farrand Field', 0);

INSERT INTO item_category (name, base_price)
VALUES
('Shirts', 6.50),
('Pants', 8.00),
('Hats', 4.50),
('Hoodies', 10.00),
('Hats', 4.50),
('Jackets', 10.00),
('Shorts', 7.00),
('Backpacks', 10.50);

INSERT INTO users 
  (username,
  email,
  password,
  card_no,
  is_paid)
VALUES
('user','user@colorado.edu','pass','1111111111111111','Y');