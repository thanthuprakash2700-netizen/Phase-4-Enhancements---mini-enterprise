from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, TaskDistribution, PerformanceInsight
from app.services.dashboard_service import DashboardService
from fastapi_cache.decorator import cache

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return DashboardService.get_dashboard_summary(db, current_user)

@router.get("/task-distribution", response_model=List[TaskDistribution])
def get_task_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return DashboardService.get_task_distribution(db, current_user)


@router.get("/performance", response_model=List[PerformanceInsight])
@cache(expire=60)
def get_performance_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return DashboardService.get_performance_insights(db, current_user)

@router.get("/ai-summary")
def get_ai_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return DashboardService.get_ai_summary(db, current_user)
