from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.rd_service import rd_service
from app.schemas.rd_library import (
    FormulaRecipeCreate, FormulaRecipeRead, FormulaRecipeUpdate,
    IngredientEfficacyCreate, IngredientEfficacyRead, IngredientEfficacyUpdate,
    ExclusiveAssetCreate, ExclusiveAssetRead, ExclusiveAssetUpdate
)
from typing import List

router = APIRouter()

# --- Formula Recipes ---
@router.post("/recipes", response_model=FormulaRecipeRead)
def create_recipe_item(recipe_in: FormulaRecipeCreate, db: Session = Depends(get_db)):
    """
    제형의 성분 배합비(레시피) 항목을 추가합니다.
    """
    return rd_service.create_recipe_item(db, recipe_in)

@router.get("/recipes/asset/{asset_id}", response_model=List[FormulaRecipeRead])
def read_recipes_by_asset(asset_id: int, db: Session = Depends(get_db)):
    """
    특정 제형 자산의 전체 배합 레시피를 조회합니다.
    """
    return rd_service.get_recipes_by_asset(db, asset_id)

@router.patch("/recipes/{recipe_id}", response_model=FormulaRecipeRead)
def update_recipe_item(recipe_id: int, recipe_in: FormulaRecipeUpdate, db: Session = Depends(get_db)):
    """
    레시피 항목의 배합비나 단계를 수정합니다.
    """
    recipe = rd_service.update_recipe_item(db, recipe_id, recipe_in)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe item not found")
    return recipe

@router.delete("/recipes/{recipe_id}")
def delete_recipe_item(recipe_id: int, db: Session = Depends(get_db)):
    """
    레시피 항목을 삭제합니다.
    """
    success = rd_service.delete_recipe_item(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe item not found")
    return {"message": "Recipe item deleted successfully"}

# --- Ingredient Efficacies ---
@router.post("/efficacies", response_model=IngredientEfficacyRead)
def create_ingredient_efficacy(efficacy_in: IngredientEfficacyCreate, db: Session = Depends(get_db)):
    """
    원료별 상세 효능 정보(점수, 근거 등)를 등록합니다.
    """
    return rd_service.create_efficacy(db, efficacy_in)

@router.get("/efficacies/ingredient/{ingredient_id}", response_model=List[IngredientEfficacyRead])
def read_efficacies_by_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    """
    특정 원료가 가진 모든 효능 정보를 조회합니다.
    """
    return rd_service.get_efficacies_by_ingredient(db, ingredient_id)

@router.patch("/efficacies/{efficacy_id}", response_model=IngredientEfficacyRead)
def update_ingredient_efficacy(efficacy_id: int, efficacy_in: IngredientEfficacyUpdate, db: Session = Depends(get_db)):
    """
    원료 효능 점수나 근거 정보를 수정합니다.
    """
    efficacy = rd_service.update_efficacy(db, efficacy_id, efficacy_in)
    if not efficacy:
        raise HTTPException(status_code=404, detail="Efficacy info not found")
    return efficacy

@router.delete("/efficacies/{efficacy_id}")
def delete_ingredient_efficacy(efficacy_id: int, db: Session = Depends(get_db)):
    """
    원료 효능 정보를 삭제합니다.
    """
    success = rd_service.delete_efficacy(db, efficacy_id)
    if not success:
        raise HTTPException(status_code=404, detail="Efficacy info not found")
    return {"message": "Efficacy info deleted successfully"}

# --- Exclusive Assets ---
@router.post("/exclusive", response_model=ExclusiveAssetRead)
def create_exclusive_info(exclusive_in: ExclusiveAssetCreate, db: Session = Depends(get_db)):
    """
    R&D 자산의 독점권/소유권 정보를 등록합니다.
    """
    return rd_service.create_exclusive_info(db, exclusive_in)

@router.get("/exclusive/asset/{asset_id}", response_model=ExclusiveAssetRead)
def read_exclusive_info(asset_id: int, db: Session = Depends(get_db)):
    """
    특정 자산의 독점 계약 및 소유권 상세 정보를 조회합니다.
    """
    info = rd_service.get_exclusive_info_by_asset(db, asset_id)
    if not info:
        raise HTTPException(status_code=404, detail="Exclusive info not found for this asset")
    return info

@router.patch("/exclusive/{exclusive_id}", response_model=ExclusiveAssetRead)
def update_exclusive_info(exclusive_id: int, exclusive_in: ExclusiveAssetUpdate, db: Session = Depends(get_db)):
    """
    독점 기간이나 업체 정보를 수정합니다.
    """
    info = rd_service.update_exclusive_info(db, exclusive_id, exclusive_in)
    if not info:
        raise HTTPException(status_code=404, detail="Exclusive info not found")
    return info

@router.delete("/exclusive/{exclusive_id}")
def delete_exclusive_info(exclusive_id: int, db: Session = Depends(get_db)):
    """
    독점 정보를 삭제합니다.
    """
    success = rd_service.delete_exclusive_info(db, exclusive_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exclusive info not found")
    return {"message": "Exclusive info deleted successfully"}
