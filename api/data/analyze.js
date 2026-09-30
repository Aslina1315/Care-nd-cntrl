import { ai, db } from "hatchable";
export const access="user";
export const methods=["POST"];

function clean(v){return String(v??"").trim()}
function parseJson(text){
  const s=String(text||"").replace(/^```json\s*/i,"").replace(/^```\s*$/,"").trim();
  const start=s.indexOf("{"), end=s.lastIndexOf("}");
  if(start<0||end<start) throw Error("AI returned no structured JSON");
  return JSON.parse(s.slice(start,end+1));
}
function iso(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString()}

export default async function(req,res){
  const u=req.user;
  const body=req.body||{};
  const fileName=clean(body.file_name)||"uploaded-healthcare-file";
  const fileType=clean(body.file_type)||"unknown";
  const text=clean(body.text).slice(0,50000);
  const rows=Array.isArray(body.rows)?body.rows.slice(0,1500):[];
  const headers=Array.isArray(body.headers)?body.headers.slice(0,200):[];
  if(!text&&!rows.length&&!body.analysis)return res.status(400).json({error:"No extractable file content was supplied."});
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 LIMIT 1",[u.id]);
  if(!hm.rows.length)return res.status(403).json({error:"A hospital workspace is required before importing patient data."});
  const hospitalId=hm.rows[0].hospital_id;

  const material=rows.length?JSON.stringify({headers,rows}).slice(0,45000):text;
  const prompt=`Analyse this authorised healthcare file for CARE & CTRL. This is data supplied by the organisation; do not invent anything.
File: ${fileName}
Type: ${fileType}
Content/sample:
${material}

Return ONLY valid JSON with this exact shape:
{
 "document_type":"patient_records|clinical_report|lab_results|medication_list|encounters|resource_inventory|facility_data|mixed_healthcare|unknown",
 "confidence":0,
 "cleaning_actions":["..."],
 "patients":[
  {
   "external_ref":"","display_name":"","date_of_birth":"","sex":"","status":"",
   "photo_url":"",
   "blood_group":"",
   "diagnoses":[{"name":"","status":"","diagnosed_at":""}],
   "medications":[{"name":"","dose":"","frequency":"","status":"","started_at":"","ended_at":""}],
   "signals":[{"type":"","value":0,"unit":"","observed_at":""}],
   "attributes":[{"key":"","value":"","data_type":"text","observed_at":""}]
  }
 ],
 "summary":"short factual description"
}
Rules: preserve only facts present in the file; leave unavailable values empty. Clean obvious duplicated whitespace, inconsistent labels and date formats. Do not infer a diagnosis from a symptom. If the file is not patient data, return an empty patients array and classify it appropriately.`;
  let parsed=body.analysis||null;
  if(!parsed){
    try{
      const out=await ai.generateText({model:"gemini",purpose:"care-ctrl-file-intelligence",userId:u.id,maxSteps:1,system:"You are a healthcare data normalization engine. Never invent clinical facts. Return structured JSON only. Preserve provenance and explicitly leave unknown fields blank.",prompt});
      parsed=parseJson(out.text);
    }catch(e){return res.status(502).json({error:"The intelligent file analyser could not produce a safe structured result.",detail:e.message||"AI unavailable"})}
  }
  if(!body.commit){return res.json({preview:true,analysis:{document_type:parsed.document_type,confidence:parsed.confidence,summary:parsed.summary,cleaning_actions:parsed.cleaning_actions||[]},patients_detected:(parsed.patients||[]).length,preview_patients:(parsed.patients||[]).slice(0,8)})}

  const src=await db.query("INSERT INTO data_sources(name,source_type,status,last_seen_at,freshness_seconds,provenance) VALUES($1,'document_upload','imported',now(),0,$2) RETURNING id,name,status,last_seen_at,provenance",
    [fileName,"User-uploaded healthcare file; parsed and normalized by CARE & CTRL. Original values remain source-bound; this import is an uploaded snapshot."]);
  const sourceId=src.rows[0].id;
  let created=0,updated=0,diag=0,meds=0,sigs=0,attrs=0;

  for(const p of (parsed.patients||[]).slice(0,1500)){
    const ref=clean(p.external_ref)||("DOC-"+sourceId+"-"+String(created+updated+1));
    const name=clean(p.display_name)||("Patient "+ref);
    const existing=await db.query("SELECT id FROM patients WHERE external_ref=$1 LIMIT 1",[ref]);
    let pid;
    if(existing.rows.length){
      pid=existing.rows[0].id;
      await db.query("UPDATE patients SET display_name=$1,date_of_birth=$2,sex=$3,status=$4,photo_url=COALESCE(NULLIF($5,''),photo_url),blood_group=COALESCE(NULLIF($6,''),blood_group),updated_at=now(),hospital_id=$7 WHERE id=$8",
        [name,clean(p.date_of_birth)||null,clean(p.sex)||null,clean(p.status)||"active",clean(p.photo_url),clean(p.blood_group),hospitalId,pid]); updated++;
    }else{
      const ins=await db.query("INSERT INTO patients(external_ref,display_name,date_of_birth,sex,status,photo_url,blood_group,hospital_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
        [ref,name,clean(p.date_of_birth)||null,clean(p.sex)||null,clean(p.status)||"active",clean(p.photo_url)||null,clean(p.blood_group)||null,hospitalId]); pid=ins.rows[0].id;created++;
    }
    for(const d of (p.diagnoses||[]))if(clean(d.name)){await db.query("INSERT INTO patient_diagnoses(patient_id,diagnosis_name,clinical_status,diagnosed_at,source_id) VALUES($1,$2,$3,$4,$5)",[pid,clean(d.name),clean(d.status)||null,iso(d.diagnosed_at),sourceId]);diag++}
    for(const m of (p.medications||[]))if(clean(m.name)){await db.query("INSERT INTO patient_medications(patient_id,medication_name,dose,frequency,status,started_at,ended_at,source_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",[pid,clean(m.name),clean(m.dose)||null,clean(m.frequency)||null,clean(m.status)||"active",iso(m.started_at),iso(m.ended_at),sourceId]);meds++}
    for(const s of (p.signals||[]))if(clean(s.type)&&Number.isFinite(Number(s.value))){await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,source_id,quality,data_status) VALUES($1,$2,$3,$4,$5,$6,'verified','verified')",[pid,clean(s.type),Number(s.value),clean(s.unit)||null,iso(s.observed_at)||new Date().toISOString(),sourceId]);sigs++}
    for(const a of (p.attributes||[]))if(clean(a.key)&&clean(a.value)){await db.query("INSERT INTO patient_attributes(patient_id,source_id,attribute_key,attribute_value,data_type,observed_at) VALUES($1,$2,$3,$4,$5,$6)",[pid,sourceId,clean(a.key),clean(a.value),clean(a.data_type)||"text",iso(a.observed_at)]);attrs++}
  }

  await db.query("INSERT INTO audit_events(event_type,entity_type,actor_id,detail) VALUES($1,$2,$3,$4)",["intelligent_file_import","data_source",u.id,JSON.stringify({file:fileName,document_type:parsed.document_type,confidence:parsed.confidence,patients_created:created,patients_updated:updated,diagnoses:diag,medications:meds,signals:sigs,attributes:attrs,cleaning_actions:parsed.cleaning_actions||[]})]);
  res.status(201).json({source:src.rows[0],analysis:{document_type:parsed.document_type,confidence:parsed.confidence,summary:parsed.summary,cleaning_actions:parsed.cleaning_actions||[]},patients_created:created,patients_updated:updated,diagnoses_imported:diag,medications_imported:meds,signals_imported:sigs,attributes_preserved:attrs});
}