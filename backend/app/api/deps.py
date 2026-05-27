from typing import Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User


from slowapi import Limiter
from slowapi.util import get_remote_address

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
limiter = Limiter(key_func=get_remote_address)

Role = Literal["admin", "manager", "employee"]


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from sqlalchemy.orm import joinedload
    user = db.execute(select(User).options(joinedload(User.organization)).where(User.id == int(user_id))).scalars().first()
    if not user or not user.is_active:
        raise credentials_exception
    return user


def require_roles(*roles: Role):
    def _dep(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return _dep


def check_credits(cost: int = 1):
    def _dep(current_user: User = Depends(get_current_user)) -> User:
        if not current_user.organization:
            raise HTTPException(status_code=400, detail="User does not belong to an organization")
        if current_user.organization.credits < cost:
            raise HTTPException(
                status_code=402, 
                detail=f"Insufficient credits. Requires {cost} credits, but you have {current_user.organization.credits}."
            )
        return current_user
    return _dep

