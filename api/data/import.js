import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];

function clean(v){return String(v??"").trim()}
function finite(v){if(v===null||v===undefined||v==="")return NaN;const n=Number(String(v).replace(/,/g,"").replace(/%$/,""));return Number.isFinite(n)?n:NaN}
function isoDate(v){const s=clean(v);if(!s)return null;const d=new Date(s);return Number.isNaN(d.getTime())?null:d.toISOString()}
function label(v){return clean(v).replace(/\{[^}]*\}/g,"").replace(/[_-]+/g," ").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/\s+/g," ").trim()||"Imported field"}

export default async function(req,res){
  const u=req.user;
  const rows=Array.isArray(req.body?.rows)?req.body.rows:[];
  const mapping=req.body?.mapping||{};
  const fileName=clean(req.body?.file_name)||"healthcare-import.csv";
  if(!rows.length)return res.status(400).json({error:"No rows supplied"});
  if(rows.length>2000)return res.status(400).json({error:"Import up to 2,000 rows at a time"});

  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 LIMIT 1",[u.id]);
  if(!hm.rows.length) return res.status(403).json({error:"A hospital workspace is required before importing or maintaining patient data."});
  const hospitalId=hm.rows[0].hospital_id;

  const src=await db.query(
    "INSERT INTO data_sources(name,source_type,status,last_seen_at,freshness_seconds,provenance) VALUES($1,'csv_upload','imported',now(),0,$2) RETURNING id,name,status,last_seen_at,provenance",
    [fileName,"User-uploaded healthcare dataset; imported snapshot. Schema was profiled automatically; unmapped source fields are preserved as patient attributes."]
  );
  const sourceId=src.rows[0].id;

  const signalDefs=Array.isArray(mapping.signals)?mapping.signals.filter(x=>x&&x.column):[];
  const attributeDefs=Array.isArray(mapping.attributes)?mapping.attributes.filter(x=>x&&x.column):[];
  let imported=0,updated=0,signals=0,attributes=0,skipped=0;

  for(let index=0;index<rows.length;index++){
    const row=rows[index]||{};
    const rawRef=mapping.external_ref?clean(row[mapping.external_ref]):"";
    const rawName=mapping.display_name?clean(row[mapping.display_name]):"";
    const rawDob=mapping.date_of_birth?clean(row[mapping.date_of_birth]):"";
    const rawSex=mapping.sex?clean(row[mapping.sex]):"";
    const rawStatus=mapping.status?clean(row[mapping.status]):"";
    const ref=rawRef||("IMPORT-"+sourceId+"-"+String(index+1));
    const name=rawName||("Patient "+(rawRef||String(index+1)));
    const dob=rawDob?rawDob:null;
    const sex=rawSex||null;
    const status=rawStatus||"active";

    // Ignore structural/schema rows from exports (for example FHIR CSV metadata rows).
    if(!rawRef&&!rawName&&!rawDob&&!rawSex&&!rawStatus){ skipped++; continue; }
    if(!rawRef && /^(type|system|value|display|family name|given name|phone|email|line|city|state|postal ?code)$/i.test(rawName)){ skipped++; continue; }

    const ex=await db.query("SELECT id FROM patients WHERE external_ref=$1 LIMIT 1",[ref]);
    let pid;
    if(ex.rows.length){
      pid=ex.rows[0].id;
      await db.query("UPDATE patients SET display_name=$1,date_of_birth=$2,sex=$3,status=$4,updated_at=now(),hospital_id=$5 WHERE id=$6",[name,dob||null,sex,status,hospitalId,pid]);
      updated++;
    }else{
      const ins=await db.query("INSERT INTO patients(external_ref,display_name,date_of_birth,sex,status,hospital_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",[ref,name,dob||null,sex,status,hospitalId]);
      pid=ins.rows[0].id;
      imported++;
    }

    for(const s of signalDefs){
      const raw=clean(row[s.column]);
      if(!raw)continue;
      const n=finite(raw);
      if(Number.isFinite(n)){
        const observed=s.observed_at?isoDate(row[s.observed_at]):new Date().toISOString();
        await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,source_id,quality,data_status) VALUES($1,$2,$3,$4,$5,$6,'verified','verified')",[pid,clean(s.type)||label(s.column),n,clean(s.unit)||null,observed,sourceId]);
        signals++;
      }else if(/blood.?pressure|bp/i.test(clean(s.type)||label(s.column)) && /^\s*\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?\s*$/.test(raw)){
        const parts=raw.split("/");
        const observed=s.observed_at?isoDate(row[s.observed_at]):new Date().toISOString();
        await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,source_id,quality,data_status) VALUES($1,$2,$3,$4,$5,$6,'verified','verified')",[pid,"Blood pressure systolic",finite(parts[0]),"mmHg",observed,sourceId]);
        await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,source_id,quality,data_status) VALUES($1,$2,$3,$4,$5,$6,'verified','verified')",[pid,"Blood pressure diastolic",finite(parts[1]),"mmHg",observed,sourceId]);
        signals+=2;
      }
    }

    for(const a of attributeDefs){
      const value=clean(row[a.column]);
      if(!value)continue;
      await db.query("INSERT INTO patient_attributes(patient_id,source_id,attribute_key,attribute_value,data_type,observed_at) VALUES($1,$2,$3,$4,$5,$6)",[pid,sourceId,clean(a.key)||label(a.column),value,clean(a.data_type)||"text",a.observed_at?isoDate(row[a.observed_at]):null]);
      attributes++;
    }
  }

  await db.query("INSERT INTO audit_events(event_type,entity_type,actor_id,detail) VALUES($1,$2,$3,$4)",["csv_import","data_source",u.id,JSON.stringify({file:fileName,rows:rows.length,patients_created:imported,patients_updated:updated,signals,attributes,skipped,mapping_summary:{signals:signalDefs.length,attributes:attributeDefs.length}})]);
  res.status(201).json({source:src.rows[0],rows_received:rows.length,patients_imported:imported,patients_updated:updated,signals_imported:signals,attributes_preserved:attributes,skipped});
}