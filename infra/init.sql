CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY,
  component_id VARCHAR(255) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  severity VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  first_signal_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS rca_records (
  id SERIAL PRIMARY KEY,
  work_item_id UUID REFERENCES work_items(id),
  root_cause_category VARCHAR(255) NOT NULL,
  fix_applied TEXT NOT NULL,
  prevention_steps TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  mttr_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_severity ON work_items(severity);
CREATE INDEX IF NOT EXISTS idx_work_items_component ON work_items(component_id);