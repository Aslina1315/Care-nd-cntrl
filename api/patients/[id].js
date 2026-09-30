import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const id=req.params.id;
  const patient=await db.query("SELECT id,external_ref,display_name,date_of_birth,sex,status,created_at,updated_at FROM patients WHERE id=$1",[id]);
  if(!patient.rows.length) return res.status(404).json({error:"Patient not found"});
  const signals=await db.query("SELECT signal_type,value_numeric,unit,observed_at,quality,source_id FROM patient_signals WHERE patient_id=$1 ORDER BY observed_at DESC LIMIT 200",[id]);
  res.json({patient:patient.rows[0],signals:signals.rows});
}