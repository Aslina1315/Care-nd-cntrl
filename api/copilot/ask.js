import { ai } from "hatchable";
export const access="user";
export const methods=["POST"];
export default async function(req,res){
 const question=String(req.body?.question||"").trim();
 const context=req.body?.context||{};
 if(!question)return res.status(400).json({error:"Question is required"});
 const safe=JSON.stringify(context).slice(0,14000);
 try{
  const r=await ai.generateText({
   model:"gemini",
   purpose:"care-ctrl-copilot",
   userId:req.user.id,
   maxSteps:1,
   system:"You are CARE & CTRL Copilot for healthcare operations. Answer only from the supplied application context. Never invent patient measurements, diagnoses, hospital facts, trends, resource levels, or live status. If evidence is insufficient, say so. Do not diagnose or replace a clinician. Separate observed facts from interpretation. Keep answers concise, operational, and explain the source/freshness state when available.",
   prompt:"Question: "+question+"\n\nApplication context:\n"+safe
  });
  res.json({answer:r.text||"No grounded answer was produced.",usage:r.usage||null});
 }catch(e){res.status(502).json({error:e.message||"AI service unavailable"})}
}