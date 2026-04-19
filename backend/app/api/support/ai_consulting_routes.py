from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.api.account_company.auth_utils import RoleChecker
from app.services.ai_consulting_service import ai_consulting_service
from app.schemas.ai_consulting import (
    AIChatSessionRead, AIChatSessionCreate, AIChatSessionUpdate,
    AIChatMessageRead, AIChatMessageCreate,
    AIConsultingBriefRead, AIConsultingBriefCreate
)

router = APIRouter()

# --- Sessions ---
@router.post("/sessions", response_model=AIChatSessionRead)
def create_session(session_in: AIChatSessionCreate, db: Session = Depends(get_db)):
    """ 새로운 AI 상담 세션을 생성합니다. """
    return ai_consulting_service.create_session(db, session_in)

@router.get("/sessions/user/{user_id}", response_model=List[AIChatSessionRead])
def get_user_sessions(user_id: int, db: Session = Depends(get_db)):
    """ 특정 사용자의 모든 AI 상담 세션을 조회합니다. """
    return ai_consulting_service.get_sessions(db, user_id)

@router.patch("/sessions/{session_id}", response_model=AIChatSessionRead)
def update_session(session_id: int, update_in: AIChatSessionUpdate, db: Session = Depends(get_db)):
    """ 세션 정보(제목 등)를 수정합니다. """
    session = ai_consulting_service.update_session(db, session_id, update_in)
    if not session: raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return session

@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """ 세션 및 모든 메시지를 삭제합니다. """
    if not ai_consulting_service.delete_session(db, session_id):
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return {"message": "세션이 성공적으로 삭제되었습니다."}

# --- Messages ---
@router.post("/messages", response_model=AIChatMessageRead)
def create_message(message_in: AIChatMessageCreate, db: Session = Depends(get_db)):
    """ 질의 혹은 답변 메시지를 등록합니다. """
    return ai_consulting_service.create_message(db, message_in)

@router.get("/sessions/{session_id}/messages", response_model=List[AIChatMessageRead])
def get_session_messages(session_id: int, db: Session = Depends(get_db)):
    """ 특정 세션의 모든 대화 내역을 조회합니다. """
    return ai_consulting_service.get_messages(db, session_id)

# --- Briefs ---
@router.post("/briefs", response_model=AIConsultingBriefRead, dependencies=[Depends(RoleChecker(["Admin", "Manufacturer"]))])
def create_brief(brief_in: AIConsultingBriefCreate, db: Session = Depends(get_db)):
    """ AI가 도출한 최종 컨설팅 브리프를 저장합니다. """
    return ai_consulting_service.create_brief(db, brief_in)

@router.get("/sessions/{session_id}/briefs", response_model=List[AIConsultingBriefRead])
def get_session_briefs(session_id: int, db: Session = Depends(get_db)):
    """ 세션별 제안된 브리프 목록을 조회합니다. """
    return ai_consulting_service.get_briefs_by_session(db, session_id)
