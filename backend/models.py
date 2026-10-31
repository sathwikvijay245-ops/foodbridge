from datetime import datetime
import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from backend.database import Base

class UserRole(str, enum.Enum):
    DONOR = "donor"
    RECIPIENT = "recipient"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class FoodCategory(str, enum.Enum):
    COOKED_MEALS = "cooked_meals"
    BAKERY_PASTRIES = "bakery_pastries"
    FRESH_PRODUCE = "fresh_produce"
    DAIRY_CHILLED = "dairy_chilled"
    PACKAGED_PANTRY = "packaged_pantry"
    BEVERAGES = "beverages"
    OTHER = "other"

class StorageRequirement(str, enum.Enum):
    ROOM_TEMP = "room_temp"
    REFRIGERATED = "refrigerated" # below 5C / 41F
    FROZEN = "frozen"             # below -18C / 0F
    HOT_HOLDING = "hot_holding"   # above 60C / 140F

class ListingStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    PICKED_UP = "picked_up"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class ReportStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.DONOR)
    
    # Organization profile
    org_name = Column(String(255), nullable=False)
    org_type = Column(String(100), nullable=True) # e.g. Restaurant, Bakery, Food Bank, Shelter
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True, default="Metropolis")
    
    # Recipient verification & capability details
    charity_reg_number = Column(String(100), nullable=True)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    refrigerated_transport = Column(Boolean, default=False)
    volunteer_capacity = Column(String(100), nullable=True)
    mission_statement = Column(Text, nullable=True)
    
    # Donor compliance details
    food_safety_cert_id = Column(String(100), nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listings = relationship("FoodListing", back_populates="donor", cascade="all, delete-orphan")
    requests = relationship("DonationRequest", back_populates="recipient", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(FoodCategory), nullable=False)
    
    # Quantity & Impact
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False, default="kg") # kg, meals, boxes, trays, portions
    quantity_kg = Column(Float, nullable=False, default=1.0) # normalized kg
    estimated_meals = Column(Integer, nullable=False, default=2)
    
    # Safety & Timing
    preparation_time = Column(DateTime, nullable=False)
    use_by_time = Column(DateTime, nullable=False)
    storage_requirement = Column(Enum(StorageRequirement), nullable=False, default=StorageRequirement.ROOM_TEMP)
    packaging_info = Column(String(255), nullable=True)
    dietary_tags = Column(Text, nullable=True) # Comma-separated: "vegetarian,halal"
    allergen_info = Column(Text, nullable=True) # Comma-separated: "contains nuts, dairy"
    
    # Pickup details & Map coordinates
    pickup_address = Column(String(255), nullable=False)
    pickup_city = Column(String(100), nullable=False, default="Metropolis")
    pickup_zip = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False, default=40.7128)
    longitude = Column(Float, nullable=False, default=-74.0060)
    pickup_instructions = Column(Text, nullable=True)
    pickup_start = Column(DateTime, nullable=False)
    pickup_end = Column(DateTime, nullable=False)
    
    # Food Safety Attestation (Mandatory donor notice requirement)
    food_safety_certified = Column(Boolean, default=False, nullable=False)
    food_safety_notes = Column(Text, nullable=True)
    
    # Workflow status & Verification code
    status = Column(Enum(ListingStatus), default=ListingStatus.AVAILABLE, nullable=False, index=True)
    pickup_code = Column(String(10), nullable=True) # e.g. "4921"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    donor = relationship("User", back_populates="listings")
    requests = relationship("DonationRequest", back_populates="listing", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="listing", cascade="all, delete-orphan")

class DonationRequest(Base):
    __tablename__ = "donation_requests"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    requested_quantity = Column(String(100), nullable=True)
    transport_type = Column(String(100), nullable=False, default="Standard Vehicle")
    estimated_pickup_time = Column(DateTime, nullable=False)
    contact_phone = Column(String(50), nullable=False)
    recipient_notes = Column(Text, nullable=True)
    donor_response_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    
    # Completion audit
    pickup_confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    listing = relationship("FoodListing", back_populates="requests")
    recipient = relationship("User", back_populates="requests")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id", ondelete="SET NULL"), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.OPEN, nullable=False)
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    listing = relationship("FoodListing", back_populates="reports")
    reporter = relationship("User", foreign_keys=[reporter_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="INFO")
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
