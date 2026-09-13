-- Additional Smart PG sample records for Explore and bed-level demonstrations.
-- Rents start at Rs. 8,000. Safe to run repeatedly with INSERT IGNORE.

START TRANSACTION;

INSERT IGNORE INTO pgs (pg_id, pg_name, property_type, gender_policy, is_active, data_status) VALUES
('PG017', 'Madhapur Metro Living', 'Co-Living', 'Unisex', 1, 'SAMPLE'),
('PG018', 'Gachibowli WorkNest PG', 'PG', 'Male', 1, 'SAMPLE'),
('PG019', 'Kondapur Lakeview Stay', 'PG', 'Female', 1, 'SAMPLE'),
('PG020', 'Koramangala Green House', 'Co-Living', 'Unisex', 1, 'SAMPLE'),
('PG021', 'HSR Layout Urban Nest', 'PG', 'Female', 1, 'SAMPLE'),
('PG022', 'Whitefield TechStay', 'PG', 'Male', 1, 'SAMPLE');

INSERT IGNORE INTO pg_locations (pg_id, address, area, city, state, pincode, latitude, longitude, data_status) VALUES
('PG017', 'Near Madhapur Metro Station, Hyderabad', 'Madhapur', 'Hyderabad', 'Telangana', '500081', 17.4483, 78.3915, 'SAMPLE'),
('PG018', 'Financial District Road, Hyderabad', 'Gachibowli', 'Hyderabad', 'Telangana', '500032', 17.4401, 78.3489, 'SAMPLE'),
('PG019', 'Botanical Garden Road, Hyderabad', 'Kondapur', 'Hyderabad', 'Telangana', '500084', 17.4590, 78.3630, 'SAMPLE'),
('PG020', '6th Block, Koramangala, Bengaluru', 'Koramangala', 'Bangalore', 'Karnataka', '560034', 12.9352, 77.6245, 'SAMPLE'),
('PG021', 'Sector 2, HSR Layout, Bengaluru', 'HSR Layout', 'Bangalore', 'Karnataka', '560102', 12.9116, 77.6474, 'SAMPLE'),
('PG022', 'ITPL Main Road, Whitefield, Bengaluru', 'Whitefield', 'Bangalore', 'Karnataka', '560066', 12.9698, 77.7499, 'SAMPLE');

INSERT IGNORE INTO pg_prices (price_id, pg_id, room_type, sharing_type, monthly_rent, security_deposit, data_status, price_source) VALUES
('PR012', 'PG017', 'Standard Room', '3 Sharing', 8000, 8000, 'SAMPLE', 'Application sample data'),
('PR013', 'PG018', 'Standard Room', '2 Sharing', 9500, 9500, 'SAMPLE', 'Application sample data'),
('PR014', 'PG019', 'Standard Room', '3 Sharing', 10000, 10000, 'SAMPLE', 'Application sample data'),
('PR015', 'PG020', 'Standard Room', '3 Sharing', 8000, 8000, 'SAMPLE', 'Application sample data'),
('PR016', 'PG021', 'Standard Room', '2 Sharing', 10500, 10500, 'SAMPLE', 'Application sample data'),
('PR017', 'PG022', 'Standard Room', '3 Sharing', 12000, 12000, 'SAMPLE', 'Application sample data');

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM027', 'PG017', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM028', 'PG017', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Food';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM029', 'PG017', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Lift';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM030', 'PG018', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM031', 'PG018', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Parking';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM032', 'PG018', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'CCTV';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM033', 'PG019', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM034', 'PG019', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Hot Water';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM035', 'PG019', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Attached Bathroom';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM036', 'PG020', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM037', 'PG020', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Laundry';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM038', 'PG020', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Power Backup';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM039', 'PG021', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM040', 'PG021', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Food';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM041', 'PG021', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Security';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM042', 'PG022', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Wi-Fi';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM043', 'PG022', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'Lift';
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source) SELECT 'AM044', 'PG022', amenity_id, 'SAMPLE', 'Application sample data' FROM amenities WHERE amenity_name = 'AC';

INSERT IGNORE INTO floors (floor_id, pg_id, floor_label, data_status) VALUES
(41, 'PG017', 'Ground Floor', 'SAMPLE'), (42, 'PG018', 'Ground Floor', 'SAMPLE'), (43, 'PG019', 'Ground Floor', 'SAMPLE'),
(44, 'PG020', 'Ground Floor', 'SAMPLE'), (45, 'PG021', 'Ground Floor', 'SAMPLE'), (46, 'PG022', 'Ground Floor', 'SAMPLE');

