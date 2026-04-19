from sqlalchemy.orm import Session
from app.models.ai_consulting import AIChatSession, AIChatMessage, AIConsultingBrief
from app.schemas.ai_consulting import (
    AIChatSessionCreate, AIChatSessionUpdate,
    AIChatMessageCreate, AIConsultingBriefCreate
)
from typing import List, Optional

class AIConsultingService:
    # --- Sessions ---
    def create_session(self, db: Session, session_in: AIChatSessionCreate):
        db_session = AIChatSession(**session_in.model_dump())
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    def get_sessions(self, db: Session, user_id: int):
        return db.query(AIChatSession).filter(AIChatSession.user_id == user_id).order_by(AIChatSession.updated_at.desc()).all()

    def update_session(self, db: Session, session_id: int, update_in: AIChatSessionUpdate):
        db_session = db.query(AIChatSession).filter(AIChatSession.session_id == session_id).first()
        if db_session:
            for key, value in update_in.model_dump(exclude_unset=True).items():
                setattr(db_session, key, value)
            db.commit()
            db.refresh(db_session)
        return db_session

    def delete_session(self, db: Session, session_id: int):
        db_session = db.query(AIChatSession).filter(AIChatSession.session_id == session_id).first()
        if db_session:
            db.delete(db_session)
            db.commit()
            return True
        return False

    # --- Messages ---
    def create_message(self, db: Session, message_in: AIChatMessageCreate):
        db_message = AIChatMessage(**message_in.model_dump())
        db.add(db_message)
        # 세션의 updated_at 갱신
        db_session = db.query(AIChatSession).filter(AIChatSession.session_id == message_in.session_id).first()
        if db_session:
            from sqlalchemy.sql import func
            db_session.updated_at = func.now()
        db.commit()
        db.refresh(db_message)
        return db_message

    def get_messages(self, db: Session, session_id: int):
        return db.query(AIChatMessage).filter(AIChatMessage.session_id == session_id).order_by(AIChatMessage.created_at.asc()).all()

    # --- Briefs ---
    def create_brief(self, db: Session, brief_in: AIConsultingBriefCreate):
        db_brief = AIConsultingBrief(**brief_in.model_dump())
        db.add(db_brief)
        db.commit()
        db.refresh(db_brief)
        return db_brief

    def get_briefs_by_session(self, db: Session, session_id: int):
        return db.query(AIConsultingBrief).filter(AIConsultingBrief.session_id == session_id).all()

ai_consulting_service = AIConsultingService()
