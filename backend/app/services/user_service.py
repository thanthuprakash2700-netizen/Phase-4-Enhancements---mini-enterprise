from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from fastapi_pagination.ext.sqlalchemy import paginate
from app.models.user import User

class UserService:
    @staticmethod
    def list_users(db: Session, current_user: User):
        stmt = select(User).where(User.organization_id == current_user.organization_id).order_by(User.id.asc())
        return paginate(db, stmt)

    @staticmethod
    def get_user(db: Session, user_id: int, current_user: User):
        stmt = select(User).where(
            User.id == user_id, 
            User.organization_id == current_user.organization_id
        )
        user = db.execute(stmt).scalars().first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if current_user.role != "admin" and current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
