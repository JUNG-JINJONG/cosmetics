import os
import sys

# 현재 디렉터리를 sys.path에 추가하여 app 모듈을 불러올 수 있게 함
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import SessionLocal

def insert_categories():
    db = SessionLocal()
    try:
        sql = """
        -- 1. Draft (초안)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000001', '견적 상태 코드 그룹', '초안', 'DRAFT');

        -- 2. Requested (의뢰/접수됨)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000002', '견적 상태 코드 그룹', '의뢰/접수됨', 'REQUESTED');

        -- 3. Sent (발송됨)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000003', '견적 상태 코드 그룹', '발송됨', 'SENT');

        -- 4. Confirmed (확정됨)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000004', '견적 상태 코드 그룹', '확정됨', 'CONFIRMED');

        -- 5. Expired (만료됨)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000005', '견적 상태 코드 그룹', '만료됨', 'EXPIRED');

        -- 6. Canceled (취소됨)
        INSERT INTO category (group_code1, group_code2, group_code3, group_code4, code, group_code1_desc, code_name_kr, code_name_eng)
        VALUES ('20', '00', '00', '00', '2000000006', '견적 상태 코드 그룹', '취소됨', 'CANCELED');
        """
        db.execute(text(sql))
        db.commit()
        print("Quotation categories (Group 20) inserted successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    insert_categories()
