from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.product import Product as ProductModel
from app.schemas.product import Product, ProductCreate, ProductUpdate
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[Product])
def read_products(
    q: Optional[str] = None,
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db)
):
    """ 전체 제품 목록 조회 (검색 지원) """
    query = db.query(ProductModel)
    if q:
        query = query.filter(
            (ProductModel.product_name.ilike(f"%{q}%")) | 
            (ProductModel.sku.ilike(f"%{q}%"))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """ 특정 제품 상세 조회 """
    product = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=Product)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """ 신규 제품 등록 """
    db_product = ProductModel(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
