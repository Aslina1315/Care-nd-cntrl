CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  actor_id text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
)