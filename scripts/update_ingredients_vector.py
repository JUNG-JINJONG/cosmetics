import os
import sys

# 프로젝트 루트 및 백엔드 경로 설정
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
backend_path = os.path.join(project_root, 'backend')
sys.path.append(backend_path)

from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def main():
    print(f"DB 접속 URL: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # 15가지 감각 속성 코드 (순서가 중요함)
    sensory_codes = [
        "1010000001", "1010000002", "1010000003", "1010000004", 
        "1011000001", "1011000002", "1011000003", "1011000004", 
        "1012000001", "1012000002", "1012000003", "1012000004", 
        "1013000001", "1013000002", "1013000003"
    ]
    
    try:
        with engine.begin() as conn:
            print("원료별 감각 데이터를 기반으로 벡터를 생성 중...")
            
            # 모든 원료 ID 조회
            result = conn.execute(text("SELECT ingredient_id FROM ingredients;"))
            ingredient_ids = [row[0] for row in result]
            
            updated_count = 0
            for ing_id in ingredient_ids:
                # 해당 원료의 모든 감각 속성값 조회
                query = text("""
                    SELECT sensory_attribute_code, point 
                    FROM ingredients_sensory_attribute 
                    WHERE ingredient_id = :ing_id
                """)
                attr_result = conn.execute(query, {"ing_id": ing_id})
                
                # 코드별 점수 매핑
                attr_map = {row[0]: float(row[1]) for row in attr_result}
                
                # 순서에 맞춰 벡터 배열 생성 (데이터가 없으면 0.0으로 채워넣음)
                vector = [attr_map.get(code, 0.0) for code in sensory_codes]
                
                # ingredients 테이블의 sensory_attribute_vector 컬럼 업데이트
                update_query = text("""
                    UPDATE ingredients 
                    SET sensory_attribute_vector = :vector 
                    WHERE ingredient_id = :ing_id
                """)
                conn.execute(update_query, {
                    "vector": str(vector), # pgvector는 리스트를 문자열 형태로 전달받아 처리 가능
                    "ing_id": ing_id
                })
                updated_count += 1
                
                if updated_count % 50 == 0:
                    print(f" - {updated_count}개 원료 완료...")

            print(f"🎉 성공적으로 {updated_count}개 원료의 sensory_attribute_vector를 업데이트했습니다!")

    except Exception as e:
        print(f"오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()
