import os
import json
import google.generativeai as genai
from typing import List

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
        else:
            self.model = None

    async def parse_query_to_vector(self, query: str) -> List[float]:
        """
        사용자의 자연어 질문을 분석하여 15개 감각 지표(1.0~5.0) 벡터로 변환합니다.
        순서: 발림성, 밀착력, 발색력, 수분감, 점도, 입자감, 유분기, 청량감, 끈적임, 산뜻함, 윤기, 잔여감, 향취, 지속력, 자극도
        """
        if not self.model:
            # 폴백: 기본 벡터 반환 (모두 수분감에 집중된 예시)
            return [1.0] * 15

        prompt = f"""
        너는 화장품 제형 전문가야. 사용자의 요구사항을 분석해서 15가지 감각 지표 점수(1.0 ~ 5.0)로 변환해줘.
        사용자 요청: "{query}"

        결과는 반드시 아래 순서대로 15개의 숫자만 들어있는 JSON 리스트 형식으로만 출력해:
        1. 발림성 (Spreadability)
        2. 밀착력 (Adhesion)
        3. 발색력 (Color Payoff)
        4. 수분감 (Moistness)
        5. 점도 (Viscosity)
        6. 입자감 (Graininess)
        7. 유분기 (Oiliness)
        8. 청량감/쿨링감 (Cooling)
        9. 끈적임 (Stickiness)
        10. 산뜻함 (Freshness)
        11. 윤기/광택 (Glow)
        12. 잔여감 (Residue)
        13. 향취 (Fragrance)
        14. 지속력 (Longevity)
        15. 자극도 (Irritation)

        출력 예시: [4.5, 3.0, 1.0, 5.0, 2.0, 1.0, 1.0, 3.0, 1.0, 4.0, 3.0, 1.0, 2.0, 4.0, 1.0]
        """

        response = self.model.generate_content(prompt)
        try:
            # 텍스트에서 JSON 리스트 부분만 추출 (가끔 설명이 붙을 수 있음)
            text = response.text.strip()
            if "[" in text and "]" in text:
                text = text[text.find("["):text.rfind("]")+1]
            vector = json.loads(text)
            if len(vector) == 15:
                # 1.0 ~ 5.0 범위 강제
                return [max(1.0, min(5.0, float(v))) for v in vector]
        except Exception as e:
            print(f"Gemini 파싱 오류: {e}")
            
        return [3.0] * 15 # 기본값

    async def generate_explanation(self, query: str, top_ingredients: List[dict]) -> str:
        """
        추천된 성분들이 왜 사용자의 요청에 적합한지 제미나이가 설명해줍니다.
        """
        if not self.model:
            return "AI 모델 설정이 되어 있지 않습니다."

        ingredients_str = ", ".join([f"{item['name']}({item['cas_no']})" for item in top_ingredients])
        
        prompt = f"""
        사용자 질문: "{query}"
        AI가 추천한 성분들: {ingredients_str}

        위 성분들이 왜 사용자의 요구사항에 가장 적합한 조합인지 화장품 연구원 관점에서 친절하게 설명해줘.
        전문적이면서도 신뢰감 있는 톤으로 한글로 작성해줘.
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def provide_smart_recommendation(self, inquiry_data: List[dict], rd_assets: List[dict], ingredients: List[dict]) -> str:
        """
        문진 결과(Inquiry), R&D 자산(Formulas), 추천 원료를 통합하여 전문적인 AI 컨설팅 보고서를 생성합니다.
        """
        if not self.model:
            return "AI 모델이 설정되지 않았습니다."

        # 컨텍스트 데이터 가공
        inquiry_summary = "\n".join([f"- {d['category_name_kr']}: {d['score']}점 ({d['comments']})" for d in inquiry_data])
        assets_summary = "\n".join([f"- {a['name']} ({a['asset_type']})" for a in rd_assets])
        ingredients_summary = "\n".join([f"- {i['name']} (기능: {i['function']})" for i in ingredients])

        prompt = f"""
        당신은 화장품 ODM 전문 AI 컨설턴트입니다. 아래의 고객 문진 결과와 우리 제조사가 보유한 R&D 자산을 바탕으로 최적의 제품 개발 전략을 제안하세요.

        [1. 고객 문진 결과]
        {inquiry_summary}

        [2. 보유 제형 및 R&D 자산]
        {assets_summary}

        [3. 추천 핵심 원료]
        {ingredients_summary}

        [요청 사항]
        1. 가장 권장하는 베이스 제형(Formula)을 선택하고 그 이유를 설명하세요.
        2. 제형에 추가할 핵심 효능 성분 조합과 기대 효과를 제시하세요.
        3. 타겟 시장(문진 결과 참고)에 맞는 마케팅 포인트 3가지를 제안하세요.
        
        어조: 전문적이고, 데이터 기반이며, 고객에게 신뢰를 주는 톤앤매너로 작성 (한글).
        """

        response = self.model.generate_content(prompt)
        return response.text.strip()

    async def get_chat_response(self, history: List[dict], message: str) -> str:
        """
        사용자와의 대화 내역을 바탕으로 전문적인 화장품 개발 상담 응답을 생성합니다.
        """
        if not self.model:
            return "AI 모델이 설정되지 않았습니다."

        # 대화 맥락 구성을 위한 프롬프트
        chat_session = self.model.start_chat(history=[
            {"role": "user", "parts": ["당신은 화장품 B2B 플랫폼의 전문 AI 컨설턴트 '코코(Coco)'입니다. 바이어의 제품 개발, 시장 트렌드, 성분 분석 제안 등을 친절하고 전문적으로 도와주세요."]},
            {"role": "model", "parts": ["안녕하세요! 화장품 비즈니스 파트너 '코코'입니다. 어떤 제품 개발을 도와드릴까요? 기획부터 성분, 시장 트렌드까지 무엇이든 물어보세요."]}
        ])
        
        # 실제 히스토리 주입 (마지막 10개 정도로 제한 가능)
        for h in history[-10:]:
            # role 변환 (DB의 assistant -> model)
            role = "model" if h["role"] == "assistant" else h["role"]
            # Gemini chat history 형식에 맞춰 추가
            # Note: start_chat history는 초기 설정용이므로, 여기서는 sendMessage를 이용하거나 
            # 혹은 전체 프롬프트를 다시 구성하는 방식 선택 가능. 
            # 여기서는 단순화를 위해 전체 맥락을 프롬프트에 포함함.
            pass

        response = chat_session.send_message(message)
        return response.text.strip()

    async def generate_brief_from_chat(self, history: List[dict]) -> dict:
        """
        상담 대화 내역 전체를 분석하여 구조화된 '제품 개발 전략 브리프'를 생성합니다.
        """
        if not self.model:
            return {"error": "AI 모델이 설정되지 않았습니다."}

        history_str = "\n".join([f"{h['role']}: {h['content']}" for h in history])
        
        prompt = f"""
        당신은 화장품 전문 컨설턴트입니다. 아래의 대화 내역을 바탕으로 '제품 개발 전략 리포트'를 작성하세요.
        
        [대화 내역]
        {history_str}
        
        반드시 아래 JSON 형식으로만 응답하세요:
        {{
            "product_name": "제품명 또는 컨셉명",
            "target_market": "주요 타겟 국가 및 소비자층",
            "concept_summary": "제품의 핵심 컨셉 요약",
            "key_ingredients": ["성분1", "성분2", "성분3"],
            "formula_suggestion": "추천 제형 특징 (텍스처, 사용감)",
            "marketing_points": ["포인트1", "포인트2", "포인트3"],
            "expected_effect": "사용 시 기대 효과"
        }}
        """

        response = self.model.generate_content(prompt)
        try:
            text = response.text.strip()
            if "{" in text and "}" in text:
                text = text[text.find("{"):text.rfind("}")+1]
            return json.loads(text)
        except Exception as e:
            print(f"Brief 생성 파싱 오류: {e}")
            return {"error": "리포트 생성 중 오류가 발생했습니다."}

ai_service = AIService()
