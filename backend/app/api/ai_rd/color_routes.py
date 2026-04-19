from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.color_service import color_service
from app.schemas.color import (
    ColorMasterCreate, ColorMasterRead, 
    ColorMeasurementCreate, ColorMeasurementRead,
    ColorComparisonRequest
)
from typing import List

router = APIRouter()

# --- Color Master CRUD ---

@router.post("/masters", response_model=ColorMasterRead)
def create_color_master(color_in: ColorMasterCreate, db: Session = Depends(get_db)):
    """
    제품의 표준 색상(Standard)을 등록합니다.
    """
    return color_service.create_color_master(db, color_in)

@router.get("/masters", response_model=List[ColorMasterRead])
def read_all_color_masters(db: Session = Depends(get_db)):
    """
    모든 제품에 등록된 전체 표준 색상 목록을 조회합니다.
    """
    return color_service.get_all_masters(db)

@router.get("/masters/product/{product_id}", response_model=List[ColorMasterRead])
def read_color_masters(product_id: int, db: Session = Depends(get_db)):
    """
    특정 제품에 등록된 모든 표준 색상 목록을 조회합니다.
    """
    return color_service.get_color_masters(db, product_id)

@router.get("/masters/{color_id}", response_model=ColorMasterRead)
def read_color_master(color_id: int, db: Session = Depends(get_db)):
    """
    색상 마스터 상세 정보를 조회합니다.
    """
    color = color_service.get_color_master(db, color_id)
    if not color:
        raise HTTPException(status_code=404, detail="Color master not found")
    return color

# --- Color Measurement & Delta E ---

@router.post("/measurements", response_model=ColorMeasurementRead)
def create_color_measurement(measurement_in: ColorMeasurementCreate, db: Session = Depends(get_db)):
    """
    실제 색상을 측정하여 기록하고, 기준 색상과의 색차(Delta E) 및 합격 여부를 계산합니다.
    """
    log = color_service.create_measurement(db, measurement_in)
    if not log:
        raise HTTPException(status_code=404, detail="Base color master not found")
    return log

@router.get("/measurements/history/{color_id}", response_model=List[ColorMeasurementRead])
def read_measurement_history(color_id: int, db: Session = Depends(get_db)):
    """
    특정 색상의 측정 이력을 조회합니다.
    """
    return color_service.get_measurement_history(db, color_id)

@router.post("/calculate-delta-e")
def calculate_delta_e(request: ColorComparisonRequest):
    """
    DB 저장 없이 단순히 두 색상 간의 색차(Delta E)를 계산합니다.
    """
    distance = color_service.calculate_delta_e(
        request.target_l, request.target_a, request.target_b,
        request.measured_l, request.measured_a, request.measured_b
    )
    return {"delta_e": distance}

@router.post("/seed-demo-data")
def seed_color_demo_data(db: Session = Depends(get_db)):
    """
    데모용 대량 색상 데이터(100개)를 생성합니다.
    """
    from app.models.product import Product
    from app.models.color import ColorMaster
    import random

    product = db.query(Product).first()
    if not product:
        # 제품이 없으면 하나 생성
        product = Product(product_name="Global Master Palette", company_id=1, category_id=2)
        db.add(product)
        db.commit()
        db.refresh(product)

    # 카테고리별 색상 생성기
    categories = [
        ("Lipstick RED", "#D00000", (40, 60), (50, 70), (10, 30)),
        ("Foundation BEIGE", "#F5D6B8", (70, 90), (10, 20), (15, 25)),
        ("Shadow PURPLE", "#6A0DAD", (30, 50), (30, 50), (-50, -30)),
        ("Blush PINK", "#FFB6C1", (60, 80), (30, 50), (0, 15)),
        ("Eye Brown", "#654321", (20, 40), (10, 25), (15, 30))
    ]

    new_masters = []
    for i in range(1, 101):
        cat_name, base_hex, l_range, a_range, b_range = random.choice(categories)
        
        # 이름 생성
        name = f"{cat_name} No.{str(i).zfill(3)}"
        
        # LAB 값 랜덤 생성 (범위 내)
        l = round(random.uniform(*l_range), 2)
        a = round(random.uniform(*a_range), 2)
        b = round(random.uniform(*b_range), 2)
        
        # 중복 방지를 위해 이름에 인덱스 추가 확인
        exists = db.query(ColorMaster).filter(ColorMaster.color_name == name).first()
        if not exists:
            master = ColorMaster(
                product_id=product.product_id,
                color_name=name,
                hex_code=base_hex, # 실제 변환 대신 샘플링용 베이스 사용
                lab_l=l,
                lab_a=a,
                lab_b=b,
                tolerance=round(random.uniform(0.5, 2.0), 1)
            )
            db.add(master)
            new_masters.append(name)

    db.commit()
    return {"status": "success", "count": len(new_masters), "samples": new_masters[:5]}
