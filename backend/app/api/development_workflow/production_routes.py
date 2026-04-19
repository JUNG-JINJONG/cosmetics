from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.workflow import ProductionProgressRead, ProductionProgressCreate, ProductionProgressUpdate
from app.services.production_service import ProductionService
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/progress/detail", response_model=ProductionProgressRead)
def get_production_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 프로젝트별 생산 현황 상세 조회 (Query Param 방식) """
    progress = ProductionService.get_progress_by_project(db, project_id)
    if not progress:
        return ProductionService.create_or_update_progress(
            db, ProductionProgressCreate(project_id=project_id)
        )
    return progress

@router.patch("/progress/update", response_model=ProductionProgressRead)
def update_production_progress(
    progress_id: int,
    progress_update: ProductionProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 생산 현황 업데이트 (Query Param 방식) """
    updated = ProductionService.update_progress(db, progress_id, progress_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Production progress not found")
    return updated
