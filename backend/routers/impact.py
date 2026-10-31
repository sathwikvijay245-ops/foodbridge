from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import (
    FoodListing, User, UserRole, ListingStatus, VerificationStatus, DonationRequest, RequestStatus
)
from backend.schemas import ImpactMetricsResponse

router = APIRouter(prefix="/api/impact", tags=["Impact & Analytics"])

@router.get("", response_model=ImpactMetricsResponse)
def get_impact_metrics(db: Session = Depends(get_db)):
    # Query completed listings
    completed_listings = db.query(FoodListing).filter(FoodListing.status == ListingStatus.COMPLETED).all()
    
    total_completed = len(completed_listings)
    total_kg = sum(l.quantity_kg for l in completed_listings)
    total_meals = sum(l.estimated_meals for l in completed_listings)

    # Standard EPA / UN FAO conversion factors:
    # 2.5 kg CO2e avoided per kg food rescued
    # 1,000 liters water saved per kg food rescued
    co2e_kg = round(total_kg * 2.5, 1)
    water_liters = round(total_kg * 1000.0, 1)

    active_listings_count = db.query(FoodListing).filter(FoodListing.status == ListingStatus.AVAILABLE).count()
    active_donors_count = db.query(User).filter(User.role == UserRole.DONOR, User.is_active == True).count()
    verified_recipients_count = db.query(User).filter(
        User.role == UserRole.RECIPIENT,
        User.verification_status == VerificationStatus.VERIFIED
    ).count()

    # Category breakdown for all completed or available
    category_counts = {}
    for l in completed_listings:
        cat = l.category.value
        category_counts[cat] = category_counts.get(cat, 0) + l.quantity_kg
    
    category_breakdown = [
        {"category": cat, "quantity_kg": round(qty, 1), "label": cat.replace("_", " ").title()}
        for cat, qty in category_counts.items()
    ]
    if not category_breakdown:
        # Fallback empty structure
        category_breakdown = [
            {"category": "cooked_meals", "quantity_kg": 0, "label": "Cooked Meals"},
            {"category": "bakery_pastries", "quantity_kg": 0, "label": "Bakery Pastries"},
            {"category": "fresh_produce", "quantity_kg": 0, "label": "Fresh Produce"}
        ]

    # Top donors
    donor_stats = {}
    for l in completed_listings:
        d_name = l.donor.org_name if l.donor else "Unknown Donor"
        if d_name not in donor_stats:
            donor_stats[d_name] = {"name": d_name, "donations": 0, "kg": 0.0, "meals": 0}
        donor_stats[d_name]["donations"] += 1
        donor_stats[d_name]["kg"] += l.quantity_kg
        donor_stats[d_name]["meals"] += l.estimated_meals

    top_donors = sorted(donor_stats.values(), key=lambda x: x["kg"], reverse=True)[:5]
    for d in top_donors:
        d["kg"] = round(d["kg"], 1)

    # Top recipients
    recipient_stats = {}
    for l in completed_listings:
        accepted_req = next((r for r in l.requests if r.status == RequestStatus.COMPLETED or r.status == RequestStatus.ACCEPTED), None)
        if accepted_req and accepted_req.recipient:
            r_name = accepted_req.recipient.org_name
            if r_name not in recipient_stats:
                recipient_stats[r_name] = {"name": r_name, "received_count": 0, "kg": 0.0, "meals": 0}
            recipient_stats[r_name]["received_count"] += 1
            recipient_stats[r_name]["kg"] += l.quantity_kg
            recipient_stats[r_name]["meals"] += l.estimated_meals

    top_recipients = sorted(recipient_stats.values(), key=lambda x: x["kg"], reverse=True)[:5]
    for r in top_recipients:
        r["kg"] = round(r["kg"], 1)

    # Recent completed donations for feed
    recent_completions = []
    for l in sorted(completed_listings, key=lambda x: x.updated_at, reverse=True)[:5]:
        recent_completions.append({
            "title": l.title,
            "category": l.category.value,
            "quantity": f"{l.quantity} {l.unit}",
            "meals": l.estimated_meals,
            "donor_org": l.donor.org_name if l.donor else "",
            "date": l.updated_at.strftime("%b %d, %Y")
        })

    return {
        "total_donations_completed": total_completed,
        "total_kg_redistributed": round(total_kg, 1),
        "total_meals_provided": total_meals,
        "co2e_avoided_kg": co2e_kg,
        "water_saved_liters": water_liters,
        "active_listings_count": active_listings_count,
        "active_donors_count": active_donors_count,
        "verified_recipients_count": verified_recipients_count,
        "category_breakdown": category_breakdown,
        "top_donors": top_donors,
        "top_recipients": top_recipients,
        "recent_completions": recent_completions
    }
