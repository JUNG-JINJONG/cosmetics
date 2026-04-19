import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.database import engine
from sqlalchemy import text

def seed_project_status():
    print("프로젝트 진행 상태(Group 13) 데이터를 category 테이블에 삽입합니다...")
    
    sql = text("""
        INSERT INTO category (
            group_code1, group_code2, group_code3, group_code4, 
            group_code1_desc, 
            code, 
            code_name_kr, code_name_eng, code_desc
        )
        VALUES 
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000001', '기획 및 의뢰', 'Planning & Inquiry', '고객 초기 의뢰 접수 및 컨셉 논의'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000002', 'AI 분석', 'AI Analysis', 'Gemini AI 성분 추천 및 제형 매칭'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000003', '제형 개발', 'R&D Formula', '연구소 제형 설계 및 확정'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000004', '샘플 테스트', 'Sample & C/T Test', '샘플 제작 및 용기 적합성 테스트'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000005', '견적 및 계약', 'Quotation', '단가 산출 및 생산 계약 체결'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000006', '발주 완료', 'Ordering', '원부자재 발주 완료'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000007', '생산 중', 'Production', '라인 배정 및 제품 제조 진행'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000008', '품질 검사', 'QC & QA', '품질 검증 및 시험성적서 발행'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000009', '출고 및 배송', 'Released', '물류 센터 출고 및 배송 시작'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000010', '완료', 'Completed', '전 과정 종료 및 고객 인도 완료'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000011', '제조사 수락', 'Manufacturer Accepted', '제조사가 의뢰를 수락하고 제안서를 준비 중인 상태'),
        ('13', '00', '00', '00', '프로젝트 진행 상태', '1300000012', '제안서 제출', 'Proposal Submitted', '제조사가 상세 제안서를 제출하여 바이어가 검토 중인 상태')
    """)

    with engine.connect() as conn:
        try:
            conn.execute(sql)
            conn.commit()
            print("✅ 프로젝트 상태 코드(10건) 삽입 완료!")
        except Exception as e:
            print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    seed_project_status()
