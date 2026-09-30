import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const r=await db.query("SELECT id,action_type,target_type,target_id,rationale,expected_impact,status,proposed_at,approved_at,approved_by FROM action_queue ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, proposed_at DESC LIMIT 100");
  res.json({rows:r.rows});
}