from sqlalchemy import text

from app.data.room_layout_images import ROOM_LAYOUT_IMAGES
from app.db.database import engine


def main():
    create_sql = """
        CREATE TABLE IF NOT EXISTS room_layout_images (
            layout_image_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            sharing_capacity INT NOT NULL,
            image_url VARCHAR(700) NOT NULL UNIQUE,
            label VARCHAR(100) NULL,
            data_status VARCHAR(50) NOT NULL DEFAULT 'OWNER_INPUT',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX ix_room_layout_images_sharing_capacity (sharing_capacity)
        )
    """
    insert_sql = text("""
        INSERT INTO room_layout_images (sharing_capacity, image_url, label, data_status)
        VALUES (:sharing_capacity, :image_url, :label, 'OWNER_INPUT')
        ON DUPLICATE KEY UPDATE
            sharing_capacity = VALUES(sharing_capacity),
            label = VALUES(label),
            data_status = VALUES(data_status)
    """)

    rows = [
        {
            "sharing_capacity": sharing_capacity,
            "image_url": image_url,
            "label": f"{sharing_capacity} Share Layout {index}",
        }
        for sharing_capacity, urls in ROOM_LAYOUT_IMAGES.items()
        for index, image_url in enumerate(urls, start=1)
    ]

    with engine.begin() as conn:
        conn.execute(text(create_sql))
        conn.execute(insert_sql, rows)

    print(f"Seeded {len(rows)} room layout image URLs.")


if __name__ == "__main__":
    main()
