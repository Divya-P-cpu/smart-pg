import urllib.request
import urllib.parse
import json

tests = [
    {"name": "Basic search (no filters)", "params": {}},
    {"name": "Gender Boys + Gachibowli", "params": {"gender": "Boys", "location": "Gachibowli"}},
    {"name": "Multiple filters: Boys + Gachibowli + Double Sharing + Budget 10000", "params": {"gender": "Boys", "location": "Gachibowli", "sharing": "2", "max_price": "10000"}},
    {"name": "Complex amenities: Boys + Gachibowli + Wifi + AC + Power Backup + Gym + Food", "params": {"gender": "Boys", "location": "Gachibowli", "amenities": "Wifi,AC,Power Backup,Gym,Food"}},
    {"name": "Girls + Madhapur + Single Sharing + AC + Cleaning", "params": {"gender": "Girls", "location": "Madhapur", "sharing": "1", "amenities": "AC,Cleaning"}},
    {"name": "Uncommon filter combo with multiple amenities", "params": {"gender": "Boys", "location": "Hitech City", "sharing": "3", "amenities": "AC,Power Backup,Geyser,TV,Laundry"}},
]

results = []
for t in tests:
    qs = urllib.parse.urlencode(t["params"])
    url = f"http://127.0.0.1:8000/api/pgs?{qs}" if qs else "http://127.0.0.1:8000/api/pgs"
    test_res = {"name": t["name"], "url": url}
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            items = data.get("items", []) if isinstance(data, dict) else data
            total = data.get("total", len(items)) if isinstance(data, dict) else len(items)
            test_res["total"] = total
            test_res["top_pgs"] = []
            for pg in items[:3]:
                test_res["top_pgs"].append({
                    "name": pg.get("pg_name"),
                    "gender": pg.get("gender_policy"),
                    "area": pg.get("area"),
                    "city": pg.get("city"),
                    "score": pg.get("compatibility_score"),
                    "match_category": pg.get("match_category"),
                    "is_exact": pg.get("is_exact_match"),
                    "available_beds": pg.get("available_bed_count"),
                    "rooms_count": len(pg.get("rooms", [])),
                    "rent": pg.get("selected_rent") or pg.get("min_rent"),
                    "amenities": pg.get("amenities", [])[:5],
                })
    except Exception as e:
        test_res["error"] = str(e)
    results.append(test_res)

with open("verification_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("SUCCESS: verification_results.json written")
