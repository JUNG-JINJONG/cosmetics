from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app.database import get_db
from app.models.company_user import CompanyUser as CompanyUserModel
from app.schemas.company_user import CompanyUser, CompanyUserCreate, CompanyUserUpdate
from app.schemas.user import Token
from app.api.account_company.auth_utils import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
    ALGORITHM,
    oauth2_scheme
)
from jose import JWTError, jwt

router = APIRouter()

# --- Helper Dependency for CompanyUser ---
def get_current_company_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        # 구분을 위해 토큰에 user_type을 넣을 수도 있습니다. 
        # 현재는 이메일을 전체 테이블에서 유니크하게 관리한다고 가정하거나,
        # 특정 테이블(company_user)에서 먼저 찾습니다.
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(CompanyUserModel).filter(CompanyUserModel.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# 1. 기업 사용자 등록 (Signup)
@router.post("/signup", response_model=CompanyUser)
def signup(user: CompanyUserCreate, db: Session = Depends(get_db)):
    # 이메일 중복 체크
    db_user = db.query(CompanyUserModel).filter(CompanyUserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
    
    hashed_password = get_password_hash(user.password)
    new_user = CompanyUserModel(
        **user.model_dump(exclude={"password"}),
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. 기업 사용자 로그인 (Login)
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(CompanyUserModel).filter(CompanyUserModel.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_type": "company_user"}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 3. 내 정보 조회 (Me)
@router.get("/me", response_model=CompanyUser)
def read_me(current_user: CompanyUserModel = Depends(get_current_company_user)):
    return current_user

# 4. 내 정보 수정 (Update Me)
@router.patch("/me", response_model=CompanyUser)
def update_me(
    user_update: CompanyUserUpdate, 
    current_user: CompanyUserModel = Depends(get_current_company_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user
