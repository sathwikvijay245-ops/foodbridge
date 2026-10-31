from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Report, User, FoodListing, ReportStatus, AuditLog, Notification, UserRole
from backend.schemas import ReportCreate, ReportResponse
from backend.auth_utils import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports & Incident Moderation"])

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify target listing if specified
    if report_in.listing_id:
        listing = db.query(FoodListing).filter(FoodListing.id == report_in.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Referenced listing not found")
        reported_user_id = listing.donor_id
    else:
        reported_user_id = report_in.reported_user_id

    new_report = Report(
        listing_id=report_in.listing_id,
        reporter_id=current_user.id,
        reported_user_id=reported_user_id,
        reason=report_in.reason,
        details=report_in.details,
        status=ReportStatus.OPEN
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Notify admins
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    for admin in admins:
        db.add(Notification(
            user_id=admin.id,
            title="⚠️ New Safety/Content Report Filed",
            message=f"{current_user.email} filed a report: '{report_in.reason}'.",
            type="ALERT",
            link="/admin/moderation"
        ))

    db.add(AuditLog(
        user_id=current_user.id,
        action="REPORT_FILED",
        entity_type="Report",
        entity_id=new_report.id,
        details=f"Filed by {current_user.email} on listing #{report_in.listing_id or 'none'}"
    ))
    db.commit()

    return new_report
