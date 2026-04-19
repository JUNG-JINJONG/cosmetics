from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# --- Formula Recipe Schemas ---
class FormulaRecipeBase(BaseModel):
    asset_id: int
    ingredient_id: int
    percentage: Decimal = Field(..., ge=0, le=100)
    phase: Optional[str] = None
    purpose: Optional[str] = None

class FormulaRecipeCreate(FormulaRecipeBase):
    pass

class FormulaRecipeUpdate(BaseModel):
    asset_id: Optional[int] = None
    ingredient_id: Optional[int] = None
    percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    phase: Optional[str] = None
    purpose: Optional[str] = None

class FormulaRecipeRead(FormulaRecipeBase):
    recipe_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Ingredient Efficacy Schemas ---
class IngredientEfficacyBase(BaseModel):
    ingredient_id: int
    category_id: int
    strength: int = Field(..., ge=1, le=5)
    evidence_level: Optional[str] = None
    is_certified: Optional[bool] = False

class IngredientEfficacyCreate(IngredientEfficacyBase):
    pass

class IngredientEfficacyUpdate(BaseModel):
    ingredient_id: Optional[int] = None
    category_id: Optional[int] = None
    strength: Optional[int] = Field(None, ge=1, le=5)
    evidence_level: Optional[str] = None
    is_certified: Optional[bool] = None

class IngredientEfficacyRead(IngredientEfficacyBase):
    efficacy_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Exclusive Asset Schemas ---
class ExclusiveAssetBase(BaseModel):
    asset_id: int
    company_id: int
    exclusive_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    region: Optional[str] = "Global"
    is_active: Optional[bool] = True

class ExclusiveAssetCreate(ExclusiveAssetBase):
    pass

class ExclusiveAssetUpdate(BaseModel):
    asset_id: Optional[int] = None
    company_id: Optional[int] = None
    exclusive_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    region: Optional[str] = None
    is_active: Optional[bool] = None

class ExclusiveAssetRead(ExclusiveAssetBase):
    exclusive_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- R&D Asset Detail (Combined) ---
class RDAssetDetail(BaseModel):
    asset_id: int
    name: str
    recipes: List[FormulaRecipeRead]
    exclusive_info: Optional[ExclusiveAssetRead] = None
