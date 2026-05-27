from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from fastapi import HTTPException
from fastapi_pagination.ext.sqlalchemy import paginate
from app.models.task import Task, StatusEnum
from app.models.user import User
from app.models.comment import Comment
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.task import TaskCreate, TaskUpdate, TaskAssign
from app.schemas.comment import CommentCreate

class TaskService:
    @staticmethod
    def get_task_or_404(db: Session, task_id: int, current_user: User) -> Task:
        stmt = select(Task).options(
            joinedload(Task.assignee),
            joinedload(Task.comments).joinedload(Comment.user)
        ).where(Task.id == task_id, Task.organization_id == current_user.organization_id)
        task = db.execute(stmt).scalars().first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @staticmethod
    def validate_status_transition(current_status: StatusEnum, new_status: StatusEnum):
        allowed_transitions = {
            StatusEnum.todo: [StatusEnum.in_progress],
            StatusEnum.in_progress: [StatusEnum.review, StatusEnum.todo],
            StatusEnum.review: [StatusEnum.done, StatusEnum.in_progress],
            StatusEnum.done: [StatusEnum.review]
        }
        if new_status not in allowed_transitions.get(current_status, []):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid transition from {current_status} to {new_status}"
            )

    @staticmethod
    def create_task(db: Session, payload: TaskCreate, current_user: User) -> tuple[Task, Notification | None]:
        if payload.assigned_to_id is not None:
            stmt = select(User).where(
                User.id == payload.assigned_to_id,
                User.organization_id == current_user.organization_id
            )
            assignee = db.execute(stmt).scalars().first()
            if not assignee:
                raise HTTPException(status_code=400, detail="Assigned user does not exist in your organization")
            
            if current_user.role == "manager" and assignee.role != "employee":
                raise HTTPException(status_code=403, detail="Managers can only assign tasks to employees")

        task = Task(
            title=payload.title,
            description=payload.description,
            status=payload.status,
            priority=payload.priority,
            attention_required=payload.attention_required,
            delay_risk=payload.delay_risk,
            due_date=payload.due_date,
            created_by_id=current_user.id,
            assigned_to_id=payload.assigned_to_id,
            organization_id=current_user.organization_id
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        audit = AuditLog(
            user_id=current_user.id, 
            action="CREATE_TASK", 
            entity="TASK", 
            entity_id=task.id, 
            details={"title": task.title, "priority": task.priority.value, "status": task.status.value, "assigned_to_id": task.assigned_to_id},
            organization_id=current_user.organization_id
        )
        db.add(audit)

        notif = None
        if task.assigned_to_id:
            notif = Notification(
                user_id=task.assigned_to_id, 
                message=f"You have been assigned a new task: {task.title}",
                organization_id=current_user.organization_id
            )
            db.add(notif)
        
        db.commit()
        return task, notif

    @staticmethod
    def list_tasks(db: Session, current_user: User):
        q = select(Task).options(
            joinedload(Task.assignee),
            joinedload(Task.creator)
        ).where(Task.organization_id == current_user.organization_id)
        
        if current_user.role == "admin":
            pass
        elif current_user.role == "manager":
            q = q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        else:
            q = q.where(Task.assigned_to_id == current_user.id)
        
        q = q.order_by(Task.id.desc())
        return paginate(db, q)

    @staticmethod
    def get_kanban_board(db: Session, current_user: User) -> dict:
        q = select(Task).options(
            joinedload(Task.assignee),
            joinedload(Task.creator)
        ).where(Task.organization_id == current_user.organization_id)
        
        if current_user.role == "manager":
            q = q.where((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
        elif current_user.role == "employee":
            q = q.where(Task.assigned_to_id == current_user.id)
            
        tasks = db.execute(q).scalars().all()
        board = {status.value: [] for status in StatusEnum}
        for task in tasks:
            board[task.status.value].append(task)
        return board

    @staticmethod
    def update_task(db: Session, task_id: int, payload: TaskUpdate, current_user: User) -> Task:
        task = TaskService.get_task_or_404(db, task_id, current_user)

        if current_user.role == "employee":
            if task.assigned_to_id != current_user.id:
                raise HTTPException(status_code=403, detail="Forbidden")
            if payload.status is None:
                raise HTTPException(status_code=400, detail="Employees can only update status")
            task.status = payload.status
        else:
            if current_user.role == "manager" and (
                task.created_by_id != current_user.id and task.assigned_to_id != current_user.id
            ):
                raise HTTPException(status_code=403, detail="Forbidden")

            if payload.title is not None:
                task.title = payload.title
            if payload.description is not None:
                task.description = payload.description
            if payload.status is not None:
                task.status = payload.status
            if payload.priority is not None:
                task.priority = payload.priority
            if payload.attention_required is not None:
                task.attention_required = payload.attention_required
            if payload.delay_risk is not None:
                task.delay_risk = payload.delay_risk
            if payload.due_date is not None:
                task.due_date = payload.due_date

        db.add(task)
        db.commit()
        db.refresh(task)

        audit = AuditLog(
            user_id=current_user.id,
            action="UPDATE_TASK",
            entity="TASK",
            entity_id=task.id,
            details={"updates": payload.model_dump(exclude_unset=True)},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        db.commit()
        return task

    @staticmethod
    def delete_task(db: Session, task_id: int, current_user: User):
        task = TaskService.get_task_or_404(db, task_id, current_user)
        if current_user.role == "manager" and task.created_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
        
        audit = AuditLog(
            user_id=current_user.id,
            action=f"DELETE_TASK: '{task.title}'",
            entity="TASK",
            entity_id=task.id,
            details={"title": task.title},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        db.delete(task)
        db.commit()

    @staticmethod
    def assign_task(db: Session, task_id: int, payload: TaskAssign, current_user: User) -> tuple[Task, Notification]:
        task = TaskService.get_task_or_404(db, task_id, current_user)
        if current_user.role == "manager" and task.created_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")

        stmt = select(User).where(
            User.id == payload.assigned_to_id,
            User.organization_id == current_user.organization_id
        )
        assignee = db.execute(stmt).scalars().first()
        if not assignee:
            raise HTTPException(status_code=400, detail="Assigned user does not exist in your organization")

        if current_user.role == "manager" and assignee.role != "employee":
            raise HTTPException(status_code=403, detail="Managers can only assign tasks to employees")

        task.assigned_to_id = assignee.id
        db.add(task)
        
        audit = AuditLog(
            user_id=current_user.id, 
            action="ASSIGN_TASK", 
            entity="TASK", 
            entity_id=task.id, 
            details={"new_assignee_id": assignee.id},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        
        notif = Notification(
            user_id=assignee.id, 
            message=f"You have been assigned to task: {task.title}",
            organization_id=current_user.organization_id
        )
        db.add(notif)
        
        db.commit()
        db.refresh(task)
        return task, notif

    @staticmethod
    def update_task_status(db: Session, task_id: int, status_str: str, current_user: User) -> tuple[Task, Notification | None]:
        task = TaskService.get_task_or_404(db, task_id, current_user)
        if not status_str:
            raise HTTPException(status_code=400, detail="Status is required")
        
        try:
            new_status = StatusEnum(status_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")

        TaskService.validate_status_transition(task.status, new_status)

        old_status = task.status
        task.status = new_status
        task.updated_by_id = current_user.id
        db.add(task)
        
        audit = AuditLog(
            user_id=current_user.id,
            action=f"UPDATE_TASK_STATUS: {old_status.value.upper()} -> {new_status.value.upper()}",
            entity="TASK",
            entity_id=task.id,
            details={"old_status": old_status.value, "new_status": new_status.value},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        
        notif = None
        if new_status == StatusEnum.done and task.created_by_id and task.created_by_id != current_user.id:
            notif = Notification(
                user_id=task.created_by_id,
                message=f"Task '{task.title}' has been completed by {current_user.name}.",
                organization_id=current_user.organization_id
            )
            db.add(notif)
        elif new_status == StatusEnum.review and task.created_by_id and task.created_by_id != current_user.id:
            notif = Notification(
                user_id=task.created_by_id,
                message=f"Task '{task.title}' is ready for review. Submitted by {current_user.name}.",
                organization_id=current_user.organization_id
            )
            db.add(notif)

        db.commit()
        db.refresh(task)
        return task, notif

    @staticmethod
    def get_smart_assign_suggestions(db: Session, current_user: User) -> list:
        if current_user.role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Forbidden")

        stmt = select(User).where(
            User.role == "employee",
            User.organization_id == current_user.organization_id
        )
        employees = db.execute(stmt).scalars().all()
        if not employees:
            return []

        suggestions = []
        for emp in employees:
            active_stmt = select(func.count(Task.id)).where(
                Task.assigned_to_id == emp.id,
                Task.organization_id == current_user.organization_id,
                Task.status != StatusEnum.done
            )
            active_tasks = db.execute(active_stmt).scalar() or 0

            completed_stmt = select(func.count(Task.id)).where(
                Task.assigned_to_id == emp.id,
                Task.organization_id == current_user.organization_id,
                Task.status == StatusEnum.done
            )
            completed_tasks = db.execute(completed_stmt).scalar() or 0

            score = (active_tasks * 10) - (completed_tasks * 2)

            reason = f"Workload: {active_tasks} active tasks. Performance: {completed_tasks} completed."
            if active_tasks == 0:
                reason = f"Highly Recommended: No active tasks. ({completed_tasks} completed historically)"

            suggestions.append({
                "user_id": emp.id,
                "name": emp.name,
                "active_tasks": active_tasks,
                "completed_tasks": completed_tasks,
                "score": score,
                "reason": reason
            })

        suggestions.sort(key=lambda x: x["score"])
        return suggestions

    @staticmethod
    def add_comment(db: Session, task_id: int, comment_in: CommentCreate, current_user: User) -> tuple[Comment, Notification | None]:
        task = TaskService.get_task_or_404(db, task_id, current_user)
        comment = Comment(
            task_id=task.id,
            user_id=current_user.id,
            content=comment_in.content,
            is_internal=comment_in.is_internal,
            organization_id=current_user.organization_id
        )
        db.add(comment)
        
        audit = AuditLog(
            user_id=current_user.id, 
            action="ADD_COMMENT", 
            entity="COMMENT", 
            entity_id=comment.id, 
            details={"content": comment.content},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        
        notif = None
        if task.assigned_to_id and task.assigned_to_id != current_user.id:
            notif = Notification(
                user_id=task.assigned_to_id, 
                message=f"New comment on task: {task.title}",
                organization_id=current_user.organization_id
            )
            db.add(notif)
            
        db.commit()
        db.refresh(comment)
        return comment, notif

    @staticmethod
    def get_comments(db: Session, task_id: int, current_user: User):
        task = TaskService.get_task_or_404(db, task_id, current_user)
        if current_user.role == "employee":
            return [c for c in task.comments if not c.is_internal]
        return task.comments
