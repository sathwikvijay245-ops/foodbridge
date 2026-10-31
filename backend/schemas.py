from datetime import datetime, timezone
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
from backend.models import (
    UserRole, VerificationStatus, FoodCategory,
    StorageRequirement, ListingStatus, RequestStatus, ReportStatus
)

def to_naive_utc(v: Optional[datetime]) -> Optional[datetime]:
    if v is not None and v.tzinfo is not None:
        return v.astimezone(timezone.utc).replace(tzinfo=None)
    return v

# User / Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    org_name: str
    org_type: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Metropolis"
    
    # Recipient specific
    charity_reg_number: Optional[str] = None
    refrigerated_transport: Optional[bool] = False
    volunteer_capacity: Optional[str] = None
    mission_statement: Optional[str] = None
    
    # Donor specific
    food_safety_cert_id: Optional[str] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(UserBase):
    id: int
    verification_status: VerificationStatus
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Food Listing Schemas
class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    category: FoodCategory
    quantity: float = Field(..., gt=0)
    unit: str = Field(default="kg")
    quantity_kg: Optional[float] = None
    estimated_meals: Optional[int] = None
    
    preparation_time: datetime
    use_by_time: datetime
    storage_requirement: StorageRequirement = StorageRequirement.ROOM_TEMP
    packaging_info: Optional[str] = "Food-grade sealed containers"
    dietary_tags: Optional[str] = ""
    allergen_info: Optional[str] = "No major allergens declared"
    
    pickup_address: str
    pickup_city: str = "Metropolis"
    pickup_zip: Optional[str] = "10001"
    latitude: float = 40.7128
    longitude: float = -74.0060
    pickup_instructions: Optional[str] = "Ring service bell at back entrance loading dock."
    pickup_start: datetime
    pickup_end: datetime
    
    food_safety_certified: bool = Field(
        ...,
        description="Mandatory donor confirmation that food was handled per local regulations and safety standards."
    )
    food_safety_notes: Optional[str] = None

    @field_validator("food_safety_certified")
    @classmethod
    def validate_safety_cert(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must certify compliance with food safety regulations to list donations.")
        return v

    @field_validator("preparation_time", "use_by_time", "pickup_start", "pickup_end", mode="after")
    @classmethod
    def normalize_datetimes(cls, v: datetime) -> datetime:
        return to_naive_utc(v)

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[FoodCategory] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    quantity_kg: Optional[float] = None
    estimated_meals: Optional[int] = None
    use_by_time: Optional[datetime] = None
    storage_requirement: Optional[StorageRequirement] = None
    packaging_info: Optional[str] = None
    dietary_tags: Optional[str] = None
    allergen_info: Optional[str] = None
    pickup_instructions: Optional[str] = None
    pickup_start: Optional[datetime] = None
    pickup_end: Optional[datetime] = None
    food_safety_notes: Optional[str] = None

    @field_validator("use_by_time", "pickup_start", "pickup_end", mode="after")
    @classmethod
    def normalize_datetimes_update(cls, v: Optional[datetime]) -> Optional[datetime]:
        return to_naive_utc(v)

class DonorSummary(BaseModel):
    id: int
    full_name: str
    org_name: str
    org_type: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True

class ListingResponse(ListingBase):
    id: int
    donor_id: int
    donor: Optional[DonorSummary] = None
    status: ListingStatus
    pickup_code: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    requests_count: Optional[int] = 0
    accepted_request_id: Optional[int] = None

    class Config:
        from_attributes = True

# Request Schemas
class RequestCreate(BaseModel):
    listing_id: int
    requested_quantity: Optional[str] = "All available"
    transport_type: str = Field(default="Standard Vehicle", description="Refrigerated Van, Insulated Bags, etc.")
    estimated_pickup_time: datetime
    contact_phone: str
    recipient_notes: Optional[str] = None

    @field_validator("estimated_pickup_time", mode="after")
    @classmethod
    def normalize_pickup_time(cls, v: datetime) -> datetime:
        return to_naive_utc(v)

class RecipientSummary(BaseModel):
    id: int
    full_name: str
    org_name: str
    org_type: Optional[str] = None
    charity_reg_number: Optional[str] = None
    verification_status: VerificationStatus
    phone: Optional[str] = None
    refrigerated_transport: Optional[bool] = False

    class Config:
        from_attributes = True

class RequestResponse(BaseModel):
    id: int
    listing_id: int
    recipient_id: int
    status: RequestStatus
    requested_quantity: Optional[str] = None
    transport_type: str
    estimated_pickup_time: datetime
    contact_phone: str
    recipient_notes: Optional[str] = None
    donor_response_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    pickup_confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    recipient: Optional[RecipientSummary] = None
    listing: Optional[ListingResponse] = None

    class Config:
        from_attributes = True

class RequestActionInput(BaseModel):
    action: str = Field(..., description="accept, reject, cancel, confirm_pickup, complete")
    notes: Optional[str] = None
    pickup_code: Optional[str] = None

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Report Schemas
class ReportCreate(BaseModel):
    listing_id: Optional[int] = None
    reported_user_id: Optional[int] = None
    reason: str
    details: str

class ReportResponse(BaseModel):
    id: int
    listing_id: Optional[int] = None
    reporter_id: int
    reported_user_id: Optional[int] = None
    reason: str
    details: str
    status: ReportStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    reporter: Optional[UserResponse] = None
    reported_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ReportUpdate(BaseModel):
    status: ReportStatus
    admin_notes: Optional[str] = None

# Admin schemas
class UserVerificationUpdate(BaseModel):
    status: VerificationStatus
    admin_notes: Optional[str] = None

# Impact Schemas
class ImpactMetricsResponse(BaseModel):
    total_donations_completed: int
    total_kg_redistributed: float
    total_meals_provided: int
    co2e_avoided_kg: float
    water_saved_liters: float
    active_listings_count: int
    active_donors_count: int
    verified_recipients_count: int
    category_breakdown: List[dict]
    top_donors: List[dict]
    top_recipients: List[dict]
    recent_completions: List[dict]

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
