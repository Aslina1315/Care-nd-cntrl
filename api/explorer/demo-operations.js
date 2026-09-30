export const access="user";
export const methods=["GET"];

const facilities=[
 {id:"demo-phc-01",external_ref:"SIM-PHC-001",name:"North River PHC",district:"North District",state:"Tamil Nadu",status:"Operational",capacity_total:120,resource_records:6},
 {id:"demo-phc-02",external_ref:"SIM-PHC-002",name:"East Gate PHC",district:"East District",state:"Tamil Nadu",status:"Operational",capacity_total:95,resource_records:6},
 {id:"demo-phc-03",external_ref:"SIM-PHC-003",name:"Central Community Clinic",district:"Central District",state:"Tamil Nadu",status:"Under pressure",capacity_total:80,resource_records:6},
 {id:"demo-phc-04",external_ref:"SIM-PHC-004",name:"Lakeside PHC",district:"South District",state:"Tamil Nadu",status:"Operational",capacity_total:140,resource_records:6},
 {id:"demo-phc-05",external_ref:"SIM-PHC-005",name:"West Valley PHC",district:"West District",state:"Tamil Nadu",status:"Watch",capacity_total:110,resource_records:6},
 {id:"demo-phc-06",external_ref:"SIM-PHC-006",name:"Hillview PHC",district:"North District",state:"Tamil Nadu",status:"Operational",capacity_total:90,resource_records:6}
];

const resourceNames=[
 ["IV Fluids","bags",38,14,50],["Oxygen Cylinders","units",12,2,8],["Paracetamol","packs",74,9,40],
 ["Insulin","vials",22,3,12],["Test Strips","boxes",31,5,18],["PPE Kits","kits",96,12,48]
];

const resources=[];
facilities.forEach((f,fi)=>resourceNames.forEach((r,ri)=>{
 const factor=fi===2?0.55:(fi===4?0.72:1);
 let available=Math.max(3,Math.round(r[2]*factor+(ri%3)*3));
 let daily=Math.max(1,Math.round(r[3]*(fi===2?1.35:fi===4?1.15:1)));
 if(fi===0&&ri===0){available=108;daily=14;}
 if(fi===2&&ri===0){available=82;daily=19;}
 const reorder=r[4];
 resources.push({id:"demo-res-"+fi+"-"+ri,facility_id:f.id,facility_name:f.name,resource_name:r[0],unit:r[1],quantity_available:available,average_daily_use:daily,reorder_level:reorder,days_to_reorder:Math.max(0,(available-reorder)/daily),observed_at:new Date(Date.now()-((fi+ri)%5)*3600000).toISOString()});
}));

const actions=[
 {id:"demo-action-01",action_type:"Redistribute IV fluids",target_type:"facility",target_id:"demo-phc-03",rationale:"Central Community Clinic is projected to cross its reorder threshold in about 1.7 days while North River PHC has transferable stock above its reorder threshold.",expected_impact:"Move 24 bags and leave North River PHC with about 2.4 days of headroom above its reorder threshold.",status:"pending"},
 {id:"demo-action-02",action_type:"Rebalance oxygen cylinders",target_type:"facility",target_id:"demo-phc-03",rationale:"Observed oxygen use is above the recent baseline and available stock is approaching the operational threshold.",expected_impact:"Add 4 cylinders and reduce immediate stock-out exposure.",status:"pending"},
 {id:"demo-action-03",action_type:"Schedule replenishment",target_type:"resource",target_id:"demo-res-2-3",rationale:"Insulin inventory is below the reorder threshold in the simulated central facility.",expected_impact:"Trigger replenishment before the projected threshold date.",status:"pending"},
 {id:"demo-action-04",action_type:"Review respiratory cohort",target_type:"population",target_id:"demo-cohort-respiratory",rationale:"The synthetic clinical stream shows a concentration of respiratory-related observations that merits human review.",expected_impact:"Confirm whether the signal represents a meaningful local pattern.",status:"pending"},
 {id:"demo-action-05",action_type:"Open overflow capacity",target_type:"facility",target_id:"demo-phc-05",rationale:"Projected utilization is nearing the simulated facility capacity threshold.",expected_impact:"Create temporary headroom and reduce queue pressure.",status:"pending"},
 {id:"demo-action-06",action_type:"Validate source freshness",target_type:"data_source",target_id:"hapi-r4",rationale:"The test source is intentionally used to demonstrate freshness and provenance controls.",expected_impact:"Keep downstream decisions visibly tied to the latest retrieved evidence.",status:"pending"}
];

export default async function(req,res){
 res.json({
  mode:"SIMULATED OPERATIONAL SCENARIO",
  generated_at:new Date().toISOString(),
  facilities,
  resources,
  actions,
  population:{
   risk_bands:{critical:4,attention:13,watch:21,stable:62},
   trend:[
    {label:"08:00",value:42},{label:"10:00",value:47},{label:"12:00",value:51},{label:"14:00",value:58},{label:"16:00",value:63}
   ],
   signal_mix:[
    {label:"Respiratory",value:28},{label:"Metabolic",value:24},{label:"Cardiovascular",value:19},{label:"General",value:29}
   ]
  },
  note:"All operational, population-risk and action records in this endpoint are synthetic demonstration data. They are not measurements from a real hospital."
 });
}