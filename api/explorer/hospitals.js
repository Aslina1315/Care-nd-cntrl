export const access="public";
export const methods=["GET"];
const nom="https://nominatim.openstreetmap.org/search";
export default async function(req,res){
 try{
  const q=String(req.query?.q||"").trim(),lat=Number(req.query?.lat),lon=Number(req.query?.lon),radius=Number(req.query?.radius||25000);
  if(!q&&!Number.isFinite(lat))return res.json({hospitals:[],hint:"Enter a location or use Near me."});
  var url;
  if(Number.isFinite(lat)&&Number.isFinite(lon)){
   const dlat=radius/111000,dlon=radius/(111000*Math.max(Math.cos(lat*Math.PI/180),.2));
   const vb=[lon-dlon,lat+dlat,lon+dlon,lat-dlat].join(",");
   url=nom+"?format=jsonv2&limit=20&layer=poi&bounded=1&viewbox="+encodeURIComponent(vb)+"&q=hospital";
  }else{
   url=nom+"?format=jsonv2&limit=20&layer=poi&q="+encodeURIComponent("hospital "+q);
  }
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7000);let r;try{r=await fetch(url,{signal:controller.signal,headers:{"User-Agent":"CARE-CTRL/1.0 healthcare-hackathon-demo","Accept":"application/json"}})}finally{clearTimeout(timer)}
  if(!r.ok)throw Error("Hospital directory is temporarily unavailable");
  const d=await r.json();
  const hospitals=(d||[]).filter(function(x){return Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon))}).map(function(x){var a=x.address||{};return{id:String(x.osm_type||"osm")+"-"+String(x.osm_id||x.place_id),name:x.name||x.display_name?.split(",")[0]||"Unnamed hospital",city:a.city||a.town||a.village||"",state:a.state||"",country:a.country||"",lat:Number(x.lat),lon:Number(x.lon),website:x.extratags?.website||"",phone:x.extratags?.phone||"",source:"OpenStreetMap / Nominatim",patientData:"Facility listing only"}}).filter(function(x){return x.name.toLowerCase().includes("hospital")||x.name.length>0});
  res.json({hospitals,source:"OpenStreetMap / Nominatim",freshness:"Community-updated",location:q||"Nearby",patientDataNotice:"Facility discovery only; patient records are not provided by this source."});
 }catch(e){res.status(502).json({error:e.name==="AbortError"?"Hospital search timed out. Try a city or state search again.":e.message||"Hospital search failed"})}
}