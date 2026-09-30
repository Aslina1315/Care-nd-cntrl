import { db } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const u=req.user;
  const requested=String(req.query?.hospital_id||req.headers?.["x-workspace-id"]||"").trim();
  const r=await db.query("SELECT h.id,h.name,h.city,h.state,h.status,m.role,m.display_name FROM hospitals h JOIN hospital_members m ON m.hospital_id=h.id WHERE m.user_id=$1 AND ($2='' OR h.id::text=$2) ORDER BY h.name",[u.id,requested]);
  const workspaces=r.rows;
  res.json({member:workspaces[0]||null,workspaces,user:{id:u.id,email:u.email,name:u.display_name||u.email}});
}