import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const [p,ps,phc,inv,act,src]=await Promise.all([
    db.query("SELECT count(*)::int AS count FROM patients WHERE status='active'"),
    db.query("SELECT count(*)::int AS count,max(observed_at) AS latest FROM patient_signals"),
    db.query("SELECT count(*)::int AS count FROM phc_facilities"),
    db.query("SELECT count(*)::int AS count FROM resource_inventory"),
    db.query("SELECT count(*)::int AS pending FROM action_queue WHERE status='pending'"),
    db.query("SELECT count(*)::int AS connected FROM data_sources WHERE status='connected'")
  ]);
  res.json({active_patients:p.rows[0]?.count||0,signals:ps.rows[0]?.count||0,latest_signal_at:ps.rows[0]?.latest||null,phc_facilities:phc.rows[0]?.count||0,resource_records:inv.rows[0]?.count||0,pending_actions:act.rows[0]?.pending||0,connected_sources:src.rows[0]?.connected||0});
}