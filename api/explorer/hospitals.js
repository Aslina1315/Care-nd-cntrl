export const access="public";
export const methods=["GET"];
const overpass="https://overpass.kumi.systems/api/interpreter";
const nom="https://nominatim.openstreetmap.org/search";
function esc(s){return String(s||"").replace(/[\\"]/g,"\\$&")}
function mapHospitals(d){return (d.elements||[]).map(function(x){return {id:String(x.id),name:x.tags?.name||"Unnamed hospital",city:x.tags?.["addr:city"]||x.tags?.["addr:town"]||"",state:x.tags?.["addr:state"]||"",country:x.tags?.["addr:country"]||"",lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon,phone:x.tags?.phone||"",website:x.tags?.website||"",source:"OpenStreetMap",patientData:"Facility listing only"}}).filter(function(x){return x.name&&Number.isFinite(x.lat)}).slice(0,80)}
export default async function(req,res){
 try{
  const q=String(req.query?.q||"").trim(),lat=Number(req.query?.lat),lon=Number(req.query?.lon),radius=Math.min(Math.max(Number(req.query?.radius||25000),1000),100000);
  var clat=lat,clon=lon,locationLabel=q||"Nearby";
  if(!Number.isFinite(clat)||!Number.isFinite(clon)){
   if(!q)return res.json({hospitals:[],hint:"Enter a location or use Near me."});
   const geo=await fetch(nom+"?format=jsonv2&limit=1&q="+encodeURIComponent(q),{headers:{"User-Agent":"CARE-CTRL/1.0 healthcare-hackathon-demo"}});
   if(!geo.ok)throw Error("Location search is temporarily unavailable");
   const gd=await geo.json();if(!gd.length)return res.json({hospitals:[],hint:"Location not found. Try a city, state or country."});
   clat=Number(gd[0].lat);clon=Number(gd[0].lon);locationLabel=gd[0].display_name||q;
  }
  const query=`[out:json][timeout:12];(nwr["amenity"="hospital"](around:${radius},${clat},${clon});nwr["healthcare"="hospital"](around:${radius},${clat},${clon}););out center tags;`;
  const r=await fetch(overpass,{method:"POST",headers:{"Content-Type":"text/plain","User-Agent":"CARE-CTRL/1.0 healthcare-hackathon-demo"},body:query});
  if(!r.ok)throw Error("Hospital directory is temporarily unavailable");
  const d=await r.json();
  res.json({hospitals:mapHospitals(d),source:"OpenStreetMap / Nominatim + Overpass",freshness:"Community-updated",location:locationLabel,patientDataNotice:"Facility discovery only; patient records are not provided by this source."});
 }catch(e){res.status(502).json({error:e.message||"Hospital search failed"})}
}