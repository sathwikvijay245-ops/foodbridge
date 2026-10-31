from datetime import datetime, timedelta
from backend.database import SessionLocal, engine, Base
from backend.models import (
    User, FoodListing, DonationRequest, Report, Notification, AuditLog,
    UserRole, VerificationStatus, FoodCategory, StorageRequirement,
    ListingStatus, RequestStatus, ReportStatus
)
from backend.auth_utils import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already contains data, skipping seed.")
        db.close()
        return

    print("Seeding realistic demo data for FoodBridge (HACK-P197)...")
    default_pw = hash_password("demo1234")

    # ── 1. Admin ──────────────────────────────────────────────────────────────
    admin_user = User(
        email="admin@foodbridge.org",
        hashed_password=default_pw,
        full_name="Sarah Jenkins (Admin)",
        role=UserRole.ADMIN,
        org_name="FoodBridge Foundation Governance",
        org_type="Platform Administration & Compliance",
        phone="+1 (555) 019-2834",
        address="100 Innovation Way, Suite 400",
        city="Metropolis",
        verification_status=VerificationStatus.VERIFIED,
        is_active=True
    )
    db.add(admin_user)

    # ── 2. Donors ─────────────────────────────────────────────────────────────
    donor1 = User(
        email="artisan@bakehouse.com", hashed_password=default_pw,
        full_name="Marco Rossi", role=UserRole.DONOR,
        org_name="The Artisan Bakehouse", org_type="Bakery & Pastry Shop",
        phone="+1 (555) 234-5678", address="442 Baker Street", city="Metropolis",
        food_safety_cert_id="FSS-NY-89124", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    donor2 = User(
        email="catering@goldenplatter.com", hashed_password=default_pw,
        full_name="Chef Linda Vance", role=UserRole.DONOR,
        org_name="Golden Platter Hospitality & Catering", org_type="Caterer / Event Hall",
        phone="+1 (555) 345-6789", address="1200 Grand Avenue, Banquet Wing", city="Metropolis",
        food_safety_cert_id="FSS-NY-44810", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    donor3 = User(
        email="manager@metrofresh.com", hashed_password=default_pw,
        full_name="David Chen", role=UserRole.DONOR,
        org_name="Metro Fresh Organics Supermarket", org_type="Supermarket & Grocery",
        phone="+1 (555) 456-7890", address="88 Market Boulevard", city="Metropolis",
        food_safety_cert_id="FSS-NY-90211", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    donor4 = User(
        email="chefkate@sunrisecafekitchen.org", hashed_password=default_pw,
        full_name="Chef Kate Morales", role=UserRole.DONOR,
        org_name="Sunrise Community Bistro & Deli", org_type="Community Kitchen & Deli",
        phone="+1 (555) 567-8901", address="315 Elmwood Terrace", city="Metropolis",
        food_safety_cert_id="FSS-NY-33921", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    donor5 = User(
        email="chef@spicegardenrestaurant.com", hashed_password=default_pw,
        full_name="Raj Patel", role=UserRole.DONOR,
        org_name="Spice Garden Indian Restaurant", org_type="Restaurant",
        phone="+1 (555) 678-1234", address="22 Curry Lane", city="Metropolis",
        food_safety_cert_id="FSS-NY-55102", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    donor6 = User(
        email="manager@freshbowls.com", hashed_password=default_pw,
        full_name="Aisha Thompson", role=UserRole.DONOR,
        org_name="Fresh Bowls & Wraps Café", org_type="Fast-Casual Restaurant",
        phone="+1 (555) 789-2345", address="10 Harvest Road", city="Metropolis",
        food_safety_cert_id="FSS-NY-66310", verification_status=VerificationStatus.VERIFIED, is_active=True
    )
    db.add_all([donor1, donor2, donor3, donor4, donor5, donor6])
    db.commit()

    # ── 3. Recipients ─────────────────────────────────────────────────────────
    recipient1 = User(
        email="coordinator@cityhopeshelter.org", hashed_password=default_pw,
        full_name="Marcus Brody", role=UserRole.RECIPIENT,
        org_name="City Hope Homeless Shelter & Care Center", org_type="Emergency Shelter & Hot Meal Provider",
        phone="+1 (555) 678-9012", address="714 8th Avenue, Downtown", city="Metropolis",
        charity_reg_number="CH-501C3-882341", verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=True,
        volunteer_capacity="18 full-time staff, 40 active volunteers; serving 350 nightly guests",
        mission_statement="Providing dignifying immediate shelter, hot nutritious meals, and pathway support for unhoused neighbors.",
        is_active=True
    )
    recipient2 = User(
        email="director@greenleafpantry.org", hashed_password=default_pw,
        full_name="Sister Evelyn Adams", role=UserRole.RECIPIENT,
        org_name="Greenleaf Community Food Pantry", org_type="Community Food Bank & Distribution Hub",
        phone="+1 (555) 789-0123", address="1025 Pine Hollow Road", city="Metropolis",
        charity_reg_number="GL-501C3-993812", verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=True,
        volunteer_capacity="2 cargo vans, 25 weekend distribution volunteers",
        mission_statement="Ending local neighborhood food insecurity through weekly dignified grocery rescue and pantry distribution.",
        is_active=True
    )
    recipient3 = User(
        email="contact@stjudeyouthhaven.org", hashed_password=default_pw,
        full_name="Pastor Jamal Washington", role=UserRole.RECIPIENT,
        org_name="St. Jude Youth & Family Haven", org_type="Youth Center & Family Crisis Support",
        phone="+1 (555) 890-1234", address="550 Martin Luther King Jr. Blvd", city="Metropolis",
        charity_reg_number="SJ-501C3-112048", verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=False,
        volunteer_capacity="12 volunteer drivers with insulated thermal transport bags",
        mission_statement="Nurturing vulnerable at-risk youth and working single-parent families with safe afterschool meals.",
        is_active=True
    )
    recipient_pending = User(
        email="help@beaconmission.org", hashed_password=default_pw,
        full_name="Thomas Wright", role=UserRole.RECIPIENT,
        org_name="Beacon Hill Community Outreach", org_type="Faith-Based Outreach & Soup Kitchen",
        phone="+1 (555) 901-2345", address="12 Beacon Hill Way", city="Metropolis",
        charity_reg_number="BH-501C3-440219", verification_status=VerificationStatus.PENDING,
        refrigerated_transport=False,
        volunteer_capacity="8 volunteers, 1 passenger minivan",
        mission_statement="Serving weekly warm soup dinners to elderly and disabled shut-in residents.",
        is_active=True
    )
    recipient4 = User(
        email="admin@childrensfoodnetwork.org", hashed_password=default_pw,
        full_name="Dr. Priya Sharma", role=UserRole.RECIPIENT,
        org_name="Children's Nutrition Network", org_type="Child Welfare & School Meal Program",
        phone="+1 (555) 234-8765", address="200 Sunshine Avenue", city="Metropolis",
        charity_reg_number="CN-501C3-770541", verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=True,
        volunteer_capacity="5 refrigerated vans, 60 school site volunteers",
        mission_statement="Ensuring every child has access to nutritious meals before and after school.",
        is_active=True
    )
    db.add_all([recipient1, recipient2, recipient3, recipient_pending, recipient4])
    db.commit()

    now = datetime.utcnow()

    # ── 4. Food Listings (20 diverse listings, long pickup windows so they don't expire) ──
    listings = [
        # === AVAILABLE LISTINGS ===
        FoodListing(
            donor_id=donor1.id,
            title="Freshly Baked Artisanal Sourdough & Croissants Surplus",
            description="End-of-day surplus of traditional slow-fermented sourdough boules, multi-grain batards, and butter croissants. All baked early morning, crisp crusts, perfectly packaged in food-grade bakery bags.",
            category=FoodCategory.BAKERY_PASTRIES, quantity=35.0, unit="kg", quantity_kg=35.0, estimated_meals=85,
            preparation_time=now - timedelta(hours=6), use_by_time=now + timedelta(days=7),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Individual kraft paper bakery liners inside 4 clean stackable crates.",
            dietary_tags="Vegetarian, Nut-Free", allergen_info="Contains Wheat (Gluten), Dairy, Yeast.",
            pickup_address="442 Baker Street (Alley Loading Bay)", pickup_city="Metropolis", pickup_zip="10002",
            latitude=40.7180, longitude=-73.9920,
            pickup_instructions="Back loading dock through double wooden doors. Ring bell marked 'Kitchen Loading'.",
            pickup_start=now + timedelta(minutes=30), pickup_end=now + timedelta(days=3),
            food_safety_certified=True, food_safety_notes="Baked at 450°F, held in dry climate-controlled holding racks.",
            status=ListingStatus.AVAILABLE, pickup_code="3841"
        ),
        FoodListing(
            donor_id=donor2.id,
            title="Unserved Herb-Roasted Lemon Chicken Breast & Wild Rice Pilaf",
            description="Prepared for an executive corporate banquet with reduced headcount. Kept sealed in hot-holding transport cambros above 65°C / 150°F. Never touched buffet line. Tender boneless chicken breasts with herb glaze, wild rice pilaf, and steamed garlic green beans.",
            category=FoodCategory.COOKED_MEALS, quantity=45.0, unit="kg", quantity_kg=45.0, estimated_meals=110,
            preparation_time=now - timedelta(hours=2), use_by_time=now + timedelta(days=1),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="12 deep hotel pans with heavy-gauge aluminum foil crimp seals.",
            dietary_tags="Gluten-Free, Halal-Certified, Nut-Free", allergen_info="None of the top 9 allergens present.",
            pickup_address="1200 Grand Avenue, Service Ramp #3", pickup_city="Metropolis", pickup_zip="10014",
            latitude=40.7290, longitude=-74.0080,
            pickup_instructions="Proceed down the service ramp to Dock 3. Ask for Chef Linda Vance.",
            pickup_start=now + timedelta(minutes=15), pickup_end=now + timedelta(hours=18),
            food_safety_certified=True, food_safety_notes="Maintained continuously above 65°C (149°F).",
            status=ListingStatus.AVAILABLE, pickup_code="7729"
        ),
        FoodListing(
            donor_id=donor3.id,
            title="Assorted Organic Crisp Apples, Carrots & Bell Peppers",
            description="Surplus produce from morning warehouse replenishment. Top commercial grade Fuji apples, sweet orange carrots, and mixed color sweet bell peppers. Crisp, unbruised, ideal for family food boxes.",
            category=FoodCategory.FRESH_PRODUCE, quantity=60.0, unit="kg", quantity_kg=60.0, estimated_meals=140,
            preparation_time=now - timedelta(hours=12), use_by_time=now + timedelta(days=5),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="6 reinforced ventilated cardboard produce lugs with handles.",
            dietary_tags="Vegan, Vegetarian, Gluten-Free, Halal, Kosher", allergen_info="Allergen-free natural fresh produce.",
            pickup_address="88 Market Boulevard, Rear Receiving Dock", pickup_city="Metropolis", pickup_zip="10003",
            latitude=40.7320, longitude=-73.9870,
            pickup_instructions="Drive to receiving bay near trash compactor. Mention FoodBridge pickup to David Chen.",
            pickup_start=now + timedelta(hours=1), pickup_end=now + timedelta(days=4),
            food_safety_certified=True, food_safety_notes="Stored in 38°F commercial walk-in cooler immediately upon delivery.",
            status=ListingStatus.AVAILABLE, pickup_code="5210"
        ),
        FoodListing(
            donor_id=donor4.id,
            title="Individual Grab-and-Go Deli Turkey & Veggie Sandwiches",
            description="Individually labeled packaged lunch boxes with roast turkey provolone subs, Mediterranean roasted hummus wraps, and garden vinaigrette grain bowls. Complete with disposable compostable cutlery packets.",
            category=FoodCategory.COOKED_MEALS, quantity=40.0, unit="portions", quantity_kg=22.0, estimated_meals=40,
            preparation_time=now - timedelta(hours=4), use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="40 individual sealed clamshell deli boxes labeled with ingredients and dates.",
            dietary_tags="Vegetarian Options, Nut-Free", allergen_info="Contains Dairy, Wheat. Hummus wraps are Dairy-Free.",
            pickup_address="315 Elmwood Terrace, Side Entrance", pickup_city="Metropolis", pickup_zip="10019",
            latitude=40.7650, longitude=-73.9820,
            pickup_instructions="Side kitchen entrance. Free 15-minute loading spot directly in front.",
            pickup_start=now + timedelta(minutes=45), pickup_end=now + timedelta(days=2),
            food_safety_certified=True, food_safety_notes="Assembled in chilled prep station; held at 36°F.",
            status=ListingStatus.AVAILABLE, pickup_code="6412"
        ),
        FoodListing(
            donor_id=donor3.id,
            title="Organic Whole Milk Gallons & Greek Vanilla Yogurt Tubs",
            description="High-quality sealed dairy overstock approaching 4 days to best-by date. 16 gallons of grade-A organic whole milk and 24 tubs of 32oz whole milk Greek yogurt. Kept continuously in chilled dairy vault.",
            category=FoodCategory.DAIRY_CHILLED, quantity=50.0, unit="kg", quantity_kg=50.0, estimated_meals=120,
            preparation_time=now - timedelta(days=1), use_by_time=now + timedelta(days=4),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="Factory sealed retail tamper-evident jugs and foil-sealed tubs.",
            dietary_tags="Vegetarian, Gluten-Free, Kosher", allergen_info="Contains Cow's Milk (Dairy).",
            pickup_address="88 Market Boulevard, Rear Receiving Dock", pickup_city="Metropolis", pickup_zip="10003",
            latitude=40.7320, longitude=-73.9870,
            pickup_instructions="Bring refrigerated van or insulated cooler bags with ice packs.",
            pickup_start=now + timedelta(hours=2), pickup_end=now + timedelta(days=3),
            food_safety_certified=True, food_safety_notes="Continuous cold-chain temperature telemetry logged at 34-37°F.",
            status=ListingStatus.AVAILABLE, pickup_code="9083"
        ),
        FoodListing(
            donor_id=donor2.id,
            title="Hearty Penne Pasta with Rich Beef Bolognese & Garlic Bread",
            description="Freshly prepared Italian buffet surplus. Savory slow-simmered beef & tomato ragù tossed with al dente penne rigate, paired with 60 slices of golden herb garlic focaccia. Kept in steam tables above 145°F.",
            category=FoodCategory.COOKED_MEALS, quantity=38.0, unit="kg", quantity_kg=38.0, estimated_meals=90,
            preparation_time=now - timedelta(hours=3), use_by_time=now + timedelta(hours=20),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="8 sealed deep aluminum chaffing pans.",
            dietary_tags="Nut-Free", allergen_info="Contains Wheat (Gluten), Beef, Dairy (Parmesan cheese).",
            pickup_address="1200 Grand Avenue, Banquet Wing", pickup_city="Metropolis", pickup_zip="10014",
            latitude=40.7290, longitude=-74.0080,
            pickup_instructions="Park at service dock #2. Chef Vance will assist loading onto carts.",
            pickup_start=now + timedelta(minutes=45), pickup_end=now + timedelta(hours=10),
            food_safety_certified=True, food_safety_notes="Prepared today in health-inspected commercial banquet kitchen.",
            status=ListingStatus.AVAILABLE, pickup_code="1478"
        ),
        FoodListing(
            donor_id=donor5.id,
            title="Vegetarian Butter Chicken & Basmati Rice — 60 Portions",
            description="Surplus from a private corporate lunch. Rich tomato-cream butter sauce with paneer and mixed vegetables, served alongside fragrant basmati rice with cumin seeds. Authentic North Indian flavors.",
            category=FoodCategory.COOKED_MEALS, quantity=25.0, unit="kg", quantity_kg=25.0, estimated_meals=60,
            preparation_time=now - timedelta(hours=3), use_by_time=now + timedelta(hours=16),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="6 foil-covered hotel pans + 3 pans of rice. Serving spoons included.",
            dietary_tags="Vegetarian, Gluten-Free, Nut-Free", allergen_info="Contains Dairy (cream, paneer).",
            pickup_address="22 Curry Lane, Restaurant Back Door", pickup_city="Metropolis", pickup_zip="10025",
            latitude=40.7480, longitude=-73.9840,
            pickup_instructions="Park behind the restaurant on Saffron Alley. Ask for Chef Raj.",
            pickup_start=now + timedelta(hours=1), pickup_end=now + timedelta(hours=8),
            food_safety_certified=True, food_safety_notes="Held above 63°C in commercial hot-holding cabinets.",
            status=ListingStatus.AVAILABLE, pickup_code="2288"
        ),
        FoodListing(
            donor_id=donor6.id,
            title="Mixed Grain Power Bowls & Açaí Smoothie Packs",
            description="30 unsold grab-and-go grain bowls with quinoa, roasted sweet potato, avocado, and tahini dressing. Also 20 frozen açaí smoothie packs, factory sealed. Perfect for a youth center or school program.",
            category=FoodCategory.COOKED_MEALS, quantity=18.0, unit="portions", quantity_kg=14.0, estimated_meals=50,
            preparation_time=now - timedelta(hours=5), use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="Individual sealed bowls + frozen smoothie packs in insulated bag.",
            dietary_tags="Vegan, Gluten-Free, Dairy-Free, Nut-Free", allergen_info="Contains Sesame (tahini). All others allergen-free.",
            pickup_address="10 Harvest Road, Front Counter", pickup_city="Metropolis", pickup_zip="10031",
            latitude=40.7590, longitude=-73.9750,
            pickup_instructions="Walk to the front counter and ask for Aisha. Bring a cooler bag.",
            pickup_start=now + timedelta(minutes=30), pickup_end=now + timedelta(days=2),
            food_safety_certified=True, food_safety_notes="Refrigerated at 35°F continuously since prep.",
            status=ListingStatus.AVAILABLE, pickup_code="4433"
        ),
        FoodListing(
            donor_id=donor3.id,
            title="Fresh-Pressed Cold Juices (Orange, Green Detox & Berry)",
            description="50 bottles (16oz each) of unpasteurized premium cold-pressed juices. Must be kept strictly refrigerated. Expiry in 3 days. Nutrient-dense vitamins for youth and seniors.",
            category=FoodCategory.BEVERAGES, quantity=25.0, unit="kg", quantity_kg=25.0, estimated_meals=50,
            preparation_time=now - timedelta(hours=8), use_by_time=now + timedelta(days=3),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="50 sealed PET bottles in sturdy plastic beverage crates.",
            dietary_tags="Vegan, Gluten-Free, Raw, Kosher", allergen_info="Allergen-free 100% pure fruits and vegetables.",
            pickup_address="88 Market Boulevard", pickup_city="Metropolis", pickup_zip="10003",
            latitude=40.7320, longitude=-73.9870,
            pickup_instructions="Dock receiving cooler door 4. Bring refrigerated transport.",
            pickup_start=now + timedelta(hours=1), pickup_end=now + timedelta(days=3),
            food_safety_certified=True, food_safety_notes="Bottled at 36°F, kept in dedicated cold display.",
            status=ListingStatus.AVAILABLE, pickup_code="3309"
        ),
        FoodListing(
            donor_id=donor1.id,
            title="Assorted Blueberry Muffins, Cinnamon Rolls & Danish Pastries",
            description="72 individually wrapped morning pastries from our weekend brunch surplus. Jumbo blueberry bran muffins, soft cinnamon sugar rolls with cream cheese glaze, and fruit danish. Excellent for shelter breakfast service.",
            category=FoodCategory.BAKERY_PASTRIES, quantity=22.0, unit="kg", quantity_kg=22.0, estimated_meals=72,
            preparation_time=now - timedelta(hours=4), use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="3 large stackable pastry boxes with individual wax paper sleeves.",
            dietary_tags="Vegetarian", allergen_info="Contains Wheat, Dairy, Eggs. Cinnamon rolls contain Soy.",
            pickup_address="442 Baker Street, Front Counter Window", pickup_city="Metropolis", pickup_zip="10002",
            latitude=40.7185, longitude=-73.9915,
            pickup_instructions="Front service window pickup. Marco will have the boxes ready by the door.",
            pickup_start=now + timedelta(hours=1), pickup_end=now + timedelta(days=2),
            food_safety_certified=True, food_safety_notes="Ambient cooling under sanitary covers.",
            status=ListingStatus.AVAILABLE, pickup_code="8150"
        ),
        FoodListing(
            donor_id=donor4.id,
            title="Vegan Moroccan Spiced Lentil & Chickpea Stew with Couscous",
            description="Warm hearty aromatic stew featuring brown lentils, chickpeas, sweet carrots, and cinnamon-cumin tomato broth served alongside fluffy steamed couscous. Excellent nutritional profile.",
            category=FoodCategory.COOKED_MEALS, quantity=30.0, unit="kg", quantity_kg=30.0, estimated_meals=75,
            preparation_time=now - timedelta(hours=3), use_by_time=now + timedelta(hours=20),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="6 food-grade insulated thermal cambro containers.",
            dietary_tags="Vegan, Vegetarian, Halal, Nut-Free, Dairy-Free", allergen_info="Contains Wheat (Couscous). Stew itself is gluten-free.",
            pickup_address="315 Elmwood Terrace", pickup_city="Metropolis", pickup_zip="10019",
            latitude=40.7650, longitude=-73.9820,
            pickup_instructions="Chef Kate Morales is holding in kitchen warming ovens.",
            pickup_start=now + timedelta(hours=1), pickup_end=now + timedelta(hours=8),
            food_safety_certified=True, food_safety_notes="Cooked to 195°F and held at 155°F.",
            status=ListingStatus.AVAILABLE, pickup_code="4921"
        ),
        FoodListing(
            donor_id=donor5.id,
            title="Biryani Rice & Mixed Vegetable Curry — 80 Portions",
            description="Fragrant long-grain basmati biryani with whole spices, caramelized onions, and mint chutney. Accompanied by rich mixed vegetable curry with potatoes, peas, and cauliflower in tomato masala.",
            category=FoodCategory.COOKED_MEALS, quantity=32.0, unit="kg", quantity_kg=32.0, estimated_meals=80,
            preparation_time=now - timedelta(hours=2), use_by_time=now + timedelta(hours=14),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="8 deep aluminum foil trays with sealed lids and labels.",
            dietary_tags="Vegan, Vegetarian, Dairy-Free, Nut-Free", allergen_info="Allergen-free. No top 9 allergens present.",
            pickup_address="22 Curry Lane", pickup_city="Metropolis", pickup_zip="10025",
            latitude=40.7482, longitude=-73.9841,
            pickup_instructions="Ring doorbell at rear kitchen entrance. Ask for Chef Raj Patel.",
            pickup_start=now + timedelta(minutes=30), pickup_end=now + timedelta(hours=6),
            food_safety_certified=True, food_safety_notes="Held at 72°C in commercial hot food storage cabinet.",
            status=ListingStatus.AVAILABLE, pickup_code="5577"
        ),
        FoodListing(
            donor_id=donor6.id,
            title="Whole Grain Oat Cereals, Pasta Boxes & Canned Black Beans",
            description="Surplus bulk dry goods cartons from promotional rotation. Shelf-stable pantry staples, high fiber whole grain cereals, boxed penne pasta, and canned black beans. Great for food pantry distribution.",
            category=FoodCategory.PACKAGED_PANTRY, quantity=120.0, unit="kg", quantity_kg=120.0, estimated_meals=285,
            preparation_time=now - timedelta(days=3), use_by_time=now + timedelta(days=180),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="10 sealed factory master cartons.",
            dietary_tags="Vegetarian, Halal, Kosher", allergen_info="Cereals contain Gluten; Canned beans are Allergen-Free.",
            pickup_address="10 Harvest Road", pickup_city="Metropolis", pickup_zip="10031",
            latitude=40.7590, longitude=-73.9750,
            pickup_instructions="Loading dock at rear of building. Ring buzzer twice.",
            pickup_start=now + timedelta(hours=2), pickup_end=now + timedelta(days=5),
            food_safety_certified=True, food_safety_notes="Factory sealed dry goods stored in humidity-controlled depot.",
            status=ListingStatus.AVAILABLE, pickup_code="7781"
        ),
        FoodListing(
            donor_id=donor2.id,
            title="Grilled Salmon Fillets with Herb Lemon Quinoa — 50 Portions",
            description="Surplus banquet dinner courses from a medical conference gala. Individually plated grilled wild salmon portions with organic quinoa, roasted asparagus, and citrus herb dressing.",
            category=FoodCategory.COOKED_MEALS, quantity=20.0, unit="kg", quantity_kg=20.0, estimated_meals=50,
            preparation_time=now - timedelta(hours=1), use_by_time=now + timedelta(hours=12),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="10 insulated catering food warmers, each holding 5 portions.",
            dietary_tags="Gluten-Free, Dairy-Free, Nut-Free", allergen_info="Contains Fish (Salmon).",
            pickup_address="1200 Grand Avenue, Kitchen Entrance", pickup_city="Metropolis", pickup_zip="10014",
            latitude=40.7292, longitude=-74.0082,
            pickup_instructions="Ask for banquet coordinator at kitchen entrance. ID required.",
            pickup_start=now + timedelta(minutes=20), pickup_end=now + timedelta(hours=6),
            food_safety_certified=True, food_safety_notes="Maintained at 140°F+ in commercial warmers.",
            status=ListingStatus.AVAILABLE, pickup_code="6643"
        ),
        FoodListing(
            donor_id=donor1.id,
            title="Artisan French Baguettes & Blueberry Streusel Breakfast Muffins",
            description="50 freshly baked French crusty baguettes and 4 dozen jumbo blueberry bran muffins. Packed in clean food-safe bakery liners and sturdy distribution cartons.",
            category=FoodCategory.BAKERY_PASTRIES, quantity=28.0, unit="kg", quantity_kg=28.0, estimated_meals=70,
            preparation_time=now - timedelta(hours=5), use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Heavyweight bakery shipping cartons.",
            dietary_tags="Vegetarian, Nut-Free", allergen_info="Contains Wheat, Dairy, Eggs.",
            pickup_address="442 Baker Street", pickup_city="Metropolis", pickup_zip="10002",
            latitude=40.7180, longitude=-73.9920,
            pickup_instructions="Alley entrance loading dock. Ring bell.",
            pickup_start=now + timedelta(minutes=45), pickup_end=now + timedelta(days=2),
            food_safety_certified=True, food_safety_notes="Ambient cooling under sanitary covers.",
            status=ListingStatus.AVAILABLE, pickup_code="8832"
        ),

        # === RESERVED (already accepted) ===
        FoodListing(
            donor_id=donor4.id,
            title="Homestyle Vegetable Minestrone Soup — 100 Portions",
            description="Rich Italian minestrone with cannellini beans, zucchini, diced tomatoes, elbow pasta, and fresh basil. Hearty and warming — ideal for shelter evening meal service.",
            category=FoodCategory.COOKED_MEALS, quantity=40.0, unit="kg", quantity_kg=40.0, estimated_meals=100,
            preparation_time=now - timedelta(hours=2), use_by_time=now + timedelta(hours=18),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="10 large soup containers with sealed lids and ladles.",
            dietary_tags="Vegan, Dairy-Free, Nut-Free", allergen_info="Contains Wheat (pasta). All others allergen-free.",
            pickup_address="315 Elmwood Terrace, Kitchen Side Door", pickup_city="Metropolis", pickup_zip="10019",
            latitude=40.7652, longitude=-73.9818,
            pickup_instructions="RESERVED — City Hope Shelter pickup confirmed at 3PM.",
            pickup_start=now + timedelta(hours=2), pickup_end=now + timedelta(hours=8),
            food_safety_certified=True, food_safety_notes="Held at 75°C continuously.",
            status=ListingStatus.RESERVED, pickup_code="1192"
        ),

        # === COMPLETED (historical impact) ===
        FoodListing(
            donor_id=donor3.id,
            title="Rustic Multi-Grain Sandwich Loaves & Brioche Rolls",
            description="Wholesome sandwich breads baked for university dining hall supply.",
            category=FoodCategory.BAKERY_PASTRIES, quantity=42.0, unit="kg", quantity_kg=42.0, estimated_meals=100,
            preparation_time=now - timedelta(days=5), use_by_time=now - timedelta(days=3),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Sealed bread bags.",
            dietary_tags="Vegetarian", allergen_info="Contains Wheat, Eggs, Milk.",
            pickup_address="88 Market Boulevard", pickup_city="Metropolis", pickup_zip="10003",
            latitude=40.7320, longitude=-73.9870,
            pickup_instructions="Completed handoff to Greenleaf Pantry.",
            pickup_start=now - timedelta(days=5, hours=3), pickup_end=now - timedelta(days=5),
            food_safety_certified=True, food_safety_notes="Clean room ambient temperature storage.",
            status=ListingStatus.COMPLETED, pickup_code="7102"
        ),
        FoodListing(
            donor_id=donor2.id,
            title="Catered Roast Beef & Yorkshire Pudding — Conference Surplus",
            description="150 portions of prime rib roast with traditional Yorkshire pudding and roasted root vegetables from a canceled gala dinner.",
            category=FoodCategory.COOKED_MEALS, quantity=55.0, unit="kg", quantity_kg=55.0, estimated_meals=150,
            preparation_time=now - timedelta(days=3), use_by_time=now - timedelta(days=2),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="15 large cambro containers.",
            dietary_tags="Gluten-Free option available, Nut-Free", allergen_info="Contains Eggs, Dairy. Gluten in Yorkshire pudding.",
            pickup_address="1200 Grand Avenue", pickup_city="Metropolis", pickup_zip="10014",
            latitude=40.7290, longitude=-74.0080,
            pickup_instructions="Completed — handed to City Hope Shelter.",
            pickup_start=now - timedelta(days=3, hours=2), pickup_end=now - timedelta(days=3),
            food_safety_certified=True, food_safety_notes="Blast chilled post-service, reheated to 165°F before handoff.",
            status=ListingStatus.COMPLETED, pickup_code="4190"
        ),
        FoodListing(
            donor_id=donor5.id,
            title="Dal Makhani & Garlic Naan — Weekend Surplus",
            description="Rich creamy black lentil dal slow-cooked overnight with butter and cream, served with freshly baked garlic naan bread.",
            category=FoodCategory.COOKED_MEALS, quantity=20.0, unit="kg", quantity_kg=20.0, estimated_meals=50,
            preparation_time=now - timedelta(days=2), use_by_time=now - timedelta(days=1),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="5 sealed hotel pans.",
            dietary_tags="Vegetarian, Nut-Free", allergen_info="Contains Dairy (butter, cream), Wheat (naan).",
            pickup_address="22 Curry Lane", pickup_city="Metropolis", pickup_zip="10025",
            latitude=40.7480, longitude=-73.9840,
            pickup_instructions="Completed — picked up by St. Jude Youth Haven.",
            pickup_start=now - timedelta(days=2, hours=3), pickup_end=now - timedelta(days=2),
            food_safety_certified=True, food_safety_notes="Held above 60°C throughout service.",
            status=ListingStatus.COMPLETED, pickup_code="9901"
        ),
        FoodListing(
            donor_id=donor6.id,
            title="Teriyaki Chicken Rice Boxes — Lunch Surplus",
            description="45 individual meal boxes with teriyaki glazed chicken thigh, steamed jasmine rice, stir-fried bok choy, and sesame edamame.",
            category=FoodCategory.COOKED_MEALS, quantity=18.0, unit="portions", quantity_kg=15.0, estimated_meals=45,
            preparation_time=now - timedelta(days=4), use_by_time=now - timedelta(days=3),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="45 individual meal boxes.",
            dietary_tags="Gluten-Free, Dairy-Free, Nut-Free", allergen_info="Contains Soy (teriyaki sauce, edamame), Sesame.",
            pickup_address="10 Harvest Road", pickup_city="Metropolis", pickup_zip="10031",
            latitude=40.7590, longitude=-73.9750,
            pickup_instructions="Completed — picked up by Children's Nutrition Network.",
            pickup_start=now - timedelta(days=4, hours=2), pickup_end=now - timedelta(days=4),
            food_safety_certified=True, food_safety_notes="Refrigerated at 35°F continuously.",
            status=ListingStatus.COMPLETED, pickup_code="3312"
        ),
    ]

    for l in listings:
        db.add(l)
    db.commit()

    # ── 5. Donation Requests ──────────────────────────────────────────────────
    # Reserved listing request (accepted)
    req_reserved = DonationRequest(
        listing_id=listings[15].id,  # Minestrone soup
        recipient_id=recipient1.id,
        status=RequestStatus.ACCEPTED,
        requested_quantity="All 40 kg",
        transport_type="Refrigerated Van with Cambro Latches",
        estimated_pickup_time=now + timedelta(hours=3),
        contact_phone="+1 (555) 678-9012",
        recipient_notes="Our driver Marcus will arrive with our van at 3PM. We have 100 residents waiting for dinner.",
        donor_response_notes="Accepted! The thermal containers will be ready at side kitchen entrance."
    )
    # Pending requests for available listings
    req_pending1 = DonationRequest(
        listing_id=listings[0].id,  # Sourdough
        recipient_id=recipient2.id,
        status=RequestStatus.PENDING,
        requested_quantity="20 kg",
        transport_type="Cargo Van",
        estimated_pickup_time=now + timedelta(hours=3),
        contact_phone="+1 (555) 789-0123",
        recipient_notes="We are hosting our bi-weekly neighborhood bread distribution this evening at 6 PM."
    )
    req_pending2 = DonationRequest(
        listing_id=listings[6].id,  # Butter chicken
        recipient_id=recipient3.id,
        status=RequestStatus.PENDING,
        requested_quantity="All 25 kg",
        transport_type="Insulated Thermal Bags",
        estimated_pickup_time=now + timedelta(hours=2),
        contact_phone="+1 (555) 890-1234",
        recipient_notes="For our youth afterschool program — 60 kids are waiting for dinner tonight."
    )
    req_pending3 = DonationRequest(
        listing_id=listings[2].id,  # Organic produce
        recipient_id=recipient4.id,
        status=RequestStatus.PENDING,
        requested_quantity="30 kg of produce",
        transport_type="Refrigerated Van",
        estimated_pickup_time=now + timedelta(hours=4),
        contact_phone="+1 (555) 234-8765",
        recipient_notes="We distribute to 12 schools. Produce goes directly to cafeteria prep kitchens."
    )
    # Completed requests (historical)
    req_completed1 = DonationRequest(
        listing_id=listings[16].id,
        recipient_id=recipient2.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="42 kg bread loaves",
        transport_type="Cargo Van",
        estimated_pickup_time=now - timedelta(days=5, hours=2),
        contact_phone="+1 (555) 789-0123",
        recipient_notes="Pantry distribution for 80 families.",
        donor_response_notes="All loaded successfully.",
        pickup_confirmed_at=now - timedelta(days=5, hours=1),
        completed_at=now - timedelta(days=5)
    )
    req_completed2 = DonationRequest(
        listing_id=listings[17].id,
        recipient_id=recipient1.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="55 kg roast beef",
        transport_type="Refrigerated Van",
        estimated_pickup_time=now - timedelta(days=3, hours=1),
        contact_phone="+1 (555) 678-9012",
        recipient_notes="Dinner for 150 shelter guests.",
        donor_response_notes="Handed over at 140°F.",
        pickup_confirmed_at=now - timedelta(days=3, hours=1),
        completed_at=now - timedelta(days=3)
    )
    req_completed3 = DonationRequest(
        listing_id=listings[18].id,
        recipient_id=recipient3.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="20 kg dal",
        transport_type="Insulated Bags",
        estimated_pickup_time=now - timedelta(days=2, hours=2),
        contact_phone="+1 (555) 890-1234",
        pickup_confirmed_at=now - timedelta(days=2, hours=1),
        completed_at=now - timedelta(days=2)
    )
    req_completed4 = DonationRequest(
        listing_id=listings[19].id,
        recipient_id=recipient4.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="45 meal boxes",
        transport_type="Refrigerated Van",
        estimated_pickup_time=now - timedelta(days=4, hours=1),
        contact_phone="+1 (555) 234-8765",
        pickup_confirmed_at=now - timedelta(days=4, hours=1),
        completed_at=now - timedelta(days=4)
    )
    db.add_all([req_reserved, req_pending1, req_pending2, req_pending3,
                req_completed1, req_completed2, req_completed3, req_completed4])
    db.commit()

    # ── 6. Reports ────────────────────────────────────────────────────────────
    report1 = Report(
        listing_id=listings[0].id,
        reporter_id=recipient3.id,
        reported_user_id=donor1.id,
        reason="Allergen labeling query",
        details="Wanted to clarify if sesame seeds were processed on the same line as the sourdough. Listing says nut-free but does not explicitly state sesame disclosure.",
        status=ReportStatus.OPEN,
        admin_notes="Pending clarification with Artisan Bakehouse head baker."
    )
    db.add(report1)

    # ── 7. Audit Logs ─────────────────────────────────────────────────────────
    audit_entries = [
        AuditLog(user_id=admin_user.id, action="PLATFORM_INITIALIZED", entity_type="System",
                 details="FoodBridge HACK-P197 initialized with 20 listings, 6 donors, 5 recipients."),
        AuditLog(user_id=donor1.id, action="LISTING_CREATED", entity_type="FoodListing",
                 entity_id=listings[0].id, details="Sourdough & Croissants surplus listed."),
        AuditLog(user_id=donor2.id, action="LISTING_CREATED", entity_type="FoodListing",
                 entity_id=listings[1].id, details="Roasted Chicken & Wild Rice Pilaf listed."),
        AuditLog(user_id=donor4.id, action="REQUEST_ACCEPTED", entity_type="DonationRequest",
                 entity_id=req_reserved.id, details="Accepted City Hope Shelter request for Minestrone Soup."),
        AuditLog(user_id=recipient1.id, action="DONATION_COMPLETED", entity_type="FoodListing",
                 entity_id=listings[17].id, details="Confirmed handoff of 55kg roast beef (~150 meals)."),
        AuditLog(user_id=recipient2.id, action="DONATION_COMPLETED", entity_type="FoodListing",
                 entity_id=listings[16].id, details="Confirmed handoff of 42kg bread loaves (~100 meals)."),
    ]
    db.add_all(audit_entries)

    # ── 8. Notifications ──────────────────────────────────────────────────────
    notifs = [
        Notification(user_id=donor1.id, title="New Donation Request Received",
                     message="Greenleaf Community Food Pantry requested 20 kg of your Sourdough & Croissants.",
                     type="REQUEST", link="/donor/dashboard?tab=requests"),
        Notification(user_id=donor4.id, title="New Donation Request Received",
                     message="St. Jude Youth Haven requested all 25 kg of your Butter Chicken & Rice.",
                     type="REQUEST", link="/donor/dashboard?tab=requests"),
        Notification(user_id=recipient1.id, title="🎉 Donation Request Accepted!",
                     message="Sunrise Bistro accepted your request for Minestrone Soup! Pickup Code: 1192.",
                     type="SUCCESS", link="/recipient/dashboard"),
        Notification(user_id=recipient3.id, title="New Listing Available",
                     message="Spice Garden Indian Restaurant just posted Biryani Rice & Mixed Vegetable Curry — 80 portions!",
                     type="INFO", link="/browse"),
        Notification(user_id=admin_user.id, title="⚠️ Safety Report Submitted",
                     message="A new allergen labeling query was submitted regarding Listing #1.",
                     type="ALERT", link="/admin"),
        Notification(user_id=donor2.id, title="🌟 Donation Completed!",
                     message="Handoff verified! You provided ~150 meals of Roast Beef & Yorkshire Pudding.",
                     type="SUCCESS", link="/impact"),
    ]
    db.add_all(notifs)
    db.commit()

    print("✅ Seed complete! 6 Donors, 5 Recipients, 1 Admin, 20 Listings, 8 Requests created.")
    db.close()

if __name__ == "__main__":
    seed_database()
