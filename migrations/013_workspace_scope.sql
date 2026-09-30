-- Explicit workspace ownership for operational, source and audit records.
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL;
ALTER TABLE phc_facilities ADD COLUMN IF NOT EXISTS hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL;
ALTER TABLE resource_inventory ADD COLUMN IF NOT EXISTS hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL;
ALTER TABLE action_queue ADD COLUMN IF NOT EXISTS hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL;
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_data_sources_hospital ON data_sources(hospital_id);
CREATE INDEX IF NOT EXISTS idx_phc_facilities_hospital ON phc_facilities(hospital_id);
CREATE INDEX IF NOT EXISTS idx_resource_inventory_hospital ON resource_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_action_queue_hospital ON action_queue(hospital_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_hospital ON audit_events(hospital_id);