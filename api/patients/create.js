import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user;
  const name=String(req.body?.display_name||"").trim();
  const ref=String(req.body?.external_ref||"").trim();
  const sex=req.body?.sex?String(req.body.sex):null;
  const dob=req.body?.date_of_birth?String(req.body.date_of_birth):null;
  if(!name||!ref) return res.status(400).json({error:"Patient name and patient reference are required"});
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[u.id,ws]);
  if(!hm.rows.length) return res.status(400).json({error:"Create or join a hospital workspace first"});
  const h=hm.rows[0].hospital_id;
  const existing=await db.query("SELECT id FROM patients WHERE external_ref=$1",[ref]);
  if(existing.rows.length) return res.status(409).json({error:"Patient reference already exists"});
  const r=await db.query("INSERT INTO patients(external_ref,display_name,date_of_birth,sex,status,hospital_id) VALUES($1,$2,$3,$4,'active',$5) RETURNING id,external_ref,display_name,date_of_birth,sex,status,created_at,updated_at",[ref,name,dob,sex,h]);
  await db.query("INSERT INTO audit_events(event_type,entity_type,entity_id,actor_id,detail,hospital_id) VALUES($1,$2,$3,$4,$5,$6)",["patient_created","patient",r.rows[0].id,u.id,"Patient created in hospital workspace",h]);
  res.status(201).json({patient:r.rows[0]});
}