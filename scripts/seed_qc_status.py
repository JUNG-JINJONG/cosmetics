import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.database import engine
from sqlalchemy import text

def seed_qc_status():
    print("품질 관리 상태(Group 14) 데이터를 category 테이블에 삽입합니다...")
    
    sql = text("""
        INSERT INTO category (
            group_code1, group_code2, group_code3, group_code4, 
            group_code1_desc, 
            code, 
            code_name_kr, code_name_eng, code_desc
        )
        VALUES 
        ('14', '00', '00', '00', '품질 관리 상태', '1400000001', '검사 대기', 'QC Pending', '품질 검사 항목이 배정되어 대기 중인 상태'),
        ('14', '00', '00', '00', '품질 관리 상태', '1400000002', '검사 진행 중', 'Testing', '품질 팀에서 실제 테스트를 수행 중인 상태'),
        ('14', '00', '00', '00', '품질 관리 상태', '1400000003', '합격(적합)', 'Passed', '모든 품질 검사 항목을 통과한 제품'),
        ('14', '00', '00', '00', '품질 관리 상태', '1400000004', '불합격(부적합)', 'Failed', '품질 기준 미달로 부적합 판정을 받은 제품'),
        ('14', '00', '00', '00', '품질 관리 상태', '1400000005', '재검사 중', 'Re-testing', '정확한 판명을 위해 다시 검사 절차를 진행 중인 상태'),
        ('14', '00', '00', '00', '품질 관리 상태', '1400000006', '검사 보류', 'On Hold', '기타 사유로 검사가 일시 중단된 상태')
    """)

    with engine.connect() as conn:
        try:
            conn.execute(sql)
            conn.commit()
            print("✅ 품질 관리 상태 코드(6건) 삽입 완료!")
        except Exception as e:
            print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    seed_qc_status()
