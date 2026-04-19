-- 생산 진척도 테이블 생성 (원부자재 준비 및 생산 단계 상세 관리)
CREATE TABLE IF NOT EXISTS project_production_progress (
    progress_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    raw_material_status_code VARCHAR(20) DEFAULT '2000000001', -- 원료 수급 현황 (Group 20)
    packaging_status_code VARCHAR(20) DEFAULT '2100000001',    -- 부자재 수급 현황 (Group 21)
    production_status_code VARCHAR(20) DEFAULT '2200000001',   -- 전체 생산 공정 상태 (Group 22)
    planned_start_date DATE,                                   -- 생산 예정 시작일
    planned_end_date DATE,                                     -- 생산 예정 종료일
    actual_start_date DATE,                                    -- 실제 생산 시작일
    actual_end_date DATE,                                      -- 실제 생산 종료일
    remarks TEXT,                                              -- 특이사항 및 코멘트
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가 (조회 성능 최적화)
CREATE INDEX idx_production_progress_project ON project_production_progress(project_id);

-- 코멘트 추가 (정부장님 컨벤션 준수)
COMMENT ON TABLE project_production_progress IS '프로젝트별 생산 진척도 및 원부자재 수급 관리';
COMMENT ON COLUMN project_production_progress.progress_id IS '생산진척ID';
COMMENT ON COLUMN project_production_progress.project_id IS '연관 프로젝트ID';
COMMENT ON COLUMN project_production_progress.raw_material_status_code IS '원료 수급 상태 코드 (Group 20)';
COMMENT ON COLUMN project_production_progress.packaging_status_code IS '부자재 수급 상태 코드 (Group 21)';
COMMENT ON COLUMN project_production_progress.production_status_code IS '생산 공정 상태 코드 (Group 22)';
COMMENT ON COLUMN project_production_progress.planned_start_date IS '생산 예정 시작일';
COMMENT ON COLUMN project_production_progress.planned_end_date IS '생산 예정 종료일';
COMMENT ON COLUMN project_production_progress.actual_start_date IS '실제 생산 시작일';
COMMENT ON COLUMN project_production_progress.actual_end_date IS '실제 생산 종료일';
COMMENT ON COLUMN project_production_progress.remarks IS '비고 및 제조사 특이사항';

-- 공통 코드 데이터 삽입 (Category 테이블 연동)
-- 원료 상태 (Group 20)
INSERT INTO category (group_code1, group_code2, code, code_name_kr) VALUES 
('20', '00', '2000000001', '원료 발주 전'),
('20', '00', '2000000002', '원료 발주 완료'),
('20', '00', '2000000003', '원료 입고 중'),
('20', '00', '2000000004', '원료 입고 완료')
ON CONFLICT DO NOTHING;

-- 부자재 상태 (Group 21)
INSERT INTO category (group_code1, group_code2, code, code_name_kr) VALUES 
('21', '00', '2100000001', '부자재 발주 전'),
('21', '00', '2100000002', '부자재 발주 완료'),
('21', '00', '2100000003', '부자재 입고 중'),
('21', '00', '2100000004', '부자재 입고 완료')
ON CONFLICT DO NOTHING;

-- 생산 상태 (Group 22)
INSERT INTO category (group_code1, group_code2, code, code_name_kr) VALUES 
('22', '00', '2200000001', '생산 준비'),
('22', '00', '2200000002', '생산 중'),
('22', '00', '2200000003', '품질 검사 중'),
('22', '00', '2200000004', '생산 완료')
ON CONFLICT DO NOTHING;
