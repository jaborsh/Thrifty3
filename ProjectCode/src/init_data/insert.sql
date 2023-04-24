INSERT INTO pickup_locations (building_name, num_listings)
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
('test','user@colorado.edu','$2a$10$XCkduQFonDLAQ6M/d1kQeOY.dVlvCCk/g/zHjYSX079ghOv6o7KcS','1111111111111111','Y');

INSERT INTO items (name, user_ID, category_ID, color, size) VALUES
('test shirt', 1, 1, 'red', 'M'),
('test pants', 1, 2, 'blue', 'L'),
('test hat', 1, 3, 'black', 'S'),
('test hoodie', 1, 4, 'white', 'M'),
('test jacket', 1, 6, 'green', 'L'),
('test shorts', 1, 7, 'yellow', 'S'),
('test backpack', 1, 8, 'orange', 'M');