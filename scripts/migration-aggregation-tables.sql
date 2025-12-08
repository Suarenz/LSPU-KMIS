-- Migration: Create KRA Aggregation Tables
-- Date: 2025-12-08

-- Create KRA Aggregations table for storing rollup metrics
CREATE TABLE IF NOT EXISTS kra_aggregations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  
  kra_id TEXT NOT NULL,
  kra_title TEXT,
  
  initiative_id TEXT NOT NULL,
  
  total_reported INTEGER,
  target_value NUMERIC,
  achievement_percent NUMERIC,
  
  submission_count INTEGER DEFAULT 0,
  participating_units JSON,
  
  status TEXT CHECK (status IN ('MET', 'MISSED', 'ON_TRACK', 'NOT_APPLICABLE')),
  
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT,
  
  previous_quarter_achieved NUMERIC,
  previous_quarter_reported INTEGER,
  previous_quarter_target NUMERIC,
  
  CONSTRAINT unique_aggregation UNIQUE(year, quarter, kra_id, initiative_id)
);

-- Create Aggregation Activities table for detailed activity breakdown
CREATE TABLE IF NOT EXISTS aggregation_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  
  aggregation_id TEXT NOT NULL REFERENCES kra_aggregations(id) ON DELETE CASCADE,
  qpro_analysis_id TEXT NOT NULL REFERENCES qpro_analyses(id) ON DELETE CASCADE,
  
  unit_id TEXT,
  
  activity_name TEXT NOT NULL,
  reported INTEGER,
  target INTEGER,
  achievement NUMERIC,
  
  activity_type TEXT,
  initiative_id TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kra_aggregations_year_quarter ON kra_aggregations(year, quarter);
CREATE INDEX IF NOT EXISTS idx_kra_aggregations_kra_id ON kra_aggregations(kra_id);
CREATE INDEX IF NOT EXISTS idx_kra_aggregations_status ON kra_aggregations(status);

CREATE INDEX IF NOT EXISTS idx_aggregation_activities_aggregation_id ON aggregation_activities(aggregation_id);
CREATE INDEX IF NOT EXISTS idx_aggregation_activities_qpro_id ON aggregation_activities(qpro_analysis_id);
CREATE INDEX IF NOT EXISTS idx_aggregation_activities_unit_id ON aggregation_activities(unit_id);
