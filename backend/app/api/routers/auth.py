from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserOut, TokenResponse, RefreshTokenRequest, 
    ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return AuthService.login(db, form.username, form.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: Request, payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    return AuthService.refresh_token(db, payload)


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.forgot_password(db, payload)


@router.post("/reset-password")
@limiter.limit("3/minute")
def reset_password(request: Request, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.reset_password(db, payload)


@router.post("/google", response_model=TokenResponse)
def google_auth(request: Request, payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    return AuthService.google_auth(db, payload)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
