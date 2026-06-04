from sqlalchemy.orm import Session
from app.models.sla import SLARule, SLATracking
from app.schemas.sla import SLARuleCreate, SLARuleUpdate, SLATrackingCreate
from fastapi import HTTPException
from datetime import datetime
from typing import List

class SLAService:
    @staticmethod
    def create_sla_rule(db: Session, rule_in: SLARuleCreate, user_id: int) -> SLARule:
        db_rule = SLARule(**rule_in.model_dump(), created_by=user_id)
        db.add(db_rule)
        db.commit()
        db.refresh(db_rule)
        return db_rule

    @staticmethod
    def get_sla_rules(db: Session, skip: int = 0, limit: int = 100) -> List[SLARule]:
        return db.query(SLARule).offset(skip).limit(limit).all()

    @staticmethod
    def get_sla_rule(db: Session, rule_id: int) -> SLARule:
        rule = db.query(SLARule).filter(SLARule.id == rule_id).first()
        if not rule:
            raise HTTPException(status_code=404, detail="SLA rule not found")
        return rule

    @staticmethod
    def update_sla_rule(db: Session, rule_id: int, rule_in: SLARuleUpdate) -> SLARule:
        rule = SLAService.get_sla_rule(db, rule_id)
        update_data = rule_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rule, field, value)
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def delete_sla_rule(db: Session, rule_id: int) -> SLARule:
        rule = SLAService.get_sla_rule(db, rule_id)
        rule.is_active = False
        db.commit()
        db.refresh(rule)
        return rule

    @staticmethod
    def start_sla_tracking(db: Session, tracking_in: SLATrackingCreate) -> SLATracking:
        db_tracking = SLATracking(**tracking_in.model_dump())
        db.add(db_tracking)
        db.commit()
        db.refresh(db_tracking)
        return db_tracking

    @staticmethod
    def complete_sla_tracking(db: Session, tracking_id: int) -> SLATracking:
        tracking = db.query(SLATracking).filter(SLATracking.id == tracking_id).first()
        if not tracking:
            raise HTTPException(status_code=404, detail="SLA tracking record not found")
        
        tracking.completed_time = datetime.now()
        # Using simple comparison, might need to ensure both are timezone aware or naive
        # Let's assume due_time is timezone aware as per schema
        if tracking.completed_time.replace(tzinfo=tracking.due_time.tzinfo) > tracking.due_time:
            tracking.status = "breached"
        else:
            tracking.status = "completed"
        db.commit()
        db.refresh(tracking)
        return tracking

    @staticmethod
    def get_active_sla_tracking(db: Session, skip: int = 0, limit: int = 100) -> List[SLATracking]:
        return db.query(SLATracking).filter(SLATracking.status == "pending").offset(skip).limit(limit).all()

    @staticmethod
    def get_breached_sla_tracking(db: Session, skip: int = 0, limit: int = 100) -> List[SLATracking]:
        return db.query(SLATracking).filter(SLATracking.status == "breached").offset(skip).limit(limit).all()

    @staticmethod
    def get_sla_tracking_for_record(db: Session, module_name: str, record_id: int) -> SLATracking:
        tracking = db.query(SLATracking).filter(SLATracking.module_name == module_name, SLATracking.record_id == record_id).first()
        if not tracking:
            raise HTTPException(status_code=404, detail="SLA tracking record not found")
        return tracking
