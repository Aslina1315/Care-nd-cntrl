import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const q = String(req.query?.q||"").trim();
  const sql = q
    ? "SELECT p.id,p.external_ref,p.display_name,p.sex,p.status,p.updated_at,(SELECT count(*) FROM patient_signals s WHERE s.patient_id=p.id)::int AS signal_count,(SELECT max(s.observed_at) FROM patient_signals s WHERE s.patient_id=p.id) AS last_signal_at FROM patients p WHERE p.display_name ILIKE '%'||$1||'%' OR p.external_ref ILIKE '%'||$1||'%' ORDER BY p.updated_at DESC LIMIT 100"
    : "SELECT p.id,p.external_ref,p.display_name,p.sex,p.status,p.updated_at,(SELECT count(*) FROM patient_signals s WHERE s.patient_id=p.id)::int AS signal_count,(SELECT max(s.observed_at) FROM patient_signals s WHERE s.patient_id=p.id) AS last_signal_at FROM patients p ORDER BY p.updated_at DESC LIMIT 100";
  const r=await db.query(sql,q?[q]:[]);
  res.json({rows:r.rows});
}