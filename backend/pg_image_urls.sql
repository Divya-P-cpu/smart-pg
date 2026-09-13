-- Supplied PG image URLs mapped to the existing PG IDs.
-- The seed replaces only its own SAMPLE_URL rows and preserves owner images.
START TRANSACTION;
INSERT IGNORE INTO pgs (pg_id, pg_name, property_type, gender_policy, is_active, data_status) VALUES ('PG023', 'Sample PG 23', 'PG', 'Unisex', 1, 'SAMPLE');
INSERT IGNORE INTO pg_locations (pg_id, address, area, city, state, pincode, latitude, longitude, data_status) VALUES ('PG023', 'Bengaluru sample location', 'Indiranagar', 'Bangalore', 'Karnataka', '560038', 12.9784, 77.6408, 'SAMPLE');
DELETE FROM pg_images WHERE data_status = 'SAMPLE_URL';
INSERT INTO pg_images (pg_id, image_url, caption, data_status) VALUES
('PG001','https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661412416/Website/CMS-Uploads/ojhnxuvo7f8saexyhcod.jpg','PG-1 image 1','SAMPLE_URL'),
('PG002','https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/v1584973656/Website/CMS-Uploads/wmv7ap53d7aunwshlvdy.jpg','PG-2 image 1','SAMPLE_URL'),
('PG003','https://pgmanagerapp.s3.ap-south-1.amazonaws.com/pgmaster/properties/bf6d5df9-97e4-42a9-b2c9-0d9f730f9d47.jpeg','PG-3 image 1','SAMPLE_URL'),
('PG004','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Dec/04/full_photo/GR2-518595-2649485.jpeg','PG-4 image 1','SAMPLE_URL'),
('PG005','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Feb/27/full_photo/GR2-484063-2406163.jpg','PG-5 image 1','SAMPLE_URL'),
('PG006','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2026/Jul/07/full_photo/GR2-545699-2822311.jpeg','PG-6 image 1','SAMPLE_URL'),
('PG007','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2024/Jul/24/full_photo/GR2-436171-2200641.jpg','PG-7 image 1','SAMPLE_URL'),
('PG008','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2021/Jan/17/full_photo/GR2-140461-679019.jpeg','PG-8 image 1','SAMPLE_URL'),
('PG009','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/May/14/full_photo/GR2-479279-2473713.jpg','PG-9 image 1','SAMPLE_URL'),
('PG010','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2022/Feb/04/full_photo/GR2-269277-1260981.jpeg','PG-10 image 1','SAMPLE_URL'),
('PG011','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2022/Jul/22/full_photo/GR2-305349-1442259.jpg','PG-11 image 1','SAMPLE_URL'),
('PG012','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2024/Dec/28/full_photo/GR2-476925-2349893.jpg','PG-12 image 1','SAMPLE_URL'),
('PG013','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Sep/14/full_photo/GR2-508709-2582807.jpg','PG-13 image 1','SAMPLE_URL'),
('PG014','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2026/Jan/30/full_photo/GR2-361311-2696077.jpg','PG-14 image 1','SAMPLE_URL'),
('PG015','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2026/Jan/30/full_photo/GR2-463147-2696411.jpg','PG-15 image 1','SAMPLE_URL'),
('PG016','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Jun/09/full_photo/GR2-412791-2494325.jpg','PG-16 image 1','SAMPLE_URL'),
('PG017','https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Jul/31/full_photo/GR2-482545-2544195.jpeg','PG-17 image 1','SAMPLE_URL'),
('PG018','https://i.pinimg.com/736x/8c/69/4e/8c694e2b54f56a0bcece3f6740d0bc6d.jpg','PG-18 image 1','SAMPLE_URL'),
('PG019','https://i.pinimg.com/1200x/9f/e6/37/9fe6379ea4decc02f670c4e9cd068c0f.jpg','PG-19 image 1','SAMPLE_URL'),
('PG020','https://i.pinimg.com/1200x/9f/3b/09/9f3b09dfe9af7a0671e882da2c011d6a.jpg','PG-20 image 1','SAMPLE_URL'),
('PG021','https://i.pinimg.com/736x/50/ac/98/50ac98fed5376490e650b2f07fa1d835.jpg','PG-21 image 1','SAMPLE_URL'),
('PG022','https://i.pinimg.com/736x/14/c2/7d/14c27dbd1a2567bdae19133c82700cd4.jpg','PG-22 image 1','SAMPLE_URL'),
('PG023','https://i.pinimg.com/236x/9b/53/b1/9b53b166b9f83dc185cb0799c6f815bd.jpg','PG-23 image 1','SAMPLE_URL');
COMMIT;
