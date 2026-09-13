-- Affordable amenity-rich sample PGs.
-- Reuses existing pg_images URLs and canonical amenities.
START TRANSACTION;

INSERT IGNORE INTO pgs (pg_id, pg_name, property_type, gender_policy, is_active, data_status) VALUES
('PG024', 'Madhapur All-Inclusive Living', 'Co-Living', 'Unisex', 1, 'SAMPLE'),
('PG025', 'Gachibowli Comfort Homes', 'PG', 'Unisex', 1, 'SAMPLE'),
('PG026', 'Koramangala Value Stay', 'Co-Living', 'Unisex', 1, 'SAMPLE'),
('PG027', 'HSR Complete Comfort PG', 'PG', 'Female', 1, 'SAMPLE');

INSERT IGNORE INTO pg_locations (pg_id, address, area, city, state, pincode, latitude, longitude, data_status) VALUES
('PG024', 'Near Metro Station, Madhapur, Hyderabad', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4483, 78.3915, 'SAMPLE'),
('PG025', 'Near Financial District, Gachibowli, Hyderabad', 'Gachibowli', 'Hyderabad', 'Telangana', '500032', 17.4401, 78.3489, 'SAMPLE'),
('PG026', '5th Block, Koramangala, Bengaluru', 'Koramangala', 'Bangalore', 'Karnataka', '560034', 12.9352, 77.6245, 'SAMPLE'),
('PG027', 'Sector 2, HSR Layout, Bengaluru', 'HSR Layout', 'Bangalore', 'Karnataka', '560102', 12.9116, 77.6474, 'SAMPLE');

INSERT IGNORE INTO pg_prices (price_id, pg_id, room_type, sharing_type, monthly_rent, security_deposit, data_status, price_source) VALUES
('PR018', 'PG024', 'Standard Room', '3 Sharing', 8000, 8000, 'SAMPLE', 'Application sample data'),
('PR019', 'PG025', 'Standard Room', '2 Sharing', 10000, 10000, 'SAMPLE', 'Application sample data'),
('PR020', 'PG026', 'Standard Room', '3 Sharing', 9000, 9000, 'SAMPLE', 'Application sample data'),
('PR021', 'PG027', 'Standard Room', '2 Sharing', 11000, 11000, 'SAMPLE', 'Application sample data');

-- Give each new PG the full existing amenity catalog, so amenity filters have affordable matches.
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT CONCAT('S', RIGHT(p.pg_id, 3), LPAD(a.amenity_id, 2, '0')), p.pg_id, a.amenity_id, 'SAMPLE', 'Application sample data'
FROM pgs p CROSS JOIN amenities a WHERE p.pg_id IN ('PG024', 'PG025', 'PG026', 'PG027');

INSERT IGNORE INTO floors (floor_id, pg_id, floor_label, data_status) VALUES
(47, 'PG024', 'Ground Floor', 'SAMPLE'), (48, 'PG025', 'Ground Floor', 'SAMPLE'),
(49, 'PG026', 'Ground Floor', 'SAMPLE'), (50, 'PG027', 'Ground Floor', 'SAMPLE');

INSERT IGNORE INTO rooms (room_id, pg_id, floor_id, room_number, room_type, capacity, occupied_count, available_count, room_status, ac_type, bathroom_type, data_status) VALUES
('ROOM066', 'PG024', 47, '101', 'Standard', 3, 1, 2, 'Available', 'AC', 'Attached', 'SAMPLE'),
('ROOM067', 'PG025', 48, '201', 'Standard', 2, 1, 1, 'Available', 'AC', 'Attached', 'SAMPLE'),
('ROOM068', 'PG026', 49, '301', 'Standard', 3, 2, 1, 'Available', 'AC', 'Attached', 'SAMPLE'),
('ROOM069', 'PG027', 50, '401', 'Standard', 2, 1, 1, 'Available', 'AC', 'Attached', 'SAMPLE');

INSERT IGNORE INTO beds (bed_id, room_id, bed_number, bed_position, near_wall, near_window, near_door, current_status, data_status) VALUES
('BED0166', 'ROOM066', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0167', 'ROOM066', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'), ('BED0168', 'ROOM066', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0169', 'ROOM067', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0170', 'ROOM067', 'B2', 'Upper', 'No', 'No', 'Yes', 'Available', 'SAMPLE'),
('BED0171', 'ROOM068', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0172', 'ROOM068', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0173', 'ROOM068', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0174', 'ROOM069', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0175', 'ROOM069', 'B2', 'Upper', 'No', 'No', 'Yes', 'Available', 'SAMPLE');

-- PG024 is the reusable basic PG demonstration property.  Its price options
-- deliberately live on one PG record so search results select the requested
-- sharing/rent combination instead of duplicating the property.
UPDATE pgs
SET gender_policy = 'Female', data_status = 'SAMPLE'
WHERE pg_id = 'PG024';

UPDATE pg_prices
SET monthly_rent = 7000.00, security_deposit = 7000.00, room_type = 'Basic Room',
    data_status = 'SAMPLE', price_source = 'Affordable basic PG sample data'
WHERE price_id = 'PR018' AND pg_id = 'PG024' AND sharing_type = '3 Sharing';

INSERT IGNORE INTO pg_prices
  (price_id, pg_id, room_type, sharing_type, monthly_rent, security_deposit, data_status, price_source)
VALUES
  ('PR022', 'PG024', 'Basic Room', '4 Sharing', 7000.00, 7000.00, 'SAMPLE', 'Affordable basic PG sample data'),
  ('PR023', 'PG024', 'Basic Room', '5 Sharing', 6500.00, 6500.00, 'SAMPLE', 'Affordable basic PG sample data');

