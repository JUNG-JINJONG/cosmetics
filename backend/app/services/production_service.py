from sqlalchemy.orm import Session
from app.models.workflow import ProjectProductionProgress, Project
from app.schemas.workflow import ProductionProgressCreate, ProductionProgressUpdate
from fastapi import HTTPException

class ProductionService:
    @staticmethod
    def get_progress_by_project(db: Session, project_id: int):
        return db.query(ProjectProductionProgress).filter(ProjectProductionProgress.project_id == project_id).first()

    @staticmethod
    def create_or_update_progress(db: Session, progress_in: ProductionProgressCreate):
        db_progress = db.query(ProjectProductionProgress).filter(
            ProjectProductionProgress.project_id == progress_in.project_id
        ).first()
        
        if db_progress:
            # Update existing
            update_data = progress_in.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_progress, key, value)
        else:
            # Create new
            db_progress = ProjectProductionProgress(**progress_in.model_dump())
            db.add(db_progress)
        
        db.commit()
        db.refresh(db_progress)
        return db_progress

    @staticmethod
    def update_progress(db: Session, progress_id: int, progress_update: ProductionProgressUpdate):
        db_progress = db.query(ProjectProductionProgress).filter(
            ProjectProductionProgress.progress_id == progress_id
        ).first()
        if not db_progress:
            return None
        
        update_data = progress_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_progress, key, value)
        
        # 프로젝트 메인 상태 동기화 로직 추가
        project = db.query(Project).filter(Project.project_id == db_progress.project_id).first()
        if project:
            # 생산 시작 (2200000002) 이후 단계일 경우
            if db_progress.production_status_code == "2200000002":
                project.status_code = "1300000007" # 생산 중
                project.current_phase_percent = 70
            elif db_progress.production_status_code == "2200000003":
                project.status_code = "1300000008" # 품질 검사
                project.current_phase_percent = 85
            elif db_progress.production_status_code == "2200000004":
                project.status_code = "1300000009" # 출고 및 배송
                project.current_phase_percent = 95

        db.commit()
        db.refresh(db_progress)
        return db_progress
