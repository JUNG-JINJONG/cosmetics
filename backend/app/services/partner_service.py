from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.company import Company
from app.models.brand import Brand
from app.models.product import Product
from typing import List, Optional

class PartnerService:
    def get_manufacturers(self, db: Session, search: Optional[str] = None, specialty: Optional[str] = None):
        """
        쇼룸에 노출할 제조사 리스트를 조회합니다.
        """
        query = db.query(Company).filter(Company.company_type == '제조사(OEM/ODM)')

        if search:
            query = query.filter(or_(
                Company.company_name.icontains(search),
                Company.specialty.icontains(search),
                Company.introduction.icontains(search)
            ))

        if specialty:
            query = query.filter(Company.specialty.icontains(specialty))

        return query.order_by(Company.is_verified.desc(), Company.created_at.desc()).all()

    def get_manufacturer_detail(self, db: Session, company_id: int):
        """
        특정 제조사의 상세 정보 및 포트폴리오(제품)를 함께 조회합니다.
        """
        return db.query(Company)\
            .options(joinedload(Company.brands).joinedload(Brand.products))\
            .filter(Company.company_id == company_id).first()

partner_service = PartnerService()
