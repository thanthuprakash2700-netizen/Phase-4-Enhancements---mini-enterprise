from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta

from app.models.user import User
from app.models.task import Task, StatusEnum
from app.models.approval import Approval, ApprovalStatus

class DashboardService:
    @staticmethod
    def get_dashboard_summary(db: Session, current_user: User) -> dict:
        q = select(func.count(Task.id)).where(Task.organization_id == current_user.organization_id)
        if current_user.role == "manager":
            q = q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        elif current_user.role == "employee":
            q = q.where(Task.assigned_to_id == current_user.id)
            
        total_tasks = db.execute(q).scalar() or 0
        
        status_q = select(Task.status, func.count(Task.id)).where(Task.organization_id == current_user.organization_id)
        if current_user.role == "manager":
            status_q = status_q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        elif current_user.role == "employee":
            status_q = status_q.where(Task.assigned_to_id == current_user.id)
            
        status_q = status_q.group_by(Task.status)
        status_counts = db.execute(status_q).all()
        
        tasks_by_status = {status.value: count for status, count in status_counts}
        
        for s in StatusEnum:
            if s.value not in tasks_by_status:
                tasks_by_status[s.value] = 0
                
        app_q = select(func.count(Approval.id)).where(
            Approval.status == ApprovalStatus.pending,
            Approval.organization_id == current_user.organization_id
        )
        if current_user.role == "employee":
            app_q = app_q.where(Approval.requested_by_id == current_user.id)
        pending_approvals = db.execute(app_q).scalar() or 0
        
        completed_tasks = tasks_by_status.get(StatusEnum.done.value, 0)
        
        return {
            "total_tasks": total_tasks,
            "tasks_by_status": tasks_by_status,
            "pending_approvals": pending_approvals,
            "completed_tasks": completed_tasks
        }

    @staticmethod
    def get_task_distribution(db: Session, current_user: User) -> List[dict]:
        status_q = select(Task.status, func.count(Task.id)).where(Task.organization_id == current_user.organization_id)
        if current_user.role == "manager":
            status_q = status_q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        elif current_user.role == "employee":
            status_q = status_q.where(Task.assigned_to_id == current_user.id)
            
        status_q = status_q.group_by(Task.status)
        status_counts = db.execute(status_q).all()
        return [{"status": status.value, "count": count} for status, count in status_counts]

    @staticmethod
    def get_performance_insights(db: Session, current_user: User) -> List[dict]:
        if current_user.role not in ["admin", "manager"]:
            return []

        q = select(
            User.name, 
            func.count(Task.id).label("completed_count")
        ).join(Task, Task.assigned_to_id == User.id)\
         .where(
             Task.status == StatusEnum.done,
             User.organization_id == current_user.organization_id,
             Task.organization_id == current_user.organization_id
         )\
         .group_by(User.name)
         
        results = db.execute(q).all()
        
        return [{"user_name": r.name, "completed_count": r.completed_count} for r in results]

    @staticmethod
    def get_ai_summary(db: Session, current_user: User) -> dict:
        q = select(Task).where(Task.organization_id == current_user.organization_id)
        
        if current_user.role == "manager":
            q = q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        elif current_user.role == "employee":
            q = q.where(Task.assigned_to_id == current_user.id)
            
        now = datetime.utcnow()
        risk_window = now + timedelta(days=1)
        
        high_priority_q = q.where(
            ((Task.priority == "high") | (Task.attention_required == True)),
            Task.status != StatusEnum.done
        )
        high_priority_tasks = db.execute(high_priority_q).scalars().all()
        
        all_pending_q = q.where(Task.status != StatusEnum.done)
        all_pending = db.execute(all_pending_q).scalars().all()
        
        delay_risks = []
        for t in all_pending:
            if t.due_date:
                try:
                    due_dt = datetime.combine(t.due_date, datetime.min.time())
                except TypeError:
                    due_dt = t.due_date
                    
                if due_dt.tzinfo:
                    now = now.replace(tzinfo=due_dt.tzinfo)
                    risk_window = risk_window.replace(tzinfo=due_dt.tzinfo)
                
                if due_dt < now or (due_dt < risk_window and t.status == StatusEnum.todo) or t.delay_risk in ["medium", "high"]:
                    delay_risks.append(t)
            elif t.delay_risk in ["medium", "high"]:
                delay_risks.append(t)
                    
        def format_task(t):
            return {
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "status": t.status.value,
                "priority": t.priority.value,
                "attention_required": t.attention_required,
                "delay_risk": t.delay_risk.value if hasattr(t.delay_risk, 'value') else t.delay_risk
            }
        
        return {
            "insights": [],
            "high_priority_pending": [format_task(t) for t in high_priority_tasks],
            "delay_risks": [format_task(t) for t in delay_risks]
        }
