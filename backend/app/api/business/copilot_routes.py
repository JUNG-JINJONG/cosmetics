from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User
from app.services.business_copilot_service import business_copilot_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class CopilotQuery(BaseModel):
    message: str

@router.get("/metrics")
def get_copilot_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 코파일럿 화면용 상단 KPI 지표 조회 """
    return business_copilot_service.get_summary_metrics(db, current_user)

@router.post("/chat")
async def chat_with_copilot(
    request: CopilotQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 비즈니스 데이터 기반 AI 채팅 응답 """
    response_text = await business_copilot_service.analyze_and_respond(db, current_user, request.message)
    return {
        "response": response_text
    }
