from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import (
    DonationRequest, FoodListing, User, UserRole,
    ListingStatus, RequestStatus, VerificationStatus,
    Notification, AuditLog
)
from backend.schemas import RequestCreate, RequestResponse, RequestActionInput, to_naive_utc
from backend.auth_utils import get_current_user, require_roles

router = APIRouter(prefix="/api/requests", tags=["Donation Requests & Workflow"])

@router.get("", response_model=List[RequestResponse])
def get_requests(
    status_filter: Optional[str] = Query(None, alias="status"),
    listing_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DonationRequest)

    if current_user.role == UserRole.RECIPIENT:
        query = query.filter(DonationRequest.recipient_id == current_user.id)
    elif current_user.role == UserRole.DONOR:
        # Requests for listings owned by this donor
        query = query.join(FoodListing).filter(FoodListing.donor_id == current_user.id)
    # Admin sees all

    if listing_id:
        query = query.filter(DonationRequest.listing_id == listing_id)
    if status_filter:
        query = query.filter(DonationRequest.status == status_filter)

    requests = query.order_by(DonationRequest.created_at.desc()).all()
    return requests

@router.get("/{request_id}", response_model=RequestResponse)
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(DonationRequest).filter(DonationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Donation request not found")

    # Auth check: Recipient, listing's donor, or Admin
    if req.recipient_id != current_user.id and req.listing.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")

    return req

@router.post("", response_model=RequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    req_in: RequestCreate,
    current_user: User = Depends(require_roles([UserRole.RECIPIENT, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # Recipient verification check
    if current_user.role == UserRole.RECIPIENT and current_user.verification_status != VerificationStatus.VERIFIED:
        raise HTTPException(
            status_code=403,
            detail="Your organization account is pending verification by FoodBridge administrators. Only verified charities may claim food."
        )

    # Check listing existence and status
    listing = db.query(FoodListing).filter(FoodListing.id == req_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Food listing not found")

    if listing.status != ListingStatus.AVAILABLE:
        raise HTTPException(
            status_code=400,
            detail=f"This listing is currently in '{listing.status.value}' status and cannot accept new requests."
        )

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    pickup_end = to_naive_utc(listing.pickup_end)
    if pickup_end and pickup_end < now:
        listing.status = ListingStatus.EXPIRED
        db.commit()
        raise HTTPException(status_code=400, detail="This listing has expired past its pickup availability window.")

    # Prevent duplicate pending or accepted requests from the same recipient
    existing_active = db.query(DonationRequest).filter(
        DonationRequest.listing_id == listing.id,
        DonationRequest.recipient_id == current_user.id,
        DonationRequest.status.in_([RequestStatus.PENDING, RequestStatus.ACCEPTED])
    ).first()
    if existing_active:
        raise HTTPException(
            status_code=400,
            detail="You already have an active request for this food listing."
        )

    new_request = DonationRequest(
        listing_id=listing.id,
        recipient_id=current_user.id,
        status=RequestStatus.PENDING,
        requested_quantity=req_in.requested_quantity or f"{listing.quantity} {listing.unit}",
        transport_type=req_in.transport_type,
        estimated_pickup_time=to_naive_utc(req_in.estimated_pickup_time),
        contact_phone=req_in.contact_phone,
        recipient_notes=req_in.recipient_notes
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Notify donor
    notif = Notification(
        user_id=listing.donor_id,
        title="New Donation Request Received",
        message=f"{current_user.org_name} has requested your listing '{listing.title}'.",
        type="REQUEST",
        link=f"/donor/requests"
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="REQUEST_SUBMITTED",
        entity_type="DonationRequest",
        entity_id=new_request.id,
        details=f"{current_user.org_name} requested listing #{listing.id} ('{listing.title}')"
    )
    db.add(audit)
    db.commit()

    return new_request

@router.post("/{request_id}/action", response_model=RequestResponse)
def handle_request_action(
    request_id: int,
    action_in: RequestActionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    action = action_in.action.lower()
    
    # Fetch request and listing
    req = db.query(DonationRequest).filter(DonationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Donation request not found")
    
    listing = db.query(FoodListing).filter(FoodListing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Associated listing not found")

    is_donor = (current_user.id == listing.donor_id)
    is_recipient = (current_user.id == req.recipient_id)
    is_admin = (current_user.role == UserRole.ADMIN)

    # 1. ACTION: ACCEPT
    if action == "accept":
        if not (is_donor or is_admin):
            raise HTTPException(status_code=403, detail="Only the donor or admin can accept a donation request.")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(status_code=400, detail=f"Cannot accept a request with status '{req.status.value}'.")

        # Double-booking prevention: verify listing is still available
        if listing.status != ListingStatus.AVAILABLE:
            raise HTTPException(
                status_code=409,
                detail=f"Conflict: Listing is already {listing.status.value}. Another recipient may have already been accepted."
            )

        # Accept this request
        req.status = RequestStatus.ACCEPTED
        req.donor_response_notes = action_in.notes
        req.updated_at = datetime.utcnow()

        # Reserve listing
        listing.status = ListingStatus.RESERVED
        listing.updated_at = datetime.utcnow()

        # Auto-reject any other pending requests for this listing
        other_pending = db.query(DonationRequest).filter(
            DonationRequest.listing_id == listing.id,
            DonationRequest.id != req.id,
            DonationRequest.status == RequestStatus.PENDING
        ).all()
        for other_req in other_pending:
            other_req.status = RequestStatus.REJECTED
            other_req.donor_response_notes = "Listing was awarded to another charitable organization."
            other_req.updated_at = datetime.utcnow()
            # Notify rejected
            db.add(Notification(
                user_id=other_req.recipient_id,
                title="Donation Request Update",
                message=f"The listing '{listing.title}' was awarded to another charity.",
                type="INFO",
                link="/recipient/requests"
            ))

        # Notify accepted recipient
        db.add(Notification(
            user_id=req.recipient_id,
            title="🎉 Donation Request Accepted!",
            message=f"{listing.donor.org_name} accepted your request for '{listing.title}'. Pickup Code: {listing.pickup_code}. Please prepare your team.",
            type="SUCCESS",
            link="/recipient/requests"
        ))

        # Audit
        db.add(AuditLog(
            user_id=current_user.id,
            action="REQUEST_ACCEPTED",
            entity_type="DonationRequest",
            entity_id=req.id,
            details=f"Donor accepted request from {req.recipient.org_name} for listing '{listing.title}'"
        ))

    # 2. ACTION: REJECT
    elif action == "reject":
        if not (is_donor or is_admin):
            raise HTTPException(status_code=403, detail="Only the donor or admin can reject a donation request.")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(status_code=400, detail=f"Cannot reject request in '{req.status.value}' state.")

        req.status = RequestStatus.REJECTED
        req.donor_response_notes = action_in.notes or "Declined by donor."
        req.updated_at = datetime.utcnow()

        # Notify recipient
        db.add(Notification(
            user_id=req.recipient_id,
            title="Donation Request Declined",
            message=f"{listing.donor.org_name} was unable to accept your request for '{listing.title}'.",
            type="INFO",
            link="/recipient/requests"
        ))

        db.add(AuditLog(
            user_id=current_user.id,
            action="REQUEST_REJECTED",
            entity_type="DonationRequest",
            entity_id=req.id,
            details=f"Donor rejected request from {req.recipient.org_name}"
        ))

    # 3. ACTION: CANCEL
    elif action == "cancel":
        if not (is_recipient or is_donor or is_admin):
            raise HTTPException(status_code=403, detail="Not authorized to cancel this request.")

        if req.status in [RequestStatus.COMPLETED, RequestStatus.REJECTED, RequestStatus.CANCELLED]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel a request that is already '{req.status.value}'.")

        was_accepted = (req.status == RequestStatus.ACCEPTED)
        req.status = RequestStatus.CANCELLED
        req.cancellation_reason = action_in.notes or "Cancelled by user"
        req.updated_at = datetime.utcnow()

        # If it was reserved, restore listing back to AVAILABLE so other charities can claim it!
        if was_accepted and listing.status == ListingStatus.RESERVED:
            listing.status = ListingStatus.AVAILABLE
            listing.updated_at = datetime.utcnow()

        # Notify the other party
        target_user_id = listing.donor_id if is_recipient else req.recipient_id
        initiator = "Recipient" if is_recipient else "Donor"
        db.add(Notification(
            user_id=target_user_id,
            title="Request Cancelled",
            message=f"{initiator} cancelled the donation request for '{listing.title}'.",
            type="ALERT",
            link="/dashboard"
        ))

        db.add(AuditLog(
            user_id=current_user.id,
            action="REQUEST_CANCELLED",
            entity_type="DonationRequest",
            entity_id=req.id,
            details=f"Cancelled by {current_user.email}. Listing reverted to AVAILABLE if reserved."
        ))

    # 4. ACTION: CONFIRM_PICKUP (On-site handover in transit)
    elif action == "confirm_pickup":
        if not (is_recipient or is_donor or is_admin):
            raise HTTPException(status_code=403, detail="Not authorized to confirm pickup.")

        if req.status != RequestStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Donation must be in ACCEPTED status before pickup confirmation.")

        req.pickup_confirmed_at = datetime.utcnow()
        listing.status = ListingStatus.PICKED_UP
        listing.updated_at = datetime.utcnow()

        db.add(AuditLog(
            user_id=current_user.id,
            action="PICKUP_CONFIRMED",
            entity_type="DonationRequest",
            entity_id=req.id,
            details=f"Pickup confirmed for listing '{listing.title}'"
        ))

    # 5. ACTION: COMPLETE (Donation fully completed & verified)
    elif action == "complete":
        if not (is_recipient or is_donor or is_admin):
            raise HTTPException(status_code=403, detail="Not authorized to complete this donation.")

        if req.status not in [RequestStatus.ACCEPTED]:
            raise HTTPException(status_code=400, detail="Cannot complete a request that is not currently accepted.")

        # Validate pickup security PIN if provided by recipient
        if is_recipient and action_in.pickup_code:
            if listing.pickup_code and action_in.pickup_code.strip() != listing.pickup_code.strip():
                raise HTTPException(status_code=400, detail="Invalid 4-digit pickup code. Please check with the donor.")

        now = datetime.utcnow()
        req.status = RequestStatus.COMPLETED
        req.completed_at = now
        req.updated_at = now

        listing.status = ListingStatus.COMPLETED
        listing.updated_at = now

        # Congratulatory notifications to both
        db.add(Notification(
            user_id=req.recipient_id,
            title="🌟 Donation Completed!",
            message=f"Thank you for rescuing {listing.quantity} {listing.unit} (~{listing.estimated_meals} meals) of food!",
            type="SUCCESS",
            link="/impact"
        ))
        db.add(Notification(
            user_id=listing.donor_id,
            title="🌟 Donation Completed!",
            message=f"Handoff verified! You provided ~{listing.estimated_meals} meals and prevented food waste.",
            type="SUCCESS",
            link="/impact"
        ))

        db.add(AuditLog(
            user_id=current_user.id,
            action="DONATION_COMPLETED",
            entity_type="FoodListing",
            entity_id=listing.id,
            details=f"Listing #{listing.id} successfully completed. {listing.quantity_kg} kg saved."
        ))

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown action '{action}'. Valid actions: accept, reject, cancel, confirm_pickup, complete."
        )

    db.commit()
    db.refresh(req)
    return req
