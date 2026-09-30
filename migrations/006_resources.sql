CREATE TABLE IF NOT EXISTS resource_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES phc_facilities(id),
  resource_name text NOT NULL,
  unit text NOT NULL,
  quantity_available double precision NOT NULL DEFAULT 0,
  average_daily_use double precision NOT NULL DEFAULT 0,
  reorder_level double precision NOT NULL DEFAULT 0,
  observed_at timestamptz NOT NULL,
  source_id uuid REFERENCES data_sources(id)
)