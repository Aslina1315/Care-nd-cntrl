export const access="public";
export const methods=["GET"];
export default async function(req,res){
 try{
  const count=Math.min(Math.max(Number(req.query?.count||25),1),100);
  const r=await fetch("https://hapi.fhir.org/baseR4/Patient?_count="+count,{headers:{"Accept":"application/fhir+json"}});
  if(!r.ok) throw Error("FHIR test dataset unavailable");
  const b=await r.json();
  const patients=(b.entry||[]).map(e=>{const p=e.resource||{};const name=p.name?.[0];return{id:p.id,external_ref:p.identifier?.[0]?.value||p.id,display_name:name?.text||[...(name?.given||[]),name?.family].filter(Boolean).join(" ")||"Synthetic patient",date_of_birth:p.birthDate||"",sex:p.gender||"",status:p.active===false?"inactive":"active",source:"HAPI FHIR R4",dataType:"SYNTHETIC / TEST"}}); 
  res.json({patients,total:b.total??patients.length,source:"HAPI FHIR R4",freshness:"Live public test endpoint",notice:"Synthetic/test data only; this is not a production hospital feed."});
 }catch(e){res.status(502).json({error:e.message||"FHIR source unavailable"})}
}