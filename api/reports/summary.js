import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const [events,actions,sources]=await Promise.all([
    db.query("SELECT event_type,created_at,actor_id,detail FROM audit_events ORDER BY created_at DESC LIMIT 100"),
    db.query("SELECT status,count(*)::int AS count FROM action_queue GROUP BY status ORDER BY status"),
    db.query("SELECT name,source_type,status,last_seen_at,freshness_seconds,provenance FROM data_sources ORDER BY name")
  ]);
  res.json({events:events.rows,actions:actions.rows,sources:sources.rows,generated_at:new Date().toISOString()});
}