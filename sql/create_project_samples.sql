-- 구형 테이블 삭제 (Plural -> Singular 전환)
DROP TABLE IF EXISTS sample_reviews CASCADE;
DROP TABLE IF EXISTS project_samples CASCADE;

-- 1. 프로젝트 샘플 마스터 테이블 (Singular: project_sample)
CREATE TABLE IF NOT EXISTS project_sample (
    project_sample_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    sample_name VARCHAR(255),
    sample_status_code VARCHAR(20) DEFAULT '1900000001', -- [필드명]_status_code 형식
    tracking_number VARCHAR(100),
    manufacturer_comments TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 샘플 품평 결과 테이블 (Singular: sample_review)
CREATE TABLE IF NOT EXISTS sample_review (
    sample_review_id SERIAL PRIMARY KEY,
    project_sample_id INTEGER REFERENCES project_sample(project_sample_id) ON DELETE CASCADE,
    buyer_id INTEGER REFERENCES buyer(buyer_id) ON DELETE SET NULL,
    overall_score NUMERIC(3, 1) CHECK (overall_score >= 1.0 AND overall_score <= 5.0),
    scent_score INTEGER CHECK (scent_score >= 1 AND scent_score <= 5),
    texture_score INTEGER CHECK (texture_score >= 1 AND texture_score <= 5),
    absorption_score INTEGER CHECK (absorption_score >= 1 AND absorption_score <= 5),
    moisture_score INTEGER CHECK (moisture_score >= 1 AND moisture_score <= 5),
    detailed_feedback TEXT,
    improvement_requests TEXT,
    decision VARCHAR(50), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 주석 업데이트 (SQL 컨벤션 준수)
COMMENT ON TABLE project_sample IS '프로젝트별 샘플 제작 및 발송 이력 관리';
COMMENT ON COLUMN project_sample.project_sample_id IS '샘플ID';
COMMENT ON COLUMN project_sample.project_id IS '연관 프로젝트ID';
COMMENT ON COLUMN project_sample.version_number IS '샘플 차수 (V1, V2 등 차수 번호)';
COMMENT ON COLUMN project_sample.sample_name IS '샘플 명칭';
COMMENT ON COLUMN project_sample.sample_status_code IS '샘플 진행 상태 코드 (Group 19)';
COMMENT ON COLUMN project_sample.tracking_number IS '배송 송장 번호 (운송장 번호)';
COMMENT ON COLUMN project_sample.manufacturer_comments IS '제조사 코멘트 (샘플 특징 및 처방 설명)';
COMMENT ON COLUMN project_sample.sent_at IS '샘플 발송일시';
COMMENT ON COLUMN project_sample.received_at IS '바이어 수령일시';
COMMENT ON COLUMN project_sample.created_at IS '등록일시';
COMMENT ON COLUMN project_sample.updated_at IS '수정일시';

COMMENT ON TABLE sample_review IS '샘플에 대한 바이어의 상세 감각 품평 결과';
COMMENT ON COLUMN sample_review.sample_review_id IS '품평ID';
COMMENT ON COLUMN sample_review.project_sample_id IS '대상 샘플ID';
COMMENT ON COLUMN sample_review.buyer_id IS '작성 바이어ID';
COMMENT ON COLUMN sample_review.overall_score IS '종합 만족도 점수 (1.0~5.0)';
COMMENT ON COLUMN sample_review.scent_score IS '향 만족도 점수 (1~5)';
COMMENT ON COLUMN sample_review.texture_score IS '제형 만족도 점수 (1~5)';
COMMENT ON COLUMN sample_review.absorption_score IS '흡수력 만족도 점수 (1~5)';
COMMENT ON COLUMN sample_review.moisture_score IS '보습력 만족도 점수 (1~5)';
COMMENT ON COLUMN sample_review.detailed_feedback IS '상세 품평 의견 (주관식 피드백)';
COMMENT ON COLUMN sample_review.improvement_requests IS '보안 요청 사항 (다음 차수 반영 요청)';
COMMENT ON COLUMN sample_review.decision IS '최종 결정 (Approved, Modify, Rejected)';
COMMENT ON COLUMN sample_review.created_at IS '등록일시';
COMMENT ON COLUMN sample_review.updated_at IS '수정일시';

-- 샘플 상태 공통 코드 추가 (Group 19)
-- 이미 존재할 경우를 대비해 ON CONFLICT DO NOTHING 사용
INSERT INTO category (group_code1, group_code1_desc, code, code_name_kr, code_name_eng, group_code2, group_code3, group_code4) VALUES
('19', '샘플 진행 상태', '1900000001', '준비 중', 'Preparing', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000002', '발송 완료', 'Sent', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000003', '바이어 수령', 'Received', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000004', '품평 중', 'Under Review', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000005', '최종 승인', 'Approved', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000006', '보안 요청', 'Modification Requested', '00', '00', '00'),
('19', '샘플 진행 상태', '1900000007', '반려', 'Rejected', '00', '00', '00')
ON CONFLICT (code) DO NOTHING;
