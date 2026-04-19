import math
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.color import ColorMaster, ColorMeasurementLog
from app.schemas.color import ColorMasterCreate, ColorMeasurementCreate

class ColorService:
    @staticmethod
    def calculate_delta_e(l1, a1, b1, l2, a2, b2):
        """
        CIELAB (CIE76) 색차 계산 공식 적용
        dE = sqrt((L2-L1)^2 + (a2-a1)^2 + (b2-b1)^2)
        """
        # Decimal 타입을 float으로 변환하여 계산
        dl = float(l2) - float(l1)
        da = float(a2) - float(a1)
        db = float(b2) - float(b1)
        
        delta_e = math.sqrt(dl**2 + da**2 + db**2)
        return round(delta_e, 3)

    def create_color_master(self, db: Session, color_in: ColorMasterCreate):
        db_color = ColorMaster(**color_in.model_dump())
        db.add(db_color)
        db.commit()
        db.refresh(db_color)
        return db_color

    def get_color_masters(self, db: Session, product_id: int):
        return db.query(ColorMaster).filter(ColorMaster.product_id == product_id).all()

    def get_all_masters(self, db: Session):
        return db.query(ColorMaster).all()

    def get_color_master(self, db: Session, color_id: int):
        return db.query(ColorMaster).filter(ColorMaster.color_id == color_id).first()

    def create_measurement(self, db: Session, measurement_in: ColorMeasurementCreate):
        # 1. 기준 색상 정보 조회
        target_color = self.get_color_master(db, measurement_in.color_id)
        if not target_color:
            return None
            
        # 2. 색차 계산 (Delta E)
        delta_e = self.calculate_delta_e(
            target_color.lab_l, target_color.lab_a, target_color.lab_b,
            measurement_in.measured_l, measurement_in.measured_a, measurement_in.measured_b
        )
        
        # 3. 합격 여부 판단
        is_pass = delta_e <= float(target_color.tolerance)
        
        # 4. 로그 저장
        db_log = ColorMeasurementLog(
            **measurement_in.model_dump(),
            delta_e=delta_e,
            is_pass=is_pass
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

    def get_measurement_history(self, db: Session, color_id: int):
        return db.query(ColorMeasurementLog).filter(ColorMeasurementLog.color_id == color_id).order_by(ColorMeasurementLog.measured_at.desc()).all()

color_service = ColorService()
