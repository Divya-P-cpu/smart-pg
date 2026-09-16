"""
Smart PG Cloud Demo Data Seeding Script
---------------------------------------
Purpose:
  Populates the cloud MySQL/TiDB database with clean demo PG listings,
  pricing tiers, room & bed inventories, amenities, and public images.

Guarantees:
  1. Strictly additive: No DROP, TRUNCATE, or DELETE.
  2. Foreign keys remain 100% ENABLED: Child records are only inserted
     if their parent record exists.
  3. No orphaned rows: Ignores legacy local IDs (PG001-PG016, PG004)
     which have no parent in the pgs table.
  4. Safe and idempotent: Skips records that already exist.
  5. Zero sensitive data: Never touches users, owners, password hashes,
     bookings, favorites, reviews, notifications, or test history.

Usage:
  Run manually from the backend directory:
    cd backend
    python seed_cloud_demo.py
"""

import sys
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.pg import Pg
from app.models.location import PgLocation
from app.models.price import PgPrice
from app.models.floor import Floor
from app.models.room import Room
from app.models.bed import Bed
from app.models.amenity import Amenity, PgAmenity
from app.models.pg_image import PgImage


# ---------------------------------------------------------------------------
# Demo Dataset (Extracted strictly from sample_pg_data, affordable_pg_sample_data,
# pg_image_urls, and pg_image_gallery_urls)
# ---------------------------------------------------------------------------

DEMO_PGS = [
    ("PG017", "Madhapur Metro Living", "Co-Living", "Female", 1, "SAMPLE"),
    ("PG018", "Gachibowli WorkNest PG", "PG", "Male", 1, "SAMPLE"),
    ("PG019", "Kondapur Lakeview Stay", "PG", "Female", 1, "SAMPLE"),
    ("PG020", "Koramangala Green House", "Co-Living", "Unisex", 1, "SAMPLE"),
    ("PG021", "HSR Layout Urban Nest", "PG", "Female", 1, "SAMPLE"),
    ("PG022", "Whitefield TechStay", "PG", "Male", 1, "SAMPLE"),
    ("PG023", "Indiranagar Urban Stay", "PG", "Unisex", 1, "SAMPLE"),
    ("PG024", "Madhapur All-Inclusive Living", "Co-Living", "Female", 1, "SAMPLE"),
    ("PG025", "Gachibowli Comfort Homes", "PG", "Unisex", 1, "SAMPLE"),
    ("PG026", "Koramangala Value Stay", "Co-Living", "Unisex", 1, "SAMPLE"),
    ("PG027", "HSR Complete Comfort PG", "PG", "Female", 1, "SAMPLE"),
]

DEMO_LOCATIONS = [
    ("PG017", "Near Madhapur Metro Station, Hyderabad", "Madhapur", "Hyderabad", "Telangana", "500081", 17.4483, 78.3915, "SAMPLE"),
    ("PG018", "Financial District Road, Hyderabad", "Gachibowli", "Hyderabad", "Telangana", "500032", 17.4401, 78.3489, "SAMPLE"),
    ("PG019", "Botanical Garden Road, Hyderabad", "Kondapur", "Hyderabad", "Telangana", "500084", 17.4590, 78.3630, "SAMPLE"),
    ("PG020", "6th Block, Koramangala, Bengaluru", "Koramangala", "Bangalore", "Karnataka", "560034", 12.9352, 77.6245, "SAMPLE"),
    ("PG021", "Sector 2, HSR Layout, Bengaluru", "HSR Layout", "Bangalore", "Karnataka", "560102", 12.9116, 77.6474, "SAMPLE"),
    ("PG022", "ITPL Main Road, Whitefield, Bengaluru", "Whitefield", "Bangalore", "Karnataka", "560066", 12.9698, 77.7499, "SAMPLE"),
    ("PG023", "100 Feet Road, Indiranagar, Bengaluru", "Indiranagar", "Bangalore", "Karnataka", "560038", 12.9784, 77.6408, "SAMPLE"),
    ("PG024", "Near Metro Station, Madhapur, Hyderabad", "Madhapur", "Hyderabad", "Telangana", "500081", 17.4483, 78.3915, "SAMPLE"),
    ("PG025", "Near Financial District, Gachibowli, Hyderabad", "Gachibowli", "Hyderabad", "Telangana", "500032", 17.4401, 78.3489, "SAMPLE"),
    ("PG026", "5th Block, Koramangala, Bengaluru", "Koramangala", "Bangalore", "Karnataka", "560034", 12.9352, 77.6245, "SAMPLE"),
    ("PG027", "Sector 2, HSR Layout, Bengaluru", "HSR Layout", "Bangalore", "Karnataka", "560102", 12.9116, 77.6474, "SAMPLE"),
]

