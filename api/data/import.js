import { db } from "hatchable";
export const access = "user";
export const methods = ["POST"];
export default async function(req,res){
  const u=req.user;
  const rows=Array.isArray(req.body?.rows)?req.body.rows:[];
  const mapping=req.body?.mapping||{};
  const fileName=String(req.body?.file_name||"healthcare-import.csv");
  if(!rows.length) return res.status(400).json({error:"No rows supplied"});
  if(rows.length>2000) return res.status(400).json({error:"Import up to 2,000 rows at a time"});
  const hm=await db.query("SELECT hospital_id FROM hospital_members WHERE user_id=$1 LIMIT 1",[u.id]);
  let hospitalId;
  if(hm.rows.length){
    hospitalId=hm.rows[0].hospital_id;
  }else{
    const reg="IMPORT-"+String(u.id).replace(/[^a-zA-Z0-9]/g,"").slice(0,24)+"-"+Date.now();
    const h=await db.query("INSERT INTO hospitals(name,registration_ref,city,state,status) VALUES($1,$2,$3,$4,'active') RETURNING id",["CARE & CTRL Import Workspace",reg,"Not specified","Not specified"]);
    hospitalId=h.rows[0].id;
    await db.query("INSERT INTO hospital_members(hospital_id,user_id,role,display_name) VALUES($1,$2,'staff',$3)",[hospitalId,u.id,u.email||"Workspace user"]);
  }
  const src=await db.query("INSERT INTO data_sources(name,source_type,status,last_seen_at,freshness_seconds,provenance) VALUES($1,'csv_upload','imported',now(),0,$2) RETURNING id,name,status,last_seen_at,provenance",[fileName,"User-uploaded healthcare dataset; imported snapshot, not a live feed"]);
  let imported=0,signals=0,skipped=0;
  for(const row of rows){
    const ref=String(row[mapping.external_ref]??"").trim();
    const name=String(row[mapping.display_name]??"").trim();
    if(!ref||!name){skipped++;continue}
    const dob=mapping.date_of_birth?String(row[mapping.date_of_birth]??"").trim():null;
    const sex=mapping.sex?String(row[mapping.sex]??"").trim():null;
    const ex=await db.query("SELECT id FROM patients WHERE external_ref=$1 LIMIT 1",[ref]);
    let pid;
    if(ex.rows.length){pid=ex.rows[0].id;await db.query("UPDATE patients SET display_name=$1,date_of_birth=$2,sex=$3,updated_at=now(),hospital_id=$4 WHERE id=$5",[name,dob||null,sex||null,hospitalId,pid]);}
    else{const ins=await db.query("INSERT INTO patients(external_ref,display_name,date_of_birth,sex,status,hospital_id) VALUES($1,$2,$3,$4,'active',$5) RETURNING id",[ref,name,dob||null,sex||null,hospitalId]);pid=ins.rows[0].id;imported++;}
    const signalType=mapping.signal_type?String(row[mapping.signal_type]??"").trim():"";
    const signalValue=mapping.value_numeric!==undefined?Number(row[mapping.value_numeric]):NaN;
    if(signalType&&Number.isFinite(signalValue)){
      const unit=mapping.unit?String(row[mapping.unit]??"").trim():null;
      const observed=mapping.observed_at?String(row[mapping.observed_at]??"").trim():new Date().toISOString();
      await db.query("INSERT INTO patient_signals(patient_id,signal_type,value_numeric,unit,observed_at,source_id,quality,data_status) VALUES($1,$2,$3,$4,$5,$6,'verified','verified')",[pid,signalType,signalValue,unit,observed,src.rows[0].id]);signals++;
    }
  }
  await db.query("INSERT INTO audit_events(event_type,entity_type,actor_id,detail) VALUES($1,$2,$3,$4)",["csv_import","data_source",u.id,JSON.stringify({file:fileName,rows:rows.length,patients:imported,signals,skipped})]);
  res.status(201).json({source:src.rows[0],rows_received:rows.length,patients_imported:imported,signals_imported:signals,skipped});
}