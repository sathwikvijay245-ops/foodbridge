import random
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from backend.database import get_db
from backend.models import (
    FoodListing, User, UserRole, ListingStatus, DonationRequest,
    RequestStatus, AuditLog, Notification
)
from backend.schemas import ListingCreate, ListingUpdate, ListingResponse, to_naive_utc
from backend.auth_utils import get_current_user, require_roles

router = APIRouter(prefix="/api/listings", tags=["Food Listings"])

def auto_expire_old_listings(db: Session):
    """Automatically marks listings past their pickup deadline as EXPIRED."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    expired_count = db.query(FoodListing).filter(
        FoodListing.status == ListingStatus.AVAILABLE,
        FoodListing.pickup_end < now
    ).update({FoodListing.status: ListingStatus.EXPIRED}, synchronize_session=False)
    if expired_count > 0:
        db.commit()

@router.get("", response_model=List[ListingResponse])
def get_listings(
    db: Session = Depends(get_db),
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    storage: Optional[str] = None,
    dietary: Optional[str] = None,
    search: Optional[str] = None,
    min_quantity: Optional[float] = None,
    urgent_only: Optional[bool] = False,
    donor_id: Optional[int] = None,
    include_all_statuses: Optional[bool] = False
):
    auto_expire_old_listings(db)
    query = db.query(FoodListing)

    if donor_id:
        query = query.filter(FoodListing.donor_id == donor_id)
    elif not include_all_statuses:
        if status_filter:
            query = query.filter(FoodListing.status == status_filter)
        else:
            # Default to showing AVAILABLE listings for discovery
            query = query.filter(FoodListing.status == ListingStatus.AVAILABLE)
    elif status_filter:
        query = query.filter(FoodListing.status == status_filter)

    if category:
        query = query.filter(FoodListing.category == category)
    if storage:
        query = query.filter(FoodListing.storage_requirement == storage)
    if min_quantity:
        query = query.filter(FoodListing.quantity >= min_quantity)
    if dietary:
        query = query.filter(FoodListing.dietary_tags.ilike(f"%{dietary}%"))
    if search:
        search_filter = or_(
            FoodListing.title.ilike(f"%{search}%"),
            FoodListing.description.ilike(f"%{search}%"),
            FoodListing.pickup_address.ilike(f"%{search}%"),
            FoodListing.pickup_city.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    if urgent_only:
        two_hours_later = datetime.utcnow() + timedelta(hours=3)
        query = query.filter(
            FoodListing.pickup_end <= two_hours_later,
            FoodListing.pickup_end > datetime.utcnow()
        )

    listings = query.order_by(FoodListing.pickup_end.asc()).all()

    # Enrich with request count and active accepted request id
    results = []
    for l in listings:
        l_dict = ListingResponse.from_orm(l)
        l_dict.requests_count = len(l.requests)
        accepted_req = next((r for r in l.requests if r.status == RequestStatus.ACCEPTED), None)
        if accepted_req:
            l_dict.accepted_request_id = accepted_req.id
        results.append(l_dict)

    return results

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    auto_expire_old_listings(db)
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    res = ListingResponse.from_orm(listing)
    res.requests_count = len(listing.requests)
    accepted_req = next((r for r in listing.requests if r.status == RequestStatus.ACCEPTED), None)
    if accepted_req:
        res.accepted_request_id = accepted_req.id
    return res

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # Normalize datetimes to naive UTC for safe comparison
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    pickup_end = to_naive_utc(listing_in.pickup_end)
    pickup_start = to_naive_utc(listing_in.pickup_start)
    use_by_time = to_naive_utc(listing_in.use_by_time)
    prep_time = to_naive_utc(listing_in.preparation_time)

    # Strict validation of timing
    if pickup_end <= now:
        raise HTTPException(status_code=400, detail="Pickup end window must be in the future.")
    if pickup_end <= pickup_start:
        raise HTTPException(status_code=400, detail="Pickup end window must be after pickup start window.")
    if use_by_time < pickup_end:
        raise HTTPException(status_code=400, detail="Food use-by deadline must be equal to or later than pickup end time.")

    # Calculate default kg and meals if not provided
    calculated_kg = listing_in.quantity_kg
    if calculated_kg is None or calculated_kg <= 0:
        if listing_in.unit.lower() in ["kg", "kilogram", "kgs"]:
            calculated_kg = listing_in.quantity
        elif listing_in.unit.lower() in ["meals", "portions", "servings"]:
            calculated_kg = round(listing_in.quantity * 0.42, 2)
        else:
            calculated_kg = round(listing_in.quantity * 1.5, 2)

    calculated_meals = listing_in.estimated_meals
    if calculated_meals is None or calculated_meals <= 0:
        calculated_meals = max(1, int(calculated_kg * 2.38))

    # Generate 4-digit pickup security verification code
    pin_code = str(random.randint(1000, 9999))

    new_listing = FoodListing(
        donor_id=current_user.id,
        title=listing_in.title,
        description=listing_in.description,
        category=listing_in.category,
        quantity=listing_in.quantity,
        unit=listing_in.unit,
        quantity_kg=calculated_kg,
        estimated_meals=calculated_meals,
        preparation_time=prep_time,
        use_by_time=use_by_time,
        storage_requirement=listing_in.storage_requirement,
        packaging_info=listing_in.packaging_info,
        dietary_tags=listing_in.dietary_tags or "",
        allergen_info=listing_in.allergen_info or "None declared",
        pickup_address=listing_in.pickup_address,
        pickup_city=listing_in.pickup_city or current_user.city or "Metropolis",
        pickup_zip=listing_in.pickup_zip or "10001",
        latitude=listing_in.latitude,
        longitude=listing_in.longitude,
        pickup_instructions=listing_in.pickup_instructions,
        pickup_start=pickup_start,
        pickup_end=pickup_end,
        food_safety_certified=True,
        food_safety_notes=listing_in.food_safety_notes,
        status=ListingStatus.AVAILABLE,
        pickup_code=pin_code
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # Log action
    audit = AuditLog(
        user_id=current_user.id,
        action="LISTING_CREATED",
        entity_type="FoodListing",
        entity_id=new_listing.id,
        details=f"Created listing '{new_listing.title}' ({new_listing.quantity} {new_listing.unit})"
    )
    db.add(audit)
    db.commit()

    res = ListingResponse.from_orm(new_listing)
    res.requests_count = 0
    return res

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    # Authorization
    if listing.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    # Disallow editing if already reserved, picked up, or completed
    if listing.status in [ListingStatus.PICKED_UP, ListingStatus.COMPLETED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot edit listing in '{listing.status.value}' state."
        )

    update_data = listing_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(listing, field, value)

    # Recalculate meals/kg if quantity changed
    if "quantity" in update_data and "quantity_kg" not in update_data:
        if listing.unit.lower() in ["kg", "kilogram", "kgs"]:
            listing.quantity_kg = listing.quantity
        else:
            listing.quantity_kg = round(listing.quantity * 0.42, 2)
        listing.estimated_meals = max(1, int(listing.quantity_kg * 2.38))

    listing.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(listing)

    audit = AuditLog(
        user_id=current_user.id,
        action="LISTING_UPDATED",
        entity_type="FoodListing",
        entity_id=listing.id,
        details=f"Updated listing '{listing.title}'"
    )
    db.add(audit)
    db.commit()

    res = ListingResponse.from_orm(listing)
    res.requests_count = len(listing.requests)
    return res

@router.delete("/{listing_id}")
def cancel_listing(
    listing_id: int,
    reason: Optional[str] = "Cancelled by donor",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(FoodListing).filter(FoodListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    if listing.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this listing")

    if listing.status == ListingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel an already completed donation.")

    listing.status = ListingStatus.CANCELLED
    
    # Notify any requesters with pending or accepted requests
    for req in listing.requests:
        if req.status in [RequestStatus.PENDING, RequestStatus.ACCEPTED]:
            req.status = RequestStatus.CANCELLED
            req.cancellation_reason = reason
            notif = Notification(
                user_id=req.recipient_id,
                title="Donation Cancelled",
                message=f"The listing '{listing.title}' was cancelled by the donor: {reason}",
                type="ALERT",
                link="/recipient/requests"
            )
            db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="LISTING_CANCELLED",
        entity_type="FoodListing",
        entity_id=listing.id,
        details=f"Listing '{listing.title}' cancelled. Reason: {reason}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Listing successfully cancelled", "listing_id": listing_id}
