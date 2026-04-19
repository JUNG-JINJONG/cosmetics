from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.business import Order, Settlement
from app.models.workflow import Project
from app.models.user import User
from typing import Dict, Any, List
import datetime

class BusinessCopilotService:
    def get_summary_metrics(self, db: Session, user: User) -> Dict[str, Any]:
        """
        사용자(바이어/제조사)에 따른 주요 비즈니스 요약 지표 산출
        """
        # 1. 매출/결제 요약 (Settlement 테이블 기준)
        # 1500000005: 정산 완료
        # 1500000002: 정산 대기, 1500000003: 정산 확정
        
        query_settle = db.query(Settlement)
        query_proj = db.query(Project)
        
        if user.role == "Client":
            query_settle = query_settle.filter(Settlement.buyer_id == user.buyer_id)
            query_proj = query_proj.join(Project.inquiry).filter(Project.inquiry.has(buyer_id=user.buyer_id))
        elif user.role == "Manufacturer":
            # 제조사는 본인이 수주한 Order에 연결된 Settlement만 조회
            query_settle = query_settle.join(Order).filter(Order.company_id == getattr(user, "company_id", None))
            query_proj = query_proj.filter(Project.status_code != "Pending") # 단순 예시

        total_sales = query_settle.filter(Settlement.settlement_status_code == "1500000005").with_entities(func.sum(Settlement.total_amount)).scalar() or 0
        pending_amount = query_settle.filter(Settlement.settlement_status_code.in_(["1500000002", "1500000003"])).with_entities(func.sum(Settlement.total_amount)).scalar() or 0
        active_projects = query_proj.count()

        return {
            "total_sales": float(total_sales),
            "pending_amount": float(pending_amount),
            "active_projects": active_projects,
            "currency": "USD"
        }

    async def analyze_and_respond(self, db: Session, user: User, query: str) -> str:
        """
        사용자의 질문을 분석하여 실제 데이터를 바탕으로 AI(Gemini) 답변 생성 (지능형 고도화)
        """
        from app.models.business import OrderItem
        from app.models.product import Product
        from app.services.ai_service import ai_service

        # 1. 공통 비즈니스 지표(Metrics) 및 상세 리트스(Items) 가져오기
        metrics = self.get_summary_metrics(db, user)
        
        # 이번 달 주문 품목 리스트 (상세 컨텍스트용)
        now = datetime.datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        query_orders = db.query(Order).join(OrderItem).join(Product).filter(Order.created_at >= start_of_month)
        
        if user.role == "Client":
            query_orders = query_orders.filter(Order.buyer_id == user.buyer_id)
        elif user.role == "Manufacturer":
            query_orders = query_orders.filter(Order.company_id == getattr(user, "company_id", None))

        raw_items = query_orders.with_entities(Product.product_name, func.count(Order.order_id), func.sum(OrderItem.quantity)).group_by(Product.product_name).all()
        item_list_str = "\n".join([f"- {item[0]}: {item[1]}건 / {item[2]}개" for item in raw_items]) if raw_items else "없음"

        # 2. AI 프롬프트 구성 (DB 팩트 주입)
        system_context = f"""
        너는 화장품 B2B 플랫폼의 전문 비즈니스 분석가 AI '코코'야. 
        사용자의 역할: {user.role} (바이어 혹은 제조사)

        [현재 시스템의 실시간 비즈니스 데이터(FACT)]
        - 통화 단위: {metrics['currency']}
        - 누적 완료 매출: {metrics['total_sales']:,}
        - 진행 중인 프로젝트 수: {metrics['active_projects']}
        - 확정 대기 중인 정산액 (미결제): {metrics['pending_amount']:,}
        - 이번 달({now.month}월) 주문 품목 리스트:
        {item_list_str}

        [답변 가이드라인]
        1. 반드시 위의 'FACT 데이터'를 바탕으로 답변해. 모르는 데이터는 지어내지 마.
        2. {user.role}의 입장을 고려해서 친절하고 전문적으로 말해줘.
        3. 질문이 정산이나 매출에 관한 거라면 구체적인 숫자를 언급해줘.
        4. 데이터가 부족하면 "현재 파악된 데이터 기준으로는~" 이라고 말해줘.
        5. 자연스럽고 대화하듯 답변해줘. (한글)
        """

        full_prompt = f"{system_context}\n\n사용자 질문: \"{query}\"\nAI 비즈니스 분석 결과:"

        try:
            # AI 모델 호출
            if ai_service.model:
                response = ai_service.model.generate_content(full_prompt)
                return response.text.strip()
            else:
                return "AI 분석 엔진을 불러올 수 없습니다. 설정을 확인해 주세요."
        except Exception as e:
            print(f"Business Copilot AI Error: {e}")
            return f"데이터 분석 도중 오류가 발생했습니다. (근거 데이터: 매출 {metrics['total_sales']:,}, 프로젝트 {metrics['active_projects']}건)"

business_copilot_service = BusinessCopilotService()
