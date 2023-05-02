INSERT INTO pickup_location (building_name, num_listings)
VALUES 
('UMC', 0), 
('Engineering Center', 0),
('C4C', 0),
('CU Rec Center', 0),
('Farrand Field', 0);

INSERT INTO item_category (name, base_price)
VALUES
('Shirts', 6.50), --1
('Pants', 8.00), -- 2
('Hats', 4.50), -- 3
('Hoodies', 10.00), --4
('Jackets', 10.00), --5
('Shorts', 7.00), --6
('Backpacks', 10.50); --7

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
('test jacket', 1, 5, 'green', 'L'),
('test shorts', 1, 6, 'yellow', 'S'),
('test backpack', 1, 7, 'orange', 'M');

INSERT INTO listings(item_ID,price,is_sale,location_ID,description) VALUES
(1,5,'Y',2,'This test shirt bussin'),
(2,7.50,'Y',2,'This test pants bussin'),
(3,4.50,'N',4,'This test hat bussin'),
(4,10.00,'N',3,'This test hoodie bussin'),
(5,5.00,'Y',5,'This test jacket bussin'),
(6,7.00,'N',1,'This test shorts bussin'),
(7,10.50,'N',1,'This test backpack bussin');