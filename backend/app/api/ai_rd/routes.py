from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.services.ai_service import ai_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class RecipeRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class IngredientMatch(BaseModel):
    name: str
    cas_no: Optional[str]
    similarity: float

class RecipeResponse(BaseModel):
    target_vector: List[float]
    recommended_ingredients: List[IngredientMatch]
    ai_explanation: str

@router.post("/recipe-recommend", response_model=RecipeResponse)
async def recommend_recipe(request: RecipeRequest, db: Session = Depends(get_db)):
    """
    제미나이 AI를 사용하여 사용자 요청을 분석하고 가장 적합한 성분 7개를 추천합니다.
    """
    try:
        # 1. 제미나이를 사용하여 자연어 질문을 15차원 벡터로 변환
        target_vector = await ai_service.parse_query_to_vector(request.query)
        
        # 2. pgvector를 사용하여 가장 유사한 성분 검색 (Cosine Distance <=> 사용)
        # 122개의 성분에 대해 벡터 검색 수행
        search_query = text("""
            SELECT name, cas_no, sensory_attribute_vector <=> :vector as distance
            FROM ingredients
            WHERE sensory_attribute_vector IS NOT NULL
            ORDER BY distance ASC
            LIMIT :limit
        """)
        
        result = db.execute(search_query, {
            "vector": str(target_vector),
            "limit": request.top_k
        })
        
        recommended = []
        for row in result:
            recommended.append({
                "name": row[0],
                "cas_no": row[1],
                "similarity": 1 - float(row[2]) # 거리를 유사도로 변환 (1 - distance)
            })
        
        if not recommended:
            raise HTTPException(status_code=404, detail="관련 성분을 찾을 수 없습니다.")
            
        # 3. 제미나이를 사용하여 추천 이유 설명 생성
        explanation = await ai_service.generate_explanation(request.query, recommended)
        
        return {
            "target_vector": target_vector,
            "recommended_ingredients": recommended,
            "ai_explanation": explanation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 추천 처리 중 오류 발생: {str(e)}")
from app.services.consulting_service import consulting_service

@router.post("/smart-consulting")
async def get_smart_consulting(inquiry_id: int, db: Session = Depends(get_db)):
    """
    고객의 스마트 문진 결과와 R&D 라이브러리를 연동하여 AI 맞춤 컨설팅 리포트를 생성합니다.
    """
    try:
        report = await consulting_service.get_smart_consulting(db, inquiry_id)
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"컨설팅 생성 중 오류 발생: {str(e)}")
