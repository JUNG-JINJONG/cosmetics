from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.company import Company as CompanyModel
from app.schemas.company import Company, CompanyCreate, CompanyUpdate, CompanyShowroom
from app.models.rating import PartnerRating
from app.schemas.rating import Rating, RatingCreate
from app.models.user import User as UserModel
from app.api.account_company.auth_utils import RoleChecker, get_current_user

router = APIRouter()

@router.get("/companies", response_model=List[Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    companies = db.query(CompanyModel).offset(skip).limit(limit).all()
    return companies

@router.post("/companies", response_model=Company, dependencies=[Depends(RoleChecker(["Admin"]))])
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = db.query(CompanyModel).filter(CompanyModel.business_number == company.business_number).first()
    if db_company:
        raise HTTPException(status_code=400, detail="이미 등록된 사업자 번호입니다.")
    
    new_company = CompanyModel(**company.model_dump())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@router.get("/companies/{company_id}", response_model=Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(CompanyModel).filter(CompanyModel.company_id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="업체를 찾을 수 없습니다.")
    return db_company

@router.patch("/companies/{company_id}", response_model=Company)
def update_company(company_id: int, company_update: CompanyUpdate, db: Session = Depends(get_db)):
    db_company = db.query(CompanyModel).filter(CompanyModel.company_id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="업체를 찾을 수 없습니다.")
    
    update_data = company_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/companies/{company_id}/showroom", response_model=CompanyShowroom)
def read_company_showroom(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(CompanyModel).filter(CompanyModel.company_id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="업체를 찾을 수 없습니다.")
    return db_company

@router.post("/companies/{company_id}/ratings", response_model=Rating)
def create_rating(
    company_id: int, 
    rating: RatingCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    db_company = db.query(CompanyModel).filter(CompanyModel.company_id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="평가할 업체를 찾을 수 없습니다.")
    
    # 본인 업체 평가 방지 로직 (브랜드사나 바이어가 평가해야 함)
    # 추후 상세 검증 로직 추가 가능

    new_rating = PartnerRating(
        target_company_id=company_id,
        reviewer_buyer_id=current_user.buyer_id,
        score=rating.score,
        review_text=rating.review_text,
        evaluation_criteria=rating.evaluation_criteria
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

@router.get("/companies/{company_id}/ratings")
def read_company_ratings(company_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    from sqlalchemy.sql import func
    
    db_company = db.query(CompanyModel).filter(CompanyModel.company_id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="업체를 찾을 수 없습니다.")
    
    # 평균 점수 계산
    avg_score = db.query(func.avg(PartnerRating.score)).filter(PartnerRating.target_company_id == company_id).scalar()
    
    # 개별 목록 조회
    ratings = db.query(PartnerRating).filter(PartnerRating.target_company_id == company_id).offset(skip).limit(limit).all()
    
    return {
        "average_score": float(avg_score) if avg_score else 0.0,
        "total_reviews": len(ratings),
        "ratings": ratings
    }