DEMO_PRICES = [
    ("PR012", "PG017", "Standard Room", "3 Sharing", 8000, 8000, "SAMPLE", "Application sample data"),
    ("PR025", "PG017", "Standard Room", "4 Sharing", 7500, 7500, "SAMPLE", "Affordable basic PG sample data"),
    ("PR013", "PG018", "Standard Room", "2 Sharing", 9500, 9500, "SAMPLE", "Application sample data"),
    ("PR014", "PG019", "Standard Room", "3 Sharing", 10000, 10000, "SAMPLE", "Application sample data"),
    ("PR015", "PG020", "Standard Room", "3 Sharing", 8000, 8000, "SAMPLE", "Application sample data"),
    ("PR016", "PG021", "Standard Room", "2 Sharing", 10500, 10500, "SAMPLE", "Application sample data"),
    ("PR017", "PG022", "Standard Room", "3 Sharing", 12000, 12000, "SAMPLE", "Application sample data"),
    ("PR028", "PG023", "Standard Room", "2 Sharing", 11000, 11000, "SAMPLE", "Application sample data"),
    ("PR018", "PG024", "Basic Room", "3 Sharing", 7000, 7000, "SAMPLE", "Affordable basic PG sample data"),
    ("PR022", "PG024", "Basic Room", "4 Sharing", 7000, 7000, "SAMPLE", "Affordable basic PG sample data"),
    ("PR023", "PG024", "Basic Room", "5 Sharing", 6500, 6500, "SAMPLE", "Affordable basic PG sample data"),
    ("PR019", "PG025", "Standard Room", "2 Sharing", 10000, 10000, "SAMPLE", "Application sample data"),
    ("PR020", "PG026", "Standard Room", "3 Sharing", 9000, 9000, "SAMPLE", "Application sample data"),
    ("PR021", "PG027", "Standard Room", "2 Sharing", 11000, 11000, "SAMPLE", "Application sample data"),
]

DEMO_FLOORS = [
    (41, "PG017", "Ground Floor", "SAMPLE"),
    (52, "PG017", "First Floor", "SAMPLE"),
    (42, "PG018", "Ground Floor", "SAMPLE"),
    (43, "PG019", "Ground Floor", "SAMPLE"),
    (44, "PG020", "Ground Floor", "SAMPLE"),
    (45, "PG021", "Ground Floor", "SAMPLE"),
    (46, "PG022", "Ground Floor", "SAMPLE"),
    (53, "PG023", "Ground Floor", "SAMPLE"),
    (47, "PG024", "Ground Floor", "SAMPLE"),
    (48, "PG025", "Ground Floor", "SAMPLE"),
    (49, "PG026", "Ground Floor", "SAMPLE"),
    (50, "PG027", "Ground Floor", "SAMPLE"),
]

