import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const h=hm.rows[0].hospital_id;
  const [p,ps,phc,inv,act,src]=await Promise.all([
    db.query("SELECT count(*)::int AS count FROM patients WHERE hospital_id=$1 AND status='active'",[h]),
    db.query("SELECT count(*)::int AS count,max(s.observed_at) AS latest FROM patient_signals s JOIN patients p ON p.id=s.patient_id WHERE p.hospital_id=$1",[h]),
    db.query("SELECT count(*)::int AS count FROM phc_facilities WHERE hospital_id=$1",[h]),
    db.query("SELECT count(*)::int AS count FROM resource_inventory WHERE hospital_id=$1",[h]),
    db.query("SELECT count(*)::int AS pending FROM action_queue WHERE hospital_id=$1 AND status='pending'",[h]),
    db.query("SELECT count(*)::int AS connected FROM data_sources WHERE hospital_id=$1 AND status='connected'",[h])
  ]);
  res.json({active_patients:p.rows[0]?.count||0,signals:ps.rows[0]?.count||0,latest_signal_at:ps.rows[0]?.latest||null,phc_facilities:phc.rows[0]?.count||0,resource_records:inv.rows[0]?.count||0,pending_actions:act.rows[0]?.pending||0,connected_sources:src.rows[0]?.connected||0});
}