export const access="public";
export const methods=["GET"];

function refId(ref){
  const s=String(ref||"");
  const m=s.match(/(?:Patient\/)?([^/]+)$/);
  return m?m[1]:null;
}
function codingText(x){
  return x?.text || x?.coding?.find(c=>c.display||c.code)?.display || x?.coding?.find(c=>c.code)?.code || "Unspecified";
}
function obsValue(o){
  if(o.valueQuantity?.value!==undefined) return {value:o.valueQuantity.value,unit:o.valueQuantity.unit||o.valueQuantity.code||""};
  if(o.valueInteger!==undefined) return {value:o.valueInteger,unit:""};
  if(o.valueDecimal!==undefined) return {value:o.valueDecimal,unit:""};
  if(o.valueBoolean!==undefined) return {value:o.valueBoolean,unit:""};
  if(o.valueString!==undefined) return {value:o.valueString,unit:""};
  if(o.valueCodeableConcept) return {value:codingText(o.valueCodeableConcept),unit:""};
  if(o.valueRange) return {value:(o.valueRange.low?.value??"")+"–"+(o.valueRange.high?.value??""),unit:o.valueRange.low?.unit||o.valueRange.high?.unit||""};
  return {value:"Not reported",unit:""};
}
function observedAt(o){
  return o.effectiveDateTime || o.effectiveInstant || o.effectivePeriod?.end || o.effectivePeriod?.start || o.issued || null;
}
async function fetchBundle(base,type,count){
  const r=await fetch(base+"/"+type+"?_count="+count,{headers:{"Accept":"application/fhir+json","User-Agent":"CARE-CTRL/1.0"}});
  const text=await r.text();
  if(!r.ok) throw Error(type+" endpoint returned "+r.status);
  const b=JSON.parse(text);
  return {resources:(b.entry||[]).map(x=>x.resource).filter(Boolean),total:b.total??null};
}
function cleanPatient(p,i,byPatient){
  const id=p.id||String(i);
  const signals=(byPatient.observations[id]||[]).sort((a,b)=>String(b.observed_at||"").localeCompare(String(a.observed_at||"")));
  const conditions=byPatient.conditions[id]||[];
  const encounters=byPatient.encounters[id]||[];
  return {
    id,
    display_name:"Patient "+String(i+1).padStart(2,"0"),
    external_ref:"FHIR/"+id,
    sex:p.gender||"not specified",
    date_of_birth:p.birthDate||null,
    status:p.active===false?"inactive":"active",
    source:"Connected FHIR endpoint",
    dataType:"LIVE ENDPOINT RESPONSE",
    redacted:true,
    signal_count:signals.length,
    last_signal_at:signals[0]?.observed_at||null,
    signals:signals.slice(0,50),
    latest_signals:signals.slice(0,8),
    conditions:conditions.slice(0,30),
    encounters:encounters.slice(0,30)
  };
}
export default async function(req,res){
  try{
    const endpoint=String(req.query?.endpoint||"").trim();
    if(!/^https:\/\//i.test(endpoint)) return res.status(400).json({error:"HTTPS FHIR endpoint required"});
    const base=endpoint.replace(/\/$/,"");
    const types=["Patient","Observation","Condition","Encounter"];
    const results=await Promise.allSettled(types.map(t=>fetchBundle(base,t,t==="Patient"?50:500)));
    const by={observations:{},conditions:{},encounters:{}};
    const counts={Patient:0,Observation:0,Condition:0,Encounter:0};
    const failures=[];
    results.forEach((r,i)=>{
      const type=types[i];
      if(r.status==="rejected"){failures.push(type);return}
      counts[type]=r.value.resources.length;
      if(type==="Observation") r.value.resources.forEach(o=>{
        const pid=refId(o.subject?.reference);
        if(!pid)return;
        const v=obsValue(o);
        (by.observations[pid] ||= []).push({
          id:o.id||null,
          type:codingText(o.code),
          value:v.value,
          unit:v.unit,
          observed_at:observedAt(o),
          status:o.status||null,
          interpretation:codingText(o.interpretation?.[0])||null
        });
      });
      if(type==="Condition") r.value.resources.forEach(c=>{
        const pid=refId(c.subject?.reference);
        if(!pid)return;
        (by.conditions[pid] ||= []).push({
          id:c.id||null,
          name:codingText(c.code),
          clinical_status:codingText(c.clinicalStatus),
          recorded_at:c.recordedDate||c.onsetDateTime||null
        });
      });
      if(type==="Encounter") r.value.resources.forEach(e=>{
        const pid=refId(e.subject?.reference);
        if(!pid)return;
        (by.encounters[pid] ||= []).push({
          id:e.id||null,
          type:codingText(e.class)||codingText(e.type?.[0]),
          status:e.status||null,
          start:e.period?.start||null,
          end:e.period?.end||null
        });
      });
    });
    if(results[0].status==="rejected") return res.status(502).json({error:"FHIR Patient resource could not be read. The endpoint may require authorization.",detail:failures.join(", ")});
    const patients=results[0].value.resources.map((p,i)=>cleanPatient(p,i,by));
    res.json({
      patients,
      count:patients.length,
      total:results[0].value.total??patients.length,
      source:base,
      fetched_at:new Date().toISOString(),
      data_status:"LIVE FHIR",
      resource_counts:counts,
      unavailable_resources:failures,
      privacy:"Patient display names are redacted in CARE & CTRL. Access remains subject to the source endpoint's authorization rules.",
      note:"Observations, Conditions and Encounters are joined to Patient records by FHIR references. Missing resource types are reported rather than fabricated."
    });
  }catch(e){
    res.status(502).json({error:e.message||"FHIR live retrieval failed"});
  }
}