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

    # 1. Admin
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

    # 2. Donors (4 realistic commercial food providers)
    donor1 = User(
        email="artisan@bakehouse.com",
        hashed_password=default_pw,
        full_name="Marco Rossi",
        role=UserRole.DONOR,
        org_name="The Artisan Bakehouse",
        org_type="Bakery & Pastry Shop",
        phone="+1 (555) 234-5678",
        address="442 Baker Street",
        city="Metropolis",
        food_safety_cert_id="FSS-NY-89124",
        verification_status=VerificationStatus.VERIFIED,
        is_active=True
    )
    donor2 = User(
        email="catering@goldenplatter.com",
        hashed_password=default_pw,
        full_name="Chef Linda Vance",
        role=UserRole.DONOR,
        org_name="Golden Platter Hospitality & Catering",
        org_type="Caterer / Event Hall",
        phone="+1 (555) 345-6789",
        address="1200 Grand Avenue, Banquet Wing",
        city="Metropolis",
        food_safety_cert_id="FSS-NY-44810",
        verification_status=VerificationStatus.VERIFIED,
        is_active=True
    )
    donor3 = User(
        email="manager@metrofresh.com",
        hashed_password=default_pw,
        full_name="David Chen",
        role=UserRole.DONOR,
        org_name="Metro Fresh Organics Supermarket",
        org_type="Supermarket & Grocery",
        phone="+1 (555) 456-7890",
        address="88 Market Boulevard",
        city="Metropolis",
        food_safety_cert_id="FSS-NY-90211",
        verification_status=VerificationStatus.VERIFIED,
        is_active=True
    )
    donor4 = User(
        email="chefkate@sunrisecafekitchen.org",
        hashed_password=default_pw,
        full_name="Chef Kate Morales",
        role=UserRole.DONOR,
        org_name="Sunrise Community Bistro & Deli",
        org_type="Community Kitchen & Deli",
        phone="+1 (555) 567-8901",
        address="315 Elmwood Terrace",
        city="Metropolis",
        food_safety_cert_id="FSS-NY-33921",
        verification_status=VerificationStatus.VERIFIED,
        is_active=True
    )
    db.add_all([donor1, donor2, donor3, donor4])
    db.commit()

    # 3. Recipient Organizations (3 verified realistic charitable nonprofits)
    recipient1 = User(
        email="coordinator@cityhopeshelter.org",
        hashed_password=default_pw,
        full_name="Marcus Brody",
        role=UserRole.RECIPIENT,
        org_name="City Hope Homeless Shelter & Care Center",
        org_type="Emergency Shelter & Hot Meal Provider",
        phone="+1 (555) 678-9012",
        address="714 8th Avenue, Downtown",
        city="Metropolis",
        charity_reg_number="CH-501C3-882341",
        verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=True,
        volunteer_capacity="18 full-time staff, 40 active volunteers; serving 350 nightly guests",
        mission_statement="Providing dignifying immediate shelter, hot nutritious meals, and pathway support for unhoused neighbors.",
        is_active=True
    )
    recipient2 = User(
        email="director@greenleafpantry.org",
        hashed_password=default_pw,
        full_name="Sister Evelyn Adams",
        role=UserRole.RECIPIENT,
        org_name="Greenleaf Community Food Pantry",
        org_type="Community Food Bank & Distribution Hub",
        phone="+1 (555) 789-0123",
        address="1025 Pine Hollow Road",
        city="Metropolis",
        charity_reg_number="GL-501C3-993812",
        verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=True,
        volunteer_capacity="2 cargo vans, 25 weekend distribution volunteers",
        mission_statement="Ending local neighborhood food insecurity through weekly dignified grocery rescue and pantry distribution.",
        is_active=True
    )
    recipient3 = User(
        email="contact@stjudeyouthhaven.org",
        hashed_password=default_pw,
        full_name="Pastor Jamal Washington",
        role=UserRole.RECIPIENT,
        org_name="St. Jude Youth & Family Haven",
        org_type="Youth Center & Family Crisis Support",
        phone="+1 (555) 890-1234",
        address="550 Martin Luther King Jr. Blvd",
        city="Metropolis",
        charity_reg_number="SJ-501C3-112048",
        verification_status=VerificationStatus.VERIFIED,
        refrigerated_transport=False,
        volunteer_capacity="12 volunteer drivers with insulated thermal transport bags",
        mission_statement="Nurturing vulnerable at-risk youth and working single-parent families with safe afterschool meals and homework tutoring.",
        is_active=True
    )
    
    # 4. Pending Recipient (to test verification workflow for admin!)
    recipient_pending = User(
        email="help@beaconmission.org",
        hashed_password=default_pw,
        full_name="Thomas Wright",
        role=UserRole.RECIPIENT,
        org_name="Beacon Hill Community Outreach",
        org_type="Faith-Based Outreach & Soup Kitchen",
        phone="+1 (555) 901-2345",
        address="12 Beacon Hill Way",
        city="Metropolis",
        charity_reg_number="BH-501C3-440219",
        verification_status=VerificationStatus.PENDING,
        refrigerated_transport=False,
        volunteer_capacity="8 volunteers, 1 passenger minivan",
        mission_statement="Serving weekly warm soup dinners to elderly and disabled shut-in residents.",
        is_active=True
    )

    db.add_all([recipient1, recipient2, recipient3, recipient_pending])
    db.commit()

    now = datetime.utcnow()

    # 4. Food Listings (At least 10 realistic, detailed listings with varied categories & statuses)
    listings = [
        # Listing 1: Artisan Bakehouse - Sourdough & Pastries (AVAILABLE)
        FoodListing(
            donor_id=donor1.id,
            title="Freshly Baked Artisanal Sourdough & Croissants Surplus",
            description="End-of-day surplus of traditional slow-fermented sourdough boules, multi-grain batards, and butter croissants. All baked early morning, crisp crusts, perfectly packaged in food-grade bakery bags.",
            category=FoodCategory.BAKERY_PASTRIES,
            quantity=35.0,
            unit="kg",
            quantity_kg=35.0,
            estimated_meals=85,
            preparation_time=now - timedelta(hours=6),
            use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Individual kraft paper bakery liners inside 4 clean stackable crates.",
            dietary_tags="Vegetarian, Nut-Free",
            allergen_info="Contains Wheat (Gluten), Dairy, Yeast.",
            pickup_address="442 Baker Street (Alley Loading Bay)",
            pickup_city="Metropolis",
            pickup_zip="10002",
            latitude=40.7180,
            longitude=-73.9920,
            pickup_instructions="Back loading dock through double wooden doors. Ring bell marked 'Kitchen Loading'.",
            pickup_start=now + timedelta(minutes=30),
            pickup_end=now + timedelta(hours=5),
            food_safety_certified=True,
            food_safety_notes="Baked at 450°F this morning, held in dry climate-controlled holding racks under strict hygiene protocols.",
            status=ListingStatus.AVAILABLE,
            pickup_code="3841"
        ),
        # Listing 2: Golden Platter - Catered Roasted Chicken & Wild Rice (AVAILABLE)
        FoodListing(
            donor_id=donor2.id,
            title="Unserved Herb-Roasted Lemon Chicken Breast & Wild Rice Pilaf",
            description="Prepared for an executive corporate banquet that had reduced headcount. Kept sealed in hot-holding transport cambros above 65°C / 150°F. Never touched buffet line or public access. Tender boneless chicken breasts with herb glaze, wild rice pilaf, and steamed garlic green beans.",
            category=FoodCategory.COOKED_MEALS,
            quantity=45.0,
            unit="kg",
            quantity_kg=45.0,
            estimated_meals=110,
            preparation_time=now - timedelta(hours=2),
            use_by_time=now + timedelta(hours=14),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="12 deep hotel pans with heavy-gauge aluminum foil crimp seals.",
            dietary_tags="Gluten-Free, Halal-Certified, Nut-Free",
            allergen_info="None of the top 9 allergens present. Prepared in certified commercial facility.",
            pickup_address="1200 Grand Avenue, Service Ramp #3",
            pickup_city="Metropolis",
            pickup_zip="10014",
            latitude=40.7290,
            longitude=-74.0080,
            pickup_instructions="Proceed down the service ramp to Dock 3. Ask for Banquets Sous Chef Linda Vance.",
            pickup_start=now + timedelta(minutes=15),
            pickup_end=now + timedelta(hours=4),
            food_safety_certified=True,
            food_safety_notes="Maintained continuously above 65°C (149°F). Immediate insulated transport recommended.",
            status=ListingStatus.AVAILABLE,
            pickup_code="7729"
        ),
        # Listing 3: Metro Fresh - Organic Produce Crates (AVAILABLE)
        FoodListing(
            donor_id=donor3.id,
            title="Assorted Organic Crisp Apples, Carrots & Bell Peppers",
            description="Surplus produce from morning warehouse replenishment. Top commercial grade Fuji apples, sweet orange carrots, and mixed color sweet bell peppers. Crisp, unbruised, ideal for family food boxes.",
            category=FoodCategory.FRESH_PRODUCE,
            quantity=60.0,
            unit="kg",
            quantity_kg=60.0,
            estimated_meals=140,
            preparation_time=now - timedelta(hours=12),
            use_by_time=now + timedelta(days=5),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="6 reinforced ventilated cardboard produce lugs with handles.",
            dietary_tags="Vegan, Vegetarian, Gluten-Free, Halal, Kosher",
            allergen_info="Allergen-free natural fresh produce.",
            pickup_address="88 Market Boulevard, Rear Receiving Dock",
            pickup_city="Metropolis",
            pickup_zip="10003",
            latitude=40.7320,
            longitude=-73.9870,
            pickup_instructions="Drive to receiving bay near trash compactor. Mention FoodBridge pickup to David Chen.",
            pickup_start=now + timedelta(hours=1),
            pickup_end=now + timedelta(hours=8),
            food_safety_certified=True,
            food_safety_notes="Stored in 38°F commercial walk-in cooler immediately upon delivery receipt.",
            status=ListingStatus.AVAILABLE,
            pickup_code="5210"
        ),
        # Listing 4: Sunrise Bistro - Boxed Gourmet Sandwiches & Salads (AVAILABLE)
        FoodListing(
            donor_id=donor4.id,
            title="Individual Grab-and-Go Deli Turkey, Veggie Sandwiches & Bowls",
            description="Individually labeled packaged lunch boxes with roast turkey provolone subs, Mediterranean roasted hummus wraps, and garden vinaigrette grain bowls. Complete with disposable compostable cutlery packets.",
            category=FoodCategory.COOKED_MEALS,
            quantity=40.0,
            unit="portions",
            quantity_kg=22.0,
            estimated_meals=40,
            preparation_time=now - timedelta(hours=4),
            use_by_time=now + timedelta(hours=20),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="40 individual sealed clamshell deli boxes labeled with ingredients and dates.",
            dietary_tags="Vegetarian Options, Nut-Free",
            allergen_info="Boxes clearly labeled: Contains Dairy, Wheat. Hummus wraps are Dairy-Free.",
            pickup_address="315 Elmwood Terrace, Side Entrance",
            pickup_city="Metropolis",
            pickup_zip="10019",
            latitude=40.7650,
            longitude=-73.9820,
            pickup_instructions="Side kitchen entrance. Free 15-minute loading spot directly in front of curb.",
            pickup_start=now + timedelta(minutes=45),
            pickup_end=now + timedelta(hours=6),
            food_safety_certified=True,
            food_safety_notes="Assembled in chilled prep station; held constantly at 36°F in reach-in display cooler.",
            status=ListingStatus.AVAILABLE,
            pickup_code="6412"
        ),
        # Listing 5: Metro Fresh - Organic Dairy & Yogurt Cartons (AVAILABLE)
        FoodListing(
            donor_id=donor3.id,
            title="Organic Whole Milk Gallons & Greek Vanilla Yogurt Tubs",
            description="High-quality sealed dairy overstock approaching 4 days to best-by date. 16 gallons of grade-A organic whole milk and 24 tubs of 32oz whole milk Greek yogurt. Kept continuously in chilled dairy vault.",
            category=FoodCategory.DAIRY_CHILLED,
            quantity=50.0,
            unit="kg",
            quantity_kg=50.0,
            estimated_meals=120,
            preparation_time=now - timedelta(days=1),
            use_by_time=now + timedelta(days=4),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="Factory sealed retail tamper-evident jugs and foil-sealed tubs.",
            dietary_tags="Vegetarian, Gluten-Free, Kosher",
            allergen_info="Contains Cow's Milk (Dairy).",
            pickup_address="88 Market Boulevard, Rear Receiving Dock",
            pickup_city="Metropolis",
            pickup_zip="10003",
            latitude=40.7320,
            longitude=-73.9870,
            pickup_instructions="Bring refrigerated van or insulated cooler bags with ice packs.",
            pickup_start=now + timedelta(hours=2),
            pickup_end=now + timedelta(hours=10),
            food_safety_certified=True,
            food_safety_notes="Continuous cold-chain temperature telemetry logged at 34°F to 37°F.",
            status=ListingStatus.AVAILABLE,
            pickup_code="9083"
        ),
        # Listing 6: Golden Platter - Penne Bolognese & Garlic Focaccia (AVAILABLE)
        FoodListing(
            donor_id=donor2.id,
            title="Hearty Penne Pasta with Rich Beef Bolognese & Garlic Bread",
            description="Freshly prepared Italian buffet surplus. Savory slow-simmered beef & tomato ragù tossed with al dente penne rigate, paired with 60 slices of golden herb garlic focaccia. Kept in steam tables above 145°F.",
            category=FoodCategory.COOKED_MEALS,
            quantity=38.0,
            unit="kg",
            quantity_kg=38.0,
            estimated_meals=90,
            preparation_time=now - timedelta(hours=3),
            use_by_time=now + timedelta(hours=12),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="8 sealed deep aluminum chaffing pans.",
            dietary_tags="Nut-Free",
            allergen_info="Contains Wheat (Gluten), Beef, Dairy (Parmesan cheese).",
            pickup_address="1200 Grand Avenue, Banquet Wing",
            pickup_city="Metropolis",
            pickup_zip="10014",
            latitude=40.7290,
            longitude=-74.0080,
            pickup_instructions="Park at service dock #2. Chef Vance will assist loading onto carts.",
            pickup_start=now + timedelta(minutes=45),
            pickup_end=now + timedelta(hours=5),
            food_safety_certified=True,
            food_safety_notes="Prepared today in health-inspected commercial banquet kitchen; strictly temperature logged.",
            status=ListingStatus.AVAILABLE,
            pickup_code="1478"
        ),
        # Listing 7: Sunrise Bistro - Hearty Lentil Stew & Rice (RESERVED - with accepted request!)
        FoodListing(
            donor_id=donor4.id,
            title="Vegan Moroccan Spiced Lentil & Chickpea Stew with Couscous",
            description="Warm hearty aromatic stew featuring brown lentils, chickpeas, sweet carrots, and cinnamon-cumin tomato broth served alongside fluffy steamed couscous. Excellent nutritional profile.",
            category=FoodCategory.COOKED_MEALS,
            quantity=30.0,
            unit="kg",
            quantity_kg=30.0,
            estimated_meals=75,
            preparation_time=now - timedelta(hours=3),
            use_by_time=now + timedelta(hours=16),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="6 food-grade insulated thermal cambro containers.",
            dietary_tags="Vegan, Vegetarian, Halal, Nut-Free, Dairy-Free",
            allergen_info="Contains Wheat (Couscous). Stew itself is gluten-free.",
            pickup_address="315 Elmwood Terrace",
            pickup_city="Metropolis",
            pickup_zip="10019",
            latitude=40.7650,
            longitude=-73.9820,
            pickup_instructions="Chef Kate Morales is holding in kitchen warming ovens.",
            pickup_start=now + timedelta(hours=1),
            pickup_end=now + timedelta(hours=4),
            food_safety_certified=True,
            food_safety_notes="Cooked to 195°F and held at 155°F.",
            status=ListingStatus.RESERVED,
            pickup_code="4921"
        ),
        # Listing 8: Artisan Bakehouse - Sandwich Baguettes & Muffins (RESERVED)
        FoodListing(
            donor_id=donor1.id,
            title="Artisan French Baguettes & Blueberry Streusel Breakfast Muffins",
            description="50 freshly baked French crusty baguettes and 4 dozen jumbo blueberry bran muffins. Packed in clean food-safe bakery liners and sturdy distribution cartons.",
            category=FoodCategory.BAKERY_PASTRIES,
            quantity=28.0,
            unit="kg",
            quantity_kg=28.0,
            estimated_meals=70,
            preparation_time=now - timedelta(hours=5),
            use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Heavyweight bakery shipping cartons.",
            dietary_tags="Vegetarian, Nut-Free",
            allergen_info="Contains Wheat, Dairy, Eggs.",
            pickup_address="442 Baker Street",
            pickup_city="Metropolis",
            pickup_zip="10002",
            latitude=40.7180,
            longitude=-73.9920,
            pickup_instructions="Alley entrance loading dock.",
            pickup_start=now + timedelta(minutes=45),
            pickup_end=now + timedelta(hours=3),
            food_safety_certified=True,
            food_safety_notes="Ambient cooling under sanitary covers.",
            status=ListingStatus.RESERVED,
            pickup_code="8832"
        ),
        # Listing 9: Metro Fresh - Pantry Staples & Cereal Boxes (COMPLETED - Historical Impact)
        FoodListing(
            donor_id=donor3.id,
            title="Whole Grain Oat Cereals, Pasta Boxes & Canned Black Beans",
            description="Surplus bulk dry goods cartons from promotional rotation. Shelf-stable pantry staples, high fiber whole grain cereals, boxed penne pasta, and canned beans.",
            category=FoodCategory.PACKAGED_PANTRY,
            quantity=120.0,
            unit="kg",
            quantity_kg=120.0,
            estimated_meals=285,
            preparation_time=now - timedelta(days=3),
            use_by_time=now + timedelta(days=180),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="10 sealed factory master cartons.",
            dietary_tags="Vegetarian, Halal, Kosher",
            allergen_info="Cereals contain Gluten; Canned beans are Allergen-Free.",
            pickup_address="88 Market Boulevard",
            pickup_city="Metropolis",
            pickup_zip="10003",
            latitude=40.7320,
            longitude=-73.9870,
            pickup_instructions="Completed handover.",
            pickup_start=now - timedelta(days=2, hours=4),
            pickup_end=now - timedelta(days=2),
            food_safety_certified=True,
            food_safety_notes="Factory sealed dry goods stored in humidity-controlled depot.",
            status=ListingStatus.COMPLETED,
            pickup_code="2019"
        ),
        # Listing 10: Golden Platter - Grilled Salmon & Quinoa Bowls (COMPLETED - Historical Impact)
        FoodListing(
            donor_id=donor2.id,
            title="Grilled Atlantic Salmon Fillets with Herb Lemon Quinoa",
            description="Surplus banquet dinner courses from medical conference gala. Individually plated grilled wild salmon portions with organic quinoa, roasted asparagus, and citrus herb dressing.",
            category=FoodCategory.COOKED_MEALS,
            quantity=55.0,
            unit="kg",
            quantity_kg=55.0,
            estimated_meals=135,
            preparation_time=now - timedelta(days=4),
            use_by_time=now - timedelta(days=3),
            storage_requirement=StorageRequirement.HOT_HOLDING,
            packaging_info="15 insulated catering food warmers.",
            dietary_tags="Gluten-Free, Dairy-Free, Nut-Free",
            allergen_info="Contains Fish (Salmon).",
            pickup_address="1200 Grand Avenue",
            pickup_city="Metropolis",
            pickup_zip="10014",
            latitude=40.7290,
            longitude=-74.0080,
            pickup_instructions="Completed handoff to City Hope Shelter.",
            pickup_start=now - timedelta(days=4, hours=2),
            pickup_end=now - timedelta(days=4),
            food_safety_certified=True,
            food_safety_notes="Blast chilled or maintained above 140°F in commercial warmers.",
            status=ListingStatus.COMPLETED,
            pickup_code="4190"
        ),
        # Listing 11: Artisan Bakehouse - Surplus Sandwich Loaves (COMPLETED)
        FoodListing(
            donor_id=donor1.id,
            title="Rustic Multi-Grain Sandwich Loaves & Brioche Rolls",
            description="Wholesome sandwich breads baked for university dining hall supply. 45 sliced sandwich loaves and 60 brioche slider buns.",
            category=FoodCategory.BAKERY_PASTRIES,
            quantity=42.0,
            unit="kg",
            quantity_kg=42.0,
            estimated_meals=100,
            preparation_time=now - timedelta(days=5),
            use_by_time=now - timedelta(days=3),
            storage_requirement=StorageRequirement.ROOM_TEMP,
            packaging_info="Sealed bread bags.",
            dietary_tags="Vegetarian",
            allergen_info="Contains Wheat, Eggs, Milk.",
            pickup_address="442 Baker Street",
            pickup_city="Metropolis",
            pickup_zip="10002",
            latitude=40.7180,
            longitude=-73.9920,
            pickup_instructions="Completed handoff to Greenleaf Pantry.",
            pickup_start=now - timedelta(days=5, hours=3),
            pickup_end=now - timedelta(days=5),
            food_safety_certified=True,
            food_safety_notes="Clean room ambient temperature storage.",
            status=ListingStatus.COMPLETED,
            pickup_code="7102"
        ),
        # Listing 12: Metro Fresh - Fresh Pressed Cold Juices & Smoothies (AVAILABLE)
        FoodListing(
            donor_id=donor3.id,
            title="Fresh-Pressed Cold Juices (Orange, Green Detox & Berry)",
            description="50 bottles (16oz each) of unpasteurized premium cold-pressed juices. Must be kept strictly refrigerated. Expiration in 48 hours. Nutrient-dense vitamins for youth and seniors.",
            category=FoodCategory.BEVERAGES,
            quantity=25.0,
            unit="kg",
            quantity_kg=25.0,
            estimated_meals=50,
            preparation_time=now - timedelta(hours=8),
            use_by_time=now + timedelta(days=2),
            storage_requirement=StorageRequirement.REFRIGERATED,
            packaging_info="50 sealed PET bottles in sturdy plastic beverage crates.",
            dietary_tags="Vegan, Gluten-Free, Raw, Kosher",
            allergen_info="Allergen-free 100% pure fruits and vegetables.",
            pickup_address="88 Market Boulevard",
            pickup_city="Metropolis",
            pickup_zip="10003",
            latitude=40.7320,
            longitude=-73.9870,
            pickup_instructions="Dock receiving cooler door 4.",
            pickup_start=now + timedelta(hours=1),
            pickup_end=now + timedelta(hours=7),
            food_safety_certified=True,
            food_safety_notes="Bottled at 36°F, kept in dedicated cold display.",
            status=ListingStatus.AVAILABLE,
            pickup_code="3309"
        )
    ]

    for l in listings:
        db.add(l)
    db.commit()

    # 5. Realistic Requests for Reserved & Completed listings
    # Request for Listing 7 (Lentils - Reserved by City Hope Shelter)
    req7 = DonationRequest(
        listing_id=listings[6].id,
        recipient_id=recipient1.id,
        status=RequestStatus.ACCEPTED,
        requested_quantity="All 30 kg",
        transport_type="Refrigerated Van with Cambro Latches",
        estimated_pickup_time=now + timedelta(hours=2),
        contact_phone="+1 (555) 678-9012",
        recipient_notes="Our driver Marcus will arrive with our van around 2:00 PM. We have 40 hungry residents waiting for dinner.",
        donor_response_notes="Accepted! We will have the thermal containers loaded at the side kitchen entrance."
    )
    # Request for Listing 8 (Baguettes - Reserved by St. Jude Youth Haven)
    req8 = DonationRequest(
        listing_id=listings[7].id,
        recipient_id=recipient3.id,
        status=RequestStatus.ACCEPTED,
        requested_quantity="All available (28 kg)",
        transport_type="Insulated Thermal Delivery Bags",
        estimated_pickup_time=now + timedelta(hours=1, minutes=30),
        contact_phone="+1 (555) 890-1234",
        recipient_notes="Pastor Jamal will pick up for our youth afterschool program dinner.",
        donor_response_notes="Great! We will help you carry the cartons to your car."
    )
    # Request for Listing 1 (Bakehouse - Pending request from Greenleaf Pantry)
    req1 = DonationRequest(
        listing_id=listings[0].id,
        recipient_id=recipient2.id,
        status=RequestStatus.PENDING,
        requested_quantity="20 kg",
        transport_type="Cargo Van",
        estimated_pickup_time=now + timedelta(hours=3),
        contact_phone="+1 (555) 789-0123",
        recipient_notes="We are hosting our bi-weekly neighborhood bread distribution this evening at 6 PM."
    )
    # Completed requests for historical impact
    req9 = DonationRequest(
        listing_id=listings[8].id,
        recipient_id=recipient2.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="120 kg pantry dry goods",
        transport_type="Cargo Van",
        estimated_pickup_time=now - timedelta(days=2, hours=3),
        contact_phone="+1 (555) 789-0123",
        recipient_notes="Pantry staples for 60 local families.",
        donor_response_notes="All loaded successfully.",
        pickup_confirmed_at=now - timedelta(days=2, hours=2),
        completed_at=now - timedelta(days=2, hours=1)
    )
    req10 = DonationRequest(
        listing_id=listings[9].id,
        recipient_id=recipient1.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="55 kg salmon courses",
        transport_type="Refrigerated Van",
        estimated_pickup_time=now - timedelta(days=4, hours=1),
        contact_phone="+1 (555) 678-9012",
        recipient_notes="Dinner for 120 shelter guests.",
        donor_response_notes="Handed over at temperature 150°F.",
        pickup_confirmed_at=now - timedelta(days=4, hours=1),
        completed_at=now - timedelta(days=4)
    )
    req11 = DonationRequest(
        listing_id=listings[10].id,
        recipient_id=recipient2.id,
        status=RequestStatus.COMPLETED,
        requested_quantity="42 kg bread loaves",
        transport_type="Cargo Van",
        estimated_pickup_time=now - timedelta(days=5, hours=2),
        contact_phone="+1 (555) 789-0123",
        pickup_confirmed_at=now - timedelta(days=5, hours=1),
        completed_at=now - timedelta(days=5)
    )

    db.add_all([req7, req8, req1, req9, req10, req11])
    db.commit()

    # 6. Realistic Reported Item for Admin Moderation Demonstration
    report1 = Report(
        listing_id=listings[0].id,
        reporter_id=recipient3.id,
        reported_user_id=donor1.id,
        reason="Mislabeled allergen query",
        details="We wanted to clarify if sesame seeds were processed on the same line as the sourdough boules. Listing says nut-free but does not explicitly state sesame disclosure.",
        status=ReportStatus.OPEN,
        admin_notes="Pending clarification with Artisan Bakehouse head baker."
    )
    db.add(report1)

    # 7. Audit Logs
    audit_entries = [
        AuditLog(user_id=admin_user.id, action="PLATFORM_INITIALIZED", entity_type="System", details="FoodBridge HACK-P197 system initialized with 12 listings & verified charities."),
        AuditLog(user_id=donor1.id, action="LISTING_CREATED", entity_type="FoodListing", entity_id=listings[0].id, details="Created listing: Freshly Baked Artisanal Sourdough & Croissants Surplus"),
        AuditLog(user_id=donor2.id, action="LISTING_CREATED", entity_type="FoodListing", entity_id=listings[1].id, details="Created listing: Roasted Lemon Chicken Breast"),
        AuditLog(user_id=donor4.id, action="REQUEST_ACCEPTED", entity_type="DonationRequest", entity_id=req7.id, details="Accepted City Hope Homeless Shelter request for Moroccan Lentil Stew"),
        AuditLog(user_id=recipient1.id, action="DONATION_COMPLETED", entity_type="FoodListing", entity_id=listings[9].id, details="Confirmed handoff of 55kg salmon dinner (~135 meals).")
    ]
    db.add_all(audit_entries)

    # 8. Realistic Notifications for demo accounts
    notifs = [
        Notification(
            user_id=donor1.id,
            title="New Donation Request",
            message="Greenleaf Community Food Pantry requested 20 kg of 'Freshly Baked Artisanal Sourdough & Croissants'.",
            type="REQUEST",
            link="/donor/requests"
        ),
        Notification(
            user_id=recipient1.id,
            title="🎉 Donation Request Accepted!",
            message="Sunrise Community Bistro accepted your request for Moroccan Spiced Lentil Stew! Pickup Code: 4921.",
            type="SUCCESS",
            link="/recipient/requests"
        ),
        Notification(
            user_id=recipient3.id,
            title="🎉 Donation Request Accepted!",
            message="The Artisan Bakehouse accepted your request for French Baguettes & Muffins! Pickup Code: 8832.",
            type="SUCCESS",
            link="/recipient/requests"
        ),
        Notification(
            user_id=admin_user.id,
            title="⚠️ Safety & Allergen Report Submitted",
            message="A new inquiry report was submitted regarding sesame labeling on Listing #1.",
            type="ALERT",
            link="/admin/moderation"
        )
    ]
    db.add_all(notifs)
    db.commit()

    print("Seed complete! 4 Donors, 4 Recipients, 1 Admin, 12 Detailed Listings created.")
    db.close()

if __name__ == "__main__":
    seed_database()
