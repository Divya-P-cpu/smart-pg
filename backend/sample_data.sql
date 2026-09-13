-- Smart PG sample data supplements existing records.
-- Safe to run repeatedly: existing rows are preserved and duplicate links are ignored.

START TRANSACTION;

-- PG013 already has a price row with blank values.
UPDATE pg_prices
SET sharing_type = '3 Sharing',
    monthly_rent = 9500.00,
    security_deposit = 9500.00,
    data_status = 'SAMPLE'
WHERE price_id = 'PR007'
  AND pg_id = 'PG013';

-- Add realistic price options for PGs that currently have rooms but no prices.
INSERT IGNORE INTO pg_prices
  (price_id, pg_id, room_type, sharing_type, monthly_rent, security_deposit, data_status, price_source)
VALUES
  ('PR008', 'PG004', 'Standard Room', '2 Sharing', 8500.00, 8500.00, 'SAMPLE', 'Application sample data'),
  ('PR009', 'PG004', 'Premium Room', 'Single', 12500.00, 12500.00, 'SAMPLE', 'Application sample data'),
  ('PR010', 'PG006', 'Standard Room', '2 Sharing', 9000.00, 9000.00, 'SAMPLE', 'Application sample data'),
  ('PR011', 'PG006', 'Premium Room', '3 Sharing', 7500.00, 7500.00, 'SAMPLE', 'Application sample data');

-- Reuse existing canonical amenities instead of duplicating the amenity catalog.
INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM021', 'PG004', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'Wi-Fi';

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM022', 'PG004', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'Food';

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM023', 'PG004', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'Lift';

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM024', 'PG006', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'Wi-Fi';

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM025', 'PG006', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'Hot Water';

INSERT IGNORE INTO pg_amenities (pg_amenity_id, pg_id, amenity_id, data_status, amenity_source)
SELECT 'AM026', 'PG006', amenity_id, 'SAMPLE', 'Application sample data'
FROM amenities WHERE amenity_name = 'CCTV';

COMMIT;
