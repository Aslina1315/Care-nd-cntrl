import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const [p,s,src,a,phc,inv] = await Promise.all([
    db.query("SELECT count(*)::int AS count FROM patients WHERE status='active'"),
    db.query("SELECT count(*)::int AS count FROM patient_signals"),
    db.query("SELECT count(*)::int AS count FROM data_sources WHERE status='connected'"),
    db.query("SELECT count(*)::int AS count FROM action_queue WHERE status='pending'"),
    db.query("SELECT count(*)::int AS count FROM phc_facilities"),
    db.query("SELECT count(*)::int AS count FROM resource_inventory")
  ]);
  res.json({patients:p.rows[0]?.count||0,signals:s.rows[0]?.count||0,connected_sources:src.rows[0]?.count||0,pending_actions:a.rows[0]?.count||0,phc_facilities:phc.rows[0]?.count||0,resource_records:inv.rows[0]?.count||0,timestamp:new Date().toISOString()});
}