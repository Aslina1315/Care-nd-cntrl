import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const h=hm.rows[0].hospital_id;
  const [events,actions,sources]=await Promise.all([
    db.query("SELECT event_type,created_at,actor_id,detail FROM audit_events WHERE hospital_id=$1 ORDER BY created_at DESC LIMIT 100",[h]),
    db.query("SELECT status,count(*)::int AS count FROM action_queue WHERE hospital_id=$1 GROUP BY status ORDER BY status",[h]),
    db.query("SELECT name,source_type,status,last_seen_at,freshness_seconds,provenance FROM data_sources WHERE hospital_id=$1 ORDER BY name",[h])
  ]);
  res.json({events:events.rows,actions:actions.rows,sources:sources.rows,generated_at:new Date().toISOString()});
}