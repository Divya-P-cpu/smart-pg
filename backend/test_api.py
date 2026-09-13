import urllib.request, urllib.parse, json, time, random, sys

BASE = "http://127.0.0.1:8000"

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def post(url, body, headers=None):
    data = json.dumps(body).encode()
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def patch(url, body, headers=None):
    data = json.dumps(body).encode()
    h = {"Content-Type": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

def form_post(url, fields, headers=None):
    data = urllib.parse.urlencode(fields).encode()
    h = {"Content-Type": "application/x-www-form-urlencoded"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()
    except Exception as e:
        return 0, str(e)

results = {}

# ============================================================
print("=" * 70)
print("SETUP: Create test user and owner")
print("=" * 70)

ts = str(int(time.time()))
email = "testuser_" + ts + "@example.com"
owner_email = "testowner_" + ts + "@example.com"
phone = "999" + str(random.randint(1000000, 9999999))
owner_phone = "888" + str(random.randint(1000000, 9999999))

# Register user
s, b = post(BASE + "/api/auth/register", {
    "full_name": "Test User",
    "email": email,
    "password": "testpass123",
    "phone": phone
})
print(f"Register user: {s}")
user_token = None
if s == 200:
    user_token = json.loads(b).get("access_token")
    print(f"User token obtained")
else:
    print(f"Body: {b[:200]}")

# Login user
s, b = form_post(BASE + "/api/auth/login", {"username": email, "password": "testpass123"})
if s == 200:
    user_token = json.loads(b).get("access_token")
    print(f"User login OK")
else:
    print(f"User login failed: {s} {b[:200]}")

# Register owner
s, b = post(BASE + "/api/auth/owner/register", {
    "owner_name": "Test Owner",
    "email": owner_email,
    "password": "testpass123",
    "phone": owner_phone
})
print(f"Register owner: {s}")
owner_token = None
if s == 200:
    owner_token = json.loads(b).get("access_token")
else:
    print(f"Body: {b[:200]}")

# Login owner
s, b = form_post(BASE + "/api/auth/owner/login", {"username": owner_email, "password": "testpass123"})
if s == 200:
    owner_token = json.loads(b).get("access_token")
    print(f"Owner login OK")
else:
    print(f"Owner login failed: {s} {b[:200]}")

user_headers = {"Authorization": f"Bearer {user_token}"} if user_token else {}
owner_headers = {"Authorization": f"Bearer {owner_token}"} if owner_token else {}

# ============================================================
print()
print("=" * 70)
print("TEST 1: GET /api/pgs?city=Hyderabad&page=1&page_size=5")
print("=" * 70)

s, b = get(BASE + "/api/pgs?city=Hyderabad&page=1&page_size=5")
results["pgs_list"] = s
print(f"Status: {s}")
if s == 200:
    try:
        data = json.loads(b)
        print(f"Total PGs: {data.get('total')}")
        print(f"Items returned: {len(data.get('items', []))}")
        if data.get("items"):
            first = data["items"][0]
            print(f"First PG: id={first.get('pg_id')} name={first.get('pg_name')} city={first.get('city')}")
            print(f"  selected_rent={first.get('selected_rent')} selected_sharing={first.get('selected_sharing')}")
            print(f"  min_rent={first.get('min_rent')}")
            print(f"  amenities count: {len(first.get('amenities', []))}")
            print(f"  rooms count: {len(first.get('rooms', []))}")
            if first.get('rooms'):
                r = first['rooms'][0]
                print(f"  First room: id={r.get('room_id')} capacity={r.get('capacity')}")
                print(f"    beds count: {len(r.get('beds', []))}")
                if r.get('beds'):
                    print(f"    First bed: id={r.get('beds')[0].get('bed_id')} status={r.get('beds')[0].get('current_status')}")
        else:
            print("No PGs found!")
    except Exception as e:
        print(f"Parse error: {e}, body: {b[:300]}")
else:
    print(f"Body: {b[:300]}")

# ============================================================
print()
print("=" * 70)
print("TEST 2: GET /api/pgs/PG001")
print("=" * 70)

s, b = get(BASE + "/api/pgs/PG001")
results["pg_detail"] = s
print(f"Status: {s}")
if s == 200:
    try:
        data = json.loads(b)
        print(f"PG: id={data.get('pg_id')} name={data.get('pg_name')}")
        print(f"  city={data.get('city')} area={data.get('area')}")
        print(f"  min_rent={data.get('min_rent')}")
        print(f"  amenities count: {len(data.get('amenities', []))}")
        print(f"  rooms count: {len(data.get('rooms', []))}")
        for i, r in enumerate(data.get('rooms', [])[:3]):
            print(f"  Room {i+1}: id={r.get('room_id')} capacity={r.get('capacity')}")
            print(f"    beds count: {len(r.get('beds', []))}")
            for j, bed in enumerate(r.get('beds', [])[:2]):
                print(f"      Bed {j+1}: id={bed.get('bed_id')} status={bed.get('current_status')}")
    except Exception as e:
        print(f"Parse error: {e}, body: {b[:300]}")
else:
    print(f"Body: {b[:300]}")

# ============================================================
print()
print("=" * 70)
print("TEST 3: GET /api/bookings/owner")
print("=" * 70)

s, b = get(BASE + "/api/bookings/owner", headers=owner_headers)
results["owner_bookings"] = s
print(f"Status: {s}")
if s == 200:
    try:
        data = json.loads(b)
        print(f"Owner bookings count: {len(data)}")
        for bk in data[:3]:
            print(f"  id={bk.get('booking_id')} pg_id={bk.get('pg_id')} status={bk.get('status')} pgName={bk.get('pgName')}")
    except Exception as e:
        print(f"Parse error: {e}, body: {b[:300]}")
else:
    print(f"Body: {b[:300]}")

# ============================================================
print()
print("=" * 70)
print("TEST 4: POST /api/bookings")
print("=" * 70)

s, b = post(BASE + "/api/bookings", {
    "pg_id": "PG001",
    "room_id": None,
    "bed_id": None,
    "requested_move_in_date": "2026-09-15",
    "message": "Looking for AC room"
}, headers=user_headers)
results["create_booking"] = s
print(f"Status: {s}")
new_booking_id = None
if s == 200:
    try:
        data = json.loads(b)
        new_booking_id = data.get('booking_id')
        print(f"  booking_id={data.get('booking_id')} pg_id={data.get('pg_id')} status={data.get('status')}")
        print(f"  pgName={data.get('pgName')} roomName={data.get('roomName')} bedNumber={data.get('bedNumber')}")
        print(f"  rent={data.get('rent')} deposit={data.get('deposit')}")
    except Exception as e:
        print(f"Parse error: {e}, body: {b[:300]}")
else:
    print(f"Body: {b[:300]}")

# ============================================================
print()
print("=" * 70)
print("TEST 5: PATCH /api/bookings/{id}")
print("=" * 70)

if new_booking_id:
    s, b = patch(BASE + f"/api/bookings/{new_booking_id}", {"status": "Accepted"}, headers=owner_headers)
    results["patch_booking"] = s
    print(f"Status: {s}")
    if s == 200:
        try:
            data = json.loads(b)
            print(f"  Updated: booking_id={data.get('booking_id')} status={data.get('status')}")
            print(f"  roomName={data.get('roomName')} bedNumber={data.get('bedNumber')}")
        except Exception as e:
            print(f"Parse error: {e}, body: {b[:300]}")
    else:
        print(f"Body: {b[:300]}")
else:
    print("No booking ID to test PATCH")

# ============================================================
print()
print("=" * 70)
print("TEST 6: GET /api/transport/booking/{id}")
print("=" * 70)

if new_booking_id:
    s, b = get(BASE + f"/api/transport/booking/{new_booking_id}", headers=user_headers)
    results["transport"] = s
    print(f"Status: {s}")
    if s == 200:
        try:
            data = json.loads(b)
            print(json.dumps(data, indent=2)[:800])
        except Exception as e:
            print(f"Parse error: {e}, body: {b[:300]}")
    else:
        print(f"Body: {b[:300]}")
else:
    print("No booking ID to test transport")

# ============================================================
print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
for name, status in results.items():
    print(f"  {name}: {'PASS' if status == 200 else 'FAIL'} (HTTP {status})")
