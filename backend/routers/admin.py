from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import (
    User, FoodListing, DonationRequest, Report, Notification, AuditLog,
    UserRole, VerificationStatus, ListingStatus, ReportStatus
)
from backend.schemas import (
    UserResponse, ListingResponse, ReportResponse, ReportUpdate,
    UserVerificationUpdate, AuditLogResponse
)
from backend.auth_utils import require_roles

router = APIRouter(prefix="/api/admin", tags=["Admin Moderation & Oversight"])

# Require admin role for all endpoints in this router
admin_only = require_roles([UserRole.ADMIN])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(admin_only)):
    total_users = db.query(User).count()
    donors_count = db.query(User).filter(User.role == UserRole.DONOR).count()
    recipients_count = db.query(User).filter(User.role == UserRole.RECIPIENT).count()
    pending_verifications = db.query(User).filter(
        User.role == UserRole.RECIPIENT,
        User.verification_status == VerificationStatus.PENDING
    ).count()
    
    total_listings = db.query(FoodListing).count()
    active_listings = db.query(FoodListing).filter(FoodListing.status == ListingStatus.AVAILABLE).count()
    completed_listings = db.query(FoodListing).filter(FoodListing.status == ListingStatus.COMPLETED).count()
    open_reports = db.query(Report).filter(Report.status == ReportStatus.OPEN).count()

    return {
        "total_users": total_users,
        "donors_count": donors_count,
        "recipients_count": recipients_count,
        "pending_verifications": pending_verifications,
        "total_listings": total_listings,
        "active_listings": active_listings,
        "completed_listings": completed_listings,
        "open_reports": open_reports,
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role: Optional[str] = None,
    verification_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if verification_status:
        query = query.filter(User.verification_status == verification_status)
    return query.order_by(User.created_at.desc()).all()

@router.patch("/users/{user_id}/verification", response_model=UserResponse)
def update_user_verification(
    user_id: int,
    verif_in: UserVerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = user.verification_status
    user.verification_status = verif_in.status
    db.commit()
    db.refresh(user)

    # Notify recipient
    status_msg = (
        "Congratulations! Your charitable organization has been VERIFIED. You can now claim surplus food donations."
        if verif_in.status == VerificationStatus.VERIFIED
        else f"Your organization verification status was updated to {verif_in.status.value.upper()}."
    )
    db.add(Notification(
        user_id=user.id,
        title="Verification Status Updated",
        message=f"{status_msg} {verif_in.admin_notes or ''}",
        type="SYSTEM",
        link="/dashboard"
    ))

    # Audit
    db.add(AuditLog(
        user_id=current_user.id,
        action="USER_VERIFICATION_UPDATED",
        entity_type="User",
        entity_id=user.id,
        details=f"Admin {current_user.email} changed {user.email} status from {old_status.value} to {verif_in.status.value}"
    ))
    db.commit()

    return user

@router.patch("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate own admin account")

    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)

    db.add(AuditLog(
        user_id=current_user.id,
        action="USER_ACTIVE_TOGGLED",
        entity_type="User",
        entity_id=user.id,
        details=f"User {user.email} active set to {user.is_active}"
    ))
    db.commit()

    return user

@router.get("/reports", response_model=List[ReportResponse])
def get_reports(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    return query.order_by(Report.created_at.desc()).all()

@router.patch("/reports/{report_id}", response_model=ReportResponse)
def resolve_report(
    report_id: int,
    rep_in: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = rep_in.status
    report.admin_notes = rep_in.admin_notes
    if rep_in.status in [ReportStatus.RESOLVED, ReportStatus.DISMISSED]:
        report.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(report)

    db.add(AuditLog(
        user_id=current_user.id,
        action="REPORT_MODERATED",
        entity_type="Report",
        entity_id=report.id,
        details=f"Report #{report.id} marked as {report.status.value}"
    ))
    db.commit()

    return report

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
