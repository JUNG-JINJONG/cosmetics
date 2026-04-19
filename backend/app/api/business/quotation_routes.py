from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.pricing_service import pricing_service
from app.models.business import Quotation as QuotationModel
from app.schemas.business import (
    QuotationCreate, QuotationRead, QuotationUpdate,
    QuotationItemCreate, QuotationItemRead, QuotationItemUpdate,
    PriceSimulationRequest, PriceSimulationResponse, PriceTierCreate, PriceTierRead, PriceTierUpdate
)
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User
from decimal import Decimal
from typing import List, Optional

router = APIRouter()

@router.post("/simulate-price", response_model=PriceSimulationResponse)
def simulate_price(request: PriceSimulationRequest, db: Session = Depends(get_db)):
    """ 수량별 예상 단가 및 환율 적용 시뮬레이션 (상단 티어 제안 포함) """
    result = pricing_service.calculate_simulation(db, request)
    if result.unit_price == Decimal("0"):
        raise HTTPException(status_code=404, detail="해당 제품의 가격 정책이 존재하지 않습니다.")
    return result

# --- Quotation CRUD ---
@router.post("/", response_model=QuotationRead)
def create_quotation(quote_in: QuotationCreate, db: Session = Depends(get_db)):
    """ 스마트 견적서 생성 (자동 단가 계산) """
    return pricing_service.create_automated_quotation(db, quote_in)

@router.get("/", response_model=List[QuotationRead])
def read_quotations(
    inquiry_id: Optional[int] = None,
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 견적서 목록 조회 (의뢰ID별 필터링 및 역할별 권한 격리 지원) """
    query = db.query(QuotationModel)
    if inquiry_id:
        query = query.filter(QuotationModel.inquiry_id == inquiry_id)
    
    # 역할별 필터링 추가
    if current_user.role == "Client":
        query = query.filter(QuotationModel.buyer_id == current_user.buyer_id)
    elif current_user.role == "Manufacturer":
        company_id = getattr(current_user, "company_id", None)
        if company_id:
            query = query.filter(QuotationModel.company_id == company_id)
            
    return query.offset(skip).limit(limit).all()

@router.get("/detail", response_model=QuotationRead)
def read_quotation(quotation_id: int, db: Session = Depends(get_db)):
    """ 특정 견적서 상세 조회 (Query Param 방식) """
    quote = pricing_service.get_quotation(db, quotation_id)
    if not quote:
        raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")
    return quote

@router.patch("/update", response_model=QuotationRead)
def update_quotation(quotation_id: int, quote_in: QuotationUpdate, db: Session = Depends(get_db)):
    """ 견적서 정보 수정 (Query Param 방식) """
    quote = pricing_service.update_quotation(db, quotation_id, quote_in)
    if not quote:
        raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")
    return quote

@router.delete("/delete")
def delete_quotation(quotation_id: int, db: Session = Depends(get_db)):
    """ 견적서 삭제 (Query Param 방식) """
    success = pricing_service.delete_quotation(db, quotation_id)
    if not success:
        raise HTTPException(status_code=404, detail="견적서를 찾을 수 없습니다.")
    return {"message": "Quotation deleted successfully"}

# --- Quotation Item CRUD ---
@router.post("/items/add", response_model=QuotationItemRead)
def add_quotation_item(quotation_id: int, item_in: QuotationItemCreate, db: Session = Depends(get_db)):
    """ 견적서에 새로운 항목 추가 (Query Param 방식) """
    return pricing_service.create_quotation_item(db, quotation_id, item_in)

@router.patch("/items/update", response_model=QuotationItemRead)
def update_quotation_item(item_id: int, item_in: QuotationItemUpdate, db: Session = Depends(get_db)):
    """ 견적 상세 항목 수정 (수량, 할인 등) """
    item = pricing_service.update_quotation_item(db, item_id, item_in)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return item

@router.delete("/items/delete")
def delete_quotation_item(item_id: int, db: Session = Depends(get_db)):
    """ 견적 상세 항목 삭제 """
    success = pricing_service.delete_quotation_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order item not found")
    return {"message": "Quotation item deleted successfully"}

# --- Price Tier CRUD ---
@router.post("/price-tiers", response_model=PriceTierRead)
def create_price_tier(tier_in: PriceTierCreate, db: Session = Depends(get_db)):
    """ 제품별 수량 티어(MOQ 단가) 생성 """
    return pricing_service.create_price_tier(db, tier_in)

@router.get("/price-tiers/product-list", response_model=List[PriceTierRead])
def get_product_price_tiers(product_id: int, db: Session = Depends(get_db)):
    """ 특정 제품에 설정된 모든 가격 티어 조회 """
    return pricing_service.get_product_price_tiers(db, product_id)

@router.patch("/price-tiers/update", response_model=PriceTierRead)
def update_price_tier(tier_id: int, tier_in: PriceTierUpdate, db: Session = Depends(get_db)):
    """ 가격 티어 수정 (최소수량, 단가 등) """
    tier = pricing_service.update_price_tier(db, tier_id, tier_in)
    if not tier:
        raise HTTPException(status_code=404, detail="Price tier not found")
    return tier

@router.delete("/price-tiers/delete")
def delete_price_tier(tier_id: int, db: Session = Depends(get_db)):
    """ 가격 티어 삭제 """
    success = pricing_service.delete_price_tier(db, tier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Price tier not found")
    return {"message": "Price tier deleted successfully"}
