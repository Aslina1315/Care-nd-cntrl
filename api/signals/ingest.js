import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user;
  const patientId=String(req.body?.patient_id||"");
  const type=String(req.body?.signal_type||"").trim();
  const value=Number(req.body?.value_numeric);
  const unit=req.body?.unit?String(req.body.unit):null;
  const observed=req.body?.observed_at?String(req.body.observed_at):new Date().toISOString();
  if(!patientId||!type||!Number.isFinite(value)) return res.status(400).json({error:"Patient, signal type and numeric value are required"});
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 LIMIT 1",[u.id]);
  if(!hm.rows.length) return res.status(400).json({error:"Create or join a hospital workspace first"});
  const p=await db.query("SELECT id FROM patients WHERE id=$1 AND hospital_id=$2",[patientId,hm.rows[0].hospital_id]);
  if(!p.rows.length) return res.status(404).json({error:"Patient not found in your workspace"});
  const s=await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,quality,data_status) VALUES($1,$2,$3,$4,$5,'verified','verified') RETURNING id,patient_id,signal_type,value_numeric,unit,observed_at,quality,data_status",[patientId,type,value,unit,observed]);
  await db.query("UPDATE patients SET updated_at=now() WHERE id=$1",[patientId]);
  await db.query("INSERT INTO audit_events(event_type,entity_type,entity_id,actor_id,detail) VALUES($1,$2,$3,$4,$5)",["signal_ingested","patient_signal",s.rows[0].id,u.id,"Signal ingested by authorised workspace user"]);
  res.status(201).json({signal:s.rows[0]});
}