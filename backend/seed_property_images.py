from app.db.database import SessionLocal
from app.models import Pg, PgImage


PROPERTY_IMAGE_URLS = [
    "https://i.pinimg.com/736x/64/5a/80/645a803dc8ee4d3be4f0495b8de7adc7.jpg",
    "https://i.pinimg.com/1200x/28/78/04/2878043b84e47a84d9dc895e24db36ac.jpg",
    "https://i.pinimg.com/1200x/61/90/fc/6190fc8f3b2128011f9f0a67145b22da.jpg",
    "https://i.pinimg.com/1200x/87/d1/9a/87d19a416cc3fa057afd4aaa0c725fc2.jpg",
    "https://i.pinimg.com/1200x/0a/32/47/0a3247a6f3f871e549c1d5c9a92adf29.jpg",
    "https://i.pinimg.com/1200x/a7/f6/05/a7f6051158d36f97904869f79f63dafc.jpg",
    "https://i.pinimg.com/736x/ad/73/d8/ad73d83f140e6ca839b1383eb37699bb.jpg",
    "https://i.pinimg.com/1200x/bb/ee/23/bbee23ced26d29a13c9fa094499e3294.jpg",
    "https://i.pinimg.com/1200x/ab/ed/d7/abedd7886cf8ec0e367e0c6198850fb7.jpg",
    "https://i.pinimg.com/1200x/10/12/de/1012de80bc9de67e695a6e4f97d5e056.jpg",
    "https://i.pinimg.com/1200x/7c/71/db/7c71dbeb3e70d97162a6e5de995ae89a.jpg",
    "https://i.pinimg.com/1200x/13/3c/18/133c1864171f4ee5dbd1eccab49bffbd.jpg",
    "https://i.pinimg.com/736x/28/a1/b3/28a1b35df83237e94563bfacf42051ac.jpg",
    "https://i.pinimg.com/736x/d2/0d/72/d20d729ed50624980956586f10c0fc98.jpg",
    "https://i.pinimg.com/736x/4c/b0/27/4cb02795866d6353fabf4d477886b2de.jpg",
    "https://i.pinimg.com/736x/55/a9/a9/55a9a9656fff27ee663684274da2c4f1.jpg",
    "https://i.pinimg.com/736x/16/e2/40/16e240c691b9038b7585cb1ca6e9927a.jpg",
    "https://i.pinimg.com/736x/f6/97/db/f697db3506503c937e1c13aa1f5e611b.jpg",
    "https://i.pinimg.com/736x/a3/b5/ee/a3b5eed66c93e9be7632f858fb319a99.jpg",
    "https://i.pinimg.com/1200x/d6/f6/33/d6f63374bd32e1e3dfcb783f65662e67.jpg",
    "https://i.pinimg.com/736x/49/49/5f/49495fc979496eaea1bfe5782980e928.jpg",
    "https://i.pinimg.com/1200x/11/42/c7/1142c798775dcba3db7d116cc6974d41.jpg",
    "https://i.pinimg.com/736x/2a/3d/4b/2a3d4b5ab2ffdb8aab60101ff2244f27.jpg",
    "https://i.pinimg.com/736x/23/df/5e/23df5e5dfd8722f4bd9c44a0b437c5b0.jpg",
    "https://i.pinimg.com/736x/46/5a/ee/465aee8db7ff9682ef911dea6ee9288e.jpg",
    "https://i.pinimg.com/736x/bc/92/9f/bc929f4c61c75c0bb1dc0f0e7ba76b6a.jpg",
    "https://i.pinimg.com/1200x/8b/13/03/8b1303c011221a61d42cd0dad104191c.jpg",
]


def seed_property_images() -> None:
    db = SessionLocal()
    try:
      pgs = db.query(Pg).order_by(Pg.pg_id).limit(len(PROPERTY_IMAGE_URLS)).all()
      for pg, image_url in zip(pgs, PROPERTY_IMAGE_URLS):
          first_image = (
              db.query(PgImage)
              .filter(PgImage.pg_id == pg.pg_id)
              .order_by(PgImage.image_id)
              .first()
          )

          if first_image:
              first_image.image_url = image_url
              first_image.caption = "Building / property image"
              first_image.data_status = "CURATED_PROPERTY_IMAGE"
          else:
              db.add(PgImage(
                  pg_id=pg.pg_id,
                  image_url=image_url,
                  caption="Building / property image",
                  data_status="CURATED_PROPERTY_IMAGE",
              ))

      db.commit()
      print(f"Updated property images for {len(pgs)} PGs.")
    finally:
      db.close()


if __name__ == "__main__":
    seed_property_images()
