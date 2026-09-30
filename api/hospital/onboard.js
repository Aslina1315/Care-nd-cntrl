import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user;
  const name=String(req.body?.name||"").trim();
  const city=String(req.body?.city||"").trim();
  const state=String(req.body?.state||"").trim();
  if(!name) return res.status(400).json({error:"Hospital name is required"});
  const h=await db.query("INSERT INTO hospitals(name,city,state) VALUES($1,$2,$3) RETURNING id,name,city,state,status",[name,city,state]);
  await db.query("INSERT INTO hospital_members(hospital_id,user_id,role,display_name) VALUES($1,$2,'admin',$3)",[h.rows[0].id,u.id,u.display_name||u.email||"Hospital admin"]);
  return res.json({hospital:h.rows[0],member:{hospital_id:h.rows[0].id,name:h.rows[0].name,city:h.rows[0].city,state:h.rows[0].state,status:h.rows[0].status,role:"admin",display_name:u.display_name||u.email||"Hospital admin"},created:true});
}