-- 품질 관리 결과 (Quality Controls) 생성 스크립트
CREATE TABLE IF NOT EXISTS quality_controls (
    qc_id SERIAL PRIMARY KEY,
    production_schedule_id INTEGER REFERENCES production_schedules(schedule_id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    result_status_code VARCHAR(20) DEFAULT 'Pending',
    test_log TEXT,
    inspector_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE quality_controls IS '생산 로트별/프로젝트별 품질 검사 결과 기록';
COMMENT ON COLUMN quality_controls.qc_id IS 'QC 고유 번호';
COMMENT ON COLUMN quality_controls.production_schedule_id IS '연관된 생산 일정 ID';
COMMENT ON COLUMN quality_controls.project_id IS '연관된 프로젝트 ID';
COMMENT ON COLUMN quality_controls.test_type IS '검사 항목 (미생물, 중금속 등)';
COMMENT ON COLUMN quality_controls.result_status_code IS '검사 결과 상태 코드';
COMMENT ON COLUMN quality_controls.test_log IS '상세 테스트 결과 기록';
COMMENT ON COLUMN quality_controls.inspector_name IS '검사 담당자 성명';
COMMENT ON COLUMN quality_controls.created_at IS '검사 실시 시각';
