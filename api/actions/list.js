import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const r=await db.query("SELECT id,action_type,target_type,target_id,rationale,expected_impact,status,proposed_at,approved_at,approved_by FROM action_queue WHERE hospital_id=$1 ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, proposed_at DESC LIMIT 100",[hm.rows[0].hospital_id]);
  res.json({rows:r.rows});
}