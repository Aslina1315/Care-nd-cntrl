export const access = "public";
export const methods = ["GET"];
export default async function(req,res){
  const q=String(req.query?.q||"").trim();
  const sources=[
    {id:"mimic-iv",name:"MIMIC-IV",region:"United States",type:"RESEARCH",freshness:"Historical / de-identified",description:"Clinical database for research; not a live patient feed.",url:"https://physionet.org/content/mimiciv/"},
    {id:"synthea",name:"Synthea",region:"Global / synthetic",type:"SIMULATED",freshness:"Generated on demand",description:"Synthetic patient records for testing healthcare workflows.",url:"https://synthetichealth.github.io/synthea/"},
    {id:"ogd-health",name:"India Open Government Data — Health",region:"India",type:"OPEN DATA",freshness:"Dataset-dependent",description:"Public government datasets; publication cadence varies by dataset.",url:"https://www.data.gov.in/"},
    {id:"osm-hospitals",name:"OpenStreetMap Healthcare Facilities",region:"Worldwide",type:"OPEN DATA",freshness:"Community-updated",description:"Facility/location data; does not provide private patient records.",url:"https://www.openstreetmap.org/"},
    {id:"fhir",name:"FHIR-compatible hospital feed",region:"Your organisation",type:"LIVE",freshness:"Requires authorised connection",description:"Connect an authorised FHIR endpoint when your organisation provides one.",url:"https://www.hl7.org/fhir/"}
  ];
  const filtered=q?sources.filter(s=>(s.name+" "+s.region+" "+s.type+" "+s.description).toLowerCase().includes(q.toLowerCase())):sources;
  res.json({sources:filtered});
}