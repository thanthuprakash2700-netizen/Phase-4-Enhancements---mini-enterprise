from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi_pagination import Page

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=Page[UserOut], dependencies=[Depends(require_roles("admin", "manager"))])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return UserService.list_users(db, current_user)


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.get_user(db, user_id, current_user)
