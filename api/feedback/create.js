import { db } from "hatchable";
export const access="user";
export const methods=["POST"];
export default async function(req,res){
 const message=String(req.body?.message||"").trim();
 const category=String(req.body?.category||"general").trim().slice(0,80)||"general";
 const page=String(req.body?.page||"").trim().slice(0,120);
 if(!message)return res.status(400).json({error:"Please describe the issue or improvement."});
 const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 LIMIT 1",[req.user.id]);
 const hospitalId=hm.rows[0]?.hospital_id||null;
 await db.query("INSERT INTO user_feedback(user_id,hospital_id,category,message,page) VALUES($1,$2,$3,$4,$5)",[req.user.id,hospitalId,category,message,page]);
 res.status(201).json({ok:true,message:"Thanks — your feedback has been recorded."});
}