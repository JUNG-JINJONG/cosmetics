from fastapi import APIRouter
from app.api.account_company.routes import router as auth_router
from app.api.account_company.auth import router as account_router
from app.api.development_workflow.routes import router as workflow_router
from app.api.ai_rd.routes import router as ai_rd_router
from app.api.ai_rd.color_routes import router as color_router
from app.api.ai_rd.rd_routes import router as rd_library_router
from app.api.business.quotation_routes import router as quotation_router
from app.api.business.factory_routes import router as factory_router
from app.api.business.settlement_routes import router as settlement_router
from app.api.business.product_routes import router as product_router
from app.api.development_workflow.qc_routes import router as qc_router
from app.api.support.insight_routes import router as insight_router
from app.api.ai_rd.consulting_routes import router as ai_consulting_router
from app.api.account_company.company_user_routes import router as company_user_router
from app.api.development_workflow.sample_routes import router as sample_router
from app.api.development_workflow.production_routes import router as production_router
from app.api.business.order_routes import router as order_router
from app.api.business.copilot_routes import router as business_copilot_router
from app.api.dashboard_routes import router as dashboard_router
from app.api.business.partner_routes import router as partner_router

api_router = APIRouter()

# 각 도메인별 라우터를 등록합니다.
api_router.include_router(auth_router, prefix="/account/auth", tags=["Authentication"])
api_router.include_router(account_router, prefix="/account", tags=["Account & Company"])
api_router.include_router(workflow_router, prefix="/workflow", tags=["Development Workflow"])
api_router.include_router(qc_router, prefix="/workflow/qc", tags=["Quality Control & CoA"])
api_router.include_router(ai_rd_router, prefix="/ai-rd", tags=["AI R&D Innovation"])
api_router.include_router(color_router, prefix="/ai-rd-color", tags=["Digital Color & Measurement"])
api_router.include_router(rd_library_router, prefix="/ai-rd/library", tags=["R&D Data Library"])
api_router.include_router(quotation_router, prefix="/business/quotations", tags=["Business Quotations"])
api_router.include_router(product_router, prefix="/business/products", tags=["Product Management"])
api_router.include_router(factory_router, prefix="/business/factory", tags=["Factory & Logistics"])
api_router.include_router(settlement_router, prefix="/business/settlements", tags=["Global Settlement"])
api_router.include_router(insight_router, prefix="/support/insights", tags=["Information & Insights"])
api_router.include_router(ai_consulting_router, prefix="/ai-rd/consulting", tags=["AI R&D Consulting"])
api_router.include_router(business_copilot_router, prefix="/business/copilot", tags=["AI Business Copilot"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Global Dashboard"])
api_router.include_router(company_user_router, prefix="/account/company-users", tags=["Company Users (Manufacturer/Brand)"])
api_router.include_router(sample_router, prefix="/workflow", tags=["Sample Development & Review"])
api_router.include_router(production_router, prefix="/workflow", tags=["Production Progress & Logistics"])
api_router.include_router(order_router, prefix="/business/orders", tags=["Business Orders"])
api_router.include_router(partner_router, prefix="/business/partners", tags=["Partner Showroom"])
