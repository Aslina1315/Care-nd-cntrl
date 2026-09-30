import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user;
  const name=String(req.body?.name||"").trim();
  const city=String(req.body?.city||"").trim();
  const state=String(req.body?.state||"").trim();
  if(!name) return res.status(400).json({error:"Hospital name is required"});
  const existing=await db.query("SELECT h.id,h.name FROM hospitals h JOIN hospital_members m ON m.hospital_id=h.id WHERE m.user_id=$1 LIMIT 1",[u.id]);
  if(existing.rows.length) return res.json({hospital:existing.rows[0],existing:true});
  const h=await db.query("INSERT INTO hospitals(name,city,state) VALUES($1,$2,$3) RETURNING id,name,city,state,status",[name,city,state]);
  await db.query("INSERT INTO hospital_members(hospital_id,user_id,role,display_name) VALUES($1,$2,'admin',$3)",[h.rows[0].id,u.id,u.display_name||u.email||"Hospital admin"]);
  return res.json({hospital:h.rows[0],created:true});
}