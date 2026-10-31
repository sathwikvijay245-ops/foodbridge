from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import User, UserRole, VerificationStatus, Notification, AuditLog
from backend.schemas import UserRegister, UserLogin, Token, UserResponse
from backend.auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Verification status: donors and admins start verified/active; recipients start PENDING until verified
    if user_in.role == UserRole.RECIPIENT:
        initial_status = VerificationStatus.PENDING
    else:
        initial_status = VerificationStatus.VERIFIED

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        org_name=user_in.org_name,
        org_type=user_in.org_type,
        phone=user_in.phone,
        address=user_in.address,
        city=user_in.city or "Metropolis",
        charity_reg_number=user_in.charity_reg_number,
        verification_status=initial_status,
        refrigerated_transport=user_in.refrigerated_transport or False,
        volunteer_capacity=user_in.volunteer_capacity,
        mission_statement=user_in.mission_statement,
        food_safety_cert_id=user_in.food_safety_cert_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Welcome notification
    welcome_msg = (
        "Welcome to FoodBridge! Your recipient profile has been submitted for verification."
        if new_user.role == UserRole.RECIPIENT
        else "Welcome to FoodBridge! You can now list surplus food donations."
    )
    notif = Notification(
        user_id=new_user.id,
        title="Welcome to FoodBridge",
        message=welcome_msg,
        type="SYSTEM",
        link="/dashboard"
    )
    db.add(notif)
    
    # Audit log
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        entity_type="User",
        entity_id=new_user.id,
        details=f"User {new_user.email} registered with role {new_user.role.value}"
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    """Return available demo users for quick 1-click evaluation switching."""
    users = db.query(User).filter(User.is_active == True).all()
    demo_list = []
    for u in users:
        demo_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value,
            "org_name": u.org_name,
            "org_type": u.org_type,
            "verification_status": u.verification_status.value
        })
    return demo_list

@router.post("/demo-login/{user_id}", response_model=Token)
def demo_login(user_id: int, db: Session = Depends(get_db)):
    """Instant login endpoint for evaluator demo mode."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found")
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer", "user": user}
