CREATE TABLE hospital_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, user_id)
)