-- 프로젝트 상태 변경 이력 로그 (Project Status Logs) 생성 스크립트
CREATE TABLE IF NOT EXISTS project_status_logs (
    log_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    status_code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE project_status_logs IS '프로젝트 상태 변경 이력 및 타임라인 로그';
COMMENT ON COLUMN project_status_logs.log_id IS '로그 고유 식별 번호';
COMMENT ON COLUMN project_status_logs.project_id IS '연관된 프로젝트 ID';
COMMENT ON COLUMN project_status_logs.status_code IS '변경된 상태 코드';
COMMENT ON COLUMN project_status_logs.description IS '상태 변경에 대한 상세 설명';
COMMENT ON COLUMN project_status_logs.created_at IS '로그 발생 시각';
