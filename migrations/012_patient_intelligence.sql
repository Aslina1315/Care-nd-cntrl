ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_name text;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_group text;

CREATE TABLE IF NOT EXISTS patient_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis_name text NOT NULL,
  clinical_status text,
  diagnosed_at timestamptz,
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name text NOT NULL,
  dose text,
  frequency text,
  status text,
  started_at timestamptz,
  ended_at timestamptz,
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_type text,
  extracted_text text,
  extracted_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT current_setting('hatchable.user_id', true),
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general',
  message text NOT NULL,
  page text,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'
);