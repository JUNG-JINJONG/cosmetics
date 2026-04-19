from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ColorMasterBase(BaseModel):
    product_id: int
    color_name: str
    hex_code: Optional[str] = None
    lab_l: Decimal = Field(..., ge=0, le=100)
    lab_a: Decimal = Field(..., ge=-128, le=127)
    lab_b: Decimal = Field(..., ge=-128, le=127)
    illuminant: Optional[str] = "D65"
    observer: Optional[str] = "10deg"
    tolerance: Optional[Decimal] = Field(1.0, ge=0)

class ColorMasterCreate(ColorMasterBase):
    pass

class ColorMasterUpdate(BaseModel):
    color_name: Optional[str] = None
    hex_code: Optional[str] = None
    lab_l: Optional[Decimal] = None
    lab_a: Optional[Decimal] = None
    lab_b: Optional[Decimal] = None
    illuminant: Optional[str] = None
    observer: Optional[str] = None
    tolerance: Optional[Decimal] = None

class ColorMasterRead(ColorMasterBase):
    color_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ColorMeasurementBase(BaseModel):
    color_id: int
    project_id: Optional[int] = None
    measured_l: Decimal = Field(..., ge=0, le=100)
    measured_a: Decimal = Field(..., ge=-128, le=127)
    measured_b: Decimal = Field(..., ge=-128, le=127)

class ColorMeasurementCreate(ColorMeasurementBase):
    pass

class ColorMeasurementRead(ColorMeasurementBase):
    measurement_id: int
    delta_e: Decimal
    is_pass: bool
    measured_at: datetime

    class Config:
        from_attributes = True

class ColorComparisonRequest(BaseModel):
    target_l: Decimal
    target_a: Decimal
    target_b: Decimal
    measured_l: Decimal
    measured_a: Decimal
    measured_b: Decimal
