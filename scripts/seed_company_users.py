import sys
import os
import bcrypt

# 백엔드 경로 추가
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.database import SessionLocal
from app.models.company import Company
from app.models.company_user import CompanyUser

def seed_company_users():
    db = SessionLocal()
    try:
        # 기존 데이터 삭제
        db.query(CompanyUser).delete()
        
        companies = db.query(Company).limit(5).all()
        if not companies:
            print("No companies found.")
            return

        # 'password123' 해싱
        password = "password123"
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        users_to_add = []
        for i in range(10):
            company = companies[i % len(companies)]
            user = CompanyUser(
                company_id=company.company_id,
                email=f"user{i+1}@company.com",
                password_hash=hashed,
                name=f"김직원{i+1}",
                dept_code=["RD", "QC", "SALES", "PROD"][i % 4],
                position=["연구원", "파트장", "팀장", "매니저"][i % 4],
                specialty_area="신규 제형 개발" if i % 2 == 0 else "품질 보증",
                phone=f"010-1234-567{i}",
                permission_role="Manager" if i == 0 else "Staff",
                is_active=True
            )
            users_to_add.append(user)
        
        db.add_all(users_to_add)
        db.commit()
        print(f"Successfully seeded 10 company users (Password: password123)")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_company_users()
