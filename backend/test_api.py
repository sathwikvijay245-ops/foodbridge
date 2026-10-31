from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_api():
    print("--- 1. Testing Health ---")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health check OK:", res.json())

    print("\n--- 2. Testing Demo Users & Auth ---")
    res = client.get("/api/auth/demo-users")
    assert res.status_code == 200, res.text
    users = res.json()
    print(f"Loaded {len(users)} demo users.")
    donor_user = next(u for u in users if u["role"] == "donor")
    recip_user = next(u for u in users if u["role"] == "recipient" and u["verification_status"] == "verified")
    admin_user = next(u for u in users if u["role"] == "admin")

    # Donor login
    res = client.post(f"/api/auth/demo-login/{donor_user['id']}")
    assert res.status_code == 200, res.text
    donor_token = res.json()["access_token"]
    donor_headers = {"Authorization": f"Bearer {donor_token}"}
    print("Donor login OK. Logged in as:", donor_user["org_name"])

    # Recipient login
    res = client.post(f"/api/auth/demo-login/{recip_user['id']}")
    assert res.status_code == 200, res.text
    recip_token = res.json()["access_token"]
    recip_headers = {"Authorization": f"Bearer {recip_token}"}
    print("Recipient login OK. Logged in as:", recip_user["org_name"])

    # Admin login
    res = client.post(f"/api/auth/demo-login/{admin_user['id']}")
    assert res.status_code == 200, res.text
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Admin login OK. Logged in as:", admin_user["org_name"])

    print("\n--- 3. Testing Food Listings & Filters ---")
    res = client.get("/api/listings")
    assert res.status_code == 200, res.text
    available_listings = res.json()
    print(f"Available listings count: {len(available_listings)}")
    assert len(available_listings) >= 5, "Expected at least 5 available listings"

    # Category filter
    res = client.get("/api/listings?category=bakery_pastries")
    assert res.status_code == 200, res.text
    print(f"Bakery listings count: {len(res.json())}")

    print("\n--- 4. Testing Impact Metrics ---")
    res = client.get("/api/impact")
    assert res.status_code == 200, res.text
    impact = res.json()
    print("Impact stats:", {
        "completed_donations": impact["total_donations_completed"],
        "total_kg": impact["total_kg_redistributed"],
        "total_meals": impact["total_meals_provided"],
        "co2e_avoided_kg": impact["co2e_avoided_kg"]
    })
    assert impact["total_donations_completed"] > 0
    assert impact["total_meals_provided"] > 0

    print("\n--- 5. Testing Admin Endpoints ---")
    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200, res.text
    print("Admin stats:", res.json())

    res = client.get("/api/admin/reports", headers=admin_headers)
    assert res.status_code == 200, res.text
    reports = res.json()
    print(f"Open reports count: {len(reports)}")

    print("\n--- 6. Testing Complete Request & Claim Workflow ---")
    target_listing = available_listings[0]
    listing_id = target_listing["id"]
    print(f"Testing claim on listing #{listing_id}: '{target_listing['title']}'")

    # Recipient requests listing
    req_payload = {
        "listing_id": listing_id,
        "requested_quantity": "All available",
        "transport_type": "Refrigerated Van",
        "estimated_pickup_time": target_listing["pickup_start"],
        "contact_phone": "+1 555-123-4567",
        "recipient_notes": "Automated workflow test request."
    }
    res = client.post("/api/requests", json=req_payload, headers=recip_headers)
    assert res.status_code == 201, res.text
    req_data = res.json()
    req_id = req_data["id"]
    print(f"Request created with id #{req_id}, status: {req_data['status']}")

    # Prevent duplicate request
    res = client.post("/api/requests", json=req_payload, headers=recip_headers)
    assert res.status_code == 400, "Should prevent duplicate request"
    print("Duplicate request prevented successfully (400 returned).")

    # Listing donor accepts request
    donor_of_listing_id = target_listing["donor_id"]
    res = client.post(f"/api/auth/demo-login/{donor_of_listing_id}")
    actual_donor_token = res.json()["access_token"]
    actual_donor_headers = {"Authorization": f"Bearer {actual_donor_token}"}

    res = client.post(f"/api/requests/{req_id}/action", json={"action": "accept", "notes": "Approved for test pickup!"}, headers=actual_donor_headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "accepted"
    print("Donor accepted request. Listing is now RESERVED.")

    # Check listing status is now RESERVED
    res = client.get(f"/api/listings/{listing_id}")
    assert res.json()["status"] == "reserved"
    pickup_code = res.json()["pickup_code"]
    print(f"Listing #{listing_id} is reserved. Pickup code: {pickup_code}")

    # Confirm pickup
    res = client.post(f"/api/requests/{req_id}/action", json={"action": "confirm_pickup"}, headers=recip_headers)
    assert res.status_code == 200, res.text
    print("Pickup confirmed. Status: in transit.")

    # Complete donation with pickup verification code
    res = client.post(f"/api/requests/{req_id}/action", json={"action": "complete", "pickup_code": pickup_code}, headers=recip_headers)
    assert res.status_code == 200, res.text
    assert res.json()["status"] == "completed"
    print("Donation completed successfully! Status: completed.")

    print("\nALL BACKEND API WORKFLOW TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_api()
