from sqlalchemy.orm import Session
from app.models.business import ProductionSchedule, Shipment
from app.schemas.business import (
    ProductionScheduleCreate, ProductionScheduleUpdate,
    ShipmentCreate, ShipmentUpdate
)

class FactoryService:
    # --- Production Schedule CRUD ---
    def create_schedule(self, db: Session, schedule_in: ProductionScheduleCreate):
        db_schedule = ProductionSchedule(**schedule_in.model_dump())
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    def get_schedules_by_order(self, db: Session, order_id: int):
        return db.query(ProductionSchedule).filter(ProductionSchedule.order_id == order_id).all()

    def update_schedule(self, db: Session, schedule_id: int, schedule_in: ProductionScheduleUpdate):
        db_schedule = db.query(ProductionSchedule).filter(ProductionSchedule.schedule_id == schedule_id).first()
        if not db_schedule:
            return None
        
        update_data = schedule_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_schedule, field, value)
        
        db.commit()
        db.refresh(db_schedule)
        return db_schedule

    def delete_schedule(self, db: Session, schedule_id: int):
        db_schedule = db.query(ProductionSchedule).filter(ProductionSchedule.schedule_id == schedule_id).first()
        if db_schedule:
            db.delete(db_schedule)
            db.commit()
            return True
        return False

    # --- Shipment CRUD ---
    def create_shipment(self, db: Session, shipment_in: ShipmentCreate):
        db_shipment = Shipment(**shipment_in.model_dump())
        db.add(db_shipment)
        db.commit()
        db.refresh(db_shipment)
        return db_shipment

    def get_shipments_by_order(self, db: Session, order_id: int):
        return db.query(Shipment).filter(Shipment.order_id == order_id).all()

    def update_shipment(self, db: Session, shipment_id: int, shipment_in: ShipmentUpdate):
        db_shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
        if not db_shipment:
            return None
        
        update_data = shipment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_shipment, field, value)
        
        db.commit()
        db.refresh(db_shipment)
        return db_shipment

    def delete_shipment(self, db: Session, shipment_id: int):
        db_shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
        if db_shipment:
            db.delete(db_shipment)
            db.commit()
            return True
        return False

factory_service = FactoryService()
