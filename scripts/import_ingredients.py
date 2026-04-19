import csv
import sys
import os

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
    
    csv_path = os.path.join(project_root, "data", "Chemicals in Cosmetics", "chemicals-in-cosmetics.csv")
    
    if not os.path.exists(csv_path):
        print(f"CSV 파일을 찾을 수 없습니다: {csv_path}")
        return

    # 고유 성분 추출용 딕셔너리 (ChemicalName -> CasNumber)
    unique_ingredients = {}
    
    print("CSV 파일을 읽어 고유 성분을 추출합니다...")
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('ChemicalName', '').strip()
            cas = row.get('CasNumber', '').strip()
            
            # Trade Secret 은 제외하거나 이름이 있는 경우만 수집
            if name and name.lower() != 'trade secret':
                if name not in unique_ingredients:
                    unique_ingredients[name] = cas
                # 이름이 등록되어 있지만 CAS 번호가 비어있고, 현재 로우에는 있는 경우 업데이트
                elif not unique_ingredients[name] and cas:
                    unique_ingredients[name] = cas

    print(f"추출 완료! 총 {len(unique_ingredients)}개의 고유 성분이 발견되었습니다.")
    print("데이터베이스에 Insert 작업을 시작합니다...")

    try:
        with engine.begin() as conn:
            # 안전을 위해 기존 데이터가 있으면 삭제 (운영 환경에서는 주의 필요)
            conn.execute(text("TRUNCATE TABLE ingredients RESTART IDENTITY CASCADE;"))
            
            insert_query = text("""
                INSERT INTO ingredients (name, inci_name, cas_no) 
                VALUES (:name, :inci_name, :cas_no)
            """)
            
            count = 0
            for name, cas in unique_ingredients.items():
                conn.execute(insert_query, {
                    "name": name, 
                    "inci_name": name, 
                    "cas_no": cas
                })
                count += 1
                if count % 500 == 0:
                    print(f" - {count}개 완료...")
            
    except Exception as e:
        print(f"데이터베이스 입력 중 오류가 발생했습니다: {e}")
        return
        
    print(f"🎉 성공적으로 {count}개의 고유 성분들을 DB(ingredients)에 저장했습니다!")

if __name__ == "__main__":
    main()