DEMO_ROOMS = [
    ("ROOM054", "PG017", 41, "101", "Standard", 3, 2, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM055", "PG017", 41, "102", "Standard", 3, 1, 2, "Available", "AC", "Common", "SAMPLE"),
    ("ROOM073", "PG017", 52, "104", "Standard 4 Sharing", 4, 1, 3, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM056", "PG018", 42, "201", "Standard", 2, 1, 1, "Available", "Non-AC", "Attached", "SAMPLE"),
    ("ROOM057", "PG018", 42, "202", "Standard", 2, 2, 0, "Full", "Non-AC", "Common", "SAMPLE"),
    ("ROOM058", "PG019", 43, "301", "Standard", 3, 1, 2, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM059", "PG019", 43, "302", "Standard", 3, 2, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM060", "PG020", 44, "401", "Standard", 3, 1, 2, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM061", "PG020", 44, "402", "Standard", 3, 0, 3, "Available", "AC", "Common", "SAMPLE"),
    ("ROOM062", "PG021", 45, "501", "Standard", 2, 1, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM063", "PG021", 45, "502", "Standard", 2, 1, 1, "Available", "AC", "Common", "SAMPLE"),
    ("ROOM064", "PG022", 46, "601", "Standard", 3, 2, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM065", "PG022", 46, "602", "Standard", 3, 2, 1, "Available", "AC", "Common", "SAMPLE"),
    ("ROOM074", "PG023", 53, "701", "Standard", 2, 1, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM066", "PG024", 47, "101", "Standard", 3, 1, 2, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM070", "PG024", 47, "102", "Basic 4 Sharing", 4, 2, 2, "Available", "Non-AC", "Common", "SAMPLE"),
    ("ROOM071", "PG024", 47, "103", "Basic 5 Sharing", 5, 3, 2, "Available", "Non-AC", "Common", "SAMPLE"),
    ("ROOM067", "PG025", 48, "201", "Standard", 2, 1, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM068", "PG026", 49, "301", "Standard", 3, 2, 1, "Available", "AC", "Attached", "SAMPLE"),
    ("ROOM069", "PG027", 50, "401", "Standard", 2, 1, 1, "Available", "AC", "Attached", "SAMPLE"),
]

DEMO_BEDS = [
    ("BED0134", "ROOM054", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0135", "ROOM054", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0136", "ROOM054", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0137", "ROOM055", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0138", "ROOM055", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0139", "ROOM055", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0189", "ROOM073", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0190", "ROOM073", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0191", "ROOM073", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0192", "ROOM073", "B4", "Upper", "Yes", "No", "No", "Available", "SAMPLE"),
    ("BED0140", "ROOM056", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0141", "ROOM056", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
    ("BED0142", "ROOM057", "B1", "Lower", "Yes", "No", "No", "Occupied", "SAMPLE"),
    ("BED0143", "ROOM057", "B2", "Upper", "No", "Yes", "Yes", "Occupied", "SAMPLE"),
    ("BED0144", "ROOM058", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0145", "ROOM058", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0146", "ROOM058", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0147", "ROOM059", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0148", "ROOM059", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0149", "ROOM059", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0150", "ROOM060", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0151", "ROOM060", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0152", "ROOM060", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0153", "ROOM061", "B1", "Lower", "Yes", "Yes", "No", "Available", "SAMPLE"),
    ("BED0154", "ROOM061", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0155", "ROOM061", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0156", "ROOM062", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0157", "ROOM062", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
    ("BED0158", "ROOM063", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0159", "ROOM063", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
    ("BED0160", "ROOM064", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0161", "ROOM064", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0162", "ROOM064", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0163", "ROOM065", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0164", "ROOM065", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0165", "ROOM065", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0193", "ROOM074", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0194", "ROOM074", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
    ("BED0166", "ROOM066", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0167", "ROOM066", "B2", "Upper", "No", "No", "No", "Available", "SAMPLE"),
    ("BED0168", "ROOM066", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0176", "ROOM070", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0177", "ROOM070", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0178", "ROOM070", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0179", "ROOM070", "B4", "Upper", "Yes", "No", "No", "Available", "SAMPLE"),
    ("BED0180", "ROOM071", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0181", "ROOM071", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0182", "ROOM071", "B3", "Lower", "No", "Yes", "Yes", "Occupied", "SAMPLE"),
    ("BED0183", "ROOM071", "B4", "Upper", "Yes", "No", "No", "Available", "SAMPLE"),
    ("BED0184", "ROOM071", "B5", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0169", "ROOM067", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0170", "ROOM067", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
    ("BED0171", "ROOM068", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0172", "ROOM068", "B2", "Upper", "No", "No", "No", "Occupied", "SAMPLE"),
    ("BED0173", "ROOM068", "B3", "Lower", "No", "Yes", "Yes", "Available", "SAMPLE"),
    ("BED0174", "ROOM069", "B1", "Lower", "Yes", "Yes", "No", "Occupied", "SAMPLE"),
    ("BED0175", "ROOM069", "B2", "Upper", "No", "No", "Yes", "Available", "SAMPLE"),
]

DEMO_PG_AMENITIES = [
    # PG017
    ("AM027", "PG017", "Wi-Fi"), ("AM028", "PG017", "Food"), ("AM029", "PG017", "Lift"),
    ("AM045", "PG017", "CCTV"), ("AM046", "PG017", "Hot Water"), ("AM047", "PG017", "Power Backup"),
    ("AM048", "PG017", "AC"), ("AM049", "PG017", "Laundry"),
    # PG018
    ("AM030", "PG018", "Wi-Fi"), ("AM031", "PG018", "Parking"), ("AM032", "PG018", "CCTV"),
    # PG019
    ("AM033", "PG019", "Wi-Fi"), ("AM034", "PG019", "Hot Water"), ("AM035", "PG019", "Attached Bathroom"),
    # PG020
    ("AM036", "PG020", "Wi-Fi"), ("AM037", "PG020", "Laundry"), ("AM038", "PG020", "Power Backup"),
    # PG021
    ("AM039", "PG021", "Wi-Fi"), ("AM040", "PG021", "Food"), ("AM041", "PG021", "Security"),
    # PG022
    ("AM042", "PG022", "Wi-Fi"), ("AM043", "PG022", "Lift"), ("AM044", "PG022", "AC"),
    # PG023
    ("AM050", "PG023", "Wi-Fi"), ("AM051", "PG023", "AC"), ("AM052", "PG023", "Food"),
    # PG024 - PG027 full amenities
    ("AM053", "PG024", "Wi-Fi"), ("AM054", "PG024", "Food"), ("AM055", "PG024", "AC"), ("AM056", "PG024", "CCTV"),
    ("AM057", "PG025", "Wi-Fi"), ("AM058", "PG025", "Food"), ("AM059", "PG025", "Attached Bathroom"),
    ("AM060", "PG026", "Wi-Fi"), ("AM061", "PG026", "Hot Water"), ("AM062", "PG026", "Laundry"),
    ("AM063", "PG027", "Wi-Fi"), ("AM064", "PG027", "Food"), ("AM065", "PG027", "Security"),
]

DEMO_IMAGES = [
    # PG017 (Madhapur)
    ("PG017", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Jul/31/full_photo/GR2-482545-2544195.jpeg", "Madhapur Metro Living - Exterior", "SAMPLE_URL"),
    ("PG017", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Apr/26/full_photo/GR2-482545-2458273.jpeg", "Madhapur Metro Living - Room", "SAMPLE_URL"),
    ("PG017", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Sep/01/Photo_h50_w70/GR2-482545-2570763_50_70.jpg", "Madhapur Metro Living - Common Area", "SAMPLE_URL"),
    # PG018 (Gachibowli)
    ("PG018", "https://i.pinimg.com/736x/8c/69/4e/8c694e2b54f56a0bcece3f6740d0bc6d.jpg", "Gachibowli WorkNest - Main", "SAMPLE_URL"),
    ("PG018", "https://i.pinimg.com/736x/13/47/74/1347743e0756592a478630f556072829.jpg", "Gachibowli WorkNest - Room", "SAMPLE_URL"),
    ("PG018", "https://i.pinimg.com/736x/8d/0b/85/8d0b854bfa90772084a1e576dc418555.jpg", "Gachibowli WorkNest - Lounge", "SAMPLE_URL"),
    # PG019 (Kondapur)
    ("PG019", "https://i.pinimg.com/1200x/9f/e6/37/9fe6379ea4decc02f670c4e9cd068c0f.jpg", "Kondapur Lakeview - Main", "SAMPLE_URL"),
    ("PG019", "https://i.pinimg.com/736x/62/a9/e7/62a9e747a27a2e2e4a57b35b9303cf04.jpg", "Kondapur Lakeview - Bedroom", "SAMPLE_URL"),
    ("PG019", "https://i.pinimg.com/1200x/cd/b5/e8/cdb5e8fc794064db259c97ac4d54f7a7.jpg", "Kondapur Lakeview - Balcony", "SAMPLE_URL"),
    # PG020 (Koramangala)
    ("PG020", "https://i.pinimg.com/1200x/9f/3b/09/9f3b09dfe9af7a0671e882da2c011d6a.jpg", "Koramangala Green House - Main", "SAMPLE_URL"),
    ("PG020", "https://i.pinimg.com/1200x/e7/c6/5f/e7c65f09d661962d02179028da63d6d.jpg", "Koramangala Green House - Room", "SAMPLE_URL"),
    ("PG020", "https://i.pinimg.com/736x/59/f6/2a/59f62afa43066d1af99f95cee8be7a35.jpg", "Koramangala Green House - Garden", "SAMPLE_URL"),
    # PG021 (HSR Layout)
    ("PG021", "https://i.pinimg.com/736x/50/ac/98/50ac98fed5376490e650b2f07fa1d835.jpg", "HSR Urban Nest - Main", "SAMPLE_URL"),
    ("PG021", "https://i.pinimg.com/1200x/dc/71/24/dc7124fc2abea4dcff729bebd21fcaa4.jpg", "HSR Urban Nest - Room", "SAMPLE_URL"),
    ("PG021", "https://i.pinimg.com/736x/f2/56/d7/f256d790d2a5b2527c95409a6f68dbd9.jpg", "HSR Urban Nest - Living Room", "SAMPLE_URL"),
    # PG022 (Whitefield)
    ("PG022", "https://i.pinimg.com/736x/14/c2/7d/14c27dbd1a2567bdae19133c82700cd4.jpg", "Whitefield TechStay - Main", "SAMPLE_URL"),
    ("PG022", "https://i.pinimg.com/736x/c6/9f/4c/c69f4c33428aa6ce034dda9d3c48c830.jpg", "Whitefield TechStay - Room", "SAMPLE_URL"),
    ("PG022", "https://i.pinimg.com/736x/18/ca/c9/18cac90cae5505616e058ed34ae41381.jpg", "Whitefield TechStay - Dining", "SAMPLE_URL"),
    # PG023 (Indiranagar)
    ("PG023", "https://i.pinimg.com/236x/9b/53/b1/9b53b166b9f83dc185cb0799c6f815bd.jpg", "Indiranagar Urban Stay - Main", "SAMPLE_URL"),
    ("PG023", "https://i.pinimg.com/1200x/96/35/8d/96358dc85c38e32cb324b1936646657d.jpg", "Indiranagar Urban Stay - Room", "SAMPLE_URL"),
    ("PG023", "https://i.pinimg.com/736x/28/c9/1e/28c91e58b3ca0e3beb9f33aa94be8878.jpg", "Indiranagar Urban Stay - Terrace", "SAMPLE_URL"),
    # PG024 (Madhapur All-Inclusive)
    ("PG024", "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661412416/Website/CMS-Uploads/ojhnxuvo7f8saexyhcod.jpg", "Madhapur All-Inclusive - Main", "SAMPLE_URL"),
    ("PG024", "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661412466/Website/CMS-Uploads/trksxemmeilapifse0lc.jpg", "Madhapur All-Inclusive - Room", "SAMPLE_URL"),
    # PG025 (Gachibowli Comfort)
    ("PG025", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2021/Jan/17/full_photo/GR2-140461-679019.jpeg", "Gachibowli Comfort - Main", "SAMPLE_URL"),
    ("PG025", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2021/Jan/17/full_photo/GR2-140461-679027.jpeg", "Gachibowli Comfort - Room", "SAMPLE_URL"),
    # PG026 (Koramangala Value)
    ("PG026", "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/v1584973656/Website/CMS-Uploads/wmv7ap53d7aunwshlvdy.jpg", "Koramangala Value - Main", "SAMPLE_URL"),
    ("PG026", "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/v1584973747/Website/CMS-Uploads/mkhmegqaljej989w0grw.jpg", "Koramangala Value - Room", "SAMPLE_URL"),
    # PG027 (HSR Complete)
    ("PG027", "https://pgmanagerapp.s3.ap-south-1.amazonaws.com/pgmaster/properties/bf6d5df9-97e4-42a9-b2c9-0d9f730f9d47.jpeg", "HSR Complete Comfort - Main", "SAMPLE_URL"),
    ("PG027", "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2026/Aug/04/full_photo/GR2-550893-2849291.jpg", "HSR Complete Comfort - Room", "SAMPLE_URL"),
]


def seed_demo_data():
    session: Session = SessionLocal()
    print("=" * 60)
    print("  Smart PG - Cloud Database Demo Seeding")
    print("=" * 60)

    stats = {
        "pgs": {"inserted": 0, "skipped": 0},
        "locations": {"inserted": 0, "skipped": 0},
        "prices": {"inserted": 0, "skipped": 0},
        "floors": {"inserted": 0, "skipped": 0},
        "rooms": {"inserted": 0, "skipped": 0},
        "beds": {"inserted": 0, "skipped": 0},
        "amenities": {"inserted": 0, "skipped": 0},
        "images": {"inserted": 0, "skipped": 0},
    }

    try:
        # Step 1: Seed Parent PGs
        print("\n[1/7] Seeding parent PG listings...")
        for row in DEMO_PGS:
            pg_id, pg_name, prop_type, gender_policy, is_active, status = row
            existing = session.query(Pg).filter(Pg.pg_id == pg_id).first()
            if existing:
                stats["pgs"]["skipped"] += 1
            else:
                session.add(Pg(
                    pg_id=pg_id,
                    pg_name=pg_name,
                    property_type=prop_type,
                    gender_policy=gender_policy,
                    is_active=is_active,
                    data_status=status
                ))
                stats["pgs"]["inserted"] += 1
        session.flush()

        # Step 2: Seed Locations
        print("[2/7] Seeding PG locations...")
        for row in DEMO_LOCATIONS:
            pg_id, addr, area, city, state, pin, lat, lng, status = row
            existing = session.query(PgLocation).filter(PgLocation.pg_id == pg_id).first()
            if existing:
                stats["locations"]["skipped"] += 1
            else:
                session.add(PgLocation(
                    pg_id=pg_id, address=addr, area=area, city=city,
                    state=state, pincode=pin, latitude=lat, longitude=lng, data_status=status
                ))
                stats["locations"]["inserted"] += 1
        session.flush()

        # Step 3: Seed Prices
        print("[3/7] Seeding pricing tiers...")
        for row in DEMO_PRICES:
            price_id, pg_id, room_t, share_t, rent, dep, status, src = row
            existing = session.query(PgPrice).filter(PgPrice.price_id == price_id).first()
            if existing:
                stats["prices"]["skipped"] += 1
            else:
                session.add(PgPrice(
                    price_id=price_id, pg_id=pg_id, room_type=room_t, sharing_type=share_t,
                    monthly_rent=rent, security_deposit=dep, data_status=status, price_source=src
                ))
                stats["prices"]["inserted"] += 1
        session.flush()

        # Step 4: Seed Floors, Rooms, and Beds
        print("[4/7] Seeding physical inventory (floors, rooms, beds)...")
        for row in DEMO_FLOORS:
            f_id, pg_id, label, status = row
            existing = session.query(Floor).filter(Floor.floor_id == f_id).first()
            if existing:
                stats["floors"]["skipped"] += 1
            else:
                session.add(Floor(floor_id=f_id, pg_id=pg_id, floor_label=label, data_status=status))
                stats["floors"]["inserted"] += 1
        session.flush()

        for row in DEMO_ROOMS:
            r_id, pg_id, f_id, r_num, r_type, cap, occ, avail, r_status, ac, bath, status = row
            existing = session.query(Room).filter(Room.room_id == r_id).first()
            if existing:
                stats["rooms"]["skipped"] += 1
            else:
                session.add(Room(
                    room_id=r_id, pg_id=pg_id, floor_id=f_id, room_number=r_num,
                    room_type=r_type, capacity=cap, occupied_count=occ, available_count=avail,
                    room_status=r_status, ac_type=ac, bathroom_type=bath, data_status=status
                ))
                stats["rooms"]["inserted"] += 1
        session.flush()

        for row in DEMO_BEDS:
            b_id, r_id, b_num, pos, wall, win, door, b_status, status = row
            existing = session.query(Bed).filter(Bed.bed_id == b_id).first()
            if existing:
                stats["beds"]["skipped"] += 1
            else:
                session.add(Bed(
                    bed_id=b_id, room_id=r_id, bed_number=b_num, bed_position=pos,
                    near_wall=wall, near_window=win, near_door=door,
                    current_status=b_status, data_status=status
                ))
                stats["beds"]["inserted"] += 1
        session.flush()

        # Step 5: Seed Amenities Links
        print("[5/7] Linking canonical amenities to PGs...")
        amenity_cache = {a.amenity_name: a.amenity_id for a in session.query(Amenity).all()}
        for pg_amenity_id, pg_id, a_name in DEMO_PG_AMENITIES:
            a_id = amenity_cache.get(a_name)
            if not a_id:
                continue
            existing = session.query(PgAmenity).filter(PgAmenity.pg_amenity_id == pg_amenity_id).first()
            if existing:
                stats["amenities"]["skipped"] += 1
            else:
                session.add(PgAmenity(
                    pg_amenity_id=pg_amenity_id,
                    pg_id=pg_id,
                    amenity_id=a_id,
                    data_status="SAMPLE",
                    amenity_source="Application sample data"
                ))
                stats["amenities"]["inserted"] += 1
        session.flush()

        # Step 6: Seed Public Images (Idempotent by pg_id + image_url)
        print("[6/7] Seeding property photos...")
        for pg_id, img_url, cap, status in DEMO_IMAGES:
            existing = session.query(PgImage).filter(
                PgImage.pg_id == pg_id,
                PgImage.image_url == img_url
            ).first()
            if existing:
                stats["images"]["skipped"] += 1
            else:
                session.add(PgImage(
                    pg_id=pg_id,
                    image_url=img_url,
                    caption=cap,
                    data_status=status
                ))
                stats["images"]["inserted"] += 1
        session.flush()

        # Step 7: Commit transaction
        print("[7/7] Committing database transaction...")
        session.commit()

        print("\n" + "=" * 60)
        print("  Demo Seeding Summary (Foreign Keys Enforced & Protected)")
        print("=" * 60)
        print(f"  {'Table':<25} {'Inserted':<12} {'Skipped (Existed)':<15}")
        print("  " + "-" * 52)
        for tbl, counts in stats.items():
            print(f"  {tbl:<25} {counts['inserted']:<12} {counts['skipped']:<15}")
        print("=" * 60)
        print("  Seeding completed successfully!")
        print("=" * 60)

    except Exception as exc:
        session.rollback()
        print(f"\n[ERROR] Seeding failed, transaction rolled back: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    seed_demo_data()
