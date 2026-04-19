from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.workflow import (
    ProjectSampleCreate, ProjectSampleRead, ProjectSampleUpdate, 
    SampleReviewCreate, SampleReviewRead, SampleReviewBase
)
from app.services.sample_service import SampleService
from app.api.account_company.auth_utils import get_current_user
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/samples", response_model=ProjectSampleRead, status_code=status.HTTP_201_CREATED)
def create_sample(
    sample_in: ProjectSampleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 제조사 또는 권한 있는 자만 생성 가능 (생략: 필요시 추가)
    return SampleService.create_project_sample(db, sample_in)

@router.get("/samples/project-list", response_model=List[ProjectSampleRead])
def get_project_samples(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 프로젝트별 샘플 목록 조회 (Query Param 방식) """
    return SampleService.get_project_samples(db, project_id)

@router.get("/samples/detail", response_model=ProjectSampleRead)
def get_sample(
    sample_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 샘플 상세 조회 (Query Param 방식) """
    sample = SampleService.get_sample_by_id(db, sample_id)
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    return sample

@router.patch("/samples/update", response_model=ProjectSampleRead)
def update_sample(
    sample_id: int,
    sample_update: ProjectSampleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 샘플 정보 업데이트 (Query Param 방식) """
    return SampleService.update_project_sample(db, sample_id, sample_update)

@router.post("/samples/reviews/create", response_model=SampleReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    sample_id: int,
    review_in: SampleReviewBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ 샘플 리뷰(피드백) 생성 (Query Param 방식) """
    full_review_in = SampleReviewCreate(**review_in.model_dump(), project_sample_id=sample_id)
    return SampleService.create_sample_review(db, full_review_in, current_user.buyer_id)
