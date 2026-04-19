from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.order_service import order_service
from app.schemas.business import OrderRead, OrderUpdate, OrderCreate
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User
from typing import List, Optional

router = APIRouter()

@router.post("/convert-from-quotation", response_model=OrderRead)
def convert_quotation_to_order(quotation_id: int, db: Session = Depends(get_db)):
    """ 견적서를 정식 발주서(Order)로 전환하고 정산 데이터를 생성합니다. """
    order = order_service.create_order_from_quotation(db, quotation_id)
    if not order:
        raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")
    return order

@router.get("/", response_model=List[OrderRead])
def get_orders(
    buyer_id: Optional[int] = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 발주 내역 목록을 조회합니다. (역할별 데이터 격리 적용) """
    target_buyer_id = None
    target_company_id = None
    
    if current_user.role == "Client":
        target_buyer_id = current_user.buyer_id
    elif current_user.role == "Manufacturer":
        target_company_id = getattr(current_user, "company_id", None)
    elif current_user.role == "Admin":
        target_buyer_id = buyer_id # Admin이 검색한 경우만 허용
        
    return order_service.get_orders(db, target_buyer_id, target_company_id, skip, limit)

@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """ 특정 발주 상세 내역을 조회합니다. """
    order = order_service.get_order_detail(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="발주 정보를 찾을 수 없습니다.")
    return order

@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int, 
    order_update: OrderUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 발주 상태를 업데이트합니다. (제조사 및 관리자 권한 필요) """
    if current_user.role not in ["Manufacturer", "Admin"]:
        raise HTTPException(status_code=403, detail="발주 상태를 변경할 권한이 없습니다.")
        
    order = order_service.update_order_status(db, order_id, order_update)
    if not order:
        raise HTTPException(status_code=404, detail="발주 정보를 찾을 수 없습니다.")
    return order
