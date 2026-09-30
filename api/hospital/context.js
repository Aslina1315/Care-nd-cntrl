import { db } from "hatchable";
export const access = "user";
export const methods = ["GET"];
export default async function(req,res){
  const u=req.user;
  const r=await db.query("SELECT h.id,h.name,h.city,h.state,h.status,m.role,m.display_name FROM hospitals h JOIN hospital_members m ON m.hospital_id=h.id WHERE m.user_id=$1 LIMIT 1",[u.id]);
  res.json({member:r.rows[0]||null,user:{id:u.id,email:u.email,name:u.display_name||u.email}});
}