ALTER TABLE patients ADD COLUMN hospital_id uuid REFERENCES hospitals(id);
ALTER TABLE patient_signals ADD COLUMN recorded_by uuid;
ALTER TABLE patient_signals ADD COLUMN data_status text NOT NULL DEFAULT 'verified'