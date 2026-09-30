import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const h=hm.rows[0].hospital_id;
  const facilities=await db.query("SELECT f.id,f.external_ref,f.name,f.district,f.state,f.status,f.capacity_total,f.updated_at,COUNT(i.id)::int AS resource_records FROM phc_facilities f LEFT JOIN resource_inventory i ON i.facility_id=f.id AND i.hospital_id=$1 WHERE f.hospital_id=$1 GROUP BY f.id ORDER BY f.name",[h]);
  res.json({facilities:facilities.rows});
}