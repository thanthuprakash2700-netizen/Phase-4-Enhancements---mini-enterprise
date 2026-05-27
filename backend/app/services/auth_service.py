from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status
from jose import jwt, JWTError

from app.models.user import User
from app.models.tenant import Organization, Subscription, PlanEnum, SubscriptionStatus
from app.schemas.user import UserCreate, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_google_token
from app.core.config import settings

class AuthService:
    @staticmethod
    def register_user(db: Session, payload: UserCreate) -> User:
        exists = db.execute(select(User).where(User.email == payload.email)).scalars().first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create a default organization for the new user
        org_name = f"{payload.name}'s Organization"
        org = Organization(name=org_name, credits=100)
        db.add(org)
        db.flush()

        # Create a default free subscription
        sub = Subscription(
            organization_id=org.id,
            plan_name=PlanEnum.basic,
            status=SubscriptionStatus.active
        )
        db.add(sub)

        user = User(
            name=payload.name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            role=payload.role,
            is_active=True,
            organization_id=org.id
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> dict:
        user = db.execute(select(User).where(User.email == email)).scalars().first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        access_token = create_access_token(str(user.id), extra={"role": user.role})
        refresh_token = create_refresh_token(str(user.id), extra={"role": user.role})
        
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    @staticmethod
    def refresh_token(db: Session, payload: RefreshTokenRequest) -> dict:
        try:
            token_data = jwt.decode(payload.refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if token_data.get("type") != "refresh":
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
            user_id = token_data.get("sub")
            if not user_id:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

        user = db.execute(select(User).where(User.id == int(user_id))).scalars().first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        access_token = create_access_token(str(user.id), extra={"role": user.role})
        refresh_token = create_refresh_token(str(user.id), extra={"role": user.role})
        
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    @staticmethod
    def forgot_password(db: Session, payload: ForgotPasswordRequest) -> dict:
        user = db.execute(select(User).where(User.email == payload.email)).scalars().first()
        if user and user.is_active:
            reset_token = create_access_token(str(user.id), extra={"type": "reset", "role": user.role})
            reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
            print(f"\n--- PASSWORD RESET LINK ---")
            print(reset_link)
            print(f"---------------------------\n")
            return {"message": "If that email exists, a password reset link has been sent.", "reset_link": reset_link}
        return {"message": "If that email exists, a password reset link has been sent."}

    @staticmethod
    def reset_password(db: Session, payload: ResetPasswordRequest) -> dict:
        try:
            token_data = jwt.decode(payload.token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if token_data.get("type") != "reset":
                raise HTTPException(status_code=400, detail="Invalid token type")
            user_id = token_data.get("sub")
        except JWTError:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")

        user = db.execute(select(User).where(User.id == int(user_id))).scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.hashed_password = hash_password(payload.new_password)
        db.commit()
        return {"message": "Password reset successfully"}

    @staticmethod
    def google_auth(db: Session, payload: GoogleAuthRequest) -> dict:
        idinfo = verify_google_token(payload.token)
        if not idinfo:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        email = idinfo.get("email")
        name = idinfo.get("name", "Google User")

        user = db.execute(select(User).where(User.email == email)).scalars().first()
        if not user:
            org_name = f"{name}'s Organization"
            org = Organization(name=org_name, credits=100)
            db.add(org)
            db.flush()
            
            sub = Subscription(
                organization_id=org.id,
                plan_name=PlanEnum.basic,
                status=SubscriptionStatus.active
            )
            db.add(sub)

            user = User(
                name=name,
                email=email,
                hashed_password=hash_password("google-oauth-placeholder"),
                role="employee",
                is_active=True,
                organization_id=org.id
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        access_token = create_access_token(str(user.id), extra={"role": user.role})
        refresh_token = create_refresh_token(str(user.id), extra={"role": user.role})

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
