from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    현재 사용자 역할(바이어/제조사)에 따른 맞춤형 대시보드 데이터 반환
    """
    if current_user.role == "Client":
        # 바이어 요약 정보
        return dashboard_service.get_buyer_summary(db, current_user.buyer_id)
    elif current_user.role == "Manufacturer":
        # 제조사 요약 정보 (관리자 포함)
        # 제조사의 경우 company_id가 필요함 (User 모델에 없을 경우 account 연동 필요)
        # 임시로 buyer_id를 사용하거나, 실제 연동된 company_id 추출 로직 적용
        company_id = getattr(current_user, "company_id", 1) # Fallback to 1 for MVP
        return dashboard_service.get_manufacturer_summary(db, company_id)
    else:
        raise HTTPException(status_code=403, detail="Dashboard access not allowed for this role")
