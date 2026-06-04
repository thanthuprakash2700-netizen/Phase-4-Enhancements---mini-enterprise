from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from fastapi import HTTPException
from fastapi_pagination.ext.sqlalchemy import paginate

from app.models.user import User
from app.models.approval import Approval, ApprovalHistory, ApprovalStatus, ApprovalLevel
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.approval import ApprovalCreate, ApprovalAction

class ApprovalService:
    @staticmethod
    def create_approval(db: Session, approval_in: ApprovalCreate, current_user: User) -> tuple[Approval, list[Notification]]:
        approval = Approval(
            title=approval_in.title,
            description=approval_in.description,
            requested_by_id=current_user.id,
            status=ApprovalStatus.pending,
            current_level=ApprovalLevel.manager,
            organization_id=current_user.organization_id
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)

        audit = AuditLog(
            user_id=current_user.id, 
            action="CREATE_APPROVAL", 
            entity="APPROVAL", 
            entity_id=approval.id, 
            details={"title": approval.title},
            organization_id=current_user.organization_id
        )
        db.add(audit)

        notifs = []
        managers = db.execute(select(User).where(
            User.role.in_(["manager", "admin"]),
            User.organization_id == current_user.organization_id
        )).scalars().all()
        for mgr in managers:
            if mgr.id != current_user.id:
                notif = Notification(
                    user_id=mgr.id,
                    message=f"New approval request '{approval.title}' submitted by {current_user.name}.",
                    organization_id=current_user.organization_id
                )
                db.add(notif)
                notifs.append(notif)
                
        db.commit()
        return approval, notifs

    @staticmethod
    def list_approvals(db: Session, current_user: User):
        stmt = select(Approval).options(
            joinedload(Approval.history).joinedload(ApprovalHistory.actor),
            joinedload(Approval.requester)
        ).where(Approval.organization_id == current_user.organization_id)
        
        if current_user.role == "admin":
            pass
        elif current_user.role == "manager":
            pass
        else:
            stmt = stmt.where(Approval.requested_by_id == current_user.id)
            
        stmt = stmt.order_by(Approval.id.desc())
        return paginate(db, stmt)

    @staticmethod
    def take_approval_action(db: Session, id: int, action_in: ApprovalAction, current_user: User) -> tuple[Approval, Notification]:
        if current_user.role not in ["admin", "manager"]:
            raise HTTPException(status_code=403, detail="Only managers and admins can take actions on approvals")

        approval = db.execute(select(Approval).where(
            Approval.id == id,
            Approval.organization_id == current_user.organization_id
        )).scalars().first()
        if not approval:
            raise HTTPException(status_code=404, detail="Approval request not found")

        if action_in.action == "rejected" and not action_in.comment:
            raise HTTPException(status_code=400, detail="Rejection requires a comment")

        if action_in.action == "approved":
            if current_user.role == "manager":
                if approval.current_level == ApprovalLevel.manager:
                    approval.status = ApprovalStatus.approved
                else:
                    approval.status = ApprovalStatus.approved
            else:
                approval.status = ApprovalStatus.approved
        else:
            approval.status = action_in.action

        history = ApprovalHistory(
            approval_id=approval.id,
            action_by_id=current_user.id,
            action=action_in.action,
            comment=action_in.comment
        )
        db.add(history)
        
        audit = AuditLog(
            user_id=current_user.id, 
            action=f"APPROVAL_{action_in.action.upper()}", 
            entity="APPROVAL", 
            entity_id=approval.id, 
            details={"action": action_in.action, "comment": action_in.comment},
            organization_id=current_user.organization_id
        )
        db.add(audit)
        
        notif = Notification(
            user_id=approval.requested_by_id, 
            message=f"Your approval request '{approval.title}' has been {action_in.action}.",
            organization_id=current_user.organization_id
        )
        db.add(notif)
        
        db.commit()
        db.refresh(approval)
        return approval, notif

    @staticmethod
    def get_approval_history(db: Session, id: int, current_user: User):
        approval = db.execute(select(Approval).where(
            Approval.id == id,
            Approval.organization_id == current_user.organization_id
        )).scalars().first()
        if not approval:
            raise HTTPException(status_code=404, detail="Approval request not found")
        
        if current_user.role == "employee" and approval.requested_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this approval history")

        return approval.history

    @staticmethod
    def escalate_approval(db: Session, escalation_in, current_user: User):
        from app.models.approval import ApprovalEscalation
        approval = db.execute(select(Approval).where(
            Approval.id == escalation_in.approval_id,
            Approval.organization_id == current_user.organization_id
        )).scalars().first()
        if not approval:
            raise HTTPException(status_code=404, detail="Approval request not found")
        
        escalation = ApprovalEscalation(
            approval_id=approval.id,
            escalated_from=current_user.id,
            escalated_to=escalation_in.escalated_to,
            reason=escalation_in.reason,
            status="pending"
        )
        db.add(escalation)
        db.commit()
        db.refresh(escalation)
        return escalation

    @staticmethod
    def get_escalations(db: Session, current_user: User):
        from app.models.approval import ApprovalEscalation
        return db.query(ApprovalEscalation).filter(
            ApprovalEscalation.escalated_from == current_user.id
        ).all()

    @staticmethod
    def delegate_approval(db: Session, delegation_in, current_user: User):
        from app.models.approval import ApprovalDelegation
        delegation = ApprovalDelegation(
            delegator_id=current_user.id,
            delegatee_id=delegation_in.delegatee_id,
            start_date=delegation_in.start_date,
            end_date=delegation_in.end_date,
            reason=delegation_in.reason,
            is_active=True
        )
        db.add(delegation)
        db.commit()
        db.refresh(delegation)
        return delegation

    @staticmethod
    def get_delegations(db: Session, current_user: User):
        from app.models.approval import ApprovalDelegation
        return db.query(ApprovalDelegation).filter(
            ApprovalDelegation.delegator_id == current_user.id
        ).all()
