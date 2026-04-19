from sqlalchemy.orm import Session
from app.models.rd_library import FormulaRecipe, IngredientEfficacy, ExclusiveAsset, CosmaxRAndDAsset
from app.schemas.rd_library import (
    FormulaRecipeCreate, FormulaRecipeUpdate,
    IngredientEfficacyCreate, IngredientEfficacyUpdate,
    ExclusiveAssetCreate, ExclusiveAssetUpdate
)

class RDService:
    # --- Formula Recipes ---
    def create_recipe_item(self, db: Session, recipe_in: FormulaRecipeCreate):
        db_recipe = FormulaRecipe(**recipe_in.model_dump())
        db.add(db_recipe)
        db.commit()
        db.refresh(db_recipe)
        return db_recipe

    def get_recipes_by_asset(self, db: Session, asset_id: int):
        return db.query(FormulaRecipe).filter(FormulaRecipe.asset_id == asset_id).all()

    def update_recipe_item(self, db: Session, recipe_id: int, recipe_in: FormulaRecipeUpdate):
        db_recipe = db.query(FormulaRecipe).filter(FormulaRecipe.recipe_id == recipe_id).first()
        if not db_recipe:
            return None
        
        update_data = recipe_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_recipe, field, value)
        
        db.commit()
        db.refresh(db_recipe)
        return db_recipe

    def delete_recipe_item(self, db: Session, recipe_id: int):
        db_recipe = db.query(FormulaRecipe).filter(FormulaRecipe.recipe_id == recipe_id).first()
        if db_recipe:
            db.delete(db_recipe)
            db.commit()
            return True
        return False

    # --- Ingredient Efficacies ---
    def create_efficacy(self, db: Session, efficacy_in: IngredientEfficacyCreate):
        db_efficacy = IngredientEfficacy(**efficacy_in.model_dump())
        db.add(db_efficacy)
        db.commit()
        db.refresh(db_efficacy)
        return db_efficacy

    def get_efficacies_by_ingredient(self, db: Session, ingredient_id: int):
        return db.query(IngredientEfficacy).filter(IngredientEfficacy.ingredient_id == ingredient_id).all()

    def update_efficacy(self, db: Session, efficacy_id: int, efficacy_in: IngredientEfficacyUpdate):
        db_efficacy = db.query(IngredientEfficacy).filter(IngredientEfficacy.efficacy_id == efficacy_id).first()
        if not db_efficacy:
            return None
        
        update_data = efficacy_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_efficacy, field, value)
        
        db.commit()
        db.refresh(db_efficacy)
        return db_efficacy

    def delete_efficacy(self, db: Session, efficacy_id: int):
        db_efficacy = db.query(IngredientEfficacy).filter(IngredientEfficacy.efficacy_id == efficacy_id).first()
        if db_efficacy:
            db.delete(db_efficacy)
            db.commit()
            return True
        return False

    # --- Exclusive Assets ---
    def create_exclusive_info(self, db: Session, exclusive_in: ExclusiveAssetCreate):
        db_exclusive = ExclusiveAsset(**exclusive_in.model_dump())
        db.add(db_exclusive)
        db.commit()
        db.refresh(db_exclusive)
        return db_exclusive

    def get_exclusive_info_by_asset(self, db: Session, asset_id: int):
        return db.query(ExclusiveAsset).filter(ExclusiveAsset.asset_id == asset_id).first()

    def update_exclusive_info(self, db: Session, exclusive_id: int, exclusive_in: ExclusiveAssetUpdate):
        db_exclusive = db.query(ExclusiveAsset).filter(ExclusiveAsset.exclusive_id == exclusive_id).first()
        if not db_exclusive:
            return None
        
        update_data = exclusive_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_exclusive, field, value)
        
        db.commit()
        db.refresh(db_exclusive)
        return db_exclusive

    def delete_exclusive_info(self, db: Session, exclusive_id: int):
        db_exclusive = db.query(ExclusiveAsset).filter(ExclusiveAsset.exclusive_id == exclusive_id).first()
        if db_exclusive:
            db.delete(db_exclusive)
            db.commit()
            return True
        return False

    # --- R&D Asset Search ---
    def get_asset_detail(self, db: Session, asset_id: int):
        asset = db.query(CosmaxRAndDAsset).filter(CosmaxRAndDAsset.cosmax_r_and_d_asset_id == asset_id).first()
        return asset

rd_service = RDService()
