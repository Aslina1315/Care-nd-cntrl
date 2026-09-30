export const access="public";
export const methods=["GET"];
const overpass="https://overpass-api.de/api/interpreter";
function esc(s){return String(s||"").replace(/[\\"]/g,"\\$&")}
export default async function(req,res){
 try{
  const q=String(req.query?.q||"").trim();
  const lat=Number(req.query?.lat),lon=Number(req.query?.lon);
  const radius=Math.min(Math.max(Number(req.query?.radius||25000),1000),100000);
  if(!q&&!Number.isFinite(lat)) return res.json({hospitals:[],hint:"Enter a city/state/country or use Near me."});
  let area="";
  if(q){
   area=`area["name"~"^${esc(q)}$",i]->.searchArea;`;
   const query=`[out:json][timeout:20];${area}(nwr["amenity"="hospital"](area.searchArea);nwr["healthcare"="hospital"](area.searchArea););out center tags;`;
   const r=await fetch(overpass,{method:"POST",headers:{"Content-Type":"text/plain"},body:query});
   if(!r.ok) throw Error("Hospital directory is temporarily unavailable");
   const d=await r.json();
   const hospitals=(d.elements||[]).map(x=>({id:String(x.id),name:x.tags?.name||"Unnamed hospital",city:x.tags?.["addr:city"]||x.tags?.["addr:town"]||q,state:x.tags?.["addr:state"]||"",country:x.tags?.["addr:country"]||"",lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon,phone:x.tags?.phone||"",website:x.tags?.website||"",source:"OpenStreetMap",patientData:"Facility listing only"})).filter(x=>x.name&&Number.isFinite(x.lat)).slice(0,80);
   return res.json({hospitals,source:"OpenStreetMap / Overpass",freshness:"Community-updated",patientDataNotice:"Facility discovery only; patient records are not provided by this source."});
  }
  const query=`[out:json][timeout:20];(nwr["amenity"="hospital"](around:${radius},${lat},${lon});nwr["healthcare"="hospital"](around:${radius},${lat},${lon}););out center tags;`;
  const r=await fetch(overpass,{method:"POST",headers:{"Content-Type":"text/plain"},body:query});
  if(!r.ok) throw Error("Nearby hospital directory is temporarily unavailable");
  const d=await r.json();
  const hospitals=(d.elements||[]).map(x=>({id:String(x.id),name:x.tags?.name||"Unnamed hospital",city:x.tags?.["addr:city"]||x.tags?.["addr:town"]||"",state:x.tags?.["addr:state"]||"",country:x.tags?.["addr:country"]||"",lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon,phone:x.tags?.phone||"",website:x.tags?.website||"",source:"OpenStreetMap",patientData:"Facility listing only"})).filter(x=>x.name&&Number.isFinite(x.lat)).slice(0,80);
  res.json({hospitals,source:"OpenStreetMap / Overpass",freshness:"Community-updated",patientDataNotice:"Facility discovery only; patient records are not provided by this source."});
 }catch(e){res.status(502).json({error:e.message||"Hospital search failed"})}
}