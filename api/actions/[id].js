import { db } from "hatchable";
export const access = "user";
export default async function(req,res){
  const id=req.params.id;
  const ws=String(req.headers?.["x-workspace-id"]||"").trim();
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 AND ($2='' OR hospital_id::text=$2) LIMIT 1",[req.user.id,ws]);
  if(!hm.rows.length)return res.status(403).json({error:"Authorised workspace required."});
  const hospitalId=hm.rows[0].hospital_id;
  if(req.method==="GET"){ const r=await db.query("SELECT * FROM action_queue WHERE id=$1 AND hospital_id=$2",[id,hospitalId]); if(!r.rows.length) return res.status(404).json({error:"Action not found"}); return res.json(r.rows[0]); }
  if(!["POST","PUT"].includes(req.method)) return res.status(405).json({error:"Method not allowed"});
  const next=String(req.body?.status||"pending");
  if(!["pending","approved","rejected","modified"].includes(next)) return res.status(400).json({error:"Invalid action status"});
  const actor=req.user?.email||req.user?.id||"user";
  const updated=await db.query("UPDATE action_queue SET status=$1, approved_at=CASE WHEN $1='approved' THEN now() ELSE approved_at END, approved_by=CASE WHEN $1='approved' THEN $2 ELSE approved_by END WHERE id=$3 AND hospital_id=$4 RETURNING id",[next,actor,id,hospitalId]);
  if(!updated.rows.length)return res.status(404).json({error:"Action not found in this workspace"});
  await db.query("INSERT INTO audit_events(event_type,entity_type,entity_id,actor_id,detail,hospital_id) VALUES($1,$2,$3,$4,$5,$6)",["action_status_changed","action",id,actor,next,hospitalId]);
  res.json({ok:true,id,status:next});
}