-- Matching room/bed inventory makes the sharing filters and bed visualisation
-- data-backed for all three basic price options.
INSERT IGNORE INTO rooms (room_id, pg_id, floor_id, room_number, room_type, capacity, occupied_count, available_count, room_status, ac_type, bathroom_type, data_status) VALUES
('ROOM070', 'PG024', 47, '102', 'Basic 4 Sharing', 4, 2, 2, 'Available', 'Non-AC', 'Common', 'SAMPLE'),
('ROOM071', 'PG024', 47, '103', 'Basic 5 Sharing', 5, 3, 2, 'Available', 'Non-AC', 'Common', 'SAMPLE');

INSERT IGNORE INTO beds (bed_id, room_id, bed_number, bed_position, near_wall, near_window, near_door, current_status, data_status) VALUES
('BED0176', 'ROOM070', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0177', 'ROOM070', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'),
('BED0178', 'ROOM070', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'), ('BED0179', 'ROOM070', 'B4', 'Upper', 'Yes', 'No', 'No', 'Available', 'SAMPLE'),
('BED0180', 'ROOM071', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0181', 'ROOM071', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'),
('BED0182', 'ROOM071', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Occupied', 'SAMPLE'), ('BED0183', 'ROOM071', 'B4', 'Upper', 'Yes', 'No', 'No', 'Available', 'SAMPLE'),
('BED0184', 'ROOM071', 'B5', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE');

-- Two existing Madhapur PGs are enriched as additional, distinct basic-PG
-- recommendations. No property records are duplicated: each adds a 4-sharing
-- price, room/bed inventory and amenity links to its existing PG record.
UPDATE pgs SET gender_policy = 'Female', data_status = 'SAMPLE' WHERE pg_id = 'PG017';

INSERT IGNORE INTO pg_prices
  (price_id, pg_id, room_type, sharing_type, monthly_rent, security_deposit, data_status, price_source)
VALUES
  ('PR024', 'PG004', 'Basic Room', '4 Sharing', 7000.00, 7000.00, 'SAMPLE', 'Affordable basic PG sample data'),
  ('PR025', 'PG017', 'Standard Room', '4 Sharing', 7500.00, 7500.00, 'SAMPLE', 'Affordable basic PG sample data');

INSERT IGNORE INTO floors (floor_id, pg_id, floor_label, data_status) VALUES
  (51, 'PG004', 'First Floor', 'SAMPLE'),
  (52, 'PG017', 'First Floor', 'SAMPLE');

INSERT IGNORE INTO rooms (room_id, pg_id, floor_id, room_number, room_type, capacity, occupied_count, available_count, room_status, ac_type, bathroom_type, data_status) VALUES
  ('ROOM072', 'PG004', 51, '204', 'Basic 4 Sharing', 4, 2, 2, 'Available', 'Non-AC', 'Common', 'SAMPLE'),
  ('ROOM073', 'PG017', 52, '104', 'Standard 4 Sharing', 4, 1, 3, 'Available', 'AC', 'Attached', 'SAMPLE');

INSERT IGNORE INTO beds (bed_id, room_id, bed_number, bed_position, near_wall, near_window, near_door, current_status, data_status) VALUES
  ('BED0185', 'ROOM072', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0186', 'ROOM072', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'),
  ('BED0187', 'ROOM072', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'), ('BED0188', 'ROOM072', 'B4', 'Upper', 'Yes', 'No', 'No', 'Available', 'SAMPLE'),
  ('BED0189', 'ROOM073', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0190', 'ROOM073', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'),
  ('BED0191', 'ROOM073', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'), ('BED0192', 'ROOM073', 'B4', 'Upper', 'Yes', 'No', 'No', 'Available', 'SAMPLE');

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT CONCAT('B', RIGHT(p.pg_id, 3), LPAD(a.amenity_id, 2, '0')), p.pg_id, a.amenity_id, 'SAMPLE', 'Affordable basic PG sample data'
FROM pgs p CROSS JOIN amenities a
WHERE p.pg_id IN ('PG004', 'PG017')
  AND a.amenity_name IN ('Wi-Fi', 'Food', 'Laundry', 'Housekeeping', 'Geyser', 'Washing Machine', 'CCTV', 'Lift');

-- Reuse existing supplied image URLs for the new PGs.
INSERT INTO pg_images (pg_id, image_url, caption, data_status)
SELECT 'PG024', image_url, 'Reused sample PG image', 'SAMPLE_REUSED'
FROM pg_images WHERE pg_id = 'PG001' AND data_status = 'SAMPLE_URL' LIMIT 1;
INSERT INTO pg_images (pg_id, image_url, caption, data_status)
SELECT 'PG025', image_url, 'Reused sample PG image', 'SAMPLE_REUSED'
FROM pg_images WHERE pg_id = 'PG008' AND data_status = 'SAMPLE_URL' LIMIT 1;
INSERT INTO pg_images (pg_id, image_url, caption, data_status)
SELECT 'PG026', image_url, 'Reused sample PG image', 'SAMPLE_REUSED'
FROM pg_images WHERE pg_id = 'PG002' AND data_status = 'SAMPLE_URL' LIMIT 1;
INSERT INTO pg_images (pg_id, image_url, caption, data_status)
SELECT 'PG027', image_url, 'Reused sample PG image', 'SAMPLE_REUSED'
FROM pg_images WHERE pg_id = 'PG003' AND data_status = 'SAMPLE_URL' LIMIT 1;

COMMIT;
