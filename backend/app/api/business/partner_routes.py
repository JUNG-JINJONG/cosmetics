from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.partner_service import partner_service
from typing import List, Optional

router = APIRouter()

@router.get("/")
def list_partners(
    search: Optional[str] = None,
    specialty: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    쇼룸 제조사 리스트 조회 API
    """
    return partner_service.get_manufacturers(db, search, specialty)

@router.get("/{company_id}")
def get_partner_detail(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    제조사 상세 정보 조회 API
    """
    return partner_service.get_manufacturer_detail(db, company_id)
