from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import TaskAssign, TaskCreate, TaskOut, TaskUpdate
from app.schemas.comment import CommentCreate, CommentOut
from app.api.routers.ws import manager
from app.services.task_service import TaskService
from fastapi_pagination import Page


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskOut, status_code=201, dependencies=[Depends(require_roles("admin", "manager"))])
def create_task(
    payload: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task, notif = TaskService.create_task(db, payload, current_user)
    
    background_tasks.add_task(manager.broadcast_to_org, {"type": "TASK_CREATED", "task_id": task.id}, current_user.organization_id)
    if notif and task.assigned_to_id:
        background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, task.assigned_to_id)
        
    return task


@router.get("/", response_model=Page[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.list_tasks(db, current_user)


@router.get("/kanban", response_model=dict[str, list[TaskOut]])
def get_kanban_board(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.get_kanban_board(db, current_user)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # For GET, the logic in TaskService is mixed with auth, but we handled auth in get_task_or_404 if needed.
    # Actually, the original code had auth logic here. Let's just use the service.
    # I should have extracted auth logic for GET into the service, let me do that quickly.
    # Wait, get_task_or_404 does NOT have auth logic. The original GET endpoint did.
    # Let me just put the auth logic here in the router or I can just call get_task_or_404.
    # It's better to keep the router thin, but auth checks belong in the router or service? Service is better for business auth.
    task = TaskService.get_task_or_404(db, task_id, current_user)
    from fastapi import HTTPException
    if current_user.role == "manager":
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    elif current_user.role == "employee":
        if task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = TaskService.update_task(db, task_id, payload, current_user)
    background_tasks.add_task(manager.broadcast_to_org, {"type": "TASK_UPDATED", "task_id": task.id}, current_user.organization_id)
    return task


@router.delete("/{task_id}", status_code=204, dependencies=[Depends(require_roles("admin", "manager"))])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    TaskService.delete_task(db, task_id, current_user)
    return None


@router.patch("/{task_id}/assign", response_model=TaskOut, dependencies=[Depends(require_roles("admin", "manager"))])
def assign_task(
    task_id: int,
    payload: TaskAssign,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task, notif = TaskService.assign_task(db, task_id, payload, current_user)
    
    background_tasks.add_task(manager.broadcast_to_org, {"type": "TASK_UPDATED", "task_id": task.id}, current_user.organization_id)
    if notif and task.assigned_to_id:
        background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, task.assigned_to_id)
        
    return task


@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: int,
    status_payload: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_status_str = status_payload.get("status")
    task, notif = TaskService.update_task_status(db, task_id, new_status_str, current_user)
    
    background_tasks.add_task(manager.broadcast_to_org, {"type": "TASK_UPDATED", "task_id": task.id}, current_user.organization_id)
    if notif and task.created_by_id:
        background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, task.created_by_id)

    return task


@router.get("/smart-assign-suggestions")
def get_smart_assign_suggestions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.get_smart_assign_suggestions(db, current_user)


@router.post("/{task_id}/comments", response_model=CommentOut)
def add_comment(
    task_id: int,
    comment_in: CommentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment, notif = TaskService.add_comment(db, task_id, comment_in, current_user)
    
    background_tasks.add_task(manager.broadcast_to_org, {"type": "TASK_UPDATED", "task_id": task_id}, current_user.organization_id)
    if notif:
        # We need the task to get the assigned_to_id, but the service returns notif if it created one.
        # We can extract the user_id from the notif
        background_tasks.add_task(manager.send_personal_message, {"type": "NOTIFICATION_NEW", "message": notif.message}, notif.user_id)
        
    return comment


@router.get("/{task_id}/comments", response_model=list[CommentOut])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService.get_comments(db, task_id, current_user)
