# 🛠️ Cosmetics-B2B Platform Technology Stack

이 문서는 프로젝트의 백엔드 및 프론트엔드 기술 표준을 정의합니다. 모든 개발 작업은 이 스택을 기준으로 진행됩니다.

---

## 🏗️ Backend (Server-side)
*   **Core Framework**: `Python 3.12+` / `FastAPI`
    *   높은 생산성과 비동기 처리를 지원하며, AI 라이브러리와의 통합이 용이함.
*   **Database**: `PostgreSQL 16` (using `pgvector`)
    *   **확장 기능:** `pgvector` (벡터 임베딩 검색 지원)
    *   **선택 이유:** 단일 DB에서 SQL과 벡터 데이터를 동시에 처리 가능하여 아키텍처 단순화 및 데이터 무결성 보장.
    *   **실행 방식:** Docker Compose를 통한 컨테이너화된 DB 환경 제공.
*   **ORM**: `SQLAlchemy 2.0`
*   **Authentication**: `JWT (JSON Web Token)`
*   **AI Integration**: `Google Gemini 2.x API`
*   **AI / MCP (Model Context Protocol)**: `mcp-sdk-python`
    *   LLM이 제조사 DB 및 프로젝트 로컬 컨텍스트에 접근 가능하도록 가교 역할.
    *   도메인 특화 데이터(화장품 성분, 규제 정보)를 LLM에 실시간 주입.
*   **Containerization**: `Docker` / `Docker Compose`
*   **Core Dependencies**:
    *   `fastapi`, `uvicorn[standard]` (Web Server)
    *   `sqlalchemy`, `psycopg2-binary` (DB / ORM)
    *   `mcp-sdk-python` (AI MCP Connection)
    *   `pydantic-settings`, `python-dotenv` (Config)

## 🎨 Frontend (Client-side) - *CoCo Recommended*
*   **Core Framework**: `React (Next.js 14+ App Router)`
    *   서버(Server)와 클라이언트(Client) 컴포넌트의 엄격한 분리로 AI의 작업 정합성 향상.
    *   SSR/SSG 지원으로 비즈니스 데이터의 빠른 최기 렌더링 및 SEO 최적화.
*   **Language**: `TypeScript` (Strict Mode)
*   **Styling**: `Tailwind CSS`
*   **UI Component**: `Shadcn/UI`
    *   **Non-Blackbox**: 소스 코드를 프로젝트 내부에서 직접 관리하여 AI가 직접 스타일과 기능을 미세 조정 가능.
*   **State Management**: `Zustand` & `TanStack Query`
*   **Folder Strategy**:
    *   `components/ui`: Shadcn 기반 기초 인터페이스 컴포넌트.
    *   `components/dashboard`: 비즈니스 로직(데이터 페칭 등)이 결합된 도메인 컴포넌트.

## 🛠️ Utilities & Infrastructure
*   **Package Manager**: `pip` (Backend), `npm` or `pnpm` (Frontend)
*   **Environment**: `Node.js v18.17.0+` (Frontend), `Python venv` (Backend)
*   **CI/CD**: `GitHub Actions` (예정)


## 🏗️ Project Architecture

```text
Cosmetics-B2B/
├── backend/            # FastAPI (Python) 서비스
│   ├── app/
│   │   ├── main.py     # 애플리케이션 진입점
│   │   ├── api/        # REST API 라우터
│   │   ├── core/       # MCP 서버 설정 및 AI 연동 로직
│   │   ├── models/     # DB ORM 모델 (SQLAlchemy/SQLModel)
│   │   └── schemas/    # Pydantic 데이터 검사 모델
│   ├── requirements.txt
│   └── .env            # 환경 변수 (API KEY, DB URL)
├── frontend/           # React(Next.js) 개발 폴더
├── docker-compose.yml  # PostgreSQL + pgvector 인프라 설정
└── design/             # 설계 및 문서 폴더 (API 리스트, 스택 정의 등)
```


## 🚀 Development Roadmap (Quick Start)
1.  **Phase 1**: 백엔드 기반 구조 및 가상 환경(`venv`) 구축 완료.
2.  **Phase 2**: Docker 기반 PostgreSQL(pgvector) 서버 구동 및 스키마 적용 완료.
3.  **Phase 3**: FastAPI 핵심 API(B2B Workflow, AI R&D) 구현 및 MCP 연동 테스트.
4.  **Phase 4**: Next.js 프리미엄 대시보드 UI 구현 및 API 연동.


## 📐 Development Standard
*   **API Protocol**: `RESTful API` (JSON format)
*   **Database Convention**: `sql-convention.md` 준수 (한글 코멘트 필수)
*   **Folder Structure Guide**: `work-history.md`에 명시된 구조 준수
*   **UI/UX Goal**: "Premium Dashboard Experience" (WOW Factor 중심)

---

> [!TIP]
> **CoCo's Note**: 모든 프론트엔드 컴포넌트는 재사용 가능한 원자적(Atomic) 구조로 설계하며, TypeScript의 인터페이스는 백엔드의 스키마와 1:1 대응을 원칙으로 합니다.
