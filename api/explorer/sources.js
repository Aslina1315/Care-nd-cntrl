export const access="public";
export const methods=["GET"];
const catalog=[
{id:"hapi-r4",name:"HAPI FHIR R4 Test Dataset",region:"Worldwide / synthetic",type:"SIMULATED",freshness:"Live test endpoint",description:"Public FHIR R4 test server containing synthetic/test healthcare resources. Not production and not real patient data.",url:"https://hapi.fhir.org/baseR4",patientFeed:true},
{id:"mimic-iv",name:"MIMIC-IV",region:"United States",type:"RESEARCH",freshness:"Historical / de-identified",description:"Research clinical database; access is controlled and it is not a live patient feed.",url:"https://physionet.org/content/mimiciv/",patientFeed:false},
{id:"synthea",name:"Synthea",region:"Global / synthetic",type:"SIMULATED",freshness:"Generated on demand",description:"Synthetic patient records for healthcare workflow testing.",url:"https://synthetichealth.github.io/synthea/",patientFeed:false},
{id:"ogd-health",name:"India Open Government Data — Health",region:"India",type:"OPEN DATA",freshness:"Dataset-dependent",description:"Public government health datasets; publication cadence varies by dataset.",url:"https://www.data.gov.in/",patientFeed:false},
{id:"osm-hospitals",name:"OpenStreetMap Healthcare Facilities",region:"Worldwide",type:"OPEN DATA",freshness:"Community-updated",description:"Worldwide facility/location discovery. It does not provide private patient records.",url:"https://www.openstreetmap.org/",patientFeed:false},
{id:"fhir",name:"Authorised Hospital FHIR Endpoint",region:"Your organisation",type:"LIVE",freshness:"Requires authorised connection",description:"Connect your organisation's authorised FHIR endpoint. Patient data is only available when the organisation grants access.",url:"https://www.hl7.org/fhir/",patientFeed:true}
];
export default async function(req,res){
 const q=String(req.query?.q||"").trim().toLowerCase();
 const type=String(req.query?.type||"").trim().toUpperCase();
 const sources=catalog.filter(s=>(!q||(s.name+" "+s.region+" "+s.type+" "+s.description).toLowerCase().includes(q))&&(!type||s.type===type));
 res.json({sources});
}