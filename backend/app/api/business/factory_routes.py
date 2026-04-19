from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.factory_service import factory_service
from app.schemas.business import (
    ProductionScheduleCreate, ProductionScheduleRead, ProductionScheduleUpdate,
    ShipmentCreate, ShipmentRead, ShipmentUpdate
)
from typing import List

router = APIRouter()

# --- Production Schedules ---
@router.post("/schedules", response_model=ProductionScheduleRead)
def create_production_schedule(schedule_in: ProductionScheduleCreate, db: Session = Depends(get_db)):
    """ 생산 일정 등록 """
    return factory_service.create_schedule(db, schedule_in)

@router.get("/schedules/order/{order_id}", response_model=List[ProductionScheduleRead])
def read_schedules_by_order(order_id: int, db: Session = Depends(get_db)):
    """ 특정 주문의 생산 일정 조회 """
    return factory_service.get_schedules_by_order(db, order_id)

@router.patch("/schedules/{schedule_id}", response_model=ProductionScheduleRead)
def update_production_schedule(schedule_id: int, schedule_in: ProductionScheduleUpdate, db: Session = Depends(get_db)):
    """ 생산 상태 및 일정 업데이트 """
    schedule = factory_service.update_schedule(db, schedule_id, schedule_in)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.delete("/schedules/{schedule_id}")
def delete_production_schedule(schedule_id: int, db: Session = Depends(get_db)):
    """ 생산 일정 삭제 """
    success = factory_service.delete_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Production schedule deleted successfully"}

# --- Shipments ---
@router.post("/shipments", response_model=ShipmentRead)
def create_shipment(shipment_in: ShipmentCreate, db: Session = Depends(get_db)):
    """ 배송 정보 등록 """
    return factory_service.create_shipment(db, shipment_in)

@router.get("/shipments/order/{order_id}", response_model=List[ShipmentRead])
def read_shipments_by_order(order_id: int, db: Session = Depends(get_db)):
    """ 특정 주문의 배송 정보 조회 """
    return factory_service.get_shipments_by_order(db, order_id)

@router.patch("/shipments/{shipment_id}", response_model=ShipmentRead)
def update_shipment(shipment_id: int, shipment_in: ShipmentUpdate, db: Session = Depends(get_db)):
    """ 배송 상태 및 송장 번호 업데이트 """
    shipment = factory_service.update_shipment(db, shipment_id, shipment_in)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.delete("/shipments/{shipment_id}")
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    """ 배송 정보 삭제 """
    success = factory_service.delete_shipment(db, shipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": "Shipment info deleted successfully"}
