from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Boolean, DateTime, text
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class ColorMaster(Base):
    __tablename__ = "color_master"

    color_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.product_id", ondelete="CASCADE"))
    color_name = Column(String(255), nullable=False)
    hex_code = Column(String(7))
    lab_l = Column(Numeric(5, 2))
    lab_a = Column(Numeric(5, 2))
    lab_b = Column(Numeric(5, 2))
    illuminant = Column(String(20), default="D65")
    observer = Column(String(20), default="10deg")
    tolerance = Column(Numeric(3, 2), default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

    # Relationships
    product = relationship("Product", back_populates="colors")
    measurements = relationship("ColorMeasurementLog", back_populates="color_master", cascade="all, delete-orphan")

class ColorMeasurementLog(Base):
    __tablename__ = "color_measurement_log"

    measurement_id = Column(Integer, primary_key=True, index=True)
    color_id = Column(Integer, ForeignKey("color_master.color_id", ondelete="CASCADE"))
    project_id = Column(Integer, ForeignKey("projects.project_id", ondelete="SET NULL"), nullable=True)
    measured_l = Column(Numeric(5, 2))
    measured_a = Column(Numeric(5, 2))
    measured_b = Column(Numeric(5, 2))
    delta_e = Column(Numeric(5, 2))
    is_pass = Column(Boolean)
    measured_at = Column(DateTime(timezone=True), server_default=text("now()"))

    # Relationships
    color_master = relationship("ColorMaster", back_populates="measurements")
    project = relationship("Project", back_populates="color_measurements")
