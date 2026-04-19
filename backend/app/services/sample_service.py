from sqlalchemy.orm import Session
from app.models.workflow import ProjectSample, SampleReview, Project
from app.schemas.workflow import ProjectSampleCreate, ProjectSampleUpdate, SampleReviewCreate, SampleReviewUpdate
from fastapi import HTTPException, status
from typing import List, Optional

class SampleService:
    @staticmethod
    def create_project_sample(db: Session, sample_in: ProjectSampleCreate) -> ProjectSample:
        # 프로젝트 존재 여부 확인
        project = db.query(Project).filter(Project.project_id == sample_in.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        db_sample = ProjectSample(**sample_in.model_dump())
        db.add(db_sample)

        # 샘플이 등록되면 메인 프로젝트 상태를 '샘플 테스트(1300000004)'로 자동 변경
        project.status_code = "1300000004"
        project.current_phase_percent = 40 # 샘플링 단계 약 40%
        
        db.commit()
        db.refresh(db_sample)
        return db_sample

    @staticmethod
    def get_project_samples(db: Session, project_id: int) -> List[ProjectSample]:
        return db.query(ProjectSample).filter(ProjectSample.project_id == project_id).order_by(ProjectSample.version_number.desc()).all()

    @staticmethod
    def get_sample_by_id(db: Session, sample_id: int) -> Optional[ProjectSample]:
        return db.query(ProjectSample).filter(ProjectSample.project_sample_id == sample_id).first()

    @staticmethod
    def update_project_sample(db: Session, sample_id: int, sample_update: ProjectSampleUpdate) -> ProjectSample:
        db_sample = db.query(ProjectSample).filter(ProjectSample.project_sample_id == sample_id).first()
        if not db_sample:
            raise HTTPException(status_code=404, detail="Sample not found")
        
        update_data = sample_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_sample, key, value)
        
        db.commit()
        db.refresh(db_sample)
        return db_sample

    @staticmethod
    def create_sample_review(db: Session, review_in: SampleReviewCreate, buyer_id: int) -> SampleReview:
        # 샘플 존재 여부 확인
        sample = db.query(ProjectSample).filter(ProjectSample.project_sample_id == review_in.project_sample_id).first()
        if not sample:
            raise HTTPException(status_code=404, detail="Sample not found")
        
        db_review = SampleReview(**review_in.model_dump(), buyer_id=buyer_id)
        db.add(db_review)
        
        # 품평이 작성되면 샘플 상태를 '품평 중(1900000004)'으로 자동 변경
        # 만약 결정(decision)이 있으면 그에 맞춰 상태 변경
        if review_in.decision == "Approved":
            sample.sample_status_code = "1900000005" # 최종 승인
        elif review_in.decision == "Modify":
            sample.sample_status_code = "1900000006" # 보완 요청
        elif review_in.decision == "Rejected":
            sample.sample_status_code = "1900000007" # 반려
        else:
            sample.sample_status_code = "1900000004" # 품평 중
            
        db.commit()
        db.refresh(db_review)
        return db_review

    @staticmethod
    def get_reviews_by_sample(db: Session, sample_id: int) -> List[SampleReview]:
        return db.query(SampleReview).filter(SampleReview.project_sample_id == sample_id).all()
