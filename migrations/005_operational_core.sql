CREATE TABLE IF NOT EXISTS phc_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref text UNIQUE NOT NULL,
  name text NOT NULL,
  district text,
  state text,
  status text NOT NULL DEFAULT 'unknown',
  capacity_total integer,
  updated_at timestamptz NOT NULL DEFAULT now()
)