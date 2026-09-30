import { db } from "hatchable";

export const access = "user";
export const methods = ["GET"];

export default async function (req, res) {
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const h=hm.rows[0].hospital_id;
  const [patientResult,sourceResult,actionResult]=await Promise.all([
    db.query("SELECT count(*)::int AS count FROM patients WHERE hospital_id=$1 AND status='active'",[h]),
    db.query("SELECT count(*)::int AS count FROM data_sources WHERE status='connected'",[]),
    db.query("SELECT count(*)::int AS count FROM action_queue WHERE status='pending'",[])
  ]);
  res.json({patients_needing_attention:0,active_patients:patientResult.rows[0]?.count??0,connected_sources:sourceResult.rows[0]?.count??0,pending_human_decisions:actionResult.rows[0]?.count??0,phc_pressure:null,resource_outlook:null,data_state:sourceResult.rows[0]?.count?"connected":"awaiting_verified_sources",generated_at:new Date().toISOString()});
}