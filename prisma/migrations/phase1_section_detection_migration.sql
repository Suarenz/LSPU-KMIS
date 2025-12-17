-- Phase 1 Migration: Add new columns to support document sections and summary extraction
-- This migration adds metadata columns to the QPROAnalysis table to store section detection and summary metrics

-- Add new columns to store section detection results
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS document_sections JSONB;
-- Structure: { type: string, sections: Array<{type, title, confidence}>, documentType, metadata }

-- Add column to store extracted summary metrics
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS extracted_summaries JSONB;
-- Structure: { summaries: Array<{metricType, metricName, value, unit, confidence}>, prioritized_value, metadata }

-- Add column to store section analysis summary for LLM context
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS section_analysis_summary TEXT;

-- Add column for detected document format
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS document_format VARCHAR(50) DEFAULT 'UNSTRUCTURED';
-- Possible values: TABLE, NARRATIVE, MIXED, UNSTRUCTURED

-- Add column for section detection confidence
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS section_detection_confidence DECIMAL(3, 2);
-- Range: 0.00 to 1.00

-- Add column to track if summary metrics were used in achievement calculation
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS used_summary_metrics BOOLEAN DEFAULT FALSE;

-- Create index for document format queries
CREATE INDEX IF NOT EXISTS idx_qpro_analyses_document_format 
ON qpro_analyses(document_format);

-- Create index for section detection confidence
CREATE INDEX IF NOT EXISTS idx_qpro_analyses_section_confidence 
ON qpro_analyses(section_detection_confidence);

-- Enhancements to AggregationActivity table for better KRA mapping tracking
ALTER TABLE aggregation_activities ADD COLUMN IF NOT EXISTS activity_mapping_confidence DECIMAL(3, 2);
-- Confidence score from Activity-KRA Mapping service

ALTER TABLE aggregation_activities ADD COLUMN IF NOT EXISTS mapping_match_type VARCHAR(50);
-- Type of match: STRATEGY, TYPE, KEYWORD, SEMANTIC

ALTER TABLE aggregation_activities ADD COLUMN IF NOT EXISTS matched_strategies JSONB;
-- Array of strategies from Strategic Plan that matched this activity

-- Add comment columns for audit trail
COMMENT ON COLUMN qpro_analyses.document_sections IS 'JSON output from DocumentSectionDetector service containing identified document sections';
COMMENT ON COLUMN qpro_analyses.extracted_summaries IS 'JSON output from SummaryExtractor service containing aggregate metrics';
COMMENT ON COLUMN qpro_analyses.used_summary_metrics IS 'Flag indicating if achievement calculations used summary metrics instead of row counts';
COMMENT ON COLUMN aggregation_activities.activity_mapping_confidence IS 'Confidence score (0-1) from ActivityKRAMappingService for this KRA assignment';
COMMENT ON COLUMN aggregation_activities.mapping_match_type IS 'How the KRA was matched: STRATEGY (exact), TYPE (activity type rules), KEYWORD (pattern matching), or SEMANTIC (LLM similarity)';
