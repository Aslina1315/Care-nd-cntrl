import { ai } from "hatchable";
export const access="user";
export const methods=["POST"];

const ACTIONS = new Set(["navigate","refresh","open_patient","open_source","open_upload","open_workspace","search_hospitals","open_source_info","scroll_top","none"]);

export default async function(req,res){
 const question=String(req.body?.question||"").trim();
 const context=req.body?.context||{};
 if(!question)return res.status(400).json({error:"Question is required"});
 const history=Array.isArray(context.conversation_history)?context.conversation_history.slice(-20):[];
 const safe=JSON.stringify(Object.assign({},context,{conversation_history:undefined})).slice(0,12000);
 const safeHistory=JSON.stringify(history).slice(0,6000);
 try{
  const r=await ai.generateText({
   model:"gemini",
   purpose:"care-ctrl-copilot",
   userId:req.user.id,
   maxSteps:1,
   system:`You are CARE & CTRL Copilot: a grounded conversational assistant embedded inside a healthcare intelligence application.

You have two jobs:
1) Answer the user's question using ONLY the supplied application context.
2) When the user is clearly asking you to control the website, return one safe UI action.

Language rule: understand mixed-language requests (for example English + Tamil) and respond in the user's language or language mix. Use the selected UI/voice language when supplied.

Never invent patient measurements, diagnoses, hospital facts, trends, resource levels, source freshness or live status. Never diagnose or make clinical decisions. Never approve/reject a clinical or operational action on behalf of a human. Consequential decisions remain human-approved.
Use the supplied conversation history to resolve follow-up references such as “that patient”, “the previous result”, “what did I ask earlier”, or “continue from before”. The history is conversational context only; current application data is the source of truth for factual claims.

Allowed UI actions ONLY:
- navigate: move to one of these views: explorer, home, patients, population, dashboard, network, resources, actions, reports, data, help, ai
- refresh: refresh the current connected source/system state
- open_patient: open a patient already present in the supplied patient list; use patient_id only when there is an exact or clearly matching patient
- open_source: open the Explorer view; do not invent a source
- open_source_info: open information for an exact source id present in the supplied source list
- open_upload: open the healthcare-file upload area; the user still chooses the local file
- open_workspace: open the workspace chooser/setup; never access an organisation the user is not authorised for
- search_hospitals: search the public facility directory using the user's requested place/name
- scroll_top: move the current page to the top
- none: no website action

Return STRICT JSON only:
{
  "answer": "concise natural-language response",
  "action": {
    "type": "navigate|refresh|open_patient|open_source|open_upload|open_workspace|search_hospitals|open_source_info|scroll_top|none",
    "target": "view name or patient id or empty string",
    "label": "short description"
  }
}

If the user is only asking a healthcare/data question, use action type "none".
If the request could cause a consequential change, do not execute it; explain that a human approval is required and use "navigate" to the relevant review page only when useful.`,
   prompt:"Recent conversation history:\n"+safeHistory+"\n\nUser request:\n"+question+"\n\nCurrent application context:\n"+safe
  });
  let parsed=null;
  try{parsed=JSON.parse(String(r.text||"").replace(/^\`\`\`json\s*/,"").replace(/\s*\`\`\`$/,"").trim())}catch(_){}
  if(!parsed||typeof parsed!=="object"){
    res.json({answer:r.text||"No grounded answer was produced.",action:{type:"none",target:"",label:""},usage:r.usage||null});
    return;
  }
  const action=parsed.action&&ACTIONS.has(parsed.action.type)?parsed.action:{type:"none",target:"",label:""};
  res.json({answer:String(parsed.answer||"No grounded answer was produced."),action:{type:action.type,target:String(action.target||""),label:String(action.label||"")},usage:r.usage||null});
 }catch(e){res.status(502).json({error:e.message||"AI service unavailable"})}
}