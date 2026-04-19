import json
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.workflow import InquiryQuestion
from app.models.rd_library import CosmaxRAndDAsset, IngredientEfficacy, ConsultingReport
from app.models.ingredient import Ingredient
from app.services.ai_service import ai_service

class ConsultingService:
    async def get_smart_consulting(self, db: Session, inquiry_id: int):
        # 1. 문진 결과 조회 및 가중치 분석 (Weighted Scoring)
        inquiry_query = text("""
            SELECT c.code_name_kr, iq.score, iq.comments, c.group_code1
            FROM inquiry_questions iq
            JOIN category c ON iq.category_id = c.category_id
            WHERE iq.inquiry_id = :inquiry_id
        """)
        inquiry_rows = db.execute(inquiry_query, {"inquiry_id": inquiry_id}).fetchall()
        
        if not inquiry_rows:
            return "해당 문진 데이터를 찾을 수 없습니다."

        inquiry_data = []
        high_score_efficacies = []
        
        for r in inquiry_rows:
            category_name_kr = r[0]
            score = r[1]
            comments = r[2]
            group_code = r[3]
            
            # 가중치 적용: 효능(Group 12)은 중요도를 2배로 계산
            weight = 2.0 if group_code == '12' else 1.0
            weighted_score = float(score) * weight
            
            inquiry_data.append({
                "category_name_kr": category_name_kr,
                "score": score,
                "weighted_score": weighted_score,
                "comments": comments
            })
            
            if score >= 4 and group_code == '12':
                high_score_efficacies.append(category_name_kr)

        # 2. R&D 자산 정밀 매칭 (Ranking)
        # 문진 키워드(comments)나 효능 명칭이 trend_tags에 포함된 자산을 우선순위로 계산
        all_assets = db.query(CosmaxRAndDAsset).all()
        scored_assets = []
        
        for asset in all_assets:
            match_score = 0
            # 태그 일치 여부 확인
            tags = asset.trend_tags.lower() if asset.trend_tags else ""
            for eff in high_score_efficacies:
                if eff.lower() in tags:
                    match_score += 10 # 효능 직접 매칭 시 높은 점수
            
            scored_assets.append({
                "id": asset.cosmax_r_and_d_asset_id,
                "name": asset.name,
                "asset_type": asset.asset_type,
                "rank_score": match_score
            })
        
        # 점수 순으로 정렬하여 상위 3개 선정
        top_assets = sorted(scored_assets, key=lambda x: x['rank_score'], reverse=True)[:3]

        # 3. 고효능 원료 조회
        ingredient_query = text("""
            SELECT DISTINCT i.name, i.function
            FROM ingredients i
            JOIN ingredient_efficacies ie ON i.ingredient_id = ie.ingredient_id
            JOIN category c ON ie.category_id = c.category_id
            WHERE c.code_name_kr = ANY(:cats)
            LIMIT 5
        """)
        
        ingredient_rows = db.execute(ingredient_query, {"cats": high_score_efficacies}).fetchall()
        ingredients_data = [{"name": r[0], "function": r[1]} for r in ingredient_rows]

        # 4. AI 컨설팅 보고서 생성 호출
        report_text = await ai_service.provide_smart_recommendation(
            inquiry_data=inquiry_data,
            rd_assets=top_assets,
            ingredients=ingredients_data
        )

        # 5. 결과 저장 (Persistent History)
        best_asset_id = top_assets[0]['id'] if top_assets else None
        
        db_report = ConsultingReport(
            inquiry_id=inquiry_id,
            recommended_asset_id=best_asset_id,
            report_content=report_text,
            matching_scores=json.dumps(top_assets, ensure_ascii=False)
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        return {
            "report_id": db_report.report_id,
            "report_content": report_text,
            "recommended_asset": top_assets[0] if top_assets else None
        }

consulting_service = ConsultingService()
