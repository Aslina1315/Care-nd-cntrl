CREATE TABLE patient_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  source_id uuid REFERENCES data_sources(id) ON DELETE SET NULL,
  attribute_key text NOT NULL,
  attribute_value text,
  data_type text NOT NULL DEFAULT 'text',
  observed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);