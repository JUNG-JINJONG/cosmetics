from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.settlement_service import settlement_service
from app.schemas.business import SettlementRead, SettlementUpdate
from typing import List, Optional

router = APIRouter()

@router.post("/generate", response_model=SettlementRead)
def generate_settlement(order_id: int, target_currency: Optional[str] = None, db: Session = Depends(get_db)):
    """
    특정 주문에 대해 정산 데이터를 자동 생성합니다. (Query Param 방식)
    """
    if target_currency:
        settlement = settlement_service.process_global_settlement(db, order_id, target_currency)
    else:
        settlement = settlement_service.create_settlement_from_order(db, order_id)
        
    if not settlement:
        raise HTTPException(status_code=404, detail="주문을 찾을 수 없거나 정산 데이터를 생성할 수 없습니다.")
    return settlement

from app.api.account_company.auth_utils import get_current_user
from app.models.user import User

@router.get("/", response_model=List[SettlementRead])
def read_settlements(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 정산 목록 조회 (역할 기반 필터링 적용) """
    target_buyer_id = None
    target_company_id = None

    if current_user.role == "Client":
        target_buyer_id = current_user.buyer_id
    elif current_user.role == "Manufacturer":
        target_company_id = getattr(current_user, "company_id", None)
    # Admin은 모든 데이터를 볼 수 있도록 필터링하지 않음

    return settlement_service.get_settlements(db, target_buyer_id, target_company_id, skip, limit)

@router.patch("/update", response_model=SettlementRead)
def update_settlement_status(settlement_id: int, status_in: SettlementUpdate, db: Session = Depends(get_db)):
    """ 정산 상태 업데이트 (Query Param 방식) """
    settlement = settlement_service.update_settlement_status(db, settlement_id, status_in.settlement_status_code)
    if not settlement:
        raise HTTPException(status_code=404, detail="정산 데이터를 찾을 수 없습니다.")
    return settlement
