import urllib.request, urllib.parse, json, time
from jose import jwt

BASE = "http://127.0.0.1:8080"

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

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

ts = str(int(time.time()))
email = "dbguser_" + ts + "@example.com"

s, b = post(BASE + "/api/auth/register", {"full_name": "Test User", "email": email, "password": "testpass123", "phone": "9999999999"})
print(f"Register: {s} {b}")

s, b = form_post(BASE + "/api/auth/login", {"username": email, "password": "testpass123"})
print(f"Login: {s} body={b[:300]}")
token = json.loads(b).get("access_token")
print(f"Token: {token[:50]}...")

# Decode without verification to check payload
try:
    decoded = jwt.get_unverified_header(token)
    print(f"Header: {decoded}")
    payload = jwt.decode(token, options={"verify_signature": False})
    print(f"Payload: {payload}")
except Exception as e:
    print(f"Decode error: {e}")

# Try the /me endpoint
s, b = get(BASE + "/api/auth/me", headers={"Authorization": f"Bearer {token}"})
print(f"\n/me: {s} {b[:200]}")

# Try bookings without auth
s, b = get(BASE + "/api/bookings")
print(f"\nBookings no-auth: {s} {b[:200]}")

# Try bookings with auth
s, b = get(BASE + "/api/bookings", headers={"Authorization": f"Bearer {token}"})
print(f"Bookings with-auth: {s} {b[:300]}")
