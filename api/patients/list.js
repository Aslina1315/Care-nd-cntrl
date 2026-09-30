import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const q=String(req.query?.q||"").trim(), ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const h=hm.rows[0].hospital_id, args=q?[h,q]:[h];
  const sql=q
    ? "SELECT p.id,p.external_ref,p.display_name,p.sex,p.status,p.updated_at,(SELECT count(*) FROM patient_signals s WHERE s.patient_id=p.id)::int AS signal_count,(SELECT max(s.observed_at) FROM patient_signals s WHERE s.patient_id=p.id) AS last_signal_at FROM patients p WHERE p.hospital_id=$1 AND (p.display_name ILIKE '%'||$2||'%' OR p.external_ref ILIKE '%'||$2||'%') ORDER BY p.updated_at DESC LIMIT 100"
    : "SELECT p.id,p.external_ref,p.display_name,p.sex,p.status,p.updated_at,(SELECT count(*) FROM patient_signals s WHERE s.patient_id=p.id)::int AS signal_count,(SELECT max(s.observed_at) FROM patient_signals s WHERE s.patient_id=p.id) AS last_signal_at FROM patients p WHERE p.hospital_id=$1 ORDER BY p.updated_at DESC LIMIT 100";
  const r=await db.query(sql,args);
  res.json({rows:r.rows});
}