from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.ai_consulting import AIChatSession, AIChatMessage, AIConsultingBrief
from app.api.account_company.auth_utils import get_current_user
from app.services.ai_service import ai_service
from pydantic import BaseModel
import datetime
import json

router = APIRouter()

@router.post("/sessions/{session_id}/generate-report")
async def generate_session_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. 세션 및 히스토리 확인
    session = db.query(AIChatSession).filter(AIChatSession.session_id == session_id).first()
    if not session: raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(AIChatMessage).filter(AIChatMessage.session_id == session_id).order_by(AIChatMessage.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in messages]

    # 2. AI 리포트 데이터 생성
    brief_data = await ai_service.generate_brief_from_chat(history)
    
    if "error" in brief_data:
        raise HTTPException(status_code=500, detail=brief_data["error"])

    # 3. DB 저장
    new_brief = AIConsultingBrief(
        session_id=session_id,
        proposed_strategy=json.dumps(brief_data, ensure_ascii=False),
        recommended_items=brief_data.get("key_ingredients", [])
    )
    db.add(new_brief)
    db.commit()
    db.refresh(new_brief)

    return brief_data

@router.get("/sessions/{session_id}/report")
def get_session_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    brief = db.query(AIConsultingBrief).filter(AIConsultingBrief.session_id == session_id).order_by(AIConsultingBrief.created_at.desc()).first()
    if not brief:
        return None
    
    return json.loads(brief.proposed_strategy)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class MessageRead(BaseModel):
    message_id: int
    role: str
    content: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SessionRead(BaseModel):
    session_id: int
    title: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 사용자 ID 추출 (Buyer 또는 CompanyUser 대응)
    user_id = getattr(current_user, "buyer_id", None) or getattr(current_user, "company_user_id", None)
    
    # 1. 세션 확인 또는 생성
    if not request.session_id:
        new_session = AIChatSession(
            user_id=user_id,
            title=request.message[:30] + ( "..." if len(request.message) > 30 else "" )
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        session_id = new_session.session_id
    else:
        session_id = request.session_id

    # 2. 사용자 메시지 저장
    user_msg = AIChatMessage(
        session_id=session_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    
    # 3. 히스토리 요약 (이전 10개 메시지)
    messages = db.query(AIChatMessage).filter(AIChatMessage.session_id == session_id).order_by(AIChatMessage.created_at.desc()).limit(11).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(messages[:-1])] # 현재 메시지 제외

    # 4. AI 응답 생성
    ai_response_text = await ai_service.get_chat_response(history, request.message)

    # 5. AI 메시지 저장
    ai_msg = AIChatMessage(
        session_id=session_id,
        role="assistant",
        content=ai_response_text
    )
    db.add(ai_msg)
    db.commit()

    return {
        "session_id": session_id,
        "response": ai_response_text
    }

@router.get("/sessions", response_model=List[SessionRead])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = getattr(current_user, "buyer_id", None) or getattr(current_user, "company_user_id", None)
    return db.query(AIChatSession).filter(AIChatSession.user_id == user_id).order_by(AIChatSession.updated_at.desc()).all()

@router.get("/sessions/{session_id}/messages", response_model=List[MessageRead])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = getattr(current_user, "buyer_id", None) or getattr(current_user, "company_user_id", None)
    # 권한 확인
    session = db.query(AIChatSession).filter(AIChatSession.session_id == session_id).first()
    if not session or session.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db.query(AIChatMessage).filter(AIChatMessage.session_id == session_id).order_by(AIChatMessage.created_at.asc()).all()
