import urllib.request, urllib.parse, json, time, random

BASE = "http://127.0.0.1:8080"

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

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

rand = random.randint(100000, 999999)
email = "test" + str(rand) + "@example.com"
phone = "777" + str(random.randint(1000000, 9999999))
owner_email = "owner" + str(rand) + "@example.com"
owner_phone = "888" + str(random.randint(1000000, 9999999))

print(f"Using email={email}, phone={phone}")

# Register user
s, b = post(BASE + "/api/auth/register", {"full_name": "Test User", "email": email, "password": "testpass123", "phone": phone})
print(f"Register user: {s} {b}")

# Login user
s, b = form_post(BASE + "/api/auth/login", {"username": email, "password": "testpass123"})
print(f"Login user: {s}")
token = json.loads(b).get("access_token") if s == 200 else None
print(f"Token: {token[:40]}..." if token else "No token")
user_headers = {"Authorization": f"Bearer {token}"}

# Register owner
s, b = post(BASE + "/api/auth/owner/register", {"owner_name": "Test Owner", "email": owner_email, "password": "testpass123", "phone": owner_phone})
print(f"Register owner: {s} {b}")

# Login owner
s, b = form_post(BASE + "/api/auth/owner/login", {"username": owner_email, "password": "testpass123"})
print(f"Login owner: {s}")
owner_token = json.loads(b).get("access_token") if s == 200 else None
print(f"Owner token: {owner_token[:40]}..." if owner_token else "No owner token")
owner_headers = {"Authorization": f"Bearer {owner_token}"}

# Test me endpoint
s, b = get(BASE + "/api/auth/me", headers=user_headers)
print(f"\n/me: {s} {b[:200]}")

print()
print("=" * 70)
print("TEST: GET /api/bookings (user token)")
print("=" * 70)
s, b = get(BASE + "/api/bookings", headers=user_headers)
print(f"Status: {s}")
try:
    data = json.loads(b)
    print(f"Bookings count: {len(data)}")
    for bk in data[:3]:
        print(f"  -- id={bk.get('booking_id')} pg_id={bk.get('pg_id')} status={bk.get('status')} pgName={bk.get('pgName')} rent={bk.get('rent')}")
except Exception as e:
    print(f"ERROR: {e}, body: {b[:300]}")

print()
print("=" * 70)
print("TEST: GET /api/bookings/owner (owner token)")
print("=" * 70)
s, b = get(BASE + "/api/bookings/owner", headers=owner_headers)
print(f"Status: {s}")
try:
    data = json.loads(b)
    print(f"Owner bookings count: {len(data)}")
    for bk in data[:3]:
        print(f"  -- id={bk.get('booking_id')} pg_id={bk.get('pg_id')} status={bk.get('status')} pgName={bk.get('pgName')}")
except Exception as e:
    print(f"ERROR: {e}, body: {b[:300]}")

print()
print("=" * 70)
print("TEST: POST /api/bookings (user token)")
print("=" * 70)
s, b = post(BASE + "/api/bookings", {"pg_id": "PG001", "room_id": None, "bed_id": None, "requested_move_in_date": "2026-09-15", "message": "Looking for AC room"}, headers=user_headers)
print(f"Status: {s}")
try:
    data = json.loads(b)
    print(f"  booking_id={data.get('booking_id')} pg_id={data.get('pg_id')} status={data.get('status')}")
    print(f"  pgName={data.get('pgName')} roomName={data.get('roomName')} bedNumber={data.get('bedNumber')} rent={data.get('rent')}")
    print(f"  userName={data.get('userName')} userEmail={data.get('userEmail')}")
    new_bid = data.get("booking_id")
except Exception as e:
    print(f"ERROR: {e}, body: {b[:300]}")
    new_bid = None

print()
print("=" * 70)
print("TEST: PATCH /api/bookings/{booking_id} (owner token)")
print("=" * 70)
s, b = get(BASE + "/api/bookings/owner", headers=owner_headers)
try:
    data = json.loads(b)
    if data and len(data) > 0:
        bid = data[0]["booking_id"]
        print(f"Found booking_id={bid} status={data[0]['status']}")
        s, b = patch(BASE + f"/api/bookings/{bid}", {"status": "Accepted"}, headers=owner_headers)
        print(f"PATCH status: {s}")
        if s == 200:
            data2 = json.loads(b)
            print(f"  Updated: booking_id={data2.get('booking_id')} status={data2.get('status')}")
            print(f"  roomName={data2.get('roomName')} bedNumber={data2.get('bedNumber')}")
        else:
            print(f"  Error: {b[:300]}")
    else:
        print("No bookings found for owner")
except Exception as e:
    print(f"ERROR: {e}, body: {b[:300]}")

print()
print("=" * 70)
print("TEST: GET /api/transport/booking/{booking_id} (user token)")
print("=" * 70)
s, b = get(BASE + "/api/bookings", headers=user_headers)
try:
    data = json.loads(b)
    accepted_bookings = [bk for bk in data if bk.get("status") == "Accepted"]
    if accepted_bookings:
        bid = accepted_bookings[0]["booking_id"]
        print(f"Testing transport for accepted booking_id={bid}")
        s, b = get(BASE + f"/api/transport/booking/{bid}", headers=user_headers)
        print(f"Status: {s}")
        try:
            tdata = json.loads(b)
            print(json.dumps(tdata, indent=2)[:800])
        except:
            print(f"Body: {b[:300]}")
    else:
        print(f"No accepted bookings. User has {len(data)} bookings, statuses: {[bk.get('status') for bk in data]}")
        # Try with any booking id
        if data:
            bid = data[0]["booking_id"]
            print(f"Trying transport for booking_id={bid} (status={data[0].get('status')})")
            s, b = get(BASE + f"/api/transport/booking/{bid}", headers=user_headers)
            print(f"Status: {s} body: {b[:300]}")
except Exception as e:
    print(f"ERROR: {e}, body: {b[:300]}")