INSERT IGNORE INTO rooms (room_id, pg_id, floor_id, room_number, room_type, capacity, occupied_count, available_count, room_status, ac_type, bathroom_type, data_status) VALUES
('ROOM054', 'PG017', 41, '101', 'Standard', 3, 2, 1, 'Available', 'AC', 'Attached', 'SAMPLE'), ('ROOM055', 'PG017', 41, '102', 'Standard', 3, 1, 2, 'Available', 'AC', 'Common', 'SAMPLE'),
('ROOM056', 'PG018', 42, '201', 'Standard', 2, 1, 1, 'Available', 'Non-AC', 'Attached', 'SAMPLE'), ('ROOM057', 'PG018', 42, '202', 'Standard', 2, 2, 0, 'Full', 'Non-AC', 'Common', 'SAMPLE'),
('ROOM058', 'PG019', 43, '301', 'Standard', 3, 1, 2, 'Available', 'AC', 'Attached', 'SAMPLE'), ('ROOM059', 'PG019', 43, '302', 'Standard', 3, 2, 1, 'Available', 'AC', 'Attached', 'SAMPLE'),
('ROOM060', 'PG020', 44, '401', 'Standard', 3, 1, 2, 'Available', 'AC', 'Attached', 'SAMPLE'), ('ROOM061', 'PG020', 44, '402', 'Standard', 3, 0, 3, 'Available', 'AC', 'Common', 'SAMPLE'),
('ROOM062', 'PG021', 45, '501', 'Standard', 2, 1, 1, 'Available', 'AC', 'Attached', 'SAMPLE'), ('ROOM063', 'PG021', 45, '502', 'Standard', 2, 1, 1, 'Available', 'AC', 'Common', 'SAMPLE'),
('ROOM064', 'PG022', 46, '601', 'Standard', 3, 2, 1, 'Available', 'AC', 'Attached', 'SAMPLE'), ('ROOM065', 'PG022', 46, '602', 'Standard', 3, 2, 1, 'Available', 'AC', 'Common', 'SAMPLE');

INSERT IGNORE INTO beds (bed_id, room_id, bed_number, bed_position, near_wall, near_window, near_door, current_status, data_status) VALUES
('BED0134', 'ROOM054', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0135', 'ROOM054', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0136', 'ROOM054', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0137', 'ROOM055', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0138', 'ROOM055', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'), ('BED0139', 'ROOM055', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0140', 'ROOM056', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0141', 'ROOM056', 'B2', 'Upper', 'No', 'No', 'Yes', 'Available', 'SAMPLE'),
('BED0142', 'ROOM057', 'B1', 'Lower', 'Yes', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0143', 'ROOM057', 'B2', 'Upper', 'No', 'Yes', 'Yes', 'Occupied', 'SAMPLE'),
('BED0144', 'ROOM058', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0145', 'ROOM058', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'), ('BED0146', 'ROOM058', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0147', 'ROOM059', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0148', 'ROOM059', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0149', 'ROOM059', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0150', 'ROOM060', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0151', 'ROOM060', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'), ('BED0152', 'ROOM060', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0153', 'ROOM061', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Available', 'SAMPLE'), ('BED0154', 'ROOM061', 'B2', 'Upper', 'No', 'No', 'No', 'Available', 'SAMPLE'), ('BED0155', 'ROOM061', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0156', 'ROOM062', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0157', 'ROOM062', 'B2', 'Upper', 'No', 'No', 'Yes', 'Available', 'SAMPLE'),
('BED0158', 'ROOM063', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0159', 'ROOM063', 'B2', 'Upper', 'No', 'No', 'Yes', 'Available', 'SAMPLE'),
('BED0160', 'ROOM064', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0161', 'ROOM064', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0162', 'ROOM064', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE'),
('BED0163', 'ROOM065', 'B1', 'Lower', 'Yes', 'Yes', 'No', 'Occupied', 'SAMPLE'), ('BED0164', 'ROOM065', 'B2', 'Upper', 'No', 'No', 'No', 'Occupied', 'SAMPLE'), ('BED0165', 'ROOM065', 'B3', 'Lower', 'No', 'Yes', 'Yes', 'Available', 'SAMPLE');

COMMIT;